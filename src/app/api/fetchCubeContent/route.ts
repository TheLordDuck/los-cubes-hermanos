import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { JSDOM } from "jsdom";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  // Check if ID is provided
  if (!id) {
    return NextResponse.json(
      { error: "Cube ID is required." },
      { status: 400 }
    );
  }

  console.log("Fetching cube content for:", id);

  try {
    const htmlData = await getCubeContent(id); // Await the HTML content directly
    const description = extractMetaDescription(htmlData); // Extract the description

    if (description) {
      // Return the found description if it exists
      return NextResponse.json({ description }, { status: 200 });
    } else {
      // Handle case where description is not found
      return NextResponse.json(
        { error: "Meta description not found." },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error("Error in GET handler:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred." },
      { status: 500 }
    );
  }
}

const getCubeContent = async (id: string) => {
  const url = `https://cubecobra.com/cube/overview/${id}`;

  // Launch a new browser instance
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate to the Cube Cobra URL
  await page.goto(url, { waitUntil: "networkidle2" });

  // Get the HTML content of the page
  const content = await page.content();

  // Close the browser
  await browser.close();

  return content; // Return the rendered HTML content
};

const extractMetaDescription = (htmlData: string) => {
  const dom = new JSDOM(htmlData);
  const document = dom.window.document;

  // Use querySelector to find the meta tag with property "og:description"
  const ogDescriptionMeta = document.querySelector(
    'meta[property="og:description"]'
  );

  // Check if the meta tag was found and retrieve the content
  if (ogDescriptionMeta) {
    const descriptionContent = ogDescriptionMeta.getAttribute("content");
    console.log("descriptionContent:", JSON.stringify(descriptionContent));
    return descriptionContent;
  } else {
    return "Open Graph Description meta tag not found.";
  }
};
