import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How OllaZen uses cookies and similar technologies.",
};

export default function CookiesPage() {
  return (
    <ContentPage title="Cookie Policy" description="Last updated: February 2026">
      <div className="space-y-6 text-neutral-600">
        <p>
          OllaZen uses cookies and similar technologies to provide and improve our service,
          keep you signed in, and remember your preferences.
        </p>
        <h2 className="text-xl font-semibold text-neutral-900 mt-8">What we use</h2>
        <p>
          <strong>Essential cookies</strong> — Required for the site to work (e.g. authentication,
          session). These cannot be disabled.
        </p>
        <p>
          <strong>Preference cookies</strong> — Remember your settings (e.g. language, region).
        </p>
        <p>
          <strong>Analytics</strong> — We may use analytics to understand how the site is used
          and to improve it. This data is aggregated and does not identify you personally.
        </p>
        <h2 className="text-xl font-semibold text-neutral-900 mt-8">Managing cookies</h2>
        <p>
          You can control cookies through your browser settings. Disabling essential cookies
          may affect how the site works.
        </p>
      </div>
    </ContentPage>
  );
}
