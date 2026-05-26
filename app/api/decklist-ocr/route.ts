// app/api/decklist-ocr/route.ts
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  const { image, mimeType } = await request.json();

  if (!image || !mimeType) {
    return NextResponse.json({ error: "Missing image or mimeType" }, { status: 400 });
  }

  const response = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mimeType, data: image },
          },
          {
            type: "text",
            text: `This is a photo of a Magic: The Gathering decklist. Extract all the cards and their quantities.

Return ONLY the decklist in this exact format, one card per line:
4 Lightning Bolt
2 Counterspell
1 Black Lotus

Rules:
- If no quantity is visible, assume 1
- Write the full card name as accurately as possible
- Do NOT include any other text, headers, section names (like "Lands:", "Creatures:"), or explanations
- Do NOT include sideboard cards
- Just the list, nothing else`,
          },
        ],
      },
    ],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("\n")
    .trim();

  return NextResponse.json({ text });
}
