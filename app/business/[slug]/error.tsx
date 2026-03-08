"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BusinessError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("Business page error:", error);
  }, [error]);

  const is404 = error.message.includes("404") || error.message.includes("not found");

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>

        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          {is404 ? "Business Not Found" : "Something went wrong"}
        </h1>

        <p className="text-muted-foreground mb-8">
          {is404
            ? "The business you're looking for doesn't exist or may have been removed."
            : "We couldn't load this business page. Please try again."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/search">
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse Businesses
            </Button>
          </Link>

          {!is404 && (
            <Button onClick={reset} className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
