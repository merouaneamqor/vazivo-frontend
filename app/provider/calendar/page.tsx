"use client";

import { useState } from "react";
import { GoogleCalendarView } from "@/components/calendar/GoogleCalendarView";
import { ProviderPremiumGate } from "@/components/provider/ProviderPremiumGate";
import { UpgradeModal } from "@/components/provider/UpgradeModal";
import "@/styles/google-calendar.css";

export default function ProviderCalendarPage() {
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  return (
    <>
      <ProviderPremiumGate onUpgradeClick={() => setUpgradeOpen(true)}>
        <GoogleCalendarView />
      </ProviderPremiumGate>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </>
  );
}
