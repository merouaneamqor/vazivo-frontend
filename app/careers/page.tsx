import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the Vazivo team. Explore open positions in restaurant and reservation tech.",
};

export default function CareersPage() {
  return (
    <ContentPage title="Careers" description="Join our team">
      <div className="space-y-6 text-neutral-600">
        <p>
          We&apos;re building the future of restaurant discovery and reservations. If you&apos;re passionate
          about great products and helping people find and book great meals, we&apos;d love to hear from you.
        </p>
        <h2 className="text-xl font-semibold text-neutral-900 mt-8">Open positions</h2>
        <p>
          We don&apos;t have any open roles at the moment. Check back soon or send your resume to
          careers@vazivo.example.com and we&apos;ll keep you in mind for future opportunities.
        </p>
      </div>
    </ContentPage>
  );
}
