import { NextResponse } from "next/server";
import { generateText } from "ai";
import { openrouter } from "@/lib/openrouter";

interface RequestBody {
  name: string;
  target: "fr" | "ar" | "en";
}

export async function POST(req: Request) {
  try {
    const { name, target }: RequestBody = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key is not configured" },
        { status: 500 }
      );
    }

    const prompt = (() => {
      switch (target) {
        case "fr":
          return `Translate this service name into French. Respond with the French name only.\n\n"${name}"`;
        case "ar":
          return `Translate this service name into Arabic. Respond with the Arabic name only.\n\n"${name}"`;
        default:
          return `Normalize this service name in English (proper casing). Respond with the English name only.\n\n"${name}"`;
      }
    })();

    const { text } = await generateText({
      model: openrouter("google/gemini-2.0-flash-lite-001"),
      prompt,
    });

    return NextResponse.json({ name: text.trim() });
  } catch (error) {
    console.error("Error translating service name via OpenRouter (AI SDK):", error);
    return NextResponse.json(
      { error: "Failed to translate name" },
      { status: 500 }
    );
  }
}

