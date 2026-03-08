"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleUnsubscribe = async () => {
    if (!email || !token) {
      setErrorMessage("Invalid unsubscribe link");
      setStatus("error");
      return;
    }

    try {
      // TODO: Implement API call to unsubscribe with token verification
      // await api.post("/unsubscribe", { email, token });
      setStatus("success");
    } catch (error) {
      setErrorMessage("Unable to process your request. The link may be expired or invalid.");
      setStatus("error");
    }
  };

  if (!email || !token) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-6">Invalid Link</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <p className="text-red-700 mb-4">This unsubscribe link is invalid or incomplete.</p>
          <p className="text-sm text-gray-600">
            Please use the unsubscribe link from your email or contact support at support@vazivo.com
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <h1 className="text-3xl font-bold mb-6">Unsubscribe</h1>
      
      {status === "idle" && (
        <>
          <p className="text-gray-600 mb-8">
            You are unsubscribing: {email}
          </p>
          
          <p className="text-sm text-gray-600 mb-6">
            Click the button below to unsubscribe from all marketing emails. 
            You will still receive essential transactional emails related to your bookings.
          </p>
          
          <button
            onClick={handleUnsubscribe}
            className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition text-lg font-medium"
          >
            Unsubscribe
          </button>
        </>
      )}

      {status === "success" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-green-800 mb-3">Successfully Unsubscribed</h2>
          <p className="text-green-700 mb-4">You have been removed from our marketing email list.</p>
          <p className="text-sm text-gray-600">
            You will continue to receive essential emails about your bookings and account.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-red-800 mb-3">Error</h2>
          <p className="text-red-700 mb-4">{errorMessage}</p>
          <div className="mt-6 pt-6 border-t border-red-200 text-sm text-gray-600">
            <p className="font-semibold mb-2">Contact Us:</p>
            <p>Email: support@vazivo.com</p>
            <p>Vazivo - Casablanca, Morocco</p>
          </div>
        </div>
      )}

      <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-600">
        <p className="mb-2">
          <a href="/privacy" className="text-purple-600 hover:underline">Privacy Policy</a> | 
          <a href="/terms" className="text-purple-600 hover:underline ml-2">Terms of Service</a>
        </p>
        <p>Vazivo - Restaurant Discovery & Reservation Platform</p>
        <p>Casablanca, Morocco | support@vazivo.com</p>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="animate-pulse text-gray-500">Loading...</div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UnsubscribeContent />
    </Suspense>
  );
}
