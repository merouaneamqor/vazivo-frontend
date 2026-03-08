"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Mail, MessageCircle } from "lucide-react";
import { QueryProvider } from "@/lib/query-client";
import { ProviderBusinessProvider } from "@/context/ProviderBusinessContext";
import { ProviderSidebar } from "@/components/provider/ProviderSidebar";
import { ProviderGuard } from "@/components/guards";
import { useProviderConfirmed } from "@/store/auth";
import { useAuthReady } from "@/store/auth";

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@vazivo.ma";
const SUPPORT_WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "+212674016417";

function ProviderNotConfirmedMessage() {
  const t = useTranslations("providerPendingConfirmation");
  const whatsappUrl = SUPPORT_WHATSAPP.replace(/\D/g, "");
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <img src="/logo.svg" alt="Logo" className="h-12 w-12" />
        </Link>
        <div className=" border border-amber-200 bg-amber-50/80 p-8">
          <h1 className="text-xl font-display font-bold text-neutral-900 mb-3">
            {t("title")}
          </h1>
          <p className="text-neutral-600 mb-4">
            {t("description")}
          </p>
          <div className="text-left text-neutral-700 text-sm mb-6 space-y-2 bg-white/60 rounded-lg p-4 border border-amber-100">
            <p className="font-medium text-neutral-800">{t("sendUs")}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t("photos")}</li>
              <li>{t("businessCard")}</li>
            </ul>
            <p className="pt-2 text-neutral-600">
              {t("contactBy")} {SUPPORT_WHATSAPP}
            </p>
          </div>
          <div className="space-y-3">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-white border border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50 transition-colors text-neutral-800 font-medium"
            >
              <Mail className="h-5 w-5" />
              {SUPPORT_EMAIL}
            </a>
            <a
              href={`https://wa.me/${whatsappUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp: {SUPPORT_WHATSAPP}
            </a>
          </div>
          <p className="text-sm text-neutral-500 mt-6">
            <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
              {t("returnHome")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function ProviderLayoutContent({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isProviderConfirmed = useProviderConfirmed();
  const isAuthReady = useAuthReady();

  // Expose toggle function globally for Navbar
  if (typeof window !== 'undefined') {
    (window as any).__toggleProviderSidebar = () => setMobileMenuOpen(true);
  }

  if (!isAuthReady) {
    return null; // ProviderGuard handles loading
  }

  if (!isProviderConfirmed) {
    return <ProviderNotConfirmedMessage />;
  }

  return (
    <div className="flex flex-1 min-h-0 min-w-0 h-full bg-white overflow-hidden gap-0">
      <ProviderSidebar
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden bg-white shrink">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <ProviderGuard>
        <ProviderLayoutContent>{children}</ProviderLayoutContent>
      </ProviderGuard>
    </QueryProvider>
  );
}
