"use client";

import { ServiceManager } from "@/components/provider/ServiceManager";
import ServiceCategoriesManager from "@/components/provider/ServiceCategoriesManager";
import { useProviderBusiness } from "@/context/ProviderBusinessContext";
import { Loader2 } from "lucide-react";

export default function CatalogPage() {
  const { businesses, isLoading } = useProviderBusiness();
  const selectedBusiness = businesses?.[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Catalog</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your services and categories
          </p>
        </div>
      </header>

      {/* Main content: flex column on small screens, flex row on lg with Categories fixed width and Prestations taking the rest */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Section 1: Categories — fixed width on desktop */}
          <aside
            className="flex flex-col lg:w-[280px] lg:flex-shrink-0"
            aria-label="Categories"
          >
            <h2 className="text-sm font-semibold text-gray-900 mb-3 md:mb-4">
              Categories
            </h2>
            <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
              {selectedBusiness ? (
                <ServiceCategoriesManager businessId={selectedBusiness.id} />
              ) : (
                <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
                  No business selected.
                </div>
              )}
            </div>
          </aside>

          {/* Section 2: Prestations — takes remaining space */}
          <section
            className="flex flex-col flex-1 min-w-0"
            aria-label="Services"
          >
            <div className="flex-1 min-h-[400px] overflow-hidden">
              <ServiceManager />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
