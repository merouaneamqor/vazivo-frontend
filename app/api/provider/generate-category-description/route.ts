import { NextResponse } from "next/server";
import { generateText } from "ai";
import { openrouter } from "@/lib/openrouter";

interface RequestBody {
  categoryName: string;
  businessName?: string;
  locale?: string;
}

export async function POST(req: Request) {
  try {
    const { categoryName, businessName, locale }: RequestBody = await req.json();

    if (!categoryName || !categoryName.trim()) {
      return NextResponse.json(
        { error: "categoryName is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key is not configured" },
        { status: 500 }
      );
    }

    const localeSymbol = (locale || "en").toLowerCase() as "en" | "fr" | "ar";

    const prompt = (() => {
      switch (localeSymbol) {
        case "fr":
          return `Écris une description professionnelle en 1-2 phrases pour une catégorie de services appelée '${categoryName}'${businessName ? ` chez ${businessName}` : ""}. Sois concis.`;
        case "ar":
          return `اكتب وصفًا احترافيًا من 1-2 جمل لفئة خدمات تسمى '${categoryName}'${businessName ? ` في ${businessName}` : ""}. كن موجزًا.`;
        default:
          return `Write a professional 1–2 sentence description for a service category called '${categoryName}'${
            businessName ? ` at ${businessName}` : ""
          }. Be concise and professional.`;
      }
    })();

    const { text } = await generateText({
      // Use a valid OpenRouter model ID (matches backend service).
      model: openrouter("google/gemini-2.0-flash-lite-001"),
      prompt,
    });

    return NextResponse.json({ description: text });
  } catch (error) {
    console.error("Error generating category description via OpenRouter (AI SDK):", error);
    return NextResponse.json(
      { error: "Failed to generate description" },
      { status: 500 }
    );
  }
}

