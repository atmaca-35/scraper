const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const fileOpts = require("./file_opts");
const queryOpts = require("./query");

const statsDir = path.join(__dirname, "stats");

const csvDir = path.join(__dirname, "csv");

if (!fs.existsSync(statsDir)) {
  fs.mkdirSync(statsDir, { recursive: true });
}

if (!fs.existsSync(csvDir)) {
  fs.mkdirSync(csvDir, { recursive: true });
}

const scrapeData = async (url) => {
  try {
    const resp = await fetch(url, {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      },
    });

    if (resp.status != 200) {
      return resp.body;
    }

    const textResp = await resp.text();

    const $ = cheerio.load(textResp);

    const entries = $("#entry-item");

    const result = [];

    entries.each((index, element) => {
      const entry = $(element);
      const content = entry.find(".content");
      const author = entry.attr("data-author");
      const date = entry.find(".entry-date.permalink").text();

      if (content.length) {
        const trimmedContent = content.text().trim();

        // let's just trust gpt
        const urlPattern = /http?:\/\/[^\s]+\.[a-z]{2,}(\/[^\s]*)?/g;

        let cleanedContent = trimmedContent.replace(urlPattern, "");

        if (cleanedContent.length) {
          result.push({
            author,
            content: content.text().trim(),
            written_at: date,
          });
        }
      }
    });

    if (result.length) {
      const page = queryOpts.getParameters(url)["p"];

      const pages = { [`page-${page ? page : "1"}`]: result };

      let cleanUrl = queryOpts.clearParameter(url, "p");

      const fileName = cleanUrl.replace("https://eksisozluk.com/", "");

      const filePath = path.join(statsDir, fileName + ".json");

      if (!(await fileOpts.fileExists(filePath))) {
        await fileOpts.writeJson(filePath, pages);
      } else {
        await fileOpts.concatJSON(filePath, pages);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error scraping the data:", error);
  }
};

module.exports = { scrapeData };
