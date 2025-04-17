import puppeteer from "puppeteer";
const popsikeRouter = Router();
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Router } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const popsikeURL = "https://www.popsike.com/index.php";

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

popsikeRouter.get("/search", async (req, res) => {
  const { query } = req.query;
  if (!query || !query.trim()) {
    return res.status(400).json({ error: "Query parameter is required" });
  }
  const browser = await puppeteer.launch({
    // headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();

    await page.goto(popsikeURL, {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector("#ac_searchtext");

    await page.type("#ac_searchtext", query);

    await page.keyboard.press("Enter");

    await page.waitForNavigation({ waitUntil: "domcontentloaded" });

    const loginSelector = "#sender-email";
    const passwordSelector = "#user-pass";

    const inputExists = await page.$(loginSelector);
    if (inputExists) {
      await page.type(loginSelector, process.env.POPSIKE_LOGIN);
      await page.type(passwordSelector, process.env.POPSIKE_PASS);
      await page.keyboard.press("Enter");
    }

    await page.waitForSelector(".item-list");
    // await autoScroll(page);

    await page.waitForSelector("img.thumbnail");

    const items = await page.evaluate(() => {
      const itemNodes = document.querySelectorAll(".item-list .row");
      const results = [];

      itemNodes.forEach((item, index) => {
        if (index >= 5) return;
        const title =
          item.querySelector(".add-title a")?.innerText.trim() || "";
        const href =
          item.querySelector(".add-title a")?.getAttribute("href") || "";
        const link = href.replace("../", "https://www.popsike.com/");
        const date =
          item.querySelector(".icon-clock").closest("b").innerText.trim() || "";
        const price =
          item
            .querySelector(".item-price")
            ?.innerText.replace(/\s+/g, " ")
            .split("€")[1]
            .trim() || "";

        const thumbSrc = item
          .querySelector("img.thumbnail")
          ?.getAttribute("src");
        let originalImagePath = null;

        if (thumbSrc) {
          const query = thumbSrc.split("?")[1];
          const params = new URLSearchParams(query);
          originalImagePath = decodeURIComponent(params.get("src"));
        }

        const fullImagePath = `${originalImagePath}`;
        results.push({ title, date, price, link, fullImagePath });
      });

      return results;
    });

    res.json(items);
  } catch (err) {
    console.error("Popsike search error:", err);
    res.status(500).json({ error: "Failed to fetch results from Popsike." });
  } finally {
    await browser.close();
  }
});

export default popsikeRouter;
