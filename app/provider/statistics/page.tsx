"use client";

import { useProviderBusiness } from "@/context/ProviderBusinessContext";
import BusinessStatistics from "@/components/provider/BusinessStatistics";

export default function StatisticsPage() {
  const { selectedBusiness } = useProviderBusiness();

  if (!selectedBusiness) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500">Please select a business</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-6 py-4">
        <h1 className="text-2xl font-semibold text-neutral-900">Statistics</h1>
        <p className="text-sm text-neutral-500 mt-1">Track your leads and performance</p>
      </div>

      <div className="p-6">
        <BusinessStatistics businessId={selectedBusiness.id} />
      </div>
    </div>
  );
}
