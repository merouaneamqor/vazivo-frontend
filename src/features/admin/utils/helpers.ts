"use client";

import type { AdminAct, AdminCity } from '../types';

export function flattenCategories(acts: AdminAct[]): { name: string; slug: string }[] {
  const flat: { name: string; slug: string }[] = [];
  for (const act of acts) {
    flat.push({ name: act.name, slug: act.slug });
    for (const sub of act.subacts) {
      flat.push({ name: sub.name, slug: sub.slug });
    }
  }
  return flat;
}

export function flattenCities(cities: AdminCity[]): { name: string; slug: string }[] {
  return cities.map((c) => ({ name: c.name, slug: c.slug }));
}
