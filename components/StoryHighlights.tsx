"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Sparkles, Tag, Flame, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Story {
  id: string;
  type: "promo" | "new_service" | "trending" | "featured";
  title: string;
  subtitle?: string;
  image: string;
  businessName: string;
  businessLogo?: string;
  link?: string;
  badge?: string;
  expiresAt?: string;
}

interface StoryHighlightsProps {
  stories: Story[];
  className?: string;
}

const typeConfig = {
  promo: { icon: Tag, color: "from-rose-500 to-pink-500", label: "Promo" },
  new_service: { icon: Sparkles, color: "from-violet-500 to-purple-500", label: "New" },
  trending: { icon: Flame, color: "from-orange-500 to-amber-500", label: "Trending" },
  featured: { icon: Star, color: "from-primary-500 to-primary-600", label: "Featured" },
};

export function StoryHighlights({ stories, className }: StoryHighlightsProps) {
  const [activeStory, setActiveStory] = React.useState<number | null>(null);
  const [progress, setProgress] = React.useState(0);
  const progressInterval = React.useRef<NodeJS.Timeout | null>(null);

  const startProgress = React.useCallback(() => {
    setProgress(0);
    if (progressInterval.current) clearInterval(progressInterval.current);
    
    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next story or close
          setActiveStory((current) => {
            if (current === null) return null;
            if (current < stories.length - 1) {
              return current + 1;
            }
            return null;
          });
          return 0;
        }
        return prev + 2; // 5 seconds per story (100 / 2 = 50 intervals * 100ms)
      });
    }, 100);
  }, [stories.length]);

  React.useEffect(() => {
    if (activeStory !== null) {
      startProgress();
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current);
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [activeStory, startProgress]);

  const handleNext = () => {
    if (activeStory !== null && activeStory < stories.length - 1) {
      setActiveStory(activeStory + 1);
      setProgress(0);
    } else {
      setActiveStory(null);
    }
  };

  const handlePrev = () => {
    if (activeStory !== null && activeStory > 0) {
      setActiveStory(activeStory - 1);
      setProgress(0);
    }
  };

  const handleClose = () => {
    setActiveStory(null);
    setProgress(0);
  };

  if (stories.length === 0) return null;

  return (
    <>
      {/* Story Circles */}
      <div className={cn("flex gap-4 overflow-x-auto scrollbar-hide py-2", className)}>
        {stories.map((story, index) => {
          const config = typeConfig[story.type];
          return (
            <motion.button
              key={story.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setActiveStory(index)}
              className="flex-shrink-0 flex flex-col items-center gap-1.5"
            >
              <div className={cn(
                "p-0.5 rounded-full bg-gradient-to-br",
                config.color
              )}>
                <div className="p-0.5 bg-white rounded-full">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src={story.image}
                      alt={story.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10" />
                    <div className={cn(
                      "absolute bottom-0 left-0 right-0 py-0.5 text-[8px] font-bold text-white text-center bg-gradient-to-r",
                      config.color
                    )}>
                      {config.label}
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium text-neutral-700 max-w-[72px] truncate">
                {story.businessName}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {activeStory !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black"
          >
            {/* Progress bars */}
            <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2 pt-safe">
              {stories.map((_, index) => (
                <div
                  key={index}
                  className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
                >
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: index < activeStory
                        ? "100%"
                        : index === activeStory
                        ? `${progress}%`
                        : "0%",
                    }}
                    transition={{ duration: 0.1, ease: "linear" }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-8 left-0 right-0 z-10 flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                {stories[activeStory].businessLogo && (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                    <Image
                      src={stories[activeStory].businessLogo}
                      alt=""
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-white">
                    {stories[activeStory].businessName}
                  </p>
                  <p className="text-xs text-white/70">
                    {typeConfig[stories[activeStory].type].label}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Story Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src={stories[activeStory].image}
                alt={stories[activeStory].title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
            </div>

            {/* Story Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pb-safe">
              {stories[activeStory].badge && (
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white mb-3 bg-gradient-to-r",
                  typeConfig[stories[activeStory].type].color
                )}>
                  {React.createElement(typeConfig[stories[activeStory].type].icon, { className: "h-3 w-3" })}
                  {stories[activeStory].badge}
                </span>
              )}
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                {stories[activeStory].title}
              </h2>
              {stories[activeStory].subtitle && (
                <p className="text-white/80 text-sm mb-4">
                  {stories[activeStory].subtitle}
                </p>
              )}
              {stories[activeStory].link && (
                <motion.a
                  href={stories[activeStory].link}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center w-full py-3 bg-white text-neutral-900 font-semibold "
                >
                  View Details
                </motion.a>
              )}
            </div>

            {/* Navigation Areas */}
            <button
              onClick={handlePrev}
              className="absolute left-0 top-20 bottom-32 w-1/3 z-10"
              aria-label="Previous story"
            />
            <button
              onClick={handleNext}
              className="absolute right-0 top-20 bottom-32 w-1/3 z-10"
              aria-label="Next story"
            />

            {/* Navigation Arrows (Desktop) */}
            {activeStory > 0 && (
              <button
                onClick={handlePrev}
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
            )}
            {activeStory < stories.length - 1 && (
              <button
                onClick={handleNext}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Compact variant for business profiles
interface MiniStoryProps {
  stories: Story[];
  className?: string;
}

export function MiniStoryHighlights({ stories, className }: MiniStoryProps) {
  if (stories.length === 0) return null;

  return (
    <div className={cn("flex gap-2 overflow-x-auto scrollbar-hide", className)}>
      {stories.slice(0, 4).map((story, index) => {
        const config = typeConfig[story.type];
        return (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative flex-shrink-0 w-24 h-32  overflow-hidden"
          >
            <Image
              src={story.image}
              alt={story.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className={cn(
              "absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold text-white bg-gradient-to-r",
              config.color
            )}>
              {config.label}
            </div>
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-xs font-medium text-white line-clamp-2">
                {story.title}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
