"use client";

import { useState } from "react";
import { ProviderPremiumGate } from "./ProviderPremiumGate";
import { UpgradeModal } from "./UpgradeModal";

/**
 * Higher-order component that wraps a page in the premium gate.
 * Shows a premium banner + blurred preview for non-premium providers.
 */
export function withPremiumGate<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  function PremiumGatedPage(props: P) {
    const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

    return (
      <>
        <ProviderPremiumGate onUpgradeClick={() => setIsUpgradeOpen(true)}>
          <WrappedComponent {...props} />
        </ProviderPremiumGate>

        <UpgradeModal
          open={isUpgradeOpen}
          onClose={() => setIsUpgradeOpen(false)}
        />
      </>
    );
  }

  PremiumGatedPage.displayName = `withPremiumGate(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;
  return PremiumGatedPage;
}
