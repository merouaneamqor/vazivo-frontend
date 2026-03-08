"use client";

import { useEffect } from "react";
import { PROVIDER_REGISTER_CAROUSEL_IMAGES } from "@/lib/provider-register-carousel";

export function PreloadCarouselImages() {
  useEffect(() => {
    PROVIDER_REGISTER_CAROUSEL_IMAGES.forEach(({ src }) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;
      document.head.appendChild(link);
    });
    return () => {
      PROVIDER_REGISTER_CAROUSEL_IMAGES.forEach(({ src }) => {
        const link = document.querySelector(`link[rel="preload"][href="${src}"]`);
        link?.remove();
      });
    };
  }, []);

  return null;
}
