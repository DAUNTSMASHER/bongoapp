/**
 * Adsterra Publisher API client.
 * Fetches domains, placements, stats. Ad codes come from dashboard — this is analytics only.
 * Base: https://api3.adsterratools.com/publisher
 * Header: X-API-Key: <token>
 */

const BASE = "https://api3.adsterratools.com/publisher";

async function fetchApi<T>(path: string): Promise<T> {
  const token = process.env.ADSTERRA_API_TOKEN;
  if (!token) throw new Error("ADSTERRA_API_TOKEN not set");
  const res = await fetch(`${BASE}${path}`, {
    headers: { "X-API-Key": token },
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Adsterra API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export interface AdsterraDomain {
  domain_id: number;
  name: string;
}

export interface AdsterraPlacement {
  placement_id: number;
  domain_id?: number;
  name?: string;
  type?: string;
}

export interface AdsterraStatsRow {
  date?: string;
  domain_id?: number;
  placement_id?: number;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  cpm?: number;
  revenue?: number;
}

/** List websites in your Adsterra account */
export async function getDomains(): Promise<AdsterraDomain[]> {
  const data = await fetchApi<{ domains?: AdsterraDomain[] }>("/domains.json");
  return data.domains ?? [];
}

/** List placements for a domain */
export async function getPlacementsByDomain(domainId: number): Promise<AdsterraPlacement[]> {
  const data = await fetchApi<{ placements?: AdsterraPlacement[] }>(
    `/domain/${domainId}/placements.json`
  );
  return data.placements ?? [];
}

/** List all placements */
export async function getAllPlacements(): Promise<AdsterraPlacement[]> {
  const data = await fetchApi<{ placements?: AdsterraPlacement[] }>("/placements.json");
  return data.placements ?? [];
}

/** Fetch stats (impressions, clicks, revenue). Dates: YYYY-MM-DD */
export async function getStats(params?: {
  domain_id?: number;
  placement_id?: number;
  start?: string;
  finish?: string;
}): Promise<AdsterraStatsRow[]> {
  const search = new URLSearchParams();
  if (params?.domain_id) search.set("domain_id", String(params.domain_id));
  if (params?.placement_id) search.set("placement_id", String(params.placement_id));
  if (params?.start) search.set("start", params.start);
  if (params?.finish) search.set("finish", params.finish);
  const q = search.toString();
  const url = `/stats.json${q ? `?${q}` : ""}`;
  const data = await fetchApi<{ stats?: AdsterraStatsRow[] }>(url);
  return data.stats ?? [];
}
