"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ImpersonationBanner() {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<string>("");

  useEffect(() => {
    // Check if impersonating (you can check cookies or localStorage)
    const checkImpersonation = () => {
      const impersonating = document.cookie.includes("impersonating=true");
      const userName = document.cookie.match(/impersonated_user=([^;]+)/)?.[1];
      setIsImpersonating(impersonating);
      setImpersonatedUser(userName ? decodeURIComponent(userName) : "");
    };

    checkImpersonation();
    // Check periodically in case it changes
    const interval = setInterval(checkImpersonation, 1000);
    return () => clearInterval(interval);
  }, []);

  const exitImpersonation = async () => {
    try {
      const response = await fetch("/api/v1/admin/exit_impersonation", {
        method: "POST",
        credentials: "include",
      });
      
      if (response.ok) {
        // Clear impersonation cookies
        document.cookie = "impersonating=; path=/; max-age=0";
        document.cookie = "impersonated_user=; path=/; max-age=0";
        
        // Redirect to admin
        window.location.href = "/admin/providers";
      }
    } catch (error) {
      console.error("Failed to exit impersonation:", error);
    }
  };

  if (!isImpersonating) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 animate-pulse">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-semibold text-xs sm:text-sm">
                ⚠️ Impersonation Mode Active
              </span>
              {impersonatedUser && (
                <span className="text-xs opacity-90">
                  Viewing as: <span className="font-medium">{impersonatedUser}</span>
                </span>
              )}
            </div>
          </div>
          <Button
            onClick={exitImpersonation}
            size="sm"
            className="bg-white text-orange-600 hover:bg-white/90 font-semibold shadow-md text-xs px-3 py-1 h-auto"
          >
            <X className="h-3 w-3 mr-1" />
            Exit & Return to Admin
          </Button>
        </div>
      </div>
    </div>
  );
}
