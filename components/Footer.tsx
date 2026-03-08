"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Instagram, Twitter, Facebook, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { getSearchPath } from "@/lib/utils";
import { useCategories } from "@/hooks/useSearchMetadata";

function useFooterLinks() {
  const t = useTranslations("footer");
  return {
    company: [
      { name: t("aboutUs"), href: "/about" },
      { name: t("careers"), href: "/careers" },
      { name: t("press"), href: "/press" },
      { name: t("blog"), href: "/blog" },
    ],
    support: [
      { name: t("helpCenter"), href: "/help" },
      { name: t("contactUs"), href: "/contact" },
      { name: t("privacyPolicy"), href: "/privacy" },
      { name: t("termsOfService"), href: "/terms" },
    ],
    business: [
      { name: t("listYourBusiness"), href: "/business" },
      { name: t("providerLogin"), href: "/provider" },
      { name: t("partnerResources"), href: "/partners" },
    ],
  };
}

const socialLinks = [
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "Facebook", icon: Facebook, href: "#" },
];

export default function Footer() {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");
  const footerLinks = useFooterLinks();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const discoverLinks = categories.map((cat) => ({
    name: cat.name,
    href: getSearchPath(null, cat.name),
  }));

  const linkGroups: { label: string; links: { name: string; href: string }[] }[] = [
    { label: t("discover"), links: discoverLinks },
    { label: t("company"), links: footerLinks.company },
    { label: t("support"), links: footerLinks.support },
    { label: t("forBusiness"), links: footerLinks.business },
  ];

  return (
    <footer
      className="bg-neutral-900 text-neutral-300"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        {/* Main grid: brand + link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand block */}
          <div className="col-span-2 sm:col-span-2 md:col-span-4 lg:col-span-1 lg:pr-4">
            <Logo href="/" size="lg" light className="mb-5" />
            <p className="text-sm text-neutral-400 leading-relaxed max-w-xs mb-6">
              Your destination for restaurant discovery and reservations. Find and book the best tables in your city.
            </p>
            <nav aria-label="Social links" className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-primary-400  transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
                  aria-label={`Follow us on ${social.name}`}
                >
                  <social.icon className="h-5 w-5" aria-hidden />
                </a>
              ))}
            </nav>
          </div>

          {/* Link columns */}
          {linkGroups.map((group) => (
            <nav key={group.label} aria-label={group.label}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">
                {group.label}
              </h3>
              <ul className="space-y-3">
                {group.label === t("discover") && categoriesLoading ? (
                  <li className="text-sm text-neutral-500">{tCommon("loading")}</li>
                ) : (
                  group.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 rounded px-1 -mx-1 py-0.5"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </nav>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-14 pt-10 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h3 className="text-white font-semibold mb-1">Stay updated</h3>
              <p className="text-sm text-neutral-400 max-w-md">
                Get the latest restaurant picks and exclusive offers in your inbox.
              </p>
            </div>
            <form
              className="flex flex-col sm:flex-row gap-3 sm:items-stretch w-full md:w-auto"
              onSubmit={(e) => e.preventDefault()}
            >
              <label htmlFor="footer-email" className="sr-only">
                Email for newsletter
              </label>
              <div className="relative flex-1 min-w-0">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none"
                  aria-hidden
                />
                <input
                  id="footer-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-neutral-800 border border-neutral-700  text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                />
              </div>
              <Button
                type="submit"
                variant="dark"
                className="shrink-0 px-6 py-3"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-8 border-t border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-neutral-500 order-2 sm:order-1">
              {t("copyright", { year: new Date().getFullYear() })}
            </p>
            <nav
              aria-label="Legal"
              className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-neutral-500 order-1 sm:order-2"
            >
              <Link
                href="/privacy"
                className="hover:text-white transition-colors underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 rounded px-1"
              >
                Privacy
              </Link>
              <span className="text-neutral-600" aria-hidden>
                ·
              </span>
              <Link
                href="/terms"
                className="hover:text-white transition-colors underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 rounded px-1"
              >
                Terms
              </Link>
              <span className="text-neutral-600" aria-hidden>
                ·
              </span>
              <Link
                href="/cookies"
                className="hover:text-white transition-colors underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 rounded px-1"
              >
                Cookies
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
