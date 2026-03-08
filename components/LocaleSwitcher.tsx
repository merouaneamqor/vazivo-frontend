"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "@/hooks/useLocale";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@/lib/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: "English",
  fr: "Français",
  ar: "العربية",
};

/** Flag SVGs from flag-icons package (path: flags/1x1/; CDN or local) */
const LOCALE_FLAG_SRC: Record<SupportedLocale, string> = {
  en: "https://cdn.jsdelivr.net/npm/flag-icons@7.2.1/flags/1x1/gb.svg",
  fr: "https://cdn.jsdelivr.net/npm/flag-icons@7.2.1/flags/1x1/fr.svg",
  ar: "https://cdn.jsdelivr.net/npm/flag-icons@7.2.1/flags/1x1/ma.svg",
};

function LocaleFlag({ locale, className }: { locale: SupportedLocale; className?: string }) {
  return (
    <img
      src={LOCALE_FLAG_SRC[locale]}
      alt=""
      width={20}
      height={15}
      className={cn("shrink-0 rounded-sm object-cover", className)}
      aria-hidden
    />
  );
}

export function LocaleSwitcher() {
  const t = useTranslations("common");
  const { locale, setLocale, isUpdating } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Defer Radix Select to client-only to avoid hydration mismatch (Radix generates different IDs on server vs client)
  if (!mounted) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 h-10 pl-3 pr-3 rounded-lg border border-neutral-200 bg-white"
        )}
        aria-label={t("language")}
      >
        <LocaleFlag locale={locale} className="h-4 w-[1.25rem]" />
        <span className="text-sm font-medium text-neutral-600">{LOCALE_LABELS[locale] ?? locale}</span>
      </div>
    );
  }

  return (
    <Select
      value={locale}
      onValueChange={(value) => setLocale(value)}
      disabled={isUpdating}
    >
      <SelectTrigger
        hideDropdownIcon
        className={cn(
          "flex items-center gap-2 h-10 pl-3 pr-3 rounded-lg border border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50 transition-colors w-auto min-w-0"
        )}
        aria-label={t("language")}
      >
        <LocaleFlag locale={locale} className="h-4 w-[1.25rem]" />
        <span className="text-sm font-medium text-neutral-600">
          {LOCALE_LABELS[locale]}
        </span>
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LOCALES.map((loc) => (
          <SelectItem key={loc} value={loc}>
            <span className="flex items-center gap-2">
              <LocaleFlag locale={loc} className="h-4 w-[1.25rem]" />
              {LOCALE_LABELS[loc]}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
