"use client";

import { motion } from "framer-motion";
import { RestaurantCard } from "./RestaurantCard";

const TRENDING = [
  { name: "La Sqala", cuisine: "Moroccan", city: "Casablanca", rating: 4.8, reviewCount: 1243, imageUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80", priceRange: "$$", slug: "/search" },
  { name: "Le Comptoir Darna", cuisine: "Mediterranean", city: "Marrakech", rating: 4.7, reviewCount: 892, imageUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&q=80", priceRange: "$$$", slug: "/search" },
  { name: "Ricks Café", cuisine: "International", city: "Casablanca", rating: 4.6, reviewCount: 2103, imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80", priceRange: "$$$", slug: "/search" },
];

export function TrendingRestaurantsSection() {
  return (
    <section className="py-16 md:py-24 bg-vazivo-creamDark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="text-vazivo-orange font-semibold text-sm uppercase tracking-wider mb-2">Trending now</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-vazivo-warmGray">Popular restaurants</h2>
          <p className="text-vazivo-warmMuted mt-2 max-w-xl mx-auto">Book a table at the most loved spots in town.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {TRENDING.map((r) => (
            <RestaurantCard key={r.name} {...r} />
          ))}
        </div>
      </div>
    </section>
  );
}
