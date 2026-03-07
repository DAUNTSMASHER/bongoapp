import type { Story } from "@/types/story";

// Mock data for development until Firestore is connected
export const MOCK_STORIES: Story[] = [
  {
    id: "1",
    title: "Sample Story One",
    slug: "sample-story-one",
    body: "This is the beginning of a sample story. It continues with more text to simulate reading content. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    summary: "A short tale to get you started.",
    tags: ["short", "romance"],
    language: "bn",
    lengthType: "short",
    status: "published",
    popularityScore: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
  },
  {
    id: "2",
    title: "Another Tale",
    slug: "another-tale",
    body: "Another story body with some content.",
    summary: "Another summary for the list.",
    tags: ["medium", "thriller"],
    language: "bn",
    lengthType: "medium",
    status: "published",
    popularityScore: 80,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
  },
  {
    id: "3",
    title: "Long Form Story",
    slug: "long-form-story",
    body: "A longer story with multiple paragraphs.",
    summary: "Summary for the long story.",
    tags: ["long", "drama"],
    language: "en",
    lengthType: "long",
    status: "published",
    popularityScore: 60,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
  },
];

export const CATEGORIES = [
  { slug: "short", label: "Short" },
  { slug: "medium", label: "Medium" },
  { slug: "long", label: "Long" },
  { slug: "romance", label: "Romance" },
  { slug: "thriller", label: "Thriller" },
  { slug: "drama", label: "Drama" },
];
