"use client";

import { useState, useRef, useEffect } from "react";
import { Search, MapPin, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  query: string;
  location: string;
  onQueryChange: (query: string) => void;
  onLocationChange: (location: string) => void;
}

export function SearchBar({ query, location, onQueryChange, onLocationChange }: SearchBarProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions] = useState([
    { type: "salon", text: "Salon Prestige" },
    { type: "service", text: "Coiffure femme" },
    { type: "category", text: "Beauté" },
  ]);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Rechercher un salon, un service ou un prestataire…"
          className="pl-12 pr-10 h-12  border-neutral-300 focus:border-primary focus:ring-primary"
        />
        {query && (
          <button
            onClick={() => onQueryChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 rounded-full"
          >
            <X className="w-4 h-4 text-neutral-400" />
          </button>
        )}

        {/* Autocomplete Suggestions */}
        {showSuggestions && query && (
          <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-neutral-200 py-2 z-50">
            {suggestions
              .filter((s) => s.text.toLowerCase().includes(query.toLowerCase()))
              .map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onQueryChange(suggestion.text)}
                  className="w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center gap-3"
                >
                  <Search className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm">{suggestion.text}</span>
                  <span className="ml-auto text-xs text-neutral-400 capitalize">{suggestion.type}</span>
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Location Selector */}
      <div className="relative sm:w-64">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <Input
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className="pl-12 h-12  border-neutral-300 focus:border-primary focus:ring-primary"
        />
      </div>

      {/* Search Button */}
      <button className="h-12 px-6 bg-primary text-white rounded-xl hover:bg-primary/90 transition font-medium whitespace-nowrap">
        Rechercher
      </button>
    </div>
  );
}
