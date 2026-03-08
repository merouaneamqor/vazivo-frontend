import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Vazivo — your destination for beauty and wellness bookings.",
};

export default function AboutPage() {
  return (
    <ContentPage title="About Us" description="Your beauty journey starts here">
      <div className="space-y-6 text-neutral-600">
        <p>
          Vazivo connects people with the best beauty and wellness professionals in their city.
          We make it easy to discover spas, salons, barbers, and wellness centers — and book
          appointments in seconds.
        </p>
        <h2 className="text-xl font-semibold text-neutral-900 mt-8">Our mission</h2>
        <p>
          To help everyone look and feel their best by bringing transparency, convenience,
          and trust to beauty and wellness booking.
        </p>
        <h2 className="text-xl font-semibold text-neutral-900 mt-8">Contact</h2>
        <p>
          Questions? Visit our <a href="/contact" className="text-primary-600 hover:underline">Contact</a> page
          or email us at support@vazivo.example.com.
        </p>
      </div>
    </ContentPage>
  );
}
