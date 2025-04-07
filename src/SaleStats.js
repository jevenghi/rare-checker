import puppeteer from "puppeteer";

const baseSalesURL = "https://www.discogs.com/release/";

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

try {
  const res = await getReleaseSaleStats("4298726");
  console.log(res);
} catch (err) {
  console.log(err);
}
