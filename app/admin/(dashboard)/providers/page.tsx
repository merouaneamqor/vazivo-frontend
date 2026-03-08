"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import {
  useAdminProviders,
  useAdminCategories,
  useAdminCities,
  adminService,
  flattenCategories,
  flattenCities,
} from "@/features/admin";
import { queryKeys } from "@/lib/query-client";
import { ProvidersFiltersBar } from "@/components/admin/ProvidersFiltersBar";
import { ProvidersTable } from "@/components/admin/ProvidersTable";
import { ProviderQuickViewDrawer } from "@/components/admin/ProviderQuickViewDrawer";
import { Pagination } from "@/components/admin/Pagination";
import { Button } from "@/components/ui/button";
import { PageSpinner } from "@/components/ui/spinner";
import type { AdminProviderListItem, AdminProvidersFilters } from "@/types/admin";

const defaultFilters: AdminProvidersFilters = {
  page: 1,
  per_page: 20,
};

export default function AdminProvidersPage() {
  const t = useTranslations("adminProviders");
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<AdminProvidersFilters>(defaultFilters);
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading } = useAdminProviders(filters);
  const { data: categoriesData } = useAdminCategories();
  const { data: citiesData } = useAdminCities();

  const topCategories = categoriesData?.acts?.filter(cat => !cat.parent_id) || [];
  const selectedCategory = topCategories.find(cat => cat.name === filters.category);
  const subCategories = selectedCategory 
    ? categoriesData?.acts?.filter(cat => cat.parent_id === selectedCategory.id) || []
    : [];
  const cities = citiesData?.cities ? flattenCities(citiesData.cities) : [];

  const invalidateProviders = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.providers() });
    if (selectedProviderId != null) {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.provider(selectedProviderId) });
    }
  }, [queryClient, selectedProviderId]);

  const updateProviderInCache = useCallback((providerId: number, updates: Partial<AdminProviderListItem>) => {
    queryClient.setQueryData(
      queryKeys.admin.providers(filters as Record<string, unknown>),
      (old: any) => {
        if (!old?.providers) return old;
        return {
          ...old,
          providers: old.providers.map((p: AdminProviderListItem) =>
            p.id === providerId ? { ...p, ...updates } : p
          ),
        };
      }
    );
  }, [queryClient, filters]);

  const mutateOptions = {
    onSuccess: () => {
      invalidateProviders();
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? "Action failed");
    },
  };

  const approveMutation = useMutation({
    mutationFn: adminService.approveProvider,
    onMutate: async (id) => {
      updateProviderInCache(id, { owner_provider_status: "confirmed", status: "approved" });
    },
    onSuccess: () => {
      toast.success("Provider confirmed");
      invalidateProviders();
    },
    onError: (err: { message?: string }, id) => {
      toast.error(err?.message ?? "Confirm failed");
      invalidateProviders();
    },
  });

  const unconfirmMutation = useMutation({
    mutationFn: adminService.unconfirmProvider,
    onMutate: async (id) => {
      updateProviderInCache(id, { owner_provider_status: "not_confirmed" });
    },
    onSuccess: () => {
      toast.success("Provider unconfirmed");
      invalidateProviders();
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? "Unconfirm failed");
      invalidateProviders();
    },
  });

  const verifyMutation = useMutation({
    mutationFn: adminService.verifyProvider,
    onMutate: async (id) => {
      updateProviderInCache(id, { verification_status: "verified" });
    },
    onSuccess: () => {
      toast.success("Provider verified");
      invalidateProviders();
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? "Verify failed");
      invalidateProviders();
    },
  });

  const unverifyMutation = useMutation({
    mutationFn: adminService.unverifyProvider,
    onMutate: async (id) => {
      updateProviderInCache(id, { verification_status: "pending" });
    },
    onSuccess: () => {
      toast.success("Provider set to pending verification");
      invalidateProviders();
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? "Unverify failed");
      invalidateProviders();
    },
  });

  const suspendMutation = useMutation({
    mutationFn: adminService.suspendProvider,
    onMutate: async (id) => {
      updateProviderInCache(id, { status: "suspended" });
    },
    onSuccess: () => {
      toast.success("Provider suspended");
      invalidateProviders();
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? "Suspend failed");
      invalidateProviders();
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: adminService.reactivateProvider,
    onMutate: async (id) => {
      updateProviderInCache(id, { status: "approved" });
    },
    onSuccess: () => {
      toast.success("Provider reactivated");
      invalidateProviders();
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? "Reactivate failed");
      invalidateProviders();
    },
  });
  const impersonateMutation = useMutation({
    mutationFn: adminService.impersonateProvider,
    onSuccess: (data) => {
      if (data?.access_token) {
        // Redirect to provider app with token or set cookie per your auth flow
        window.location.href = "/provider";
      }
      invalidateProviders();
    },
    onError: (err: { message?: string }) => toast.error(err?.message ?? "Impersonate failed"),
  });
  const sendOnboardingMutation = useMutation({
    mutationFn: adminService.sendOnboardingEmailProvider,
    onSuccess: () => {
      toast.success("Onboarding email sent");
      invalidateProviders();
    },
    onError: (err: { message?: string }) => toast.error(err?.message ?? "Send email failed"),
  });

  const handleApprove = (id: number) => approveMutation.mutate(id);
  const handleUnconfirm = (id: number) => unconfirmMutation.mutate(id);
  const handleVerify = (id: number) => verifyMutation.mutate(id);
  const handleUnverify = (id: number) => unverifyMutation.mutate(id);
  const handleSuspend = (id: number) => suspendMutation.mutate(id);
  const handleReactivate = (id: number) => reactivateMutation.mutate(id);
  const handleImpersonate = (id: number) => impersonateMutation.mutate(id);
  const handleSendOnboardingEmail = (id: number) => sendOnboardingMutation.mutate(id);
  const handleCopyId = () => toast.success(t("copyIdSuccess"));

  const openQuickView = (provider: AdminProviderListItem) => {
    setSelectedProviderId(provider.id);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <ProvidersFiltersBar
        filters={filters}
        onFiltersChange={setFilters}
        categories={topCategories}
        subCategories={subCategories}
        cities={cities}
      />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-display font-bold text-neutral-900">{t("title")}</h1>
          <Link href="/admin/providers/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("createProvider")}
            </Button>
          </Link>
        </div>
        {isLoading ? (
          <PageSpinner />
        ) : (
          <>
            <ProvidersTable
              providers={data?.providers ?? []}
              onVerify={handleVerify}
              onUnverify={handleUnverify}
              onSuspend={handleSuspend}
              onReactivate={handleReactivate}
              onImpersonate={handleImpersonate}
              onSendOnboardingEmail={handleSendOnboardingEmail}
              onCopyId={handleCopyId}
              onOpenQuickView={openQuickView}
              onApprove={handleApprove}
              onUnconfirm={handleUnconfirm}
              onUpgradeSuccess={invalidateProviders}
            />
            {data?.meta && data.meta.total_pages > 1 && (
              <Pagination
                currentPage={data.meta.current_page}
                totalPages={data.meta.total_pages}
                onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
              />
            )}
          </>
        )}
      </div>
      <ProviderQuickViewDrawer
        providerId={selectedProviderId}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedProviderId(null);
        }}
        onImpersonate={handleImpersonate}
        onApprove={handleApprove}
        onUnconfirm={handleUnconfirm}
        onUpgradeSuccess={invalidateProviders}
      />
    </div>
  );
}
