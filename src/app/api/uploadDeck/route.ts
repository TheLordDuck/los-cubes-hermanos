import { NextResponse } from "next/server";
import { submitDeckToMTGGoldfish } from "./uploadDeck";

export async function GET(req: Request) {
  const url = new URL(req.url);

  // Extract query parameters from the URL
  const username = process.env.ARCHIDEKT_USERNAME;
  const password = process.env.ARCHIDEKT_PASSWORD;
  const deckName = url.searchParams.get("deckName");
  const deckList = url.searchParams.get("deckList");
  const headless = url.searchParams.get("headless") === "false";

  // Validate required parameters
  if (!username || !password || !deckName || !deckList) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    // Call the function to submit the deck
    const result = await submitDeckToMTGGoldfish({
      username,
      password,
      deckName,
      deckList,
      headless,
    });

    return NextResponse.json({ deckUrl: result.deckUrl, message: "Deck submitted successfully!" });
  } catch (error) {
    console.error("Error submitting the deck:", error);
    return NextResponse.json({ error: "Failed to submit the deck" }, { status: 500 });
  }
}
