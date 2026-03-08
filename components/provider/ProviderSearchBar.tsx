"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { ProviderGlobalSearch } from "@/components/provider/search";
import { useCommandK } from "@/hooks/useCommandK";

export function ProviderSearchBar() {
  const [searchOpen, setSearchOpen] = useState(false);

  useCommandK(() => setSearchOpen(true));

  return (
    <>
      <button
        onClick={() => setSearchOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors w-full max-w-md"
      >
        <Search className="h-4 w-4 text-neutral-400" />
        <span className="text-sm text-neutral-500 flex-1 text-left">Search anything...</span>
        <kbd className="hidden sm:inline-flex px-2 py-1 text-xs font-medium text-neutral-500 bg-neutral-100 border border-neutral-200 rounded-lg">
          ⌘K
        </kbd>
      </button>

      <ProviderGlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
