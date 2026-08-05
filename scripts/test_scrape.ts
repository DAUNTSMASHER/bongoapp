import * as cheerio from "cheerio";

async function run() {
  const url = "https://www.banglachotikahinii.com/videos/";
  console.log(`Fetching ${url}...`);
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  console.log("Title:", $("title").text());
  console.log("Body Snippet:", $("body").html()?.substring(0, 1000));
}
run();
