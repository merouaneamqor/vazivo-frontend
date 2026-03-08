import type { Metadata } from "next";
import { BusinessLandingContent } from "./BusinessLandingContent";

export const metadata: Metadata = {
  title: "Vazivo for Restaurants – Fill more tables",
  description:
    "Join Vazivo and fill more tables. Reach diners searching for restaurants, manage reservations, and grow your business.",
  openGraph: {
    title: "Vazivo for Restaurants – Fill more tables",
    description:
      "Join Vazivo and reach more diners. Get more reservations and grow your restaurant.",
  },
};

export default function BusinessLandingPage() {
  return <BusinessLandingContent />;
}
