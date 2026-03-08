import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Get help with booking, your account, and more.",
};

export default function HelpPage() {
  return (
    <ContentPage title="Help Center" description="How can we help?">
      <div className="space-y-6 text-neutral-600">
        <p>
          Find answers to common questions about booking, your account, and using OllaZen.
        </p>
        <h2 className="text-xl font-semibold text-neutral-900 mt-8">Booking</h2>
        <p>
          Search for a service or business, pick a date and time, and confirm your booking.
          You&apos;ll receive a confirmation by email. You can view and manage your bookings
          in your <Link href="/bookings" className="text-primary-600 hover:underline">bookings</Link> page.
        </p>
        <h2 className="text-xl font-semibold text-neutral-900 mt-8">Account</h2>
        <p>
          Sign in or create an account to book appointments and save your favorites.
          You can update your profile and password in <Link href="/dashboard?tab=settings" className="text-primary-600 hover:underline">account settings</Link>.
        </p>
        <h2 className="text-xl font-semibold text-neutral-900 mt-8">Contact</h2>
        <p>
          Need more help? <Link href="/contact" className="text-primary-600 hover:underline">Contact us</Link> and we&apos;ll get back to you.
        </p>
      </div>
    </ContentPage>
  );
}
