import type { Metadata } from "next";
import Link from "next/link";
import ContentPage from "@/components/ContentPage";
import { Button } from "@/components/ui/button";
import { Store, Users, BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "List Your Business",
  description: "Join Vazivo and reach more customers. List your salon, spa, or wellness business.",
};

export default function ForBusinessPage() {
  return (
    <ContentPage title="List Your Business" description="Reach more customers with Vazivo">
      <div className="space-y-6 text-neutral-600">
        <p>
          Join thousands of beauty and wellness businesses on Vazivo. Get more bookings,
          manage your schedule, and grow your client base.
        </p>
        <div className="grid sm:grid-cols-3 gap-6 mt-8">
          <div className="flex flex-col gap-2">
            <Store className="h-8 w-8 text-primary-500" />
            <p className="font-medium text-neutral-900">List your business</p>
            <p className="text-sm">Add your salon, spa, or wellness center and set your services.</p>
          </div>
          <div className="flex flex-col gap-2">
            <Users className="h-8 w-8 text-primary-500" />
            <p className="font-medium text-neutral-900">Reach customers</p>
            <p className="text-sm">Get discovered by people searching for your services in your city.</p>
          </div>
          <div className="flex flex-col gap-2">
            <BarChart3 className="h-8 w-8 text-primary-500" />
            <p className="font-medium text-neutral-900">Manage bookings</p>
            <p className="text-sm">See your calendar, confirm bookings, and grow your revenue.</p>
          </div>
        </div>
        <div className="mt-10">
          <Link href="/register/provider">
            <Button size="lg">Get started as a provider</Button>
          </Link>
        </div>
      </div>
    </ContentPage>
  );
}
