"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { setAuthCookiesFromOAuth, getGoogleAuthUrl } from "@/lib/google-auth";
import { getPostLoginRedirect } from "@/lib/routes";
import { PageSpinner } from "@/components/ui/spinner";

function LoadingFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <PageSpinner />
    </div>
  );
}

/**
 * Inner content that uses useSearchParams — must be wrapped in Suspense for static generation.
 */
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setErrorMessage(decodeURIComponent(error));
      setStatus("error");
      return;
    }

    if (typeof window === "undefined") return;

    const hash = window.location.hash?.slice(1);
    if (!hash) {
      setStatus("error");
      setErrorMessage("No auth data received");
      return;
    }

    const params = Object.fromEntries(new URLSearchParams(hash));
    const { access_token, refresh_token, expires_in } = params;
    if (!access_token || !refresh_token) {
      setStatus("error");
      setErrorMessage("Invalid auth data");
      return;
    }

    setAuthCookiesFromOAuth({
      access_token,
      refresh_token,
      expires_in: parseInt(expires_in || "3600", 10),
    });
    setStatus("success");
    router.replace(getPostLoginRedirect(null) ?? "/search");
  }, [router, searchParams]);

  if (status === "loading") {
    return <LoadingFallback />;
  }

  if (status === "error") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">
            Sign-in failed
          </h1>
          <p className="text-neutral-600 mb-6">
            {errorMessage ?? "Something went wrong. Please try again."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={getGoogleAuthUrl()}
              className="inline-flex items-center justify-center rounded-lg bg-neutral-900 text-white px-4 py-2.5 font-medium hover:bg-neutral-800"
            >
              Try again with Google
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-neutral-300 text-neutral-700 px-4 py-2.5 font-medium hover:bg-neutral-50"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <LoadingFallback />;
}

/**
 * OAuth callback page. Backend redirects here with either:
 * - Fragment: #access_token=...&refresh_token=...&expires_in=...
 * - Query: ?error=... on failure
 */
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
