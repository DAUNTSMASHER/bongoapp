import HeroBanner from "@/components/HeroBanner";
import TrendingRail from "@/components/TrendingRail";
import LatestList from "@/components/LatestList";
import CategoryChips from "@/components/CategoryChips";
import { MOCK_STORIES } from "@/lib/stories";

export default function HomePage() {
  const trending = MOCK_STORIES.slice(0, 3);
  const latest = MOCK_STORIES;
  const heroStory = trending[0];

  return (
    <div className="min-h-screen">
      {heroStory && <HeroBanner story={heroStory} />}
      <CategoryChips />
      <TrendingRail stories={trending} />
      <LatestList initialStories={latest} />
    </div>
  );
}
