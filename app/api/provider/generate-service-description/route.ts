import { NextResponse } from "next/server";
import { generateText } from "ai";
import { openrouter } from "@/lib/openrouter";

interface RequestBody {
  serviceName: string;
  categoryName?: string;
  locale?: string;
}

export async function POST(req: Request) {
  try {
    const { serviceName, categoryName, locale }: RequestBody = await req.json();

    if (!serviceName || !serviceName.trim()) {
      return NextResponse.json(
        { error: "serviceName is required" },
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
          return `Écris une description professionnelle et attrayante en 2-3 phrases pour une prestation de beauté appelée '${serviceName}'${
            categoryName ? ` dans la catégorie '${categoryName}'` : ""
          }. Sois concis et mets en valeur les bénéfices pour le client.`;
        case "ar":
          return `اكتب وصفًا احترافيًا وجذابًا من 2-3 جمل لخدمة تجميل تسمى '${serviceName}'${
            categoryName ? ` في فئة '${categoryName}'` : ""
          }. كن موجزًا وأبرز الفوائد للعميل.`;
        default:
          return `Write a professional and appealing 2-3 sentence description for a beauty service called '${serviceName}'${
            categoryName ? ` in the '${categoryName}' category` : ""
          }. Be concise and highlight benefits for the client.`;
      }
    })();

    const { text } = await generateText({
      model: openrouter("google/gemini-2.0-flash-lite-001"),
      prompt,
    });

    return NextResponse.json({ description: text });
  } catch (error) {
    console.error("Error generating service description via OpenRouter (AI SDK):", error);
    return NextResponse.json(
      { error: "Failed to generate description" },
      { status: 500 }
    );
  }
}

