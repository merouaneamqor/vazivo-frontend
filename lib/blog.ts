/**
 * Blog content registry.
 * Static articles are defined here as plain TS objects.
 * Programmatic guide and avis pages are generated at request time using the business API.
 */

export type ArticleType = "static" | "city_guide" | "avis";

export interface CityLink {
  label: string;
  href: string;
  category: string;
  emoji?: string;
}

export interface BlogArticle {
  slug: string;
  type: ArticleType;
  locale?: "fr" | "ar" | "en";
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  date: string;
  image?: string;
  /** category slug for city_guide (e.g. "spa", "hammam") */
  category?: string;
  /** city slug for city_guide (e.g. "rabat", "tanger") */
  city?: string;
  /** business slug for avis pages */
  businessSlug?: string;
  /** HTML body for static articles */
  body?: string;
  body_ar?: string;
  /** Structured city links rendered as a visual grid after the prose body */
  cityLinks?: CityLink[];
}

/** Static editorial articles */
export const STATIC_ARTICLES: BlogArticle[] = [
  {
    slug: "spa-autour-de-moi-maroc",
    type: "static",
    title: "Spa autour de moi : Comment trouver le meilleur spa au Maroc",
    description:
      "Guide complet pour trouver un spa ou hammam près de chez vous au Maroc. Conseils pour choisir, réserver et profiter au maximum de votre séance.",
    date: "2026-03-01",
    body: `<p>Vous cherchez un spa ou un hammam à proximité ? Au Maroc, l'offre est riche : des hammams traditionnels aux spas de luxe en passant par les instituts de beauté, il y en a pour tous les goûts et tous les budgets.</p>
<h2>Comment trouver un spa près de vous</h2>
<p>Utilisez Vazivo pour rechercher par ville ou par géolocalisation. Vous pouvez filtrer par catégorie (spa, hammam, massage), par disponibilité et par note client.</p>
<h2>Conseils pour choisir le bon spa</h2>
<ul>
  <li>Consultez les avis clients avant de réserver.</li>
  <li>Vérifiez les photos pour avoir une idée de l'ambiance.</li>
  <li>Comparez les tarifs : un bon hammam traditionnel coûte entre 80 et 200 MAD.</li>
  <li>Réservez en ligne pour éviter les files d'attente.</li>
</ul>
<h2>Les villes avec les meilleurs spas au Maroc</h2>
<p>Casablanca, Rabat, Marrakech, Tanger et Agadir concentrent la majorité des établissements premium. Mais des villes comme Essaouira, Meknès et Tétouan offrent aussi d'excellentes adresses.</p>`,
    cityLinks: [
      { label: "Casablanca", href: "/spa/casablanca", category: "Spa", emoji: "🌊" },
      { label: "Rabat", href: "/spa/rabat", category: "Spa", emoji: "🏛️" },
      { label: "Marrakech", href: "/spa/marrakech", category: "Spa", emoji: "🌹" },
      { label: "Tanger", href: "/spa/tanger", category: "Spa", emoji: "⚓" },
      { label: "Agadir", href: "/spa/agadir", category: "Spa", emoji: "☀️" },
      { label: "Meknès", href: "/spa/meknes", category: "Spa", emoji: "🕌" },
      { label: "Casablanca", href: "/hammam/casablanca", category: "Hammam", emoji: "♨️" },
      { label: "Rabat", href: "/hammam/rabat", category: "Hammam", emoji: "♨️" },
    ],
  },
  {
    slug: "hammam-pres-de-moi",
    type: "static",
    title: "Hammam près de moi ouvert maintenant – Guide Maroc",
    title_ar: "حمام قريب مني مفتوح الآن",
    description:
      "Trouvez un hammam ouvert maintenant près de chez vous. Liste des hammams par ville au Maroc avec horaires et réservation en ligne.",
    description_ar: "ابحث عن حمام مفتوح الآن بالقرب منك. قائمة الحمامات حسب المدينة في المغرب مع مواعيد العمل والحجز عبر الإنترنت.",
    date: "2026-03-02",
    body: `<p>Besoin d'un hammam ouvert maintenant ? Que vous soyez à Casablanca, Rabat, Tanger ou Agadir, Vazivo vous permet de trouver un hammam disponible immédiatement.</p>
<h2>Combien coûte un hammam au Maroc ?</h2>
<p>Les tarifs varient selon le type d'établissement :</p>
<ul>
  <li>Hammam traditionnel : 50–120 MAD</li>
  <li>Hammam de luxe ou spa hammam : 200–500 MAD</li>
  <li>Séance avec gommage et massage : 150–400 MAD</li>
</ul>`,
    body_ar: `<p>هل تبحث عن حمام مفتوح الآن؟ سواء كنت في الدار البيضاء أو الرباط أو طنجة أو أكادير، يتيح لك Vazivo العثور على حمام متاح فوراً.</p>
<h2>تكلفة الحمام في المغرب</h2>
<ul>
  <li>حمام تقليدي : 50–120 درهم</li>
  <li>حمام فاخر أو سبا : 200–500 درهم</li>
  <li>جلسة مع تدليك : 150–400 درهم</li>
</ul>`,
    cityLinks: [
      { label: "Casablanca", href: "/hammam/casablanca", category: "Hammam", emoji: "♨️" },
      { label: "Rabat", href: "/hammam/rabat", category: "Hammam", emoji: "♨️" },
      { label: "Tanger", href: "/hammam/tanger", category: "Hammam", emoji: "♨️" },
      { label: "Agadir", href: "/hammam/agadir", category: "Hammam", emoji: "♨️" },
      { label: "Marrakech", href: "/hammam/marrakech", category: "Hammam", emoji: "♨️" },
      { label: "Salé", href: "/hammam/sale", category: "Hammam", emoji: "♨️" },
    ],
  },
  {
    slug: "hammam-maroc-prix",
    type: "static",
    title: "Combien coûte un hammam au Maroc ? Prix et tarifs 2026",
    description:
      "Tout sur les prix des hammams au Maroc en 2026 : tarifs, différences entre hammam traditionnel et luxe, ce qui est inclus et comment réserver.",
    date: "2026-03-03",
    body: `<p>Le hammam est une tradition millénaire au Maroc. Les prix varient selon le type d'établissement, la ville et les prestations incluses.</p>
<h2>Prix du hammam traditionnel</h2>
<p>Un hammam traditionnel (de quartier) coûte entre <strong>50 et 100 MAD</strong> pour une séance complète incluant l'accès à la salle de vapeur, le savon beldi et parfois un gommage basique.</p>
<h2>Prix du spa hammam ou hammam de luxe</h2>
<p>Un hammam haut de gamme ou spa hammam propose des séances entre <strong>200 et 800 MAD</strong>, incluant généralement :</p>
<ul>
  <li>Accès à la salle de vapeur chauffée</li>
  <li>Gommage au savon beldi et au kessa</li>
  <li>Enveloppement au ghassoul (rhassoul)</li>
  <li>Massage relaxant</li>
  <li>Tisane ou thé marocain</li>
</ul>
<h2>Comparatif par ville</h2>
<ul>
  <li><strong>Marrakech</strong> : parmi les plus chers (tourisme oblige), 300–600 MAD pour les riads-hammam.</li>
  <li><strong>Casablanca / Rabat</strong> : 150–400 MAD pour un bon spa hammam.</li>
  <li><strong>Agadir / Tanger</strong> : tarifs compétitifs, 100–300 MAD.</li>
</ul>`,
    cityLinks: [
      { label: "Casablanca", href: "/hammam/casablanca", category: "Hammam", emoji: "♨️" },
      { label: "Rabat", href: "/hammam/rabat", category: "Hammam", emoji: "♨️" },
      { label: "Tanger", href: "/hammam/tanger", category: "Hammam", emoji: "♨️" },
      { label: "Agadir", href: "/hammam/agadir", category: "Hammam", emoji: "♨️" },
      { label: "Marrakech", href: "/hammam/marrakech", category: "Hammam", emoji: "♨️" },
    ],
  },
  {
    slug: "meilleurs-barbershops-maroc",
    type: "static",
    title: "Meilleurs Barbershops au Maroc – Coupe Homme & Barbe 2026",
    description:
      "Découvrez les meilleurs barbershops au Maroc pour une coupe homme moderne, un rasage traditionnel ou une barbe taillée au cordeau. Réservez en ligne.",
    date: "2026-03-04",
    body: `<p>Le barbershop connaît un véritable essor au Maroc. Des établissements premium proposant des coupes modernes aux barbiers traditionnels, l'offre est variée et de qualité.</p>
<h2>Comment choisir un bon barbershop</h2>
<ul>
  <li>Consultez le portfolio de coupes sur leur page Vazivo.</li>
  <li>Lisez les avis de clients précédents.</li>
  <li>Réservez un créneau en ligne pour éviter l'attente.</li>
  <li>Vérifiez les tarifs : une coupe homme de qualité coûte entre 60 et 200 MAD.</li>
</ul>`,
    cityLinks: [
      { label: "Casablanca", href: "/barber/casablanca", category: "Barber", emoji: "✂️" },
      { label: "Rabat", href: "/barber/rabat", category: "Barber", emoji: "✂️" },
      { label: "Marrakech", href: "/barber/marrakech", category: "Barber", emoji: "✂️" },
      { label: "Tanger", href: "/barber/tanger", category: "Barber", emoji: "✂️" },
      { label: "Agadir", href: "/barber/agadir", category: "Barber", emoji: "✂️" },
    ],
  },
  {
    slug: "salon-beaute-femme-maroc",
    type: "static",
    title: "Salon de Beauté Femme au Maroc – Soins, Épilation & Maquillage",
    description:
      "Guide complet pour trouver le meilleur salon de beauté pour femmes au Maroc. Soins du visage, épilation, maquillage professionnel et onglerie.",
    date: "2026-03-05",
    body: `<p>Les salons de beauté au Maroc offrent un large éventail de services : soins du visage, épilation orientale, manucure, pédicure et maquillage professionnel.</p>
<h2>Services populaires</h2>
<ul>
  <li>Épilation à fil ou à la cire : 30–100 MAD</li>
  <li>Soin du visage : 150–400 MAD</li>
  <li>Manucure gel : 100–200 MAD</li>
  <li>Maquillage de mariage : 300–800 MAD</li>
</ul>`,
    cityLinks: [
      { label: "Casablanca", href: "/salon-de-beaute/casablanca", category: "Salon", emoji: "💅" },
      { label: "Rabat", href: "/salon-de-beaute/rabat", category: "Salon", emoji: "💅" },
      { label: "Marrakech", href: "/salon-de-beaute/marrakech", category: "Salon", emoji: "💅" },
      { label: "Tanger", href: "/salon-de-beaute/tanger", category: "Salon", emoji: "💅" },
      { label: "Agadir", href: "/salon-de-beaute/agadir", category: "Salon", emoji: "💅" },
    ],
  },
];

/**
 * Predefined city guide combinations (category × city).
 * Each generates a programmatic page at /blog/meilleurs-{category}-{city}.
 */
export const CITY_GUIDE_COMBOS: Array<{ category: string; city: string; categoryLabel: string; cityLabel: string }> = [
  { category: "spa", city: "essaouira", categoryLabel: "Spas", cityLabel: "Essaouira" },
  { category: "hammam", city: "rabat", categoryLabel: "Hammams", cityLabel: "Rabat" },
  { category: "spa", city: "tanger", categoryLabel: "Spas", cityLabel: "Tanger" },
  { category: "spa", city: "tetouan", categoryLabel: "Spas", cityLabel: "Tétouan" },
  { category: "spa", city: "meknes", categoryLabel: "Spas", cityLabel: "Meknès" },
  { category: "spa", city: "nador", categoryLabel: "Spas", cityLabel: "Nador" },
  { category: "spa", city: "mohammedia", categoryLabel: "Spas", cityLabel: "Mohammedia" },
  { category: "hammam", city: "tanger", categoryLabel: "Hammams", cityLabel: "Tanger" },
  { category: "hammam", city: "casablanca", categoryLabel: "Hammams", cityLabel: "Casablanca" },
  { category: "hammam", city: "marrakech", categoryLabel: "Hammams", cityLabel: "Marrakech" },
  { category: "spa", city: "rabat", categoryLabel: "Spas", cityLabel: "Rabat" },
  { category: "spa", city: "casablanca", categoryLabel: "Spas", cityLabel: "Casablanca" },
  { category: "spa", city: "agadir", categoryLabel: "Spas", cityLabel: "Agadir" },
  { category: "barber", city: "rabat", categoryLabel: "Barbershops", cityLabel: "Rabat" },
  { category: "barber", city: "casablanca", categoryLabel: "Barbershops", cityLabel: "Casablanca" },
  { category: "barber", city: "marrakech", categoryLabel: "Barbershops", cityLabel: "Marrakech" },
  { category: "barber", city: "agdal", categoryLabel: "Barbershops", cityLabel: "Agdal" },
  { category: "salon-de-beaute", city: "casablanca", categoryLabel: "Salons de Beauté", cityLabel: "Casablanca" },
  { category: "salon-de-beaute", city: "rabat", categoryLabel: "Salons de Beauté", cityLabel: "Rabat" },
  { category: "coiffeur", city: "casablanca", categoryLabel: "Coiffeurs", cityLabel: "Casablanca" },
  { category: "coiffeur", city: "rabat", categoryLabel: "Coiffeurs", cityLabel: "Rabat" },
];

/**
 * High-priority avis pages (business slug → display name + city for SEO).
 */
export const AVIS_PAGES: Array<{ slug: string; name: string; city: string; businessSlug: string }> = [
  { slug: "avis-hammam-charaf-agadir", name: "Hammam Charaf", city: "Agadir", businessSlug: "hammam-charaf" },
  { slug: "avis-hammam-zaryouh-tanger", name: "Hammam Zaryouh", city: "Tanger", businessSlug: "hammam-zaryouh" },
  { slug: "avis-hammam-lilya-sale", name: "Hammam Lilya", city: "Salé", businessSlug: "hammam-lilya" },
  { slug: "avis-hammam-boughaz-tanger", name: "Hammam Boughaz", city: "Tanger", businessSlug: "hammam-boughaz" },
  { slug: "avis-lotus-spa-meknes", name: "Lotus Spa", city: "Meknès", businessSlug: "lotus-spa-meknes" },
  { slug: "avis-so-spa-prestigia-rabat", name: "So Spa Prestigia", city: "Rabat", businessSlug: "so-spa-prestigia" },
  { slug: "avis-hammam-turc-al-falah-mohammedia", name: "Hammam Turc Al Falah", city: "Mohammedia", businessSlug: "hammam-turc-al-falah" },
  { slug: "avis-les-bains-almaha-spa", name: "Les Bains Almaha Spa", city: "Casablanca", businessSlug: "les-bains-almaha-spa" },
];

export function getCityGuideSlug(category: string, city: string): string {
  return `meilleurs-${category}-${city}`;
}

export function parseCityGuideSlug(slug: string): { category: string; city: string } | null {
  const combo = CITY_GUIDE_COMBOS.find((c) => getCityGuideSlug(c.category, c.city) === slug);
  return combo ? { category: combo.category, city: combo.city } : null;
}

export function parseAvisSlug(slug: string): (typeof AVIS_PAGES)[number] | null {
  return AVIS_PAGES.find((a) => a.slug === slug) ?? null;
}

export function getAllBlogSlugs(): string[] {
  return [
    ...STATIC_ARTICLES.map((a) => a.slug),
    ...CITY_GUIDE_COMBOS.map((c) => getCityGuideSlug(c.category, c.city)),
    ...AVIS_PAGES.map((a) => a.slug),
  ];
}

export function getStaticArticle(slug: string): BlogArticle | null {
  return STATIC_ARTICLES.find((a) => a.slug === slug) ?? null;
}
