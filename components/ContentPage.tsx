"use client";

import type { ReactNode } from "react";

interface ContentPageProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function ContentPage({ title, description, children }: ContentPageProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-display font-bold text-neutral-900">{title}</h1>
          {description && (
            <p className="mt-2 text-neutral-500">{description}</p>
          )}
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-10 prose prose-neutral prose-headings:font-display prose-headings:font-semibold">
        {children}
      </div>
    </div>
  );
}
