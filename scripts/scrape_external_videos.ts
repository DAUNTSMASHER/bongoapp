import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface ScrapedVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
}

async function scrapeVideos() {
  const allVideos: ScrapedVideo[] = [];
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  try {
    for (let i = 1; i <= 10; i++) {
      const url = i === 1 
        ? `https://www.banglachotikahinii.com/videos/` 
        : `https://www.banglachotikahinii.com/videos/page/${i}/`;
      
      console.log(`Scraping page ${i}: ${url}`);
      
      // Use curl directly to bypass Cloudflare
      const tempFile = 'temp_curl_dump.html';
      execSync(`powershell -Command "curl.exe -s -A '${userAgent}' ${url} > ${tempFile}"`);
      
      const html = fs.readFileSync(tempFile, 'utf16le');
      const $ = cheerio.load(html);
      
      const videosOnPage: ScrapedVideo[] = [];
      
      $('.post, .type-video, article, .video-item, .item').each((_, el) => {
        const titleEl = $(el).find('.entry-title, h2, h3, .title, a[title]');
        const title = titleEl.text().trim() || titleEl.attr('title') || '';
        
        const linkEl = $(el).find('a[href*="/videos/"]');
        let href = linkEl.attr('href') || '';
        
        const imgEl = $(el).find('img');
        const thumbnail = imgEl.attr('src') || '';

        if (href && !href.endsWith('/videos/') && !href.includes('tags') && !href.includes('categories') && title && thumbnail) {
          videosOnPage.push({
            id: href,
            title,
            thumbnail,
            url: href
          });
        }
      });
      
      // If the above structured selector fails, try grabbing all video links generically
      if (videosOnPage.length === 0) {
        $("a").each((_, el) => {
          const href = $(el).attr("href");
          if (href && href.includes("/videos/") && !href.endsWith("/videos/") && !href.includes("tags") && !href.includes("categories")) {
            const title = $(el).attr("title") || $(el).text().trim() || "No Title";
            const thumbnail = $(el).find("img").attr("src") || "";
            if (thumbnail) {
               videosOnPage.push({ id: href, title, thumbnail, url: href });
            }
          }
        });
      }
      
      // Deduplicate on this page
      const uniqueVideos = Array.from(new Map(videosOnPage.map(v => [v.id, v])).values());
      
      console.log(`Found ${uniqueVideos.length} videos on page ${i}.`);
      allVideos.push(...uniqueVideos);

      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      
      // Add a small delay between pages
      await new Promise(r => setTimeout(r, 2000));
    }

    const outputPath = path.join(process.cwd(), 'lib', 'externalVideos.json');
    fs.writeFileSync(outputPath, JSON.stringify(allVideos, null, 2));
    console.log(`Successfully saved ${allVideos.length} videos to ${outputPath}`);

  } catch (error) {
    console.error('Error during scraping:', error);
  }
}

scrapeVideos();
