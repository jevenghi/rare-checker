import puppeteer from "puppeteer";
const baseSalesURL = "https://www.discogs.com/release/";
const popsikeURL = "https://www.popsike.com/index.php";

async function getReleaseSaleStats(releaseId) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const url = `${baseSalesURL}${releaseId}`;
  console.log(url);

  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  const data = await page.evaluate(() => {
    const container = document.querySelector(".items_PQSxS ul");
    if (!container) return null;

    return Array.from(container.querySelectorAll("li")).map((li) =>
      li.innerText.trim()
    );
  });

  console.log(data);

  await browser.close();
}

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

async function getPopsikeStats(title) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(popsikeURL, {
    waitUntil: "domcontentloaded",
  });

  await page.waitForSelector("#ac_searchtext");

  await page.type("#ac_searchtext", title);

  await page.keyboard.press("Enter");

  await page.waitForNavigation({ waitUntil: "domcontentloaded" });

  const loginSelector = "#sender-email";
  const passwordSelector = "#user-pass";

  const inputExists = await page.$(loginSelector);
  if (inputExists) {
    await page.type(loginSelector, "jevenghi");
    await page.type(passwordSelector, "skatabaza");
    await page.keyboard.press("Enter");
  }

  await page.waitForSelector(".item-list");
  await autoScroll(page);
  await page.waitForSelector("img.thumbnail");

  const items = await page.evaluate(() => {
    const itemNodes = document.querySelectorAll(".item-list .row");
    const results = [];

    itemNodes.forEach((item) => {
      const title = item.querySelector(".add-title a")?.innerText.trim() || "";
      const date =
        item.querySelector(".icon-clock").closest("b").innerText.trim() || "";
      const price =
        item
          .querySelector(".item-price")
          ?.innerText.replace(/\s+/g, " ")
          .split("€")[1]
          .trim() || "";

      const imageSrc =
        item.querySelector("img.thumbnail")?.getAttribute("src") || "no thumb";
      const fullThumbSrc = `https://www.popsike.com${imageSrc}`;
      results.push({ title, date, price, fullThumbSrc });
    });

    return results;
  });

  console.log(items);

  await browser.close();
}
getPopsikeStats("Isd es ist beit");
// try {
//   const res = await getReleaseSaleStats("4298726");
//   console.log(res);
// } catch (err) {
//   console.log(err);
// }
export default getPopsikeStats;
