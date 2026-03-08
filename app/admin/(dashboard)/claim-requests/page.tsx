"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Check, X } from "lucide-react";
import { useAdminClaimRequests, adminService } from "@/features/admin";
import { queryKeys } from "@/lib/query-client";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { Button } from "@/components/ui/button";
import type { AdminClaimRequestListItem } from "@/types/admin";

const statusBadgeClass: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-neutral-100 text-neutral-600",
};

export default function AdminClaimRequestsPage() {
  const t = useTranslations("admin.claimRequests");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");
  const queryClient = useQueryClient();
  const { data, isLoading } = useAdminClaimRequests({
    page,
    per_page: 20,
    status: status || undefined,
  });

  const approveMutation = useMutation({
    mutationFn: adminService.approveClaimRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "claimRequests"] });
    },
  });
  const rejectMutation = useMutation({
    mutationFn: adminService.rejectClaimRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "claimRequests"] });
    },
  });

  const columns: Column<AdminClaimRequestListItem>[] = [
    { key: "id", header: "ID", render: (r) => `#${r.id}` },
    {
      key: "business_name",
      header: t("business"),
      render: (r) =>
        r.business_slug ? (
          <Link
            href={`/business/${r.business_slug}`}
            className="text-primary-600 hover:underline"
          >
            {r.business_name ?? `#${r.business_id}`}
          </Link>
        ) : (
          r.business_name ?? `#${r.business_id}`
        ),
    },
    { key: "name", header: t("requester") },
    { key: "email", header: t("email") },
    {
      key: "status",
      header: t("status"),
      render: (r) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass[r.status] ?? "bg-neutral-100 text-neutral-600"}`}
        >
          {r.status === "pending" ? t("statusPending") : r.status === "approved" ? t("statusApproved") : t("statusRejected")}
        </span>
      ),
    },
    {
      key: "created_at",
      header: t("date"),
      render: (r) => new Date(r.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex items-center gap-1">
          <Link href={`/admin/claim-requests/${r.id}`}>
            <Button variant="ghost" size="icon-sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          {r.status === "pending" && (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-emerald-600 hover:text-emerald-700"
                onClick={() => approveMutation.mutate(r.id)}
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => rejectMutation.mutate(r.id)}
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-display font-bold text-neutral-900">
          {t("title")}
        </h1>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        >
          <option value="">{t("allStatuses")}</option>
          <option value="pending">{t("statusPending")}</option>
          <option value="approved">{t("statusApproved")}</option>
          <option value="rejected">{t("statusRejected")}</option>
        </select>
      </div>
      <DataTable
        columns={columns}
        data={data?.claim_requests ?? []}
        keyExtractor={(r) => r.id}
        emptyMessage={isLoading ? t("loading") : t("emptyMessage")}
      />
      {data?.meta && data.meta.total_pages > 1 && (
        <Pagination
          currentPage={data.meta.current_page}
          totalPages={data.meta.total_pages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
