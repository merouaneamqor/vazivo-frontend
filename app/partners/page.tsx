import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Partner Resources",
  description: "Resources for Vazivo partners and business providers.",
};

export default function PartnersPage() {
  return (
    <ContentPage title="Partner Resources" description="Tools and resources for partners">
      <div className="space-y-6 text-neutral-600">
        <p>
          If you&apos;re a business partner or provider on Vazivo, you can manage your listings,
          services, and bookings from your provider dashboard.
        </p>
        <h2 className="text-xl font-semibold text-neutral-900 mt-8">Provider dashboard</h2>
        <p>
          <Link href="/provider" className="text-primary-600 hover:underline font-medium">Sign in to the provider dashboard</Link> to
          add or edit your business, manage services, view bookings, and update your availability.
        </p>
        <h2 className="text-xl font-semibold text-neutral-900 mt-8">Support</h2>
        <p>
          For partner support, contact us at partners@vazivo.example.com.
        </p>
      </div>
    </ContentPage>
  );
}
