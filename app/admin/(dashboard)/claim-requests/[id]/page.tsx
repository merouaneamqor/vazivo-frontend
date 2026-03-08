"use client";

import { use } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, X } from "lucide-react";
import { useAdminClaimRequest, adminService } from "@/features/admin";
import { queryKeys } from "@/lib/query-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statusBadgeClass: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-neutral-100 text-neutral-600",
};

export default function AdminClaimRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations("admin.claimRequests");
  const { id } = use(params);
  const requestId = Number(id);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useAdminClaimRequest(requestId);

  const approveMutation = useMutation({
    mutationFn: () => adminService.approveClaimRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.claimRequest(requestId) });
      queryClient.invalidateQueries({ queryKey: ["admin", "claimRequests"] });
    },
  });
  const rejectMutation = useMutation({
    mutationFn: () => adminService.rejectClaimRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.claimRequest(requestId) });
      queryClient.invalidateQueries({ queryKey: ["admin", "claimRequests"] });
    },
  });

  if (Number.isNaN(requestId) || error) {
    return (
      <div className="space-y-6">
        <p className="text-red-600">{t("notFound")}</p>
        <Link href="/admin/claim-requests">
          <Button variant="outline">{t("backToList")}</Button>
        </Link>
      </div>
    );
  }

  const req = data?.claim_request;
  if (isLoading || !req) {
    return (
      <div className="space-y-6">
        <p>{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/claim-requests">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-display font-bold text-neutral-900">
            {t("detailTitle", { id: req.id })}
          </h1>
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-sm font-medium ${statusBadgeClass[req.status] ?? "bg-neutral-100 text-neutral-600"}`}
          >
            {req.status === "pending" ? t("statusPending") : req.status === "approved" ? t("statusApproved") : t("statusRejected")}
          </span>
        </div>
        {req.status === "pending" && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              <Check className="h-4 w-4 mr-1" />
              {t("approve")}
            </Button>
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => rejectMutation.mutate()}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              <X className="h-4 w-4 mr-1" />
              {t("reject")}
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("details")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-neutral-500">{t("business")}</p>
            <p className="text-neutral-900">
              {req.business_slug ? (
                <Link
                  href={`/business/${req.business_slug}`}
                  className="text-primary-600 hover:underline"
                >
                  {req.business_name ?? `#${req.business_id}`}
                </Link>
              ) : (
                req.business_name ?? `#${req.business_id}`
              )}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">{t("requesterName")}</p>
            <p className="text-neutral-900">{req.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">{t("email")}</p>
            <p className="text-neutral-900">{req.email}</p>
          </div>
          {"message" in req && req.message && (
            <div>
              <p className="text-sm font-medium text-neutral-500">{t("message")}</p>
              <p className="text-neutral-900 whitespace-pre-wrap">{req.message}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-neutral-500">{t("submitted")}</p>
            <p className="text-neutral-900">
              {new Date(req.created_at).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
