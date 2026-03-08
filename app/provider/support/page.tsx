"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircle, Mail, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function ProviderSupportPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-neutral-900">
          Help & Support
        </h1>
        <p className="text-neutral-600 mt-1">
          Get help with your provider account and find answers to common questions
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="card-premium hover:shadow-soft-lg transition-shadow cursor-pointer">
          <CardHeader>
            <MessageCircle className="h-8 w-8 text-primary-500 mb-2" />
            <CardTitle className="text-lg">Live Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600 mb-4">
              Chat with our support team in real-time
            </p>
            <Button className="w-full">Start Chat</Button>
          </CardContent>
        </Card>

        <Card className="card-premium hover:shadow-soft-lg transition-shadow cursor-pointer">
          <CardHeader>
            <Mail className="h-8 w-8 text-primary-500 mb-2" />
            <CardTitle className="text-lg">Email Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600 mb-4">
              Send us an email and we'll respond within 24 hours
            </p>
            <Button variant="outline" className="w-full">
              Send Email
            </Button>
          </CardContent>
        </Card>

        <Card className="card-premium hover:shadow-soft-lg transition-shadow cursor-pointer">
          <CardHeader>
            <FileText className="h-8 w-8 text-primary-500 mb-2" />
            <CardTitle className="text-lg">Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600 mb-4">
              Browse our guides and documentation
            </p>
            <Button variant="outline" className="w-full">
              View Docs
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQs */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary-500" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-neutral-900 mb-2">
              How do I add a new service?
            </h3>
            <p className="text-sm text-neutral-600">
              Navigate to the Services page, click "Add Service", and fill in the
              service details including name, description, duration, and price.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 mb-2">
              How do I manage bookings?
            </h3>
            <p className="text-sm text-neutral-600">
              You can view and manage all bookings from the Calendar or Bookings
              page. Click on any booking to see details, confirm, or cancel it.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 mb-2">
              How do I update my business hours?
            </h3>
            <p className="text-sm text-neutral-600">
              Go to Settings &gt; Operating Hours to set your availability for
              each day of the week.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 mb-2">
              How do I handle customer reviews?
            </h3>
            <p className="text-sm text-neutral-600">
              Customer reviews appear automatically after completed bookings. You
              can view and respond to reviews from your dashboard.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle>Helpful Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link
            href="/help"
            className="flex items-center justify-between p-3  hover:bg-neutral-50 transition-colors"
          >
            <span className="text-sm font-medium text-neutral-900">
              Getting Started Guide
            </span>
            <ExternalLink className="h-4 w-4 text-neutral-400" />
          </Link>
          <Link
            href="/help"
            className="flex items-center justify-between p-3  hover:bg-neutral-50 transition-colors"
          >
            <span className="text-sm font-medium text-neutral-900">
              Best Practices for Providers
            </span>
            <ExternalLink className="h-4 w-4 text-neutral-400" />
          </Link>
          <Link
            href="/help"
            className="flex items-center justify-between p-3  hover:bg-neutral-50 transition-colors"
          >
            <span className="text-sm font-medium text-neutral-900">
              Managing Your Profile
            </span>
            <ExternalLink className="h-4 w-4 text-neutral-400" />
          </Link>
          <Link
            href="/help"
            className="flex items-center justify-between p-3  hover:bg-neutral-50 transition-colors"
          >
            <span className="text-sm font-medium text-neutral-900">
              Payment & Payouts
            </span>
            <ExternalLink className="h-4 w-4 text-neutral-400" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
