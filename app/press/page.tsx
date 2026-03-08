import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "Press",
  description: "OllaZen press kit, media inquiries, and news.",
};

export default function PressPage() {
  return (
    <ContentPage title="Press" description="Media and news">
      <div className="space-y-6 text-neutral-600">
        <p>
          For press inquiries, partnership opportunities, or to request our logo and brand assets,
          please contact us at press@ollazen.example.com.
        </p>
        <h2 className="text-xl font-semibold text-neutral-900 mt-8">About OllaZen</h2>
        <p>
          OllaZen is a beauty and wellness booking platform that helps customers discover and book
          appointments at spas, salons, barbers, and wellness centers. We operate in multiple cities
          and are growing fast.
        </p>
      </div>
    </ContentPage>
  );
}
