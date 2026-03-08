import type { Metadata } from "next";
import Link from "next/link";
import { STATIC_ARTICLES, CITY_GUIDE_COMBOS, AVIS_PAGES, getCityGuideSlug } from "@/lib/blog";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://vazivo.com").replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Blog Vazivo – Guides Spa, Hammam & Beauté au Maroc",
  description:
    "Découvrez nos guides spa, hammam et beauté au Maroc : meilleures adresses par ville, prix, avis et conseils pour bien choisir.",
  alternates: {
    canonical: `${appUrl}/blog`,
    languages: {
      "fr-MA": `${appUrl}/blog?hl=fr`,
      "ar-MA": `${appUrl}/blog?hl=ar`,
      en: `${appUrl}/blog?hl=en`,
      "x-default": `${appUrl}/blog`,
    },
  },
  openGraph: {
    title: "Blog Vazivo – Guides Spa, Hammam & Beauté au Maroc",
    description: "Découvrez nos guides spa, hammam et beauté au Maroc.",
    url: `${appUrl}/blog`,
    type: "website",
    siteName: "Vazivo",
    locale: "fr_MA",
  },
};

interface CardProps {
  href: string;
  title: string;
  description: string;
  date?: string;
  badge?: string;
}

function ArticleCard({ href, title, description, date, badge }: CardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-primary-200"
    >
      {badge && (
        <span className="w-fit text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      <h2 className="text-base font-semibold text-neutral-900 group-hover:text-primary-600 leading-snug">
        {title}
      </h2>
      <p className="text-sm text-neutral-500 line-clamp-2">{description}</p>
      {date && (
        <time className="text-xs text-neutral-400 mt-auto" dateTime={date}>
          {new Date(date).toLocaleDateString("fr-MA", { year: "numeric", month: "long", day: "numeric" })}
        </time>
      )}
    </Link>
  );
}

export default function BlogPage() {
  const cityGuides = CITY_GUIDE_COMBOS.slice(0, 12).map((c) => ({
    href: `/blog/${getCityGuideSlug(c.category, c.city)}`,
    title: `Les Meilleurs ${c.categoryLabel} à ${c.cityLabel}`,
    description: `Découvrez le top des ${c.categoryLabel.toLowerCase()} à ${c.cityLabel} : adresses, prix, avis clients et réservation en ligne.`,
    badge: "Guide Ville",
  }));

  const avisCards = AVIS_PAGES.slice(0, 8).map((a) => ({
    href: `/blog/${a.slug}`,
    title: `Avis sur ${a.name} à ${a.city} – Prix, Photos & Expérience`,
    description: `Tout ce que vous devez savoir sur ${a.name} à ${a.city} : avis clients, prix des services, photos et comment réserver.`,
    badge: "Avis",
  }));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog Vazivo",
    description: "Guides spa, hammam et beauté au Maroc",
    url: `${appUrl}/blog`,
    publisher: {
      "@type": "Organization",
      name: "Vazivo",
      url: appUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
              Blog Vazivo
            </h1>
            <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
              Guides, avis et conseils sur les meilleurs spas, hammams et salons de beauté au Maroc.
            </p>
          </div>

          {/* Static articles */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-neutral-800 mb-5">Guides & Conseils</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {STATIC_ARTICLES.map((a) => (
                <ArticleCard
                  key={a.slug}
                  href={`/blog/${a.slug}`}
                  title={a.title}
                  description={a.description}
                  date={a.date}
                  badge="Article"
                />
              ))}
            </div>
          </section>

          {/* City guides */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-neutral-800 mb-5">Guides par Ville</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cityGuides.map((g) => (
                <ArticleCard key={g.href} {...g} />
              ))}
            </div>
          </section>

          {/* Avis pages */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-neutral-800 mb-5">Avis & Expériences</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {avisCards.map((a) => (
                <ArticleCard key={a.href} {...a} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
