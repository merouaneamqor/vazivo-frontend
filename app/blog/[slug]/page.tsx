import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getStaticArticle,
  parseCityGuideSlug,
  parseAvisSlug,
  getAllBlogSlugs,
  CITY_GUIDE_COMBOS,
  type CityLink,
} from "@/lib/blog";
import { getApiBaseUrl } from "@/lib/business-server";
import type { Business } from "@/types";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://ollazen.com").replace(/\/+$/, "");

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

// ---------- Metadata ----------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const staticArticle = getStaticArticle(slug);
  if (staticArticle) {
    return buildMeta(staticArticle.title, staticArticle.description, slug);
  }

  const guideCombo = parseCityGuideSlug(slug);
  if (guideCombo) {
    const combo = CITY_GUIDE_COMBOS.find(
      (c) => c.category === guideCombo.category && c.city === guideCombo.city
    );
    if (combo) {
      const title = `Les ${combo.categoryLabel} à ${combo.cityLabel} – Top Adresses & Réservation`;
      const description = `Découvrez les meilleurs ${combo.categoryLabel.toLowerCase()} à ${combo.cityLabel} : adresses, prix, avis clients et réservation en ligne sur OllaZen.`;
      return buildMeta(title, description, slug);
    }
  }

  const avisPage = parseAvisSlug(slug);
  if (avisPage) {
    const title = `Avis sur ${avisPage.name} à ${avisPage.city} – Prix, Photos et Expérience`;
    const description = `Découvrez ${avisPage.name} à ${avisPage.city} : avis clients, prix des services, photos et comment réserver sur OllaZen.`;
    return buildMeta(title, description, slug);
  }

  return { title: "Article introuvable" };
}

function buildMeta(title: string, description: string, slug: string): Metadata {
  const canonical = `${appUrl}/blog/${slug}`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "fr-MA": `${canonical}?hl=fr`,
        "ar-MA": `${canonical}?hl=ar`,
        en: `${canonical}?hl=en`,
        "x-default": canonical,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      siteName: "OllaZen",
      locale: "fr_MA",
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1 } },
  };
}

// ---------- Page ----------

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const staticArticle = getStaticArticle(slug);
  if (staticArticle) return <StaticArticleLayout article={staticArticle} />;

  const guideCombo = parseCityGuideSlug(slug);
  if (guideCombo) {
    const combo = CITY_GUIDE_COMBOS.find(
      (c) => c.category === guideCombo.category && c.city === guideCombo.city
    );
    if (!combo) return notFound();
    const businesses = await fetchBusinesses(guideCombo.category, guideCombo.city);
    return <CityGuideLayout combo={combo} businesses={businesses} slug={slug} />;
  }

  const avisPage = parseAvisSlug(slug);
  if (avisPage) {
    const business = await fetchBusiness(avisPage.businessSlug);
    return <AvisLayout avisPage={avisPage} business={business} slug={slug} />;
  }

  return notFound();
}

// ---------- Data fetchers ----------

async function fetchBusinesses(category: string, city: string): Promise<Business[]> {
  try {
    const url = `${getApiBaseUrl()}/public/businesses?category=${encodeURIComponent(category)}&city=${encodeURIComponent(city)}&per_page=12`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.businesses || []) as Business[];
  } catch {
    return [];
  }
}

async function fetchBusiness(slug: string): Promise<Business | null> {
  try {
    const url = `${getApiBaseUrl()}/public/businesses/${encodeURIComponent(slug)}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.business ?? null;
  } catch {
    return null;
  }
}

// ---------- Helpers ----------

function readingMins(html: string): number {
  const words = html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-MA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Gradient per article slug / category
const GRADIENTS: Record<string, string> = {
  "spa-autour-de-moi-maroc": "from-emerald-600 via-teal-600 to-cyan-600",
  "hammam-pres-de-moi": "from-amber-500 via-orange-500 to-red-500",
  "hammam-maroc-prix": "from-amber-600 via-yellow-500 to-orange-400",
  "meilleurs-barbershops-maroc": "from-slate-700 via-neutral-700 to-zinc-800",
  "salon-beaute-femme-maroc": "from-rose-500 via-pink-500 to-fuchsia-500",
  spa: "from-emerald-600 via-teal-600 to-cyan-600",
  hammam: "from-amber-500 via-orange-500 to-red-500",
  barber: "from-slate-700 via-neutral-700 to-zinc-800",
  "salon-de-beaute": "from-rose-500 via-pink-500 to-fuchsia-500",
  coiffeur: "from-violet-600 via-purple-600 to-indigo-600",
};

// ---------- SVG icons ----------

function ChevronRight({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={`${className} shrink-0`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function StarFill({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

// ---------- Article shell ----------

interface ShellProps {
  title: string;
  description?: string;
  breadcrumb: string;
  date?: string;
  bodyHtml?: string;
  badge?: string;
  gradient: string;
  children: React.ReactNode;
}

function ArticleShell({ title, description, breadcrumb, date, bodyHtml, badge, gradient, children }: ShellProps) {
  const mins = bodyHtml ? readingMins(bodyHtml) : null;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sticky breadcrumb bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-neutral-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-10 flex items-center gap-1.5 text-xs text-neutral-500 overflow-hidden">
          <Link href="/" className="hover:text-primary-600 transition-colors whitespace-nowrap">
            Accueil
          </Link>
          <ChevronRight />
          <Link href="/blog" className="hover:text-primary-600 transition-colors whitespace-nowrap">
            Blog
          </Link>
          <ChevronRight />
          <span className="font-medium text-neutral-700 truncate">{breadcrumb}</span>
        </div>
      </div>

      {/* Hero banner */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${gradient}`}>
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-black/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-white/5 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          {badge && (
            <span className="inline-block mb-4 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/20 text-black border border-white/20">
              {badge}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black leading-tight mb-3 max-w-2xl">
            {title}
          </h1>
          {description && (
            <p className="text-black/80 text-sm sm:text-base max-w-xl leading-relaxed mb-5">
              {description}
            </p>
          )}
          {(date || mins) && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-black/70">
              {date && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <time dateTime={date}>{formatDate(date)}</time>
                </span>
              )}
              {date && mins && <span className="text-black/40">·</span>}
              {mins && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {mins} min de lecture
                </span>
              )}
              <span className="text-black/40">·</span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                OllaZen
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </div>
    </div>
  );
}

// ---------- City links grid ----------

function CityLinksGrid({ links, title = "Réserver par ville" }: { links: CityLink[]; title?: string }) {
  return (
    <section className="mt-10">
      <h2 className="text-base font-semibold text-neutral-900 mb-4 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-emerald-500 shrink-0" />
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {links.map((link, i) => (
          <Link
            key={i}
            href={link.href}
            className="group flex items-center gap-2.5 p-3 bg-white rounded-xl border border-neutral-200 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-sm transition-all"
          >
            {link.emoji && (
              <span className="text-xl shrink-0 w-8 h-8 bg-neutral-50 group-hover:bg-white rounded-lg flex items-center justify-center transition-colors">
                {link.emoji}
              </span>
            )}
            <div className="min-w-0">
              <div className="text-[11px] text-neutral-400 leading-none mb-0.5">{link.category}</div>
              <div className="text-sm font-medium text-neutral-800 group-hover:text-emerald-700 truncate transition-colors">
                {link.label}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ---------- Booking CTA ----------

function BookingCTA({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description?: string;
}) {
  return (
    <div className="mt-10 relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-6 sm:p-8 text-black">
      <div className="pointer-events-none absolute right-0 top-0 w-48 h-48 -translate-y-1/3 translate-x-1/3 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute left-0 bottom-0 w-32 h-32 translate-y-1/3 -translate-x-1/4 rounded-full bg-black/10 blur-2xl" />
      <div className="relative">
        <p className="text-xs font-bold uppercase tracking-widest text-black/60 mb-1">OllaZen</p>
        <h3 className="text-lg sm:text-xl font-bold text-black mb-1">{label}</h3>
        {description && <p className="text-sm text-black/75 mb-5 max-w-sm">{description}</p>}
        <Link
          href={href}
          className="inline-flex items-center gap-2 bg-white text-emerald-700 font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-emerald-50 transition-colors shadow-md"
        >
          Réserver maintenant
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

// ---------- Static article layout ----------

function StaticArticleLayout({ article }: { article: ReturnType<typeof getStaticArticle> }) {
  if (!article) return null;

  const gradient = GRADIENTS[article.slug] || "from-emerald-600 via-teal-600 to-cyan-600";
  const ctaHref = article.cityLinks?.[0]?.href || "/blog";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    author: { "@type": "Organization", name: "OllaZen" },
    publisher: { "@type": "Organization", name: "OllaZen", url: appUrl },
    url: `${appUrl}/blog/${article.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ArticleShell
        title={article.title}
        description={article.description}
        breadcrumb={article.title}
        date={article.date}
        bodyHtml={article.body}
        badge="Guide"
        gradient={gradient}
      >
        {article.body && (
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 sm:p-8">
            <div
              className="prose prose-neutral max-w-none prose-headings:font-semibold prose-headings:text-neutral-900 prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3 prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline prose-li:text-neutral-700 prose-li:leading-relaxed prose-p:text-neutral-600 prose-p:leading-relaxed prose-strong:text-neutral-900"
              dangerouslySetInnerHTML={{ __html: article.body }}
            />
          </div>
        )}

        {article.cityLinks && article.cityLinks.length > 0 && (
          <CityLinksGrid links={article.cityLinks} />
        )}

        <BookingCTA
          href={ctaHref}
          label="Trouvez votre spa ou hammam idéal"
          description="Comparez les prix, lisez les avis et réservez en ligne en quelques secondes."
        />
      </ArticleShell>
    </>
  );
}

// ---------- City guide layout ----------

function CityGuideLayout({
  combo,
  businesses,
  slug,
}: {
  combo: (typeof CITY_GUIDE_COMBOS)[number];
  businesses: Business[];
  slug: string;
}) {
  const title = `Les Meilleurs ${combo.categoryLabel} à ${combo.cityLabel}`;
  const listingUrl = `/${combo.category}/${combo.city}`;
  const gradient = GRADIENTS[combo.category] || "from-primary-600 to-primary-700";
  const description = `Vous cherchez un ${combo.categoryLabel.toLowerCase().replace(/s$/, "")} à ${combo.cityLabel} ? Voici les meilleures adresses sur OllaZen, avec avis clients et réservation en ligne.`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    author: { "@type": "Organization", name: "OllaZen" },
    publisher: { "@type": "Organization", name: "OllaZen", url: appUrl },
    url: `${appUrl}/blog/${slug}`,
    about: { "@type": "City", name: combo.cityLabel, addressCountry: "MA" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ArticleShell
        title={title}
        description={description}
        breadcrumb={`${combo.categoryLabel} ${combo.cityLabel}`}
        badge="Guide Ville"
        gradient={gradient}
      >
        {businesses.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-neutral-500">
                <span className="font-semibold text-neutral-800">{businesses.length}</span>{" "}
                établissement{businesses.length > 1 ? "s" : ""} trouvé{businesses.length > 1 ? "s" : ""}
              </p>
              <Link
                href={listingUrl}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
              >
                Voir tout <ChevronRight />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              {businesses.map((b, i) => (
                <BusinessCard key={b.id} business={b} rank={i + 1} />
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-100 p-10 text-center mb-4">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="text-neutral-500 text-sm">
              Les établissements de cette ville sont en cours d&apos;ajout.
            </p>
          </div>
        )}

        <BookingCTA
          href={listingUrl}
          label={`Voir tous les ${combo.categoryLabel.toLowerCase()} à ${combo.cityLabel}`}
          description="Comparez les prix, lisez les avis et réservez en ligne sur OllaZen."
        />
      </ArticleShell>
    </>
  );
}

// ---------- Avis layout ----------

function AvisLayout({
  avisPage,
  business,
  slug,
}: {
  avisPage: { name: string; city: string; businessSlug: string; slug: string };
  business: Business | null;
  slug: string;
}) {
  const title = `Avis sur ${avisPage.name} à ${avisPage.city} – Prix, Photos et Expérience`;
  const description = business
    ? `Tout sur ${avisPage.name} à ${avisPage.city}${business.average_rating > 0 ? ` – note ${business.average_rating.toFixed(1)}/5` : ""} : prix, photos et avis clients.`
    : `Découvrez ${avisPage.name} à ${avisPage.city} sur OllaZen.`;

  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Review",
    name: title,
    author: { "@type": "Organization", name: "OllaZen" },
    publisher: { "@type": "Organization", name: "OllaZen", url: appUrl },
    url: `${appUrl}/blog/${slug}`,
    itemReviewed: {
      "@type": "LocalBusiness",
      name: business?.name || avisPage.name,
      address: { "@type": "PostalAddress", addressLocality: avisPage.city, addressCountry: "MA" },
      ...(business?.average_rating && business.total_reviews > 0
        ? { aggregateRating: { "@type": "AggregateRating", ratingValue: business.average_rating, reviewCount: business.total_reviews } }
        : {}),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ArticleShell
        title={title}
        description={description}
        breadcrumb={`${avisPage.name} ${avisPage.city}`}
        badge="Avis"
        gradient="from-emerald-600 via-teal-600 to-cyan-600"
      >
        {business ? (
          <AvisContent business={business} avisPage={avisPage} />
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-100 p-10 text-center">
            <span className="text-4xl block mb-4">🕐</span>
            <p className="text-neutral-500 text-sm mb-4">
              Les informations sur {avisPage.name} à {avisPage.city} seront bientôt disponibles.
            </p>
            <Link href="/blog" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
              ← Voir tous nos guides
            </Link>
          </div>
        )}
      </ArticleShell>
    </>
  );
}

// ---------- Avis content ----------

function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "xs" }) {
  const sz = size === "xs" ? "w-3 h-3" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <StarFill
          key={s}
          className={`${sz} ${s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-neutral-200 fill-neutral-200"}`}
        />
      ))}
    </div>
  );
}

function AvisContent({
  business,
  avisPage,
}: {
  business: Business;
  avisPage: { name: string; city: string; businessSlug: string; slug: string };
}) {
  const city = (typeof business.city === "string" ? business.city : avisPage.city)
    .toLowerCase()
    .replace(/\s+/g, "-");
  const cat = (typeof business.category === "string" ? business.category : "spa")
    .toLowerCase()
    .replace(/\s+/g, "-");
  const businessPath = `/${city}/${cat}/${business.slug}`;

  return (
    <div className="space-y-5">
      {/* Summary card */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {business.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.logo_url}
              alt={business.name}
              loading="lazy"
              className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-neutral-100"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-emerald-50 shrink-0 flex items-center justify-center text-3xl border border-emerald-100">
              🧖
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-neutral-900 mb-1 leading-tight">{business.name}</h2>
            {business.address && (
              <p className="text-sm text-neutral-500 flex items-center gap-1 mb-2">
                <span>📍</span>
                {business.address}, {avisPage.city}
              </p>
            )}
            {business.average_rating > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <StarRow rating={business.average_rating} />
                <span className="text-sm font-semibold text-neutral-900">{business.average_rating.toFixed(1)}</span>
                <span className="text-sm text-neutral-400">({business.total_reviews} avis)</span>
              </div>
            )}
            {business.phone && (
              <p className="text-sm text-neutral-500 flex items-center gap-1">
                <span>📞</span>
                {business.phone}
              </p>
            )}
          </div>
          <Link
            href={businessPath}
            className="shrink-0 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-black font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            Réserver <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Services & Prix */}
      {business.services && business.services.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-50">
            <h2 className="text-base font-semibold text-neutral-900">Services & Prix</h2>
          </div>
          <div className="divide-y divide-neutral-50">
            {business.services.slice(0, 8).map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-neutral-700">{s.name}</span>
                <span className="text-sm font-semibold text-neutral-900 bg-neutral-50 px-2.5 py-0.5 rounded-lg tabular-nums">
                  {s.formatted_price || `${s.price} MAD`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos */}
      {business.image_urls && business.image_urls.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-neutral-900 mb-3">Photos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {business.image_urls.slice(0, 6).map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt={`${avisPage.name} ${avisPage.city} photo ${i + 1}`}
                loading="lazy"
                className="w-full aspect-square object-cover rounded-xl"
              />
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {business.description && (
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-neutral-900 mb-2">À propos</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">{business.description}</p>
        </div>
      )}

      {/* Avis clients */}
      {business.reviews && business.reviews.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-neutral-900 mb-4">Avis clients</h2>
          <div className="divide-y divide-neutral-50">
            {business.reviews.slice(0, 5).map((r) => (
              <div key={r.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <div className="shrink-0 w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold flex items-center justify-center uppercase">
                  {(r.user_name || "C").slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-neutral-900">{r.user_name || "Client"}</span>
                    <StarRow rating={r.rating} size="xs" />
                  </div>
                  {r.comment && <p className="text-sm text-neutral-600 leading-relaxed">{r.comment}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <BookingCTA
        href={businessPath}
        label={`Réserver chez ${avisPage.name}`}
        description={`Voir les disponibilités et réserver en ligne sur OllaZen.`}
      />
    </div>
  );
}

// ---------- Business card ----------

function BusinessCard({ business, rank }: { business: Business; rank: number }) {
  const citySlug = (typeof business.city === "string" ? business.city : "all").toLowerCase().replace(/\s+/g, "-");
  const catSlug = (typeof business.category === "string" ? business.category : "all").toLowerCase().replace(/\s+/g, "-");
  const href = `/${citySlug}/${catSlug}/${business.slug}`;

  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all p-4 flex gap-3 items-start"
    >
      {/* Rank badge */}
      <div className="shrink-0 w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center justify-center border border-emerald-100 mt-0.5">
        {rank}
      </div>

      {/* Logo */}
      {business.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={business.logo_url}
          alt={business.name}
          loading="lazy"
          className="w-14 h-14 rounded-xl object-cover shrink-0"
        />
      ) : (
        <div className="w-14 h-14 rounded-xl bg-neutral-50 shrink-0 flex items-center justify-center text-2xl border border-neutral-100">
          🧖
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-neutral-900 group-hover:text-emerald-700 leading-tight mb-0.5 transition-colors">
          {business.name}
        </p>
        {business.address && (
          <p className="text-xs text-neutral-400 truncate mb-1">{business.address}</p>
        )}
        {business.average_rating > 0 && (
          <div className="flex items-center gap-1">
            <StarFill className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold text-amber-600">{business.average_rating.toFixed(1)}</span>
            <span className="text-xs text-neutral-400">({business.total_reviews})</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <span className="shrink-0 self-center text-xs font-semibold text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap">
        Voir →
      </span>
    </Link>
  );
}
