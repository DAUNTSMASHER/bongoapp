/**
 * AI-powered story enhancement: headlines, hashtags, SEO, and part splitting.
 * Uses Hugging Face when HUGGINGFACE_API_KEY is set; falls back to rule-based heuristics.
 */

import {
  extractCleanHeadline,
  extractHeadlineFromFirstLine,
  extractStoryBody,
} from "./storyTextExtractor";

const TARGET_PARTS = 5;
const MIN_PART_CHARS = 150;
const SEO_TITLE_MAX = 60;
const SEO_DESC_MAX = 155;
const HEADLINE_MAX = 80;

/** Split body into 4-5 roughly equal parts at paragraph boundaries */
export function splitIntoParts(body: string, targetParts = TARGET_PARTS): string[] {
  const trimmed = body.trim();
  if (!trimmed) return [];
  if (trimmed.length < MIN_PART_CHARS * 2) return [trimmed];

  const paragraphs = trimmed.split(/\n\n+/).filter((p) => p.trim().length > 0);
  if (paragraphs.length <= targetParts) return paragraphs;

  const totalChars = paragraphs.reduce((s, p) => s + p.length, 0);
  const idealPartSize = Math.max(MIN_PART_CHARS, Math.floor(totalChars / targetParts));
  const parts: string[] = [];
  let current: string[] = [];
  let currentLen = 0;

  for (const p of paragraphs) {
    const pLen = p.length + 2; // +2 for \n\n
    if (currentLen + pLen > idealPartSize && current.length > 0) {
      parts.push(current.join("\n\n"));
      current = [];
      currentLen = 0;
    }
    current.push(p);
    currentLen += pLen;
  }
  if (current.length > 0) parts.push(current.join("\n\n"));

  if (parts.length > targetParts + 1) {
    const last = parts.pop()!;
    parts[parts.length - 1] = parts[parts.length - 1] + "\n\n" + last;
  }
  return parts;
}

/** Rule-based headline: prefer clean extracted title, else first sentence */
function ruleBasedHeadline(body: string, title: string): string {
  const firstLine = body.split(/\n+/)[0]?.trim() || "";
  const fromFirstLine = extractHeadlineFromFirstLine(firstLine);
  if (fromFirstLine) return fromFirstLine;
  const cleanTitle = extractCleanHeadline(title);
  if (cleanTitle && cleanTitle.length >= 5) return cleanTitle;
  const firstPara = body.split(/\n\n+/)[0]?.trim() || "";
  const firstSentence = firstPara.match(/^[^।.!?]+[।.!?]?/)?.[0]?.trim() || firstPara.slice(0, 60);
  const clean = extractCleanHeadline(firstSentence.replace(/\s+/g, " ").trim());
  if (clean && clean.length <= HEADLINE_MAX) return clean;
  return (clean || firstSentence).slice(0, HEADLINE_MAX - 1) + "…";
}

/** Rule-based hashtags from title + body keywords */
function ruleBasedHashtags(body: string, title: string): string[] {
  const base = ["#বাংলা", "#গল্প", "#bongochoti"];
  const text = `${title} ${body}`.toLowerCase();
  const bnWords = text.match(/[\u0980-\u09FF]+/g) || [];
  const freq: Record<string, number> = {};
  for (const w of bnWords) {
    if (w.length >= 3) freq[w] = (freq[w] || 0) + 1;
  }
  const top = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => `#${w}`);
  return [...new Set([...base, ...top])].slice(0, 8);
}

/** Rule-based SEO meta */
function ruleBasedSeo(body: string, title: string, headline: string): { seoTitle: string; seoDescription: string } {
  const seoTitle = (headline || title).slice(0, SEO_TITLE_MAX);
  const desc = (body.slice(0, 200).replace(/\s+/g, " ").trim() + "…").slice(0, SEO_DESC_MAX);
  return { seoTitle, seoDescription: desc };
}

/** Call Hugging Face for text generation (supports multiple response shapes) */
async function hfGenerate(
  prompt: string,
  maxNewTokens = 80
): Promise<string | null> {
  const token = process.env.HUGGINGFACE_API_KEY;
  if (!token) return null;

  try {
    const res = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-base",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_length: maxNewTokens + 50, min_length: 5, do_sample: true, temperature: 0.7 },
        }),
      }
    );
    if (!res.ok) return null;
    const out = await res.json();
    const text =
      (Array.isArray(out) ? out[0]?.generated_text : out?.generated_text ?? out?.[0]?.generated_text) ??
      (Array.isArray(out) ? out[0]?.summary_text : out?.summary_text);
    return typeof text === "string" ? text.trim().replace(/\s+/g, " ").slice(0, HEADLINE_MAX) : null;
  } catch {
    return null;
  }
}

/** Returns true if text contains Bengali script (Bangla) */
function hasBengaliScript(text: string): boolean {
  return /[\u0980-\u09FF]/.test(text);
}

/** AI headline via Flan-T5. Flan-T5 outputs English — only use AI when it returns Bangla. */
async function aiHeadline(body: string, title: string): Promise<string | null> {
  const excerpt = body.slice(0, 400).replace(/\n/g, " ");
  const prompt = `Summarize this Bengali story title in Bengali, one catchy phrase under 60 chars. Title: ${title}. Start: ${excerpt}`;
  const out = await hfGenerate(prompt, 40);
  if (!out || out.length < 10 || out.length > HEADLINE_MAX) return null;
  if (!hasBengaliScript(out)) return null;
  return out;
}

/** Generate a unique, catchy story title from content using LLM */
export async function generateStoryTitle(body: string, oldTitle: string): Promise<string | null> {
  const token = process.env.HUGGINGFACE_API_KEY;
  if (!token) return null;
  const excerpt = body.slice(0, 500).replace(/\n/g, " ");
  const prompt = `Generate a unique catchy Bengali story title (max 60 chars). Old title: ${oldTitle}. Story start: ${excerpt}. Output only the new title, nothing else.`;
  const out = await hfGenerate(prompt, 50);
  return out && out.length >= 5 && out.length <= 70 ? out.trim() : null;
}


/** Rule-based fallback for title: first meaningful phrase from body */
export function ruleBasedTitle(body: string): string {
  const firstLine = body.split(/\n+/)[0]?.trim() || "";
  const extracted = extractHeadlineFromFirstLine(firstLine);
  if (extracted) return extracted;
  const firstPara = body.split(/\n\n+/)[0]?.trim() || "";
  const match = firstPara.match(/^[^।.!?]+[।.!?]?/);
  let phrase = match?.[0]?.trim() || firstPara.slice(0, 80);
  phrase = extractCleanHeadline(phrase.replace(/\s+/g, " ").trim().slice(0, 70));
  if (!phrase || phrase.length < 5) return "গল্প";
  return phrase;
}

/** AI hashtags - Flan-T5 may not be ideal for hashtags; use rule-based as primary */
async function aiHashtags(body: string, title: string): Promise<string[] | null> {
  const excerpt = body.slice(0, 300);
  const prompt = `Extract 5 hashtags for this Bengali story. Format: #tag1 #tag2. Title: ${title}. Text: ${excerpt}`;
  const out = await hfGenerate(prompt, 60);
  if (!out) return null;
  const tags = out.match(/#[\w\u0980-\u09FF]+/g);
  return tags && tags.length >= 3 ? tags.slice(0, 8) : null;
}

export interface EnhancedStory {
  headline: string;
  seoTitle: string;
  seoDescription: string;
  hashtags: string[];
  parts: string[];
}

/** Enhance a story with headline, SEO, hashtags, and parts */
export async function enhanceStory(
  title: string,
  body: string,
  summary?: string
): Promise<EnhancedStory> {
  const cleanBody = extractStoryBody(body);
  const parts = splitIntoParts(cleanBody, TARGET_PARTS);

  let headline = ruleBasedHeadline(cleanBody, title);
  const aiHead = await aiHeadline(cleanBody, title);
  if (aiHead) headline = aiHead;

  let hashtags = ruleBasedHashtags(cleanBody, title);
  const aiTags = await aiHashtags(cleanBody, title);
  if (aiTags?.length && aiTags.some(hasBengaliScript)) hashtags = aiTags;

  const { seoTitle, seoDescription } = ruleBasedSeo(cleanBody, title, headline);

  return {
    headline,
    seoTitle,
    seoDescription,
    hashtags,
    parts: parts.length >= 2 ? parts : [cleanBody],
  };
}

/** Sync version for when AI is not needed (e.g. migration fallback) */
export function enhanceStorySync(title: string, body: string): EnhancedStory {
  const cleanBody = extractStoryBody(body);
  const parts = splitIntoParts(cleanBody, TARGET_PARTS);
  const headline = ruleBasedHeadline(cleanBody, title);
  const hashtags = ruleBasedHashtags(cleanBody, title);
  const { seoTitle, seoDescription } = ruleBasedSeo(cleanBody, title, headline);
  return {
    headline,
    seoTitle,
    seoDescription,
    hashtags,
    parts: parts.length >= 2 ? parts : [cleanBody],
  };
}
