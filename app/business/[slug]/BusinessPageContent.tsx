"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Phone,
  Star,
  Clock,
  Calendar,
  ShieldCheck,
  X,
  AlertCircle,
  Navigation,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import api from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import { FavoriteButton } from "@/components/FavoriteButton";
import { MapPreview } from "@/components/MapPreview";
import { RatingStars } from "@/components/ui/rating-stars";
import { CategoryBadge, AvailableBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, cn, cityNameToSlug, getSearchPath, getBusinessCityDisplay, getBusinessCategoryDisplay, toServiceSlug } from "@/lib/utils";
import ServiceSection from "@/components/business/ServiceSection";
import { SimilarBusinesses } from "@/components/business/SimilarBusinesses";
import { ReviewBreakdown } from "@/components/reviews/ReviewBreakdown";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { format, parseISO } from "date-fns";
import type { Business, Service, Review } from "@/types";
import toast from "react-hot-toast";
import { GalleryRoot } from "@/components/gallery";
import type { GalleryImage } from "@/components/gallery";
import SocialShareButtons from "@/components/SocialShareButtons";

interface BusinessPageContentProps {
  slug: string;
  initialData: Business;
}

const DEFAULT_GALLERY_IMAGE = "/masscotte.png";

export function BusinessPageContent({ slug, initialData }: BusinessPageContentProps) {
  const router = useRouter();
  const t = useTranslations("businessPage");
  const tCommon = useTranslations("common");
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showMapDropdown, setShowMapDropdown] = useState(false);
  const [claimForm, setClaimForm] = useState({ name: "", email: "", message: "" });
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [galleryMounted, setGalleryMounted] = useState(false);

  useEffect(() => {
    setGalleryMounted(true);
  }, []);

  const { data } = useQuery({
    queryKey: queryKeys.businesses.detail(slug),
    queryFn: () => api.getBusiness(slug),
    initialData: { business: initialData },
    staleTime: 60 * 1000,
  });

  const business = data?.business ?? initialData;
  // Premium is per-business (not user); from API business.premium
  const isPremium = business.premium === true;

  // Track profile view on mount
  useEffect(() => {
    fetch(`/api/v1/businesses/${business.id}/track-profile-view`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  }, [business.id]);

  const handleBookService = useCallback(
    (service: Service) => {
      // Track booking click
      fetch(`/api/v1/businesses/${business.id}/track-booking-click`, {
        method: "POST",
        credentials: "include",
      }).catch(() => {});
      
      const serviceSlug = service.slug ?? toServiceSlug(service.name);
      router.push(`/book/${business.slug}/${serviceSlug}`);
    },
    [router, business.slug]
  );

  const handleClaimSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!claimForm.name.trim() || !claimForm.email.trim()) {
        toast.error(t("claimValidation"));
        return;
      }
      setClaimSubmitting(true);
      try {
        await api.submitBusinessClaim(slug, {
          name: claimForm.name.trim(),
          email: claimForm.email.trim(),
          message: claimForm.message.trim() || undefined,
        });
        toast.success(t("claimSuccess"));
        setShowClaimModal(false);
        setClaimForm({ name: "", email: "", message: "" });
      } catch (err: unknown) {
        const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : t("claimError");
        toast.error(msg);
      } finally {
        setClaimSubmitting(false);
      }
    },
    [slug, claimForm, t]
  );

  const handleShare = useCallback(async () => {
    const shareData = {
      title: business.name,
      text: t("shareText", { name: business.name }),
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (_err) {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t("linkCopied"));
    }
  }, [business.name, t]);

  // Logo is used only in the header avatar; gallery shows only business images (not logo).
  const galleryUrls = business.image_urls ?? [];
  const galleryImages: GalleryImage[] =
    galleryUrls.length > 0
      ? galleryUrls.map((url, i) => ({
          url,
          alt: `${business.name} - ${i + 1}`,
        }))
      : [{ url: DEFAULT_GALLERY_IMAGE, alt: t("noPhotosYet") }];

  const mapUrl =
    business.lat != null && business.lng != null
      ? `https://www.google.com/maps?q=${business.lat},${business.lng}`
      : null;

  const wazeUrl =
    business.lat != null && business.lng != null
      ? `https://waze.com/ul?ll=${business.lat},${business.lng}&navigate=yes`
      : null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="pt-3 pb-1">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground hover:underline">
                {t("home")}
              </Link>
            </li>
            <li aria-hidden className="select-none">
              /
            </li>
            <li>
              <Link
                href={
                  getBusinessCityDisplay(business.city)
                    ? `/search/${cityNameToSlug(getBusinessCityDisplay(business.city))}`
                    : "/search"
                }
                className="hover:text-foreground hover:underline"
              >
                {getBusinessCityDisplay(business.city) || t("search")}
              </Link>
            </li>
            <li aria-hidden className="select-none">
              /
            </li>
            <li>
              <Link
                href={getSearchPath(
                  getBusinessCityDisplay(business.city) || null,
                  getBusinessCategoryDisplay(business.category) || null
                )}
                className="hover:text-foreground hover:underline"
              >
                {getBusinessCategoryDisplay(business.category) || t("category")}
              </Link>
            </li>
            <li aria-hidden className="select-none">
              /
            </li>
            <li>
              <span className="font-medium text-foreground" aria-current="page">
                {business.name}
              </span>
            </li>
          </ol>
        </nav>

        <main className="px-3 md:px-4">
          {/* ── Header ── */}
          <header className="pt-4 pb-4">
            {/* Row 1: Category + action icons */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Link
                  href={getSearchPath(
                    getBusinessCityDisplay(business.city) || null,
                    getBusinessCategoryDisplay(business.category) || null
                  )}
                >
                  <CategoryBadge category={getBusinessCategoryDisplay(business.category)} />
                </Link>
                {business.is_open && <AvailableBadge />}
              </div>

              <div className="flex items-center gap-2">
                {business.lat && business.lng && (
                  <a
                    href={`https://waze.com/ul?ll=${business.lat},${business.lng}&navigate=yes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      fetch(`/api/v1/businesses/${business.id}/track-waze-click`, {
                        method: "POST",
                        credentials: "include",
                      }).catch(() => {});
                    }}
                    className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
                    aria-label="Navigate with Waze"
                  >
                    <Navigation className="h-4 w-4 text-neutral-600" />
                  </a>
                )}
                <SocialShareButtons
                  url={typeof window !== "undefined" ? window.location.href : ""}
                  title={`${business.name} – ${getBusinessCategoryDisplay(business.category)} ${getBusinessCityDisplay(business.city)}`}
                  text={`Check out ${business.name} on Vazivo`}
                  variant="dropdown"
                />
                <FavoriteButton business={business} variant="icon" size="md" />
              </div>
            </div>

            {/* Row 2: Logo + name/info + actions */}
            <div className="flex flex-col lg:flex-row items-start gap-2.5">
              <div className="flex items-start gap-2.5 flex-1 min-w-0 w-full">
                {business.logo_url && (
                  <Avatar className="h-12 w-12 md:h-14 md:w-14 shrink-0 rounded-xl border border-neutral-100 shadow-sm">
                    <AvatarImage src={business.logo_url} alt={`${business.name} logo`} className="object-cover object-center" />
                    <AvatarFallback className="text-base md:text-lg">{getInitials(business.name)}</AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-foreground leading-tight">
                    {business.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-0.5">
                    {/* Address */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-neutral-500 text-xs md:text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>{business.address}, {getBusinessCityDisplay(business.city)}</span>
                      </div>
                      {(mapUrl || wazeUrl) && (
                        <div className="flex items-center gap-1">
                          <span className="text-neutral-300 hidden sm:inline">•</span>
                          <div className="relative">
                            <button
                              onClick={() => setShowMapDropdown(!showMapDropdown)}
                              onBlur={() => setTimeout(() => setShowMapDropdown(false), 200)}
                              className="inline-flex items-center gap-1 text-primary hover:text-primary-600 font-medium"
                            >
                              {t("showMap")}
                              <ChevronDown className="h-3 w-3" />
                            </button>
                            {showMapDropdown && (
                              <div className="absolute left-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-neutral-200 py-1 z-10">
                                {mapUrl && (
                                  <a
                                    href={mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => {
                                      fetch(`/api/v1/businesses/${business.id}/track-google-maps-click`, {
                                        method: "POST",
                                        credentials: "include",
                                      }).catch(() => {});
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    {t("googleMaps")}
                                  </a>
                                )}
                                {wazeUrl && (
                                  <a
                                    href={wazeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => {
                                      fetch(`/api/v1/businesses/${business.id}/track-waze-click`, {
                                        method: "POST",
                                        credentials: "include",
                                      }).catch(() => {});
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    {t("waze")}
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <span className="text-neutral-200 hidden sm:inline" aria-hidden>|</span>

                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <RatingStars rating={Number(business.average_rating) || 0} size="sm" />
                      <span className="text-xs md:text-sm text-muted-foreground">
                        {(Number(business.average_rating) || 0).toFixed(1)} ({t("reviewsCount", { count: business.total_reviews || 0 })})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions - Right Side */}
              <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto">
                {isPremium && (
                  <Button
                    size="default"
                    className="h-10 rounded-xl px-6 text-base font-semibold flex-1 lg:flex-none bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => {
                      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    aria-label={t("bookNowAria")}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {t("bookNow")}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="default"
                  className="h-10 px-4 rounded-lg text-sm border border-neutral-200 text-neutral-500 hover:text-foreground flex-1 lg:flex-none"
                  onClick={() => setShowClaimModal(true)}
                  aria-label={t("claimButton")}
                >
                  <ShieldCheck className="h-4 w-4 mr-1.5 shrink-0" aria-hidden />
                  {t("claimButton")}
                </Button>
              </div>
            </div>
          </header>

        {/* Gallery - Full Width. Rendered only after mount to avoid hydration mismatch (image count/URLs can differ between server and client). */}
        <section
          className="mt-4"
          aria-labelledby="gallery-heading"
        >
          <h2 id="gallery-heading" className="sr-only">
            {t("photosOf", { name: business.name })}
          </h2>
          {galleryMounted ? (
            <GalleryRoot
              images={galleryImages}
              initialIndex={0}
              businessName={business.name}
              enableShare
              enableFavorite
              onShare={handleShare}
              onBack={() => router.back()}
              renderFavorite={() => (
                <FavoriteButton business={business} variant="icon" size="md" />
              )}
            />
          ) : (
            <div
              className="relative min-h-[240px] sm:min-h-[340px] lg:min-h-[420px] rounded-xl bg-neutral-100 grid gap-2 sm:gap-2.5 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
              aria-hidden
            />
          )}
        </section>

        {/* Two-column: services + location + rest | sticky sidebar (Prochaines disponibilités above Note globale) */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: services + location + rest */}
          <div className="lg:col-span-2 space-y-4">

            {/* Services — only for premium */}
            {isPremium && (
              <ServiceSection
                services={business.services || []}
                businessName={business.name}
                onBook={handleBookService}
              />
            )}
            {/* Non-Premium Message */}
            {!isPremium && (
                  <div className="mt-3 mb-4 p-3 md:p-4 bg-primary-50 border border-primary-200 rounded-xl">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs md:text-sm text-neutral-700 leading-relaxed">
                          {t("contactDirectlyMessage")}
                        </p>
                        {business.phone && (
                          <button
                            onClick={async () => {
                              try {
                                await fetch(`/api/v1/businesses/${business.id}/track-phone-click`, {
                                  method: "POST",
                                  credentials: "include",
                                });
                              } catch (error) {
                                console.error("Failed to track phone click");
                              }
                              setShowPhoneModal(true);
                            }}
                            className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium animate-pulse hover:animate-none"
                            aria-label={t("callAria")}
                          >
                            <Phone className="h-4 w-4" />
                            {t("showPhone")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

            {/* Location — map preview card */}
            <section aria-labelledby="location-heading" id="location">
              <header className="mb-4">
                <h2 id="location-heading" className="text-2xl font-semibold text-foreground tracking-tight">
                  {t("location")}
                </h2>
              </header>
              <MapPreview
                address={business.address || ""}
                city={getBusinessCityDisplay(business.city)}
                mapUrl={mapUrl}
                business={business}
              />
            </section>

            {/* Team (only if staff present and premium) */}
            {isPremium && Array.isArray(business.staff) && business.staff.length > 0 && (
              <section className=" border border-neutral-200 bg-white rounded-xl p-4 md:p-6 shadow-sm" aria-labelledby="team-heading">
                <h2 id="team-heading" className="text-2xl font-semibold text-foreground tracking-tight mb-4">
                  {t("team")}
                </h2>
                <ul className="list-none p-0 m-0 flex flex-wrap gap-4" role="list">
                  {business.staff.map((member) => (
                    <li key={member.id} className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 border-2 border-neutral-100">
                        {member.avatar_url ? (
                          <AvatarImage src={member.avatar_url} alt={member.name} />
                        ) : null}
                        <AvatarFallback className="text-sm">{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground">{member.name}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Reviews — premium only */}
            {isPremium && (
            <section className=" border border-neutral-200 bg-white rounded-xl p-4 md:p-6 shadow-sm" aria-labelledby="reviews-heading">
              <h2 id="reviews-heading" className="text-2xl font-semibold text-foreground tracking-tight mb-4">
                {t("reviews")}
              </h2>
              
              {/* Review Breakdown */}
              {business.reviews && business.reviews.length > 0 && business.rating_breakdown && (
                <div className="mb-4">
                  <ReviewBreakdown 
                    summary={{
                      average_rating: business.average_rating || 0,
                      total_reviews: business.total_reviews || 0,
                      rating_breakdown: business.rating_breakdown || {},
                      category_averages: business.category_averages || { cleanliness: 0, punctuality: 0, professionalism: 0, service_quality: 0, hygiene: 0 },
                      recent_photos: []
                    }}
                    isPremium={isPremium}
                  />
                </div>
              )}
              
              {/* Review List */}
              {business.reviews && business.reviews.length > 0 ? (
                <div className="space-y-0">
                  {business.reviews.slice(0, 5).map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("noReviewsYet")}
                </p>
              )}
            </section>
            )}

            {/* About */}
            <section className=" border border-neutral-200 bg-white rounded-xl p-4 md:p-6 shadow-sm" aria-labelledby="about-heading">
              <h2 id="about-heading" className="text-2xl font-semibold text-foreground tracking-tight mb-4">
                {t("about")}
              </h2>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {business.description || t("noDescription")}
              </p>
            </section>

            {/* Categories - Premium only */}
            {isPremium && (
              <section className=" border border-neutral-200 bg-white rounded-xl p-4 md:p-6 shadow-sm" aria-labelledby="categories-heading">
                <h2 id="categories-heading" className="text-2xl font-semibold text-foreground tracking-tight mb-4">
                  {t("inThisEstablishment")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={getSearchPath(
                      getBusinessCityDisplay(business.city) || null,
                      getBusinessCategoryDisplay(business.category) || null
                    )}
                    className="transition-opacity hover:opacity-90"
                  >
                    <CategoryBadge category={getBusinessCategoryDisplay(business.category)} />
                  </Link>
                </div>
              </section>
            )}
          </div>

          {/* Right: sticky sidebar */}
          <aside
            className="space-y-4 lg:sticky lg:top-24 h-fit"
            aria-label="Business information"
          >

            {/* Similar Premium Businesses - Only show for non-premium */}
            {!isPremium && (
              <SimilarBusinesses category={getBusinessCategoryDisplay(business.category)} city={getBusinessCityDisplay(business.city)} currentBusinessId={business.id} />
            )}

            <div className=" border border-neutral-200 bg-white rounded-xl p-4 md:p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-3">{t("overallRating")}</h3>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">
                  {(Number(business.average_rating) || 0).toFixed(1)}
                </span>
                <RatingStars rating={Number(business.average_rating) || 0} size="md" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {t("reviewsCount", { count: business.total_reviews || 0 })}
              </p>
              {business.total_reviews > 0 && business.rating_breakdown ? (
                <RatingBreakdown reviews={business.reviews || []} />
              ) : (
                <p className="text-sm text-muted-foreground">{t("noReviewsYet")}</p>
              )}
            </div>
          </aside>
        </div>

        </main>
      </div>

      <div className="pb-8"></div>

      {/* Phone Number Modal */}
      {showPhoneModal && business.phone && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
          onClick={() => setShowPhoneModal(false)}
        >
          <div
            className="bg-white rounded-xl  shadow-xl max-w-sm w-full p-4 md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                {t("call")}
              </h2>
              <button
                type="button"
                onClick={() => setShowPhoneModal(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 text-muted-foreground"
                aria-label={tCommon("close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-full mb-4">
                <Phone className="h-8 w-8 text-primary-600" />
              </div>
              <p className="text-sm text-neutral-600 mb-2">{business.name}</p>
              <a
                href={`tel:${business.phone}`}
                className="text-2xl md:text-3xl font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                {business.phone}
              </a>
            </div>
            <Button
              size="lg"
              className="w-full "
              asChild
            >
              <a href={`tel:${business.phone}`}>
                <Phone className="h-5 w-5 mr-2" />
                {t("call")}
              </a>
            </Button>
          </div>
        </div>
      )}

      {/* Claim this business modal */}
      {showClaimModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
          aria-labelledby="claim-modal-title"
          onClick={() => setShowClaimModal(false)}
        >
          <div
            className="bg-white rounded-xl  shadow-xl max-w-md w-full p-4 md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="claim-modal-title" className="text-xl font-semibold text-foreground">
                {t("claimModalTitle")}
              </h2>
              <button
                type="button"
                onClick={() => setShowClaimModal(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 text-muted-foreground"
                aria-label={tCommon("close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t("claimModalDescription", { name: business.name })}
            </p>
            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div>
                <label htmlFor="claim-name" className="block text-sm font-medium text-foreground mb-1.5">
                  {t("claimName")}
                </label>
                <Input
                  id="claim-name"
                  type="text"
                  required
                  placeholder={t("claimNamePlaceholder")}
                  value={claimForm.name}
                  onChange={(e) => setClaimForm((f) => ({ ...f, name: e.target.value }))}
                  className=""
                />
              </div>
              <div>
                <label htmlFor="claim-email" className="block text-sm font-medium text-foreground mb-1.5">
                  {t("claimEmail")}
                </label>
                <Input
                  id="claim-email"
                  type="email"
                  required
                  placeholder={t("claimEmailPlaceholder")}
                  value={claimForm.email}
                  onChange={(e) => setClaimForm((f) => ({ ...f, email: e.target.value }))}
                  className=""
                />
              </div>
              <div>
                <label htmlFor="claim-message" className="block text-sm font-medium text-foreground mb-1.5">
                  {t("claimMessage")} <span className="text-muted-foreground font-normal">{t("claimMessageOptional")}</span>
                </label>
                <textarea
                  id="claim-message"
                  rows={3}
                  placeholder={t("claimMessagePlaceholder")}
                  value={claimForm.message}
                  onChange={(e) => setClaimForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full  border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className=" flex-1"
                  onClick={() => setShowClaimModal(false)}
                >
                  {tCommon("cancel")}
                </Button>
                <Button type="submit" className=" flex-1" disabled={claimSubmitting}>
                  {claimSubmitting ? t("claimSending") : t("claimSubmit")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function RatingBreakdown({ reviews }: { reviews: Review[] }) {
  const total = reviews.length || 1;
  const breakdown = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: (reviews.filter((r) => r.rating === rating).length / total) * 100,
  }));

  return (
    <div className="space-y-1.5">
      {breakdown.map(({ rating, count, percentage }) => (
        <div key={rating} className="flex items-center gap-2 text-sm">
          <span className="w-3 text-muted-foreground">{rating}</span>
          <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />
          <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="w-8 text-muted-foreground text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}


