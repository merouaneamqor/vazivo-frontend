"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useCreateBusiness } from "@/hooks/useBusinesses";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { PageSpinner } from "@/components/ui/spinner";
import { BusinessForm } from "@/components/BusinessForm";
import { roleFromUser, isProviderOrAdminRole } from "@/lib/roles";

export default function NewBusinessPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const createBusiness = useCreateBusiness();
  const role = roleFromUser(user);

  // Redirect if not authenticated or not provider/admin
  if (!isAuthenticated || !isProviderOrAdminRole(role)) {
    router.push("/login");
    return <PageSpinner />;
  }

  const handleSubmit = async (businessData: any) => {
    const result = await createBusiness.mutateAsync(businessData);
    if (result.business) {
      router.push(`/provider`);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/provider">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-display font-bold text-neutral-900">
                Add New Business
              </h1>
              <p className="text-neutral-500">Create a new business listing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <BusinessForm
          onSubmit={handleSubmit}
          isSubmitting={createBusiness.isPending}
          submitLabel="Create Business"
        />

        {/* Submit Button */}
        <div className="flex justify-end gap-4 mt-6">
          <Link href="/provider">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            form="business-form"
            disabled={createBusiness.isPending}
            onClick={(e) => {
              e.preventDefault();
              const form = document.getElementById('business-form') as HTMLFormElement;
              if (form) {
                form.requestSubmit();
              }
            }}
          >
            <Save className="h-4 w-4 mr-2" />
            {createBusiness.isPending ? "Creating..." : "Create Business"}
          </Button>
        </div>
      </div>
    </div>
  );
}
