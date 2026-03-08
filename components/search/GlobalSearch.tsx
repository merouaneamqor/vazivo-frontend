"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, MapPin, Briefcase, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const t = useTranslations("nav");

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
      setQuery("");
    }
  };

  const popularSearches = [
    { icon: Briefcase, label: "Haircut", query: "haircut" },
    { icon: Briefcase, label: "Massage", query: "massage" },
    { icon: Briefcase, label: "Manicure", query: "manicure" },
    { icon: MapPin, label: "Casablanca", query: "casablanca" },
    { icon: MapPin, label: "Rabat", query: "rabat" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2147483646]"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[2147483647] flex items-start justify-center pt-[20vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-200">
                <Search className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("searchPlaceholder") || "Search for services, businesses, locations..."}
                  className="flex-1 text-base text-neutral-900 placeholder:text-neutral-400 outline-none bg-transparent"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                />
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <X className="h-4 w-4 text-neutral-500" />
                </button>
              </div>

              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-600">Popular Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.query}
                        onClick={() => {
                          setQuery(item.query);
                          router.push(`/search?q=${encodeURIComponent(item.query)}`);
                          onClose();
                          setQuery("");
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500">
                Press <kbd className="px-2 py-1 bg-white rounded-lg text-xs font-medium border border-neutral-200">Enter</kbd> to search
                or <kbd className="px-2 py-1 bg-white rounded-lg text-xs font-medium border border-neutral-200">Esc</kbd> to close
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
