import { readFile, writeFile } from "node:fs/promises";

const DATA_PATH = new URL("../_data/scholar.json", import.meta.url);
const PUBLICATIONS_PATH = new URL("../_publications/", import.meta.url);

const scholar = JSON.parse(await readFile(DATA_PATH, "utf8"));
const authorId = process.env.SCHOLAR_AUTHOR_ID || scholar.authorId;
const profileUrl =
  process.env.SCHOLAR_PROFILE_URL ||
  scholar.profileUrl ||
  `https://scholar.google.com/citations?user=${authorId}&hl=en`;
const serpApiKey = process.env.SERPAPI_API_KEY;

const nextScholar = {
  ...scholar,
  profileUrl,
  authorId,
  lastUpdated: new Date().toISOString()
};

if (serpApiKey) {
  const authorMetrics = await fetchSerpApi({
    engine: "google_scholar_author",
    author_id: authorId,
    api_key: serpApiKey
  });

  const citedBy = authorMetrics.cited_by?.table?.[0]?.citations;
  const hIndex = authorMetrics.cited_by?.table?.[1]?.h_index;
  const i10Index = authorMetrics.cited_by?.table?.[2]?.i10_index;

  nextScholar.totalCitations = numberOrNull(citedBy?.all);
  nextScholar.hIndex = numberOrNull(hIndex?.all);
  nextScholar.i10Index = numberOrNull(i10Index?.all);
  nextScholar.recentCitations = await collectRecentCitations(serpApiKey);
} else {
  console.warn("SERPAPI_API_KEY is not set. Keeping existing citation metrics and recent citations.");
  try {
    const html = await fetch(profileUrl, {
      headers: {
        "user-agent": "Mozilla/5.0 citation-monitor/1.0 (+https://github.com/michellechang14/michellechang14.github.io)"
      }
    }).then((response) => response.text());
    const metrics = parseScholarProfile(html);
    nextScholar.totalCitations = metrics.totalCitations ?? scholar.totalCitations;
    nextScholar.hIndex = metrics.hIndex ?? scholar.hIndex;
    nextScholar.i10Index = metrics.i10Index ?? scholar.i10Index;
  } catch (error) {
    console.warn(`Direct Scholar fetch failed: ${error.message}`);
  }
}

await writeFile(DATA_PATH, `${JSON.stringify(nextScholar, null, 2)}\n`);

async function collectRecentCitations(apiKey) {
  const publications = await readPublicationFrontMatter();
  const collected = [];

  for (const publication of publications) {
    if (!publication.scholar_cites_id) continue;
    const result = await fetchSerpApi({
      engine: "google_scholar",
      cites: publication.scholar_cites_id,
      scisbd: "1",
      api_key: apiKey
    });

    for (const item of result.organic_results || []) {
      collected.push({
        title: item.title,
        authors: item.publication_info?.authors?.map((author) => author.name).join(", ") || item.publication_info?.summary || "",
        venue: item.publication_info?.summary || "",
        year: extractYear(item.publication_info?.summary),
        url: item.link || "",
        sourcePublication: publication.title
      });
    }
  }

  const seen = new Set();
  return collected
    .filter((item) => {
      const key = `${item.title}|${item.authors}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => (b.year || 0) - (a.year || 0))
    .slice(0, 10);
}

async function fetchSerpApi(params) {
  const url = new URL("https://serpapi.com/search.json");
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(`SerpAPI request failed: ${response.status} ${response.statusText}`);
  return response.json();
}

async function readPublicationFrontMatter() {
  const { readdir, readFile } = await import("node:fs/promises");
  const files = await readdir(PUBLICATIONS_PATH);
  const markdownFiles = files.filter((file) => file.endsWith(".md"));
  const publications = [];

  for (const file of markdownFiles) {
    const text = await readFile(new URL(file, PUBLICATIONS_PATH), "utf8");
    const match = text.match(/^---\n([\s\S]*?)\n---/);
    if (!match) continue;
    publications.push(parseFrontMatter(match[1]));
  }

  return publications;
}

function parseFrontMatter(text) {
  const data = {};
  for (const line of text.split("\n")) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    data[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return data;
}

function parseScholarProfile(html) {
  const cells = [...html.matchAll(/<td class="gsc_rsb_std">([^<]+)<\/td>/g)].map((match) => numberOrNull(match[1]));
  return {
    totalCitations: cells[0] ?? null,
    hIndex: cells[2] ?? null,
    i10Index: cells[4] ?? null
  };
}

function numberOrNull(value) {
  if (value === undefined || value === null) return null;
  const number = Number(String(value).replace(/[^\d]/g, ""));
  return Number.isFinite(number) ? number : null;
}

function extractYear(text = "") {
  const match = text.match(/\b(19|20)\d{2}\b/g);
  return match ? Number(match.at(-1)) : null;
}
