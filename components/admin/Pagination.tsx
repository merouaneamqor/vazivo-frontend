"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  /** SEO: page numbers to show (from getPaginationSeries). When provided with getPageUrl, renders numbered links. */
  series?: number[];
  /** SEO: build href for a page (path + query). When provided with series, links are crawlable. */
  getPageUrl?: (page: number) => string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  series,
  getPageUrl,
}: PaginationProps) {
  const t = useTranslations("common.pagination");
  if (totalPages <= 1) return null;

  const showNumberedLinks = Array.isArray(series) && series.length > 0 && typeof getPageUrl === "function";

  return (
    <nav
      className={cn(
        "flex items-center gap-2 sm:gap-3 w-full min-w-0",
        className
      )}
      aria-label="Pagination"
    >
      <Button
        variant="outline"
        size="sm"
        className="flex-shrink-0"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label={t("previous")}
      >
        <ChevronLeft className="h-4 w-4 sm:mr-1" />
        <span className="hidden sm:inline">{t("previous")}</span>
      </Button>

      {showNumberedLinks ? (
        <div className="flex items-center gap-1 flex-1 min-w-0 justify-center overflow-x-auto py-1">
          <div className="flex items-center gap-1">
            {series!.map((p, i) => {
              const prev = i > 0 ? series![i - 1]! : 0;
              const showEllipsis = prev > 0 && p - prev > 1;
              const isCurrent = p === currentPage;
              const href = getPageUrl(p);
              return (
                <span key={p} className="inline-flex items-center gap-1 flex-shrink-0">
                  {showEllipsis && <span className="px-0.5 text-neutral-400" aria-hidden>…</span>}
                  {isCurrent ? (
                    <span
                      className="min-w-[2rem] inline-flex justify-center py-1.5 px-2 rounded-lg bg-primary-100 text-primary-800 font-medium text-sm"
                      aria-current="page"
                    >
                      {p}
                    </span>
                  ) : (
                    <Link
                      href={href}
                      className="min-w-[2rem] inline-flex justify-center py-1.5 px-2 rounded-lg border border-neutral-200 text-sm text-neutral-700 hover:border-primary-300 hover:text-primary-700 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange(p);
                      }}
                    >
                      {p}
                    </Link>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      ) : (
        <span className="flex-1 text-center text-sm text-neutral-600 min-w-0 truncate">
          {t("pageOf", { current: currentPage, total: totalPages })}
        </span>
      )}

      <Button
        variant="outline"
        size="sm"
        className="flex-shrink-0"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label={t("next")}
      >
        <span className="hidden sm:inline">{t("next")}</span>
        <ChevronRight className="h-4 w-4 sm:ml-1" />
      </Button>
    </nav>
  );
}
