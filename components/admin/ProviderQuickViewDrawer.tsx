"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, MapPin, ExternalLink, User, CheckCircle, XCircle, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/features/admin";
import { queryKeys } from "@/lib/query-client";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/admin/VerificationBadge";
import { HealthScoreIndicator } from "@/components/admin/HealthScoreIndicator";
import { ComplianceFlags } from "@/components/admin/ComplianceFlags";
import { UpgradeProviderModal } from "@/components/admin/UpgradeProviderModal";
import { cn } from "@/lib/utils";

const ONBOARDING_ITEMS: { key: keyof Pick<
  import("@/types/admin").AdminProviderListItem,
  "has_services" | "has_cover_photos" | "has_opening_hours" | "has_staff" | "has_availability" | "has_category" | "has_geo"
>; labelKey: string }[] = [
  { key: "has_services", labelKey: "onboardingServices" },
  { key: "has_cover_photos", labelKey: "onboardingCoverPhotos" },
  { key: "has_opening_hours", labelKey: "onboardingOpeningHours" },
  { key: "has_staff", labelKey: "onboardingStaff" },
  { key: "has_availability", labelKey: "onboardingAvailability" },
  { key: "has_category", labelKey: "onboardingCategory" },
  { key: "has_geo", labelKey: "onboardingGeo" },
];

export function ProviderQuickViewDrawer({
  providerId,
  open,
  onClose,
  onImpersonate,
  onApprove,
  onUnconfirm,
  onUpgradeSuccess,
}: {
  providerId: number | null;
  open: boolean;
  onClose: () => void;
  onImpersonate?: (id: number) => void;
  onApprove?: (id: number) => void;
  onUnconfirm?: (id: number) => void;
  onUpgradeSuccess?: () => void;
}) {
  const t = useTranslations("adminProviders");
  const tCommon = useTranslations("common");
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.provider(providerId ?? 0),
    queryFn: () => adminService.getProvider(providerId!),
    enabled: open && providerId != null,
  });

  const provider = data?.provider;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-neutral-200 bg-white shadow-xl transition-transform duration-200 ease-out",
            "data-[state=closed]:translate-x-full data-[state=open]:translate-x-0"
          )}
          onEscapeKeyDown={() => onClose()}
        >
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
              <DialogPrimitive.Title className="text-lg font-semibold text-neutral-900">
                {t("drawerTitle")}
              </DialogPrimitive.Title>
              <DialogPrimitive.Close asChild>
                <Button variant="ghost" size="icon-sm" aria-label={tCommon("close")}>
                  <X className="h-5 w-5" />
                </Button>
              </DialogPrimitive.Close>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {isLoading && (
                <div className="text-sm text-neutral-500">{t("loading")}</div>
              )}
              {!isLoading && provider && (
                <>
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
                      {t("sectionBusiness")}
                    </h3>
                    <p className="font-medium text-neutral-900">{provider.name}</p>
                    <p className="text-sm text-neutral-600">{provider.category}</p>
                    <VerificationBadge
                      status={
                        provider.status === "suspended"
                          ? "suspended"
                          : provider.verification_status
                      }
                      className="mt-2"
                    />
                  </section>

                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2 flex items-center gap-1">
                      <User className="h-3.5 w-3.5" /> {t("sectionOwner")}
                    </h3>
                    <p className="text-sm text-neutral-900">{provider.owner_name ?? "—"}</p>
                    <p className="text-xs text-neutral-600">{provider.owner_email ?? "—"}</p>
                    {provider.owner_phone && (
                      <p className="text-xs text-neutral-600">{provider.owner_phone}</p>
                    )}
                    <p className="text-xs text-neutral-500 mt-1">
                      {t("account")}: {provider.account_status ?? "—"}
                      {provider.last_login_at && (
                        <> · {t("lastLogin")}: {new Date(provider.last_login_at).toLocaleDateString()}</>
                      )}
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
                      {t("sectionHealth")}
                    </h3>
                    <HealthScoreIndicator
                      score={provider.onboarding_score}
                      noShowRate={provider.no_show_rate}
                      cancellationRate={provider.cancellation_rate}
                    />
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-neutral-600">
                      <span>{t("columnBookings30d")}: {provider.total_bookings_30d ?? 0}</span>
                      <span>{t("reviews")}: {provider.total_reviews ?? 0}</span>
                      <span>{t("noShow")}: {((provider.no_show_rate ?? 0) * 100).toFixed(1)}%</span>
                      <span>{t("cancel")}: {((provider.cancellation_rate ?? 0) * 100).toFixed(1)}%</span>
                      {provider.last_booking_at && (
                        <span>{t("lastBooking")}: {new Date(provider.last_booking_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
                      {t("sectionOnboarding")}
                    </h3>
                    <ul className="space-y-1.5">
                      {ONBOARDING_ITEMS.map(({ key, labelKey }) => {
                        const value = provider[key];
                        return (
                          <li
                            key={key}
                            className={cn(
                              "flex items-center gap-2 text-sm",
                              value ? "text-emerald-700" : "text-neutral-500"
                            )}
                          >
                            {value ? (
                              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                            ) : (
                              <XCircle className="h-4 w-4 text-neutral-300 shrink-0" />
                            )}
                            {t(labelKey)}
                          </li>
                        );
                      })}
                    </ul>
                    <p className="mt-2 text-xs text-neutral-500">
                      {t("score")}: {provider.onboarding_score ?? 0}/7
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
                      {t("sectionStaff")}
                    </h3>
                    <p className="text-sm text-neutral-700">
                      {provider.staff_count ?? 0} {t("staffCountLabel")}
                      {typeof provider.staff_with_availability_count === "number" && (
                        <span className="text-neutral-500">
                          {" "}
                          ({provider.staff_with_availability_count} {t("staffWithAvailability")})
                        </span>
                      )}
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {t("sectionLocation")}
                    </h3>
                    <p className="text-sm text-neutral-700">{provider.address ?? "—"}</p>
                    <p className="text-sm text-neutral-700">{typeof provider.city === "string" ? provider.city : (provider.city as { name?: string })?.name ?? "—"}</p>
                    {provider.map_link && (
                      <a
                        href={provider.map_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline mt-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {t("openInMaps")}
                      </a>
                    )}
                    {provider.geo_validated && (
                      <span className="text-xs text-emerald-600 mt-1 block">{t("geoValidated")}</span>
                    )}
                  </section>

                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
                      {t("sectionCompliance")}
                    </h3>
                    <ComplianceFlags provider={provider} />
                  </section>
                </>
              )}
              {!isLoading && !provider && providerId != null && (
                <p className="text-sm text-neutral-500">{t("providerNotFound")}</p>
              )}
            </div>
            {provider && (
              <div className="flex flex-wrap gap-2 border-t border-neutral-200 p-4">
                <Link href={`/admin/providers/${provider.id}`}>
                  <Button variant="outline" size="sm">
                    {t("viewFull")}
                  </Button>
                </Link>
                <Link href={`/admin/providers/${provider.id}/edit`}>
                  <Button variant="outline" size="sm">
                    {t("edit")}
                  </Button>
                </Link>
                {onApprove &&
                  (provider as { owner_provider_status?: string }).owner_provider_status !==
                    "confirmed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onApprove(provider.id)}
                      className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {t("actionConfirmProvider")}
                    </Button>
                  )}
                {onUnconfirm &&
                  (provider as { owner_provider_status?: string }).owner_provider_status ===
                    "confirmed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUnconfirm(provider.id)}
                      className="text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      {t("actionUnconfirmProvider")}
                    </Button>
                  )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUpgradeModalOpen(true)}
                  className="text-amber-700 border-amber-200 hover:bg-amber-50"
                >
                  <Crown className="h-4 w-4 mr-1" />
                  {t("actionUpgradePremium")}
                </Button>
                {onImpersonate && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onImpersonate(provider.id)}
                  >
                    {t("impersonate")}
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
      {providerId != null && (
        <UpgradeProviderModal
          open={upgradeModalOpen}
          onOpenChange={setUpgradeModalOpen}
          providerId={providerId}
          providerName={provider?.name}
          onSuccess={onUpgradeSuccess}
        />
      )}
    </DialogPrimitive.Root>
  );
}
