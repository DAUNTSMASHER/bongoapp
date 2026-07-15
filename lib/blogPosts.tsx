/**
 * SEO blog posts — indexable pages with internal links to stories, categories, videos.
 */

import type { ReactNode } from "react";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  body: ReactNode;
  coverImage?: string;
}

const BLOG_COVER_IMAGES = [
  "/story_cover/bongochoti_online_golpo_01.png",
  "/story_cover/bongochoti_online_golpo_03.png",
  "/story_cover/bongochoti_online_golpo_05.png",
  "/story_cover/bongochoti_online_golpo_07.png",
  "/story_cover/bongochoti_online_golpo_08.png",
  "/story_cover/bongochoti_online_golpo_10.png",
  "/story_cover/bongochoti_online_golpo_12.png",
  "/story_cover/bongochoti_online_golpo_13.png",
  "/story_cover/bongochoti_online_golpo_14.png",
  "/story_cover/bongochoti_online_golpo_15.png",
  "/story_cover/bongochoti_online_golpo_17.png",
  "/story_cover/bongochoti_online_golpo_18.png",
  "/story_cover/bongochoti_online_golpo_20.png",
  "/story_cover/bongochoti_online_golpo_22.png",
  "/story_cover/bongochoti_online_golpo_23.png",
  "/story_cover/bongochoti_online_golpo_24.png",
  "/story_cover/bongochoti_online_golpo_25.png",
];

function getDeterministicImage(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BLOG_COVER_IMAGES.length;
  return BLOG_COVER_IMAGES[index];
}

const RAW_BLOG_POSTS: BlogPost[] = [
  {
    slug: "best-bangla-choti-categories",
    title: "Best Bangla Choti Categories — বাংলা চটি গল্প বিভাগ",
    description:
      "Discover the best bangla choti categories: অজাচার, পরকিয়া, গৃহবধূ, সেরা চটি, কাজের মেয়ে and more. Browse 1800+ bangla choti golpo by category.",
    publishedAt: "2025-03-10",
    body: (
      <>
        <p>
          <strong>Bangla choti golpo</strong> comes in many categories. At bongochoti you can browse
          thousands of bangla choti kahini organized by theme. Here are the most popular categories:
        </p>
        <h2>Popular Bangla Choti Categories</h2>
        <ul>
          <li>
            <a href="/categories/sera/">সেরা বাংলা চটি</a> — Top-rated bangla choti stories
          </li>
          <li>
            <a href="/categories/ojachar/">অজাচার বাংলা চটি গল্প</a> — A large collection
          </li>
          <li>
            <a href="/categories/porokia/">পরকিয়া বাংলা চটি গল্প</a> — Affairs &amp; extramarital
          </li>
          <li>
            <a href="/categories/grihobodhur/">গৃহবধূর চোদন কাহিনী</a> — Housewife stories
          </li>
          <li>
            <a href="/categories/kajer-meye/">কাজের মেয়ে চোদার গল্প</a> — Maid stories
          </li>
          <li>
            <a href="/categories/bandhobi/">বান্ধবী চোদার বাংলা চটি</a> — Girlfriend stories
          </li>
          <li>
            <a href="/categories/group-sex/">গ্রুপ সেক্সের বাংলা চটি গল্প</a>
          </li>
          <li>
            <a href="/categories/swami-strir/">স্বামী স্ত্রীর বাংলা চটি গল্প</a> — Couple stories
          </li>
          <li>
            <a href="/categories/students/">স্টুডেন্টস বাংলা চটি গল্প</a> — Student stories
          </li>
        </ul>
        <p>
          View <a href="/categories/">all bangla choti categories</a> or browse{" "}
          <a href="/stories/">all stories</a>.
        </p>
        <p>
          <a href="/">bongochoti.com</a> — Free bangla choti golpo, choti kahini, and bangla sex
          video.
        </p>
      </>
    ),
  },
  {
    slug: "how-to-read-bangla-choti-online-free",
    title: "How to Read Bangla Choti Online Free | বাংলা চটি পড়ার উপায়",
    description:
      "Read bangla choti golpo and choti kahini online free. No registration. Browse 1800+ stories at bongochoti.",
    publishedAt: "2025-03-10",
    body: (
      <>
        <p>
          Want to <strong>read bangla choti online free</strong>? bongochoti offers 1800+ bangla
          choti golpo and choti kahini with no signup required.
        </p>
        <h2>Steps to Read Bangla Choti</h2>
        <ol>
          <li>Visit <a href="/">bongochoti.com</a></li>
          <li>Choose from featured stories on the home page or browse by category</li>
          <li>
            Use <a href="/categories/">categories</a> to find bangla choti by theme
          </li>
          <li>
            Search for specific topics at <a href="/search/">Search</a>
          </li>
          <li>
            Browse <a href="/archive/">archive</a> by month
          </li>
        </ol>
        <p>
          All <strong>bangla choti kahini</strong> are free to read. Mobile-friendly. No ads
          blocking the content.
        </p>
        <p>
          Also check out <a href="/videos/">bangla sex video</a> and{" "}
          <a href="/stories/">all bangla choti golpo</a>.
        </p>
      </>
    ),
  },
  {
    slug: "bangla-sex-video-watch-online",
    title: "Bangla Sex Video — Watch Online Free | বাংলা পর্ন ভিডিও",
    description:
      "Watch bangla sex video and bangla porn video online. 1000+ videos. Free streaming at bongochoti.",
    publishedAt: "2025-03-10",
    body: (
      <>
        <p>
          <strong>Bangla sex video</strong> and bangla porn video are available at bongochoti.
          Stream 1000+ videos free.
        </p>
        <h2>Bangla Sex Video Categories</h2>
        <p>
          Browse <a href="/videos/">bangla sex video</a> by type. All content is 18+.
        </p>
        <p>
          Along with bangla sex video, we have <strong>bangla choti golpo</strong> and choti kahini
          — stories you can read. Visit <a href="/">home</a> for featured content or{" "}
          <a href="/stories/">all stories</a>.
        </p>
        <p>
          bongochoti.com — Bangla choti, bangla sex video, choti kahini. Free and easy to
          navigate.
        </p>
      </>
    ),
  },
  {
    slug: "bangla-choti-golpo-choti-kahini-guide",
    title: "Bangla Choti Golpo & Choti Kahini — Complete Guide",
    description:
      "What is bangla choti golpo? Where to read choti kahini? Guide to bangla choti, panu golpo, and sex video.",
    publishedAt: "2025-03-10",
    body: (
      <>
        <p>
          <strong>Bangla choti golpo</strong> (বাংলা চটি গল্প) and <strong>choti kahini</strong> are
          Bengali adult fiction. At bongochoti you get both stories and bangla sex video.
        </p>
        <h2>Bangla Choti Terms</h2>
        <ul>
          <li>
            <strong>Bangla choti golpo</strong> — Bengali erotic stories
          </li>
          <li>
            <strong>Choti kahini</strong> — Story format, same as golpo
          </li>
          <li>
            <strong>Panu golpo</strong> — Adult stories
          </li>
          <li>
            <strong>Bangla sex video</strong> — Bengali adult video
          </li>
        </ul>
        <p>
          Browse <a href="/categories/">categories</a> for অজাচার, পরকিয়া, গৃহবধূ, সেরা চটি and
          more. Or read <a href="/stories/">all bangla choti golpo</a>.
        </p>
        <p>
          <a href="/">bongochoti.com</a> — 1800+ bangla choti, 1000+ bangla sex video. Free.
        </p>
      </>
    ),
  },
  {
    slug: "relationship-psychology-attraction-guide",
    title: "Relationship Psychology & Attraction: The Ultimate Guide",
    description: "Master the secrets of relationship psychology. Learn about attraction, emotional attachment, and how to build lasting bonds. The ultimate guide for 2025.",
    publishedAt: "2025-04-23",
    body: (
      <>
        <div className="mb-8 overflow-hidden rounded-xl border border-white/10 shadow-2xl">
          <img src="/blog-pillar.png" alt="Relationship Psychology" className="w-full object-cover" />
        </div>
        <p className="lead text-lg font-medium text-white/90">
          Understanding the human heart is both a science and an art. In this comprehensive guide, we dive deep into the <strong>psychology of relationships</strong> and the hidden forces of attraction.
        </p>
        <h2>The Foundation of Attraction</h2>
        <p>
          Why are we drawn to certain people? It's not just about looks. Psychology suggests that <strong>similarity</strong>, <strong>proximity</strong>, and <strong>reciprocity</strong> play massive roles. We tend to fall for people who share our values, are physically close to us, and who show interest in us.
        </p>
        <div className="my-6 rounded-lg bg-[var(--primary)]/10 p-6 border-l-4 border-[var(--primary)]">
          <h3 className="mt-0 text-[var(--primary)]">Topic Cluster: Explore More</h3>
          <ul>
            <li><a href="/blog/science-of-falling-in-love/">The Science of Why We Fall in Love</a></li>
            <li><a href="/blog/signs-of-attraction/">10 Hidden Signs Someone is Attracted to You</a></li>
            <li><a href="/blog/attachment-styles-explained/">Understanding Your Attachment Style</a></li>
            <li><a href="/blog/long-distance-relationship-tips/">Success in Long Distance Relationships</a></li>
          </ul>
        </div>
        <h2>Attachment Theory: The Secret Map</h2>
        <p>
          Attachment theory explains how our early childhood experiences shape our adult relationships. Whether you are <strong>Secure</strong>, <strong>Anxious</strong>, or <strong>Avoidant</strong>, understanding your style is the first step toward healthier connections.
        </p>
        <p>
          Secure individuals feel comfortable with intimacy. Anxious types often crave constant reassurance, while Avoidants may pull away when things get too close. Recognizing these patterns in yourself and your partner can transform your love life.
        </p>
        <h2>FAQ: Relationship Psychology</h2>
        <div className="mt-8 space-y-4">
          <details className="rounded-lg border border-white/10 bg-white/5 p-4">
            <summary className="cursor-pointer font-bold">What is the most important factor in a long-lasting relationship?</summary>
            <p className="mt-2">Communication and mutual respect are often cited as the bedrock of success. Being able to navigate conflict without resentment is key.</p>
          </details>
          <details className="rounded-lg border border-white/10 bg-white/5 p-4">
            <summary className="cursor-pointer font-bold">Can an Anxious and Avoidant person make it work?</summary>
            <p className="mt-2">Yes, but it requires extreme self-awareness and effort from both sides to meet each other's needs without feeling overwhelmed or neglected.</p>
          </details>
        </div>
      </>
    ),
  },
  {
    slug: "science-of-falling-in-love",
    title: "Why People Fall in Love: The Science of Attraction",
    description: "Ever wondered what happens in your brain when you fall in love? Discover the hormones and psychological triggers behind the 'spark'.",
    publishedAt: "2025-04-23",
    body: (
      <>
        <h2>The Chemical Cocktail of Love</h2>
        <p>
          Falling in love is a biological process driven by hormones like <strong>dopamine</strong>, <strong>oxytocin</strong>, and <strong>adrenaline</strong>. That heart-racing feeling? That's adrenaline. The deep bond? That's oxytocin, often called the "cuddle hormone."
        </p>
        <p>
          Research shows that the brain of someone in love looks remarkably similar to the brain of someone on a high. It’s a powerful, addictive state that drives us to seek connection and partnership.
        </p>
        <p>Learn more in our <a href="/blog/relationship-psychology-attraction-guide/">Ultimate Relationship Guide</a>.</p>
      </>
    ),
  },
  {
    slug: "signs-of-attraction",
    title: "10 Hidden Signs Someone is Secretly Attracted to You",
    description: "Is it just friendship or something more? Learn the subtle body language and psychological cues that scream 'I like you'.",
    publishedAt: "2025-04-23",
    body: (
      <>
        <div className="mb-8 overflow-hidden rounded-xl">
          <img src="/blog-attraction.png" alt="Signs of Attraction" className="w-full object-cover" />
        </div>
        <h2>Body Language Secrets</h2>
        <p>
          Sometimes people say more with their eyes than their words. Here are 10 signs to look for:
        </p>
        <ol>
          <li><strong>Prolonged Eye Contact:</strong> Looking a second longer than normal.</li>
          <li><strong>Mirroring:</strong> Subtly copying your movements or posture.</li>
          <li><strong>The Lean In:</strong> Moving closer when you speak.</li>
          <li><strong>Physical Touch:</strong> Light, accidental touches on the arm or shoulder.</li>
          <li><strong>Pupil Dilation:</strong> A biological reaction to excitement.</li>
        </ol>
        <p>For a deeper dive into behavior analysis, visit our <a href="/blog/relationship-psychology-attraction-guide/">Psychology Hub</a>.</p>
      </>
    ),
  },
  {
    slug: "confessions-modern-housewife",
    title: "Confessions: The Secret Life of a Modern Housewife",
    description: "A raw, real-life confession about the complexities of marriage, desire, and finding oneself in the quiet moments of a busy life.",
    publishedAt: "2025-04-23",
    body: (
      <>
        <div className="mb-8 overflow-hidden rounded-xl">
          <img src="/blog-confessions.png" alt="Confessions" className="w-full object-cover" />
        </div>
        <p className="italic text-white/60">"The house was finally quiet, but my mind was louder than ever..."</p>
        <p>
          This is a story about the things we don't say. Behind every closed door, there's a narrative that the neighbors never see. In this <strong>human-style confession</strong>, we explore the emotional landscape of a woman seeking more than just a routine.
        </p>
        <p>
          It started with a simple thought. A feeling that the days were blurring into one another. It wasn't that I was unhappy, but rather that I felt... invisible.
        </p>
        <h2>Finding the Spark Again</h2>
        <p>
          This narrative is part of our <a href="/blog/">Viral Story series</a>, where we share the unfiltered experiences of our readers.
        </p>
      </>
    ),
  },
];

export const BLOG_POSTS: BlogPost[] = RAW_BLOG_POSTS.map(p => ({
  ...p,
  coverImage: p.coverImage || getDeterministicImage(p.slug)
}));

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
