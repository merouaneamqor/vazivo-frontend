"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { RatingStars } from "@/components/ui/rating-stars";
import { VerificationBadge } from "@/components/admin/VerificationBadge";
import { HealthScoreIndicator } from "@/components/admin/HealthScoreIndicator";
import { ComplianceFlags } from "@/components/admin/ComplianceFlags";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ProviderActionsDropdown } from "@/components/admin/ProviderActionsDropdown";
import type { AdminProviderListItem } from "@/types/admin";

export function ProvidersTable({
  providers,
  onVerify,
  onUnverify,
  onSuspend,
  onReactivate,
  onImpersonate,
  onSendOnboardingEmail,
  onCopyId,
  onOpenQuickView,
  onApprove,
  onUnconfirm,
  onUpgradeSuccess,
}: {
  providers: AdminProviderListItem[];
  onVerify: (id: number) => void;
  onUnverify: (id: number) => void;
  onSuspend: (id: number) => void;
  onReactivate: (id: number) => void;
  onImpersonate: (id: number) => void;
  onSendOnboardingEmail: (id: number) => void;
  onCopyId: (id: number) => void;
  onOpenQuickView?: (provider: AdminProviderListItem) => void;
  onApprove?: (id: number) => void;
  onUnconfirm?: (id: number) => void;
  onUpgradeSuccess?: () => void;
}) {
  const t = useTranslations("adminProviders");
  const headerRow = (
    <tr className="sticky top-0 z-[1] border-b border-neutral-200 bg-neutral-100 text-left text-sm font-semibold text-neutral-700">
      <th className="px-4 py-3">{t("columnBusiness")}</th>
      <th className="px-4 py-3">{t("columnOwner")}</th>
      <th className="px-4 py-3">{t("columnStatus")}</th>
      <th className="px-4 py-3">{t("columnHealth")}</th>
      <th className="px-4 py-3">{t("columnPerformance")}</th>
      <th className="px-4 py-3 text-right">{t("columnActions")}</th>
    </tr>
  );

  return (
    <div className="overflow-x-auto  border border-neutral-200 shadow-sm">
      <table className="w-full text-sm" role="grid">
        <thead>{headerRow}</thead>
        <tbody>
          {providers.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-neutral-500">
                {t("noProvidersFound")}
              </td>
            </tr>
          ) : (
            providers.map((provider) => (
              <tr
                key={provider.id}
                className="border-b border-neutral-100 hover:bg-neutral-50/80 transition-colors"
              >
                {/* Business Info */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      {onOpenQuickView ? (
                        <button
                          type="button"
                          onClick={() => onOpenQuickView(provider)}
                          className="font-semibold text-primary-600 hover:underline text-left"
                        >
                          {provider.name}
                        </button>
                      ) : (
                        <Link
                          href={`/admin/providers/${provider.id}`}
                          className="font-semibold text-primary-600 hover:underline"
                        >
                          {provider.name}
                        </Link>
                      )}
                      {provider.verification_status === "verified" && provider.status !== "suspended" && (
                        <svg 
                          className="w-4 h-4 text-blue-500 flex-shrink-0" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <title>Verified account</title>
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span>{provider.category}</span>
                      <span>•</span>
                      <span>{typeof provider.city === "string" ? provider.city : (provider.city as { name?: string })?.name ?? "—"}</span>
                    </div>
                  </div>
                </td>

                {/* Owner Info */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-neutral-900">{provider.owner_name ?? "—"}</span>
                    {provider.owner_email && (
                      <span className="text-xs text-neutral-500 truncate max-w-[200px]" title={provider.owner_email}>
                        {provider.owner_email}
                      </span>
                    )}
                  </div>
                </td>

                {/* Status Column - Combined confirmation, premium, suspended */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1.5">
                    {provider.status === "suspended" && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-medium">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
                        </svg>
                        Suspended
                      </span>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {provider.owner_provider_status === "confirmed" ? (
                        <span 
                          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 cursor-help"
                          title="Provider account is confirmed and can accept bookings"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          Account Active
                        </span>
                      ) : (
                        <span 
                          className="inline-flex items-center gap-1 text-xs text-neutral-400 cursor-help"
                          title="Provider account is not confirmed yet and cannot accept bookings"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                          </svg>
                          Pending Approval
                        </span>
                      )}
                      {provider.owner_premium_expires_at && new Date(provider.owner_premium_expires_at) > new Date() && (
                        <span 
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 text-xs font-semibold text-amber-700 cursor-help"
                          title={`Premium subscription active until ${new Date(provider.owner_premium_expires_at).toLocaleDateString()}`}
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                          Premium
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Health Column */}
                <td className="px-4 py-3">
                  <HealthScoreIndicator
                    score={provider.onboarding_score}
                    noShowRate={provider.no_show_rate}
                    cancellationRate={provider.cancellation_rate}
                  />
                </td>

                {/* Performance Column - Combined rating, bookings, staff */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1.5">
                    <RatingStars
                      rating={provider.average_rating ?? 0}
                      size="sm"
                      showValue
                      className="text-neutral-700"
                    />
                    <div className="flex items-center gap-3 text-xs text-neutral-600">
                      <span className="font-medium">{provider.total_bookings_30d ?? 0} bookings</span>
                      <span>•</span>
                      <span>{provider.staff_count ?? 0} staff</span>
                    </div>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {onOpenQuickView && (
                      <button
                        type="button"
                        onClick={() => onOpenQuickView(provider)}
                        className="text-primary-600 hover:underline text-sm font-medium"
                      >
                        {t("view")}
                      </button>
                    )}
                    <ProviderActionsDropdown
                      provider={provider}
                      onVerify={onVerify}
                      onUnverify={onUnverify}
                      onSuspend={onSuspend}
                      onReactivate={onReactivate}
                      onImpersonate={onImpersonate}
                      onSendOnboardingEmail={onSendOnboardingEmail}
                      onCopyId={onCopyId}
                      onApprove={onApprove}
                      onUnconfirm={onUnconfirm}
                      onUpgradeSuccess={onUpgradeSuccess}
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
