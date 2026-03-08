import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "Press",
  description: "Vazivo press kit, media inquiries, and news.",
};

export default function PressPage() {
  return (
    <ContentPage title="Press" description="Media and news">
      <div className="space-y-6 text-neutral-600">
        <p>
          For press inquiries, partnership opportunities, or to request our logo and brand assets,
          please contact us at press@vazivo.example.com.
        </p>
        <h2 className="text-xl font-semibold text-neutral-900 mt-8">About Vazivo</h2>
        <p>
          Vazivo is a restaurant discovery and reservation platform that helps diners discover and book
          tables at restaurants. We operate in multiple cities and are growing fast.
        </p>
      </div>
    </ContentPage>
  );
}
