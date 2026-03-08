import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { RestaurantSignupForm } from "./RestaurantSignupForm";

export const metadata: Metadata = {
  title: "List your restaurant – Vazivo for Restaurants",
  description:
    "Join Vazivo and start receiving reservations. Add your restaurant in a few steps.",
  openGraph: {
    title: "List your restaurant – Vazivo for Restaurants",
    description: "Join Vazivo and fill more tables. Sign up your restaurant today.",
  },
};

export default function BusinessSignupPage() {
  return (
    <div className="min-h-screen bg-vazivo-lightGray/30">
      <div className="max-w-lg mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8">
          <Logo href="/business" variant="full" size="sm" className="mb-6" />
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-vazivo-charcoal">
            List your restaurant
          </h1>
          <p className="text-vazivo-warmMuted mt-2 text-sm">
            Tell us about your restaurant. We’ll get in touch to complete your profile.
          </p>
        </div>
        <RestaurantSignupForm />
        <p className="text-center text-vazivo-warmMuted text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-vazivo-red hover:text-vazivo-redLight font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
