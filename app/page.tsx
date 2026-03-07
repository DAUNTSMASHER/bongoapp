import HeroBanner from "@/components/HeroBanner";
import TrendingRail from "@/components/TrendingRail";
import LatestList from "@/components/LatestList";
import CategoryChips from "@/components/CategoryChips";
import ContentWrapper from "@/components/ContentWrapper";
import { MOCK_STORIES } from "@/lib/stories";

export default function HomePage() {
  const trending = MOCK_STORIES.slice(0, 3);
  const latest = MOCK_STORIES;
  const heroStory = trending[0];

  return (
    <div className="min-h-screen">
      {heroStory && <HeroBanner story={heroStory} />}
      <ContentWrapper className="pt-2 md:pt-4 lg:pt-6">
        <CategoryChips />
        <TrendingRail stories={trending} />
        <LatestList initialStories={latest} />
      </ContentWrapper>
    </div>
  );
}
