"use client";

import { useState, useEffect } from "react";
import { ResultCard } from "./ResultCard";

interface ResultsGridProps {
  query: string;
  location: string;
  filters: any;
  sortBy: string;
}

export function ResultsGrid({ query, location, filters, sortBy }: ResultsGridProps) {
  const [loading, setLoading] = useState(true);
  const [results] = useState([
    {
      id: 1,
      image: "/placeholder-salon.jpg",
      name: "Salon Prestige",
      rating: 4.9,
      reviewCount: 132,
      tags: ["Coiffure", "Beauté", "Ongles"],
      priceFrom: 120,
      distance: 1.2,
      instantBooking: true,
      promo: "-20% Aujourd'hui",
    },
    {
      id: 2,
      image: "/placeholder-salon.jpg",
      name: "Beauty Center",
      rating: 4.7,
      reviewCount: 89,
      tags: ["Beauté", "Spa"],
      priceFrom: 150,
      distance: 2.5,
      instantBooking: false,
      promo: null,
    },
    {
      id: 3,
      image: "/placeholder-salon.jpg",
      name: "Coiffure Moderne",
      rating: 4.8,
      reviewCount: 156,
      tags: ["Coiffure"],
      priceFrom: 100,
      distance: 0.8,
      instantBooking: true,
      promo: null,
    },
  ]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [query, location, filters, sortBy]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">Aucun résultat trouvé</p>
        <p className="text-sm text-neutral-400 mt-2">Essayez de modifier vos filtres</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-neutral-600 mb-4">{results.length} résultats trouvés</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result) => (
          <ResultCard key={result.id} {...result} />
        ))}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-neutral-200 animate-pulse">
      <div className="h-48 bg-neutral-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-neutral-200 rounded w-3/4" />
        <div className="h-4 bg-neutral-200 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-6 bg-neutral-200 rounded-full w-16" />
          <div className="h-6 bg-neutral-200 rounded-full w-16" />
        </div>
        <div className="h-4 bg-neutral-200 rounded w-1/3" />
        <div className="h-10 bg-neutral-200 rounded-lg" />
      </div>
    </div>
  );
}
