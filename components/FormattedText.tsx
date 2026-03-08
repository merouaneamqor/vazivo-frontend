"use client";

import React from "react";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Applies standard markdown-style formatting to plain text, then returns HTML string.
 * Supports: **bold**, __bold__, *italic*, _italic_, `code`, and optionally newlines -> <br>.
 */
function formatToHtml(text: string, multiline: boolean): string {
  let out = escapeHtml(text);

  // Code `...` (before other so code can contain * or _)
  out = out.replace(/`([^`]+)`/g, "<code class=\"rounded bg-neutral-100 px-1 py-0.5 text-sm font-medium text-neutral-700\">$1</code>");

  // Bold __...__ (before single _)
  out = out.replace(/__(.+?)__/g, "<strong>$1</strong>");
  // Bold **...**
  out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Italic: single _..._ (content must not contain _)
  out = out.replace(/_([^_]+)_/g, "<em>$1</em>");
  // Italic: single *...* (content must not contain *)
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  if (multiline) {
    out = out.replace(/\n/g, "<br />");
  }

  return out;
}

export interface FormattedTextProps {
  text: string;
  className?: string;
  as?: "span" | "p" | "div";
  /** If true, newlines are rendered as <br /> (useful for block containers). */
  multiline?: boolean;
}

/**
 * Renders text with standard markdown-style formatting:
 * - **bold** and __bold__
 * - *italic* and _italic_
 * - `code`
 * - Optional: newlines as line breaks when multiline is true
 * HTML is escaped for safety; only these patterns are converted.
 */
export function FormattedText({
  text,
  className,
  as: Component = "span",
  multiline = false,
}: FormattedTextProps) {
  if (!text || typeof text !== "string") return null;

  const html = formatToHtml(text, multiline);

  return React.createElement(Component, {
    className,
    dangerouslySetInnerHTML: { __html: html },
  });
}
