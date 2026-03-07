export type StoryStatus = "draft" | "pending" | "published";

export type LengthType = "short" | "medium" | "long";

export interface Story {
  id: string;
  title: string;
  slug: string;
  body: string;
  summary?: string;
  tags: string[];
  language: string;
  lengthType: LengthType;
  sourceUrl?: string;
  status: StoryStatus;
  popularityScore?: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface Bookmark {
  userId: string;
  storyId: string;
  createdAt: Date;
  progressPercent: number;
  lastPosition?: number;
}

export interface ReadingHistory {
  userId: string;
  storyId: string;
  lastReadAt: Date;
  progressPercent: number;
}
