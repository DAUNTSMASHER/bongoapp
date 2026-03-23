"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

interface MarketingAuditResult {
  url: string;
  ok: boolean;
  error?: string;
  title?: string;
  titleLength?: number;
  titleOk?: boolean;
  metaDescription?: string;
  metaLength?: number;
  hasH1?: boolean;
  h1Text?: string[];
  headings?: { h2: number; h3: number; h4: number; h5: number; h6: number };
  headingTexts?: { tag: string; text: string }[];
  keywordConsistency?: {
    inTitle: string[];
    inMeta: string[];
    inHeadings: string[];
    suggested: string[];
  };
  recommendations: string[];
}

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.bongochoti.com";

const SUITE_FEATURES: { command: string; label: string; description: string; runnable: "api" | "claude" }[] = [
  { command: "/market audit <url>", label: "Full audit", description: "Marketing audit with 5 parallel agents (content, conversion, SEO, competitive, brand, strategy).", runnable: "api" },
  { command: "/market seo <url>", label: "SEO audit", description: "On-page SEO: title, meta, headers, keyword consistency.", runnable: "api" },
  { command: "/market quick <url>", label: "Quick snapshot", description: "60-second marketing snapshot.", runnable: "claude" },
  { command: "/market copy <url>", label: "Copy", description: "Generate optimized copy with before/after examples.", runnable: "claude" },
  { command: "/market emails <topic>", label: "Email sequences", description: "Complete email sequences for a topic.", runnable: "claude" },
  { command: "/market social <topic>", label: "Social calendar", description: "30-day social media content calendar.", runnable: "claude" },
  { command: "/market ads <url>", label: "Ad creative", description: "Ad creative and copy for all platforms.", runnable: "claude" },
  { command: "/market funnel <url>", label: "Funnel analysis", description: "Sales funnel analysis and optimization.", runnable: "claude" },
  { command: "/market competitors <url>", label: "Competitors", description: "Competitive intelligence report.", runnable: "claude" },
  { command: "/market landing <url>", label: "Landing CRO", description: "Landing page CRO analysis.", runnable: "claude" },
  { command: "/market launch <product>", label: "Launch playbook", description: "Product launch playbook.", runnable: "claude" },
  { command: "/market proposal <client>", label: "Proposal", description: "Client proposal generator.", runnable: "claude" },
  { command: "/market report <url>", label: "Report (MD)", description: "Full marketing report (Markdown).", runnable: "claude" },
  { command: "/market report-pdf <url>", label: "Report (PDF)", description: "Professional marketing report (PDF).", runnable: "claude" },
  { command: "/market brand <url>", label: "Brand voice", description: "Brand voice analysis and guidelines.", runnable: "claude" },
];

export default function AdminMarketingPage() {
  const [url, setUrl] = useState(SITE_URL);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"audit" | "seo" | null>(null);
  const [result, setResult] = useState<MarketingAuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  async function runAudit(type: "audit" | "seo") {
    setError(null);
    setResult(null);
    setMode(type);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/marketing-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Audit failed");
    } finally {
      setLoading(false);
    }
  }

  function copyCommand(cmd: string) {
    const toCopy = cmd.replace("<url>", url).replace("<topic>", "bangla choti").replace("<product>", "bongochoti").replace("<client>", "Client Name");
    navigator.clipboard.writeText(toCopy);
    setCopiedCommand(cmd);
    setTimeout(() => setCopiedCommand(null), 2000);
  }

  return (
    <div className="min-h-screen">
      <AdminPageHeader
        title="AI Marketing Suite"
        description="Audit and analyze your site. Based on AI Marketing Suite for Claude Code."
        backHref="/admin/dashboard/"
        backLabel="Dashboard"
      />
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 lg:px-8">
        {/* Run audit / SEO */}
        <section className="mb-10 rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Run audit from this panel</h2>
          <p className="mt-1 text-sm text-white/60">
            Enter a URL and run an on-page SEO audit (title, meta, H1–H6, keyword consistency).
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.bongochoti.com"
              className="min-w-[280px] flex-1 rounded-lg border border-white/20 bg-black/30 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-[var(--primary)] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => runAudit("audit")}
              disabled={loading}
              className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading && mode === "audit" ? "Running…" : "Full audit"}
            </button>
            <button
              type="button"
              onClick={() => runAudit("seo")}
              disabled={loading}
              className="rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              {loading && mode === "seo" ? "Running…" : "SEO audit"}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}
        </section>

        {/* Audit / SEO results */}
        {result && (
          <section className="mb-10 rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">
              {mode === "seo" ? "SEO audit results" : "Audit results"}
            </h2>
            <div className="mt-4 space-y-4 text-sm">
              {result.title != null && (
                <div>
                  <span className="text-white/50">Title:</span>
                  <p className="mt-1 font-mono text-white/90">{result.title || "(empty)"}</p>
                  <p className="mt-0.5 text-white/50">
                    Length: {result.titleLength ?? 0} chars
                    {result.titleOk !== undefined && (
                      result.titleOk ? " ✓ 50–60" : " — aim for 50–60"
                    )}
                  </p>
                </div>
              )}
              {result.metaDescription != null && (
                <div>
                  <span className="text-white/50">Meta description:</span>
                  <p className="mt-1 text-white/80">{result.metaDescription || "(empty)"}</p>
                  <p className="mt-0.5 text-white/50">Length: {result.metaLength ?? 0} chars</p>
                </div>
              )}
              <div className="flex flex-wrap gap-4">
                <span className="text-white/50">H1:</span>
                <span className={result.hasH1 ? "text-green-400" : "text-amber-400"}>
                  {result.hasH1 ? `✓ ${result.h1Text?.length ?? 0} found` : "Missing"}
                </span>
                {result.headings && (
                  <>
                    <span className="text-white/50">H2–H6:</span>
                    <span className="text-white/70">
                      H2: {result.headings.h2}, H3: {result.headings.h3}, H4: {result.headings.h4}, H5: {result.headings.h5}, H6: {result.headings.h6}
                    </span>
                  </>
                )}
              </div>
              {result.recommendations?.length > 0 && (
                <div>
                  <span className="text-white/50">Recommendations:</span>
                  <ul className="mt-1 list-inside list-disc text-white/80">
                    {result.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.keywordConsistency && (
                <div>
                  <span className="text-white/50">Keywords in title / meta / headings:</span>
                  <p className="mt-1 text-white/70">
                    Title: {result.keywordConsistency.inTitle.join(", ") || "—"} · Meta: {result.keywordConsistency.inMeta.join(", ") || "—"} · Headings: {result.keywordConsistency.inHeadings.join(", ") || "—"}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* All 15 features */}
        <section>
          <h2 className="text-lg font-semibold text-white">All suite features</h2>
          <p className="mt-1 text-sm text-white/60">
            Full audit and SEO run above. Other commands are for Claude Code — copy and run in your terminal.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {SUITE_FEATURES.map((f) => (
              <div
                key={f.command}
                className="rounded-lg border border-white/10 bg-black/20 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-white">{f.label}</p>
                    <p className="mt-0.5 text-xs text-white/60">{f.description}</p>
                  </div>
                  {f.runnable === "api" ? (
                    <span className="shrink-0 rounded bg-[var(--primary)]/20 px-2 py-1 text-xs text-[var(--primary)]">
                      Run above
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => copyCommand(f.command)}
                      className="shrink-0 rounded border border-white/20 px-2 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                    >
                      {copiedCommand === f.command ? "Copied" : "Copy cmd"}
                    </button>
                  )}
                </div>
                <code className="mt-2 block break-all rounded bg-white/5 px-2 py-1.5 text-xs text-white/80">
                  {f.command}
                </code>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-8 text-center text-xs text-white/40">
          Based on{" "}
          <a
            href="https://github.com/zubair-trabzada/ai-marketing-claude"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white/60"
          >
            AI Marketing Suite for Claude Code
          </a>
          . Install and run full audits from your terminal with /market audit &lt;url&gt;.
        </p>
      </div>
    </div>
  );
}
