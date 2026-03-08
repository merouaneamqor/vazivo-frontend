"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { GalleryImage } from "./types";

interface GalleryContextValue {
  images: GalleryImage[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  isOpen: boolean;
  openAt: (index: number) => void;
  close: () => void;
  handleNext: () => void;
  handlePrev: () => void;
}

const GalleryContext = createContext<GalleryContextValue | null>(null);

export function useGallery() {
  const ctx = useContext(GalleryContext);
  if (!ctx) throw new Error("useGallery must be used within GalleryProvider");
  return ctx;
}

interface GalleryProviderProps {
  images: GalleryImage[];
  initialIndex?: number;
  children: React.ReactNode;
}

export function GalleryProvider({ images, initialIndex = 0, children }: GalleryProviderProps) {
  const [currentIndex, setCurrentIndex] = useState(
    Math.min(Math.max(0, initialIndex), Math.max(0, images.length - 1))
  );
  const [isOpen, setIsOpen] = useState(false);

  const openAt = useCallback((index: number) => {
    const i = Math.min(Math.max(0, index), Math.max(0, images.length - 1));
    setCurrentIndex(i);
    setIsOpen(true);
  }, [images.length]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => (i >= images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const value = useMemo<GalleryContextValue>(
    () => ({
      images,
      currentIndex,
      setCurrentIndex,
      isOpen,
      openAt,
      close,
      handleNext,
      handlePrev,
    }),
    [images, currentIndex, isOpen, openAt, close, handleNext, handlePrev]
  );

  return (
    <GalleryContext.Provider value={value}>
      {children}
    </GalleryContext.Provider>
  );
}
