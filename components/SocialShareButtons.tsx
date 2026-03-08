"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialShareButtonsProps {
  url: string;
  title: string;
  text?: string;
  className?: string;
  /** Render as a compact icon-only button with dropdown (default), or inline row */
  variant?: "dropdown" | "inline";
}

const SHARE_LINKS = [
  {
    name: "Facebook",
    buildHref: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    hoverColor: "hover:bg-[#1877F2] hover:text-white",
  },
  {
    name: "X",
    buildHref: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    hoverColor: "hover:bg-black hover:text-white",
  },
  {
    name: "WhatsApp",
    buildHref: (url: string, text: string) =>
      `https://wa.me/?text=${encodeURIComponent(text)}%20${encodeURIComponent(url)}`,
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    hoverColor: "hover:bg-[#25D366] hover:text-white",
  },
  {
    name: "LinkedIn",
    buildHref: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    hoverColor: "hover:bg-[#0A66C2] hover:text-white",
  },
];

export default function SocialShareButtons({
  url,
  title,
  text,
  className,
  variant = "dropdown",
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect native share only after mount to avoid hydration mismatch (server has no navigator)
  useEffect(() => {
    setMounted(true);
  }, []);

  const supportsNativeShare =
    mounted &&
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function";

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const shareText = text || title;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [url]);

  const handleNativeShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url });
      } catch {
        /* user cancelled */
      }
    }
    setOpen(false);
  }, [title, shareText, url]);

  /* ── Dropdown variant: single icon button → flyout ── */
  if (variant === "dropdown") {
    return (
      <div ref={dropdownRef} className={cn("relative", className)}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white p-2 text-neutral-500 transition-colors",
            "hover:bg-neutral-50 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
            open && "bg-neutral-50 text-neutral-700"
          )}
          aria-label="Share"
          aria-expanded={open}
          aria-haspopup="true"
        >
          <Share2 className="h-4 w-4" />
        </button>

        {open && (
          <div
            className="absolute right-0 top-full mt-2 z-50 w-48 rounded-xl border border-neutral-100 bg-white py-1.5 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150"
            role="menu"
          >
            {supportsNativeShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
                role="menuitem"
              >
                <Share2 className="h-4 w-4 text-neutral-400" />
                Share…
              </button>
            )}

            {SHARE_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.buildHref(url, shareText)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <span className="text-neutral-400">{link.icon}</span>
                {link.name}
              </a>
            ))}

            <div className="my-1 border-t border-neutral-100" role="separator" />

            <button
              type="button"
              onClick={() => {
                handleCopyLink();
                setTimeout(() => setOpen(false), 1200);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
              role="menuitem"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-neutral-400" />
                  Copy link
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ── Inline variant (legacy): row of icons ── */
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {SHARE_LINKS.map((link) => (
        <a
          key={link.name}
          href={link.buildHref(url, shareText)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white p-2 text-neutral-600 transition-colors",
            link.hoverColor
          )}
          aria-label={`Share on ${link.name}`}
        >
          {link.icon}
        </a>
      ))}
      <button
        type="button"
        onClick={handleCopyLink}
        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
        aria-label="Copy link"
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
