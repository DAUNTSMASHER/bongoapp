import type { Video } from "@/types/video";

// Mock data for development until Firestore is connected
export const MOCK_VIDEOS: Video[] = [
  {
    id: "v1",
    title: "বাংলা রোমান্টিক ভিডিও ১",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%231a1a1a' width='400' height='225'/%3E%3Ctext x='50%25' y='50%25' fill='%23666' text-anchor='middle' dy='.3em' font-size='18'%3EVideo 1%3C/text%3E%3C/svg%3E",
    outboundUrl: "https://example.com/watch/1",
    tags: ["রোমান্টিক"],
    language: "bn",
    sourceSite: "example",
    status: "active",
    clicks: 0,
    createdAt: new Date("2026-02-01"),
  },
  {
    id: "v2",
    title: "বাংলা স্টোরি ভিডিও ২",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%231a1a1a' width='400' height='225'/%3E%3Ctext x='50%25' y='50%25' fill='%23666' text-anchor='middle' dy='.3em' font-size='18'%3EVideo 2%3C/text%3E%3C/svg%3E",
    outboundUrl: "https://example.com/watch/2",
    tags: ["স্টোরি"],
    language: "bn",
    status: "active",
    clicks: 0,
    createdAt: new Date("2026-01-28"),
  },
  {
    id: "v3",
    title: "বাংলা নতুন ভিডিও ৩",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%231a1a1a' width='400' height='225'/%3E%3Ctext x='50%25' y='50%25' fill='%23666' text-anchor='middle' dy='.3em' font-size='18'%3EVideo 3%3C/text%3E%3C/svg%3E",
    outboundUrl: "https://example.com/watch/3",
    embedUrl: "https://example.com/embed/3",
    tags: ["নতুন"],
    language: "bn",
    status: "active",
    clicks: 0,
    createdAt: new Date("2026-01-15"),
  },
];

export function getVideos(): Video[] {
  return MOCK_VIDEOS.filter((v) => v.status === "active");
}

export function getVideoById(id: string): Video | undefined {
  return MOCK_VIDEOS.find((v) => v.id === id && v.status === "active");
}
