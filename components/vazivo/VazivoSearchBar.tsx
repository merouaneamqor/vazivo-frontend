"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, UtensilsCrossed, Calendar, Clock, Users, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const CITIES = ["Casablanca", "Rabat", "Marrakech", "Tangier", "Fes", "Agadir"];
const CUISINES = ["Moroccan", "Italian", "Japanese", "French", "Mediterranean", "Street food"];
const TIME_SLOTS = ["12:00", "12:30", "13:00", "19:00", "19:30", "20:00", "20:30", "21:00"];
const GUESTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function VazivoSearchBar() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState<number | "">("");
  const [focused, setFocused] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (cuisine) params.set("cuisine", cuisine);
    if (date) params.set("date", date);
    if (time) params.set("time", time);
    if (guests !== "") params.set("guests", String(guests));
    router.push(`/search?${params.toString()}`);
  };

  const labelClass =
    "flex items-center gap-2 text-white/90 text-xs font-medium mb-1.5 [&_svg]:text-white/85 [&_svg]:shrink-0";
  const inputClass =
    "w-full bg-transparent border-0 p-0 text-white font-medium text-sm placeholder:text-white/70 focus:ring-0 cursor-pointer [color-scheme:dark]";

  return (
    <div
      className={cn(
        "rounded-2xl bg-black/50 backdrop-blur-md border border-white/25 shadow-vazivo overflow-hidden transition-all duration-300",
        focused && "ring-2 ring-white/40 shadow-vazivo-hover"
      )}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-white/20">
        <div className="relative p-3 sm:p-4">
          <label className={labelClass}>
            <MapPin className="h-3.5 w-3.5" />
            Location
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={inputClass}
            aria-label="Location"
          >
            <option value="">Where?</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="relative p-3 sm:p-4">
          <label className={labelClass}>
            <UtensilsCrossed className="h-3.5 w-3.5" />
            Cuisine
          </label>
          <select
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className={inputClass}
            aria-label="Cuisine"
          >
            <option value="">Any cuisine</option>
            {CUISINES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="relative p-3 sm:p-4">
          <label className={labelClass}>
            <Calendar className="h-3.5 w-3.5" />
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            className={inputClass}
            aria-label="Date"
          />
        </div>
        <div className="relative p-3 sm:p-4">
          <label className={labelClass}>
            <Clock className="h-3.5 w-3.5" />
            Time
          </label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={inputClass}
            aria-label="Time"
          >
            <option value="">Any time</option>
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="relative p-3 sm:p-4">
          <label className={labelClass}>
            <Users className="h-3.5 w-3.5" />
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value === "" ? "" : Number(e.target.value))}
            className={inputClass}
            aria-label="Guests"
          >
            <option value="">Any</option>
            {GUESTS.map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
            ))}
          </select>
        </div>
        <div className="p-3 sm:p-4 flex items-end">
          <Button
            onClick={handleSearch}
            className="w-full h-12 bg-vazivo-red hover:bg-vazivo-redLight text-white font-semibold rounded-xl shadow-vazivo hover:shadow-vazivo-hover transition-all flex items-center justify-center gap-2"
          >
            <Search className="h-4 w-4" />
            Find tables
          </Button>
        </div>
      </div>
    </div>
  );
}
