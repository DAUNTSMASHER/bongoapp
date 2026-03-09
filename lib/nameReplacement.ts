/**
 * Replaces character names in story headline/title with Firestore-mapped unique names.
 * Fetches mappings from Firestore config/nameMappings.
 */

import type { Story } from "@/types/story";
import { extractCharacterNames } from "./storyMLProcessor";

export type NameMappings = Record<string, string>;

/** Escape special regex chars for use in RegExp */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Replaces names in text using the mapping.
 * Uses word boundaries where possible to avoid partial matches.
 */
export function applyNameReplacements(
  text: string,
  names: string[],
  mappings: NameMappings
): string {
  if (!text || !mappings || Object.keys(mappings).length === 0) return text;
  let out = text;
  for (const name of names) {
    const replacement = mappings[name];
    if (!replacement || replacement === name) continue;
    const re = new RegExp(escapeRegex(name), "g");
    out = out.replace(re, replacement);
  }
  return out;
}

/**
 * Get names to check for replacement: story.characterNames or extract from body+headline.
 */
export function getNamesForReplacement(story: { characterNames?: string[]; body?: string; headline?: string; title?: string }): string[] {
  if (Array.isArray(story.characterNames) && story.characterNames.length > 0) {
    return story.characterNames;
  }
  const body = story.body || "";
  const headline = story.headline || story.title || "";
  return extractCharacterNames(body, headline);
}

/**
 * Apply name replacements to story headline and title.
 * Returns a new story object with replaced headline/title.
 */
export function applyNameReplacementsToStory(story: Story, mappings: NameMappings): Story {
  if (!mappings || Object.keys(mappings).length === 0) return story;
  const names = getNamesForReplacement(story);
  if (names.length === 0) return story;

  const headline = story.headline
    ? applyNameReplacements(story.headline, names, mappings)
    : story.headline;
  const title = story.title
    ? applyNameReplacements(story.title, names, mappings)
    : story.title;

  if (headline === story.headline && title === story.title) return story;

  return { ...story, headline, title };
}
