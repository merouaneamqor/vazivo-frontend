import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Vazivo — your destination for restaurant discovery and reservations.",
};

export default function AboutPage() {
  return (
    <ContentPage title="About Us" description="Your next great meal starts here">
      <div className="space-y-6 text-neutral-600">
        <p>
          Vazivo connects people with the best restaurants in their city.
          We make it easy to discover great places to eat — and book a table in seconds.
        </p>
        <h2 className="text-xl font-semibold text-neutral-900 mt-8">Our mission</h2>
        <p>
          To help everyone find and book the perfect table by bringing transparency, convenience,
          and trust to restaurant discovery and reservations.
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
