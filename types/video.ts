export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  outboundUrl: string;
  embedUrl?: string;
  embedCode?: string;
  /** Direct .mp4/.webm/.m3u8 URL – played in our <video> player, no redirect */
  directVideoUrl?: string;
  tags: string[];
  language: string;
  sourceSite?: string;
  status: "active" | "hidden";
  clicks?: number;
  createdAt: Date;
  /** Optional: e.g. "720p", "1080p" */
  resolution?: string;
  /** Optional: view count for display */
  viewCount?: number;
  /** Optional: duration in seconds or "10 min" string */
  duration?: string | number;
}
