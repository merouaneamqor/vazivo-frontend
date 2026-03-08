"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Save, ExternalLink, Loader2, ChevronRight, CheckCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUpdateBusiness } from "@/hooks/useBusinesses";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PageSpinner } from "@/components/ui/spinner";
import { BusinessForm, type BusinessFormFiles } from "@/components/BusinessForm";
import { getBusinessPath } from "@/lib/utils";
import { queryKeys } from "@/lib/query-client";
import type { Business } from "@/types";
import toast from "react-hot-toast";

export default function EditBusinessPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = Number(params.id);
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const updateBusiness = useUpdateBusiness();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.businesses.detail(businessId),
    queryFn: () => api.getBusinessById(businessId),
    enabled: !!businessId,
  });

  const { data: myBusinessesData, isLoading: myBusinessesLoading } = useQuery({
    queryKey: ["provider", "businesses"],
    queryFn: () => api.getBusinesses({ per_page: 500 }),
    enabled: !!businessId && (user?.role === "provider" || user?.role === "admin"),
  });
  const myBusinessIds = (myBusinessesData?.businesses ?? []).map((b) => b.id);
  const canEditThisBusiness = myBusinessIds.includes(businessId);
  const ownershipKnown = !myBusinessesLoading && (user?.role === "provider" || user?.role === "admin");

  const handleSubmit = useCallback(
    async (businessData: Record<string, unknown>, files?: BusinessFormFiles) => {
      setSubmitError(null);
      setIsSubmitting(true);
      try {
        if (files?.logoFile) {
          await api.updateBusinessWithFiles(businessId, businessData, { logo: files.logoFile! });
        } else {
          await updateBusiness.mutateAsync({
            id: businessId,
            data: businessData as Partial<Business>,
          });
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.businesses.detail(businessId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.businesses.all });
        queryClient.invalidateQueries({ queryKey: ["provider", "businesses"] });
        toast.success("Changes saved");
        setShowSuccessBanner(true);
        setTimeout(() => setShowSuccessBanner(false), 5000);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setSubmitError(message);
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [businessId, queryClient, updateBusiness]
  );

  const triggerSubmit = useCallback(() => {
    setSubmitError(null);
    const form = document.getElementById("business-form") as HTMLFormElement | null;
    if (form) form.requestSubmit();
  }, []);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== "provider" && user?.role !== "admin"))) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, user, router]);

  if (authLoading || !isAuthenticated || (user?.role !== "provider" && user?.role !== "admin")) {
    return <PageSpinner />;
  }

  const needOwnershipCheck = user?.role === "provider" || user?.role === "admin";
  if (isLoading || (needOwnershipCheck && myBusinessesLoading)) {
    return <PageSpinner />;
  }

  if (data?.business && ownershipKnown && !canEditThisBusiness) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-neutral-900 mb-2">Not authorized</h2>
          <p className="text-neutral-500 mb-6">You can only edit businesses you own.</p>
          <Link href="/provider">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error || !data?.business) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-neutral-900 mb-2">Business Not Found</h2>
          <p className="text-neutral-500 mb-6">The business you're trying to edit doesn't exist.</p>
          <Link href="/provider">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const business = data.business;
  const publicUrl = business.slug ? getBusinessPath(business) : null;

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      {/* Success banner */}
      {showSuccessBanner && (
        <div className="sticky top-0 z-10 flex items-center justify-center gap-2 bg-success-50 border-b border-success-200 px-4 py-2.5 text-success-800 text-sm">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>Your changes have been saved.</span>
          <Link href="/provider" className="font-medium underline underline-offset-2 hover:text-success-900">
            Back to dashboard
          </Link>
        </div>
      )}

      {/* Header with breadcrumbs + view public page */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
            <Link href="/provider" className="hover:text-neutral-700 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4 text-neutral-300" />
            <span className="text-neutral-900 font-medium truncate max-w-[200px] sm:max-w-none" title={business.name}>
              {business.name}
            </span>
            <ChevronRight className="h-4 w-4 text-neutral-300" />
            <span className="text-neutral-600">Edit</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-neutral-900">Edit business</h1>
              <p className="text-neutral-500 text-sm mt-0.5">Update your listing details, hours, and logo. Manage gallery photos on the Photos page.</p>
            </div>
            {publicUrl && (
              <Link
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                <ExternalLink className="h-4 w-4" />
                View public page
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {submitError && (
          <div
            role="alert"
            className="mb-6  border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-start justify-between gap-3"
          >
            <span>{submitError}</span>
            <button
              type="button"
              onClick={() => setSubmitError(null)}
              className="text-red-600 hover:text-red-800 font-medium shrink-0"
              aria-label="Dismiss"
            >
              Dismiss
            </button>
          </div>
        )}

        <BusinessForm
          initialData={business}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Update Business"
        />
      </div>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-neutral-200 bg-white/95 backdrop-blur-sm safe-area-inset-bottom">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-wrap items-center justify-end gap-3">
          <Link href="/provider">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </Link>
          <Button
            type="button"
            onClick={triggerSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

