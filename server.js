const express = require("express");

const scrapper = require("./scraper");

const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/index.html"));
});

app.get("/:url", async (req, res) => {
  let url = req.params.url;

  url += "?";

  if (req.query.a) {
    url += "a=" + req.query.a;
  }

  if (req.query.p) {
    if (req.query.a) {
      url += "&p=" + req.query.p;
    } else {
      url += "p=" + req.query.p;
    }
  }

  try {
    const scrapped = await scrapper.scrapeData("https://eksisozluk.com/" + url);

    if (scrapped && scrapped.success) {
      return res.status(200).json({ success: true });
    }

    return res.status(403).json({ failed: scrapped });
  } catch (error) {
    return res.status(500).json({ failed: error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
