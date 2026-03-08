"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function AdminRootPage() {
  const router = useRouter();
  const t = useTranslations("adminRoot");
  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="animate-pulse text-neutral-500">{t("redirecting")}</div>
    </div>
  );
}
