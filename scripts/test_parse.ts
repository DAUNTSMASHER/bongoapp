import * as cheerio from "cheerio";
import * as fs from "fs";

function parseHtml() {
  const html = fs.readFileSync("curl_dump.html", "utf16le");
  const $ = cheerio.load(html);
  
  // Find video elements. Looking at common classes or elements.
  const videoItems = $(".video-item, .post, .type-video, article, .item, .thumb, a[href*='/video/']");
  console.log(`Found ${videoItems.length} potential items`);

  // Let's just dump the class of the first 5 links
  const links = $("a");
  console.log(`Found ${links.length} total links.`);
  
  let count = 0;
  $("a").each((i, el) => {
    const href = $(el).attr("href");
    if (href && href.includes("/videos/") && !href.endsWith("/videos/") && !href.includes("top-rated") && !href.includes("latest-updates") && !href.includes("most-popular") && !href.includes("categories")) {
      console.log(`Video Link: ${href}`);
      count++;
    }
  });
  console.log(`Found ${count} actual videos`);
}

parseHtml();
