import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Plus_Jakarta_Sans, Syne } from "next/font/google";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import "./globals.css";
import { QueryProvider } from "@/lib/query-client";
import { Toaster } from "react-hot-toast";
import ConditionalSiteChrome from "@/components/ConditionalSiteChrome";
import StructuredData from "@/components/StructuredData";
import { WebVitalsProvider } from "@/components/WebVitalsProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
  display: "optional",
  preload: true,
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-logo",
  weight: ["500", "600", "700", "800"],
  display: "swap",
  preload: true,
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("seo");
  
  return {
    metadataBase: new URL(appUrl),
    title: {
      default: t("defaultTitle"),
      template: "%s | OllaZen",
    },
    description: t("defaultDescription"),
    keywords: [
      // Core platform
      "réservation salon en ligne", "booking salon maroc", "appointment booking morocco", "salon booking app",
      // Morocco cities
      "salon casablanca", "coiffeur casablanca", "barber casablanca", "spa casablanca", "hammam casablanca",
      "salon rabat", "coiffeur rabat", "salon marrakech", "barber marrakech", "spa marrakech",
      "salon tanger", "salon agadir", "beauty services morocco",
      // Services
      "réservation coiffeur", "booking barber", "réservation spa", "massage booking", "manucure casablanca",
      "pédicure booking", "hammam reservation", "facial treatment", "laser hair removal morocco",
      // Long-tail
      "meilleur salon casablanca", "barbershop near me", "spa près de moi", "coiffeur en ligne maroc",
      "réservation beauté maroc", "wellness booking morocco", "beauty marketplace morocco"
    ],
    authors: [{ name: "OllaZen" }],
    openGraph: {
      type: "website",
      locale: "fr_MA",
      url: process.env.NEXT_PUBLIC_APP_URL,
      siteName: "OllaZen",
      title: t("defaultTitle"),
      description: t("defaultDescription"),
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "OllaZen – Réservation Salon & Beauté au Maroc",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("defaultTitle"),
      description: t("defaultDescription"),
      images: ["/og-image.jpg"],
    },
    alternates: {
      languages: {
        en: `${appUrl}?hl=en`,
        fr: `${appUrl}?hl=fr`,
        ar: `${appUrl}?hl=ar`,
        "x-default": appUrl,
      },
    },
    robots: {
      index: true,
      follow: true,
      noarchive: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION
      ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } }
      : {}),
    icons: {
      icon: [{ url: "/logo-icon.svg", type: "image/svg+xml" }],
      shortcut: "/logo-icon.svg",
      apple: "/logo-app-icon.svg",
    },
    manifest: "/site.webmanifest",
  };
}

export const viewport: Viewport = {
  themeColor: "#ff5c7c",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${plusJakarta.variable} ${syne.variable}`}>
      <head>
        {/* Preconnect to critical third-party resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://infra.ollazen.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
      <body className="font-sans antialiased">
        {/* Google Tag Manager (noscript) - fallback when JS is disabled */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MTG25MQH"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        {/* Must run before any app script: patch performance.measure for Turbopack negative timestamp (vercel/next.js#86060) */}
        <Script src="/perf-measure-patch.js" strategy="beforeInteractive" />
        {/* Google Tag Manager - load GA4, Clarity, etc. via your GTM container */}
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MTG25MQH');`}
        </Script>
        <StructuredData />
        <WebVitalsProvider />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <ConditionalSiteChrome>{children}</ConditionalSiteChrome>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1c1917",
                color: "#fff",
                borderRadius: "12px",
                padding: "12px 16px",
              },
              success: {
                iconTheme: {
                  primary: "#22c55e",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
