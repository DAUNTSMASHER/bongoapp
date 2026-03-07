export type StoryStatus = "draft" | "pending" | "published";

export type LengthType = "short" | "medium" | "long";

export interface Story {
  id: string;
  title: string;
  slug: string;
  body: string;
  summary?: string;
  coverImageUrl?: string;
  tags: string[];
  categorySlug?: string;
  language: string;
  lengthType: LengthType;
  sourceUrl?: string;
  status: StoryStatus;
  popularityScore?: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  /** AI-generated catchy headline (SEO-friendly, not date) */
  headline?: string;
  /** SEO meta title (60 chars) */
  seoTitle?: string;
  /** SEO meta description (155 chars) */
  seoDescription?: string;
  /** Hashtags for discoverability */
  hashtags?: string[];
  /** Story split into 4-5 parts for reading flow + ad breaks */
  parts?: string[];
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
