import { NextResponse } from "next/server";
import { generateText } from "ai";
import { openrouter } from "@/lib/openrouter";

interface RequestBody {
  categoryName: string;
  subCategoryName: string;
}

export async function POST(req: Request) {
  try {
    const { categoryName, subCategoryName }: RequestBody = await req.json();

    if (!categoryName?.trim() || !subCategoryName?.trim()) {
      return NextResponse.json(
        { error: "categoryName and subCategoryName are required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key is not configured" },
        { status: 500 }
      );
    }

    const prompt = `Suggest a short, professional service name (2–5 words) for a business offering in the category "${categoryName}" and sub-category "${subCategoryName}". The name should be specific and appealing to clients (e.g. "Deep Conditioning", "Hair Mask", "Scalp Treatment"). Respond with the name only, in English, no quotes or explanation.`;

    const { text } = await generateText({
      model: openrouter("google/gemini-2.0-flash-lite-001"),
      prompt,
    });

    return NextResponse.json({ name: text.trim() });
  } catch (error) {
    console.error("Error generating service name via OpenRouter (AI SDK):", error);
    return NextResponse.json(
      { error: "Failed to generate service name" },
      { status: 500 }
    );
  }
}
