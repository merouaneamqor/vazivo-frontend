"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock } from "lucide-react";

export default function ProviderCustomersPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-neutral-900">
          Customers
        </h1>
        <p className="text-neutral-600 mt-1">
          Manage your customer relationships and history
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="card-premium">
        <CardContent className="py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 mb-4">
            <Users className="h-8 w-8 text-primary-500" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            Customer Management
          </h3>
          <p className="text-neutral-600 mb-6 max-w-md mx-auto">
            We're building a comprehensive customer management system. Stay tuned
            for features like customer profiles, booking history, notes, and more.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-50 text-accent-700 text-sm font-medium">
            <Clock className="h-4 w-4" />
            Coming Soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
