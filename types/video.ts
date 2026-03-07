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
}
