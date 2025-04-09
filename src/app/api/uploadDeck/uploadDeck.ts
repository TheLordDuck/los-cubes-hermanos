import puppeteer, { Browser } from "puppeteer";

const MTG_ARCHIDEKT_LOGIN_URL = "https://archidekt.com/login";
const DECK_BUILDER_URL = "https://archidekt.com/new-deck";

interface MTGDeckSubmissionOptions {
  username: string;
  password: string;
  deckName: string;
  deckList: string;
  headless?: boolean; // Optional, defaults to false for visible browser
}

export const submitDeckToMTGGoldfish = async ({
  username,
  password,
  deckName,
  deckList,
}: MTGDeckSubmissionOptions) => {
  let browser: Browser | null = null;

  try {
    // Launch Puppeteer
    browser = await puppeteer.launch({
      slowMo: 10,
      headless: false,
    });
    const page = await browser.newPage();

    // Navigate to ARCHIDEKT
    await page.goto(MTG_ARCHIDEKT_LOGIN_URL);

    // Click on "Login" and log in
    await page.waitForSelector('input[name="username"]');
    await page.type('input[name="username"]', username);
    await page.type('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for login to complete
    await page.waitForNavigation();

    // Navigate to the deck builder page
    await page.goto(DECK_BUILDER_URL);

    // Setup for the deck
    await page.waitForSelector("input[placeholder='Super awesome deck name 2000']");
    const elementsCheckBox = await page.$$("button[class='checkboxFancybox_toggleBox__wye0C ")
    await elementsCheckBox[1].click();

    // Select Custom in dropdown type deck
    const dropdownSelector = await page.$$("div[class*='archidektDropdown_trigger__Wdtom']");
    await dropdownSelector[5].click();
    // Wait for the dropdown menu to appear
    await page.waitForSelector(".phatDropdown_trigger__5VxaE", { visible: true });
    // Select the "Custom" button by its text
    await page.waitForSelector(".button_button__dK2Lv");
    const dropdownOptions = await page.$$('.button_button__dK2Lv');
    await dropdownOptions[5].click();

    // Enter the deck name
    await page.type("input[placeholder='Super awesome deck name 2000']", deckName);

    // Submit the deck setup
    await page.click('button[type="submit"]');

    // Wait for input cards to load
    await page.waitForNavigation();

    // Get the url od the deck
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    // Click on the element to import from list
    await page.waitForSelector('i[class="pencil massive link icon"]');
    await page.click('i[class="pencil massive link icon"]');

    // Wait for the textarea of the input text of the deck
    await page.waitForSelector("textarea[name='deckString']");

    // Enter the list of the deck
    await page.type("textarea[name='deckString']", deckList);

    // Click submit deck
    await page.click('button[class="phatButton_button__9cZcg phatButton_green__6wA_m "]');

    // Wait for success confirmation
    await page.waitForSelector("div[class='import_success__zaaTI']");

    console.log("Deck submitted successfully!");
    return {
      deckUrl: currentUrl,
      success: true
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return {
      success: false
    }
  } finally {
    // Ensure the browser closes even if an error occurs
    if (browser) {
      await browser.close();
    }
  }
};
