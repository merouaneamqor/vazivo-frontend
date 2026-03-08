"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { BookingsList } from "@/components/provider/BookingsList";
import { ProviderPremiumGate } from "@/components/provider/ProviderPremiumGate";
import { UpgradeModal } from "@/components/provider/UpgradeModal";

export default function ProviderBookingsPage() {
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  return (
    <>
      <ProviderPremiumGate onUpgradeClick={() => setUpgradeOpen(true)}>
        <div className="min-h-screen bg-neutral-50">
          {/* Header */}
          <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
            <div className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-neutral-900">
                    Bookings
                  </h1>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    Manage all your booking requests and history
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <BookingsList />
          </div>
        </div>
      </ProviderPremiumGate>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </>
  );
}
