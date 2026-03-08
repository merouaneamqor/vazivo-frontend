"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminMe } from "@/features/admin";

export function AdminTopbar({ title, onMenuClick }: { title?: string; onMenuClick?: () => void }) {
  const t = useTranslations("admin");
  const { data } = useAdminMe();
  const user = data?.user;

  return (
    <header className="h-16 border-b border-neutral-200 bg-white flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link href="/admin/dashboard" className="text-sm font-semibold text-neutral-700 hover:text-neutral-900">
          {t("navLabel")}
        </Link>
        {title && (
          <span className="text-neutral-500 text-sm hidden md:inline">/ {title}</span>
        )}
      </div>
      {user && (
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <User className="h-4 w-4 text-neutral-400" aria-hidden />
          <span className="font-medium text-neutral-800 truncate max-w-[180px]" title={user.email}>
            {user.name || user.email}
          </span>
          {user.admin_role && (
            <span className="hidden sm:inline text-xs text-neutral-400 font-normal">
              ({user.admin_role})
            </span>
          )}
        </div>
      )}
    </header>
  );
}
