"use client";

import dynamic from "next/dynamic";

const ProviderPhotosContent = dynamic(
  () => import("./ProviderPhotosContent").then((m) => m.default),
  {
    ssr: true,
    loading: () => (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    ),
  }
);

export default function ProviderPhotosPage() {
  return <ProviderPhotosContent />;
}
