import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { JSDOM } from "jsdom";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Cube ID is required." },
      { status: 400 }
    );
  }

  try {
    const htmlData = await getCubeContent(id);
    const markdownHTML = extractMarkdownHTML(htmlData);

    if (markdownHTML) {
      return NextResponse.json({ html: markdownHTML }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Markdown content not found." },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error("Error fetching cube data:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}

const getCubeContent = async (id: string) => {
  const url = `https://cubecobra.com/cube/overview/${id}`;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });
  const content = await page.content();
  await browser.close();
  return content;
};

const extractMarkdownHTML = (htmlData: string) => {
  const dom = new JSDOM(htmlData);
  const document = dom.window.document;
  const markdownElement = document.querySelector(".markdown");
  return markdownElement ? markdownElement.innerHTML : null;
};
