import { readFile, writeFile } from "node:fs/promises";

const DATA_PATH = new URL("../_data/scholar.json", import.meta.url);
const NEWS_PATH = new URL("../_includes/news.md", import.meta.url);
const PUBLICATIONS_PATH = new URL("../_publications/", import.meta.url);

const scholar = JSON.parse(await readFile(DATA_PATH, "utf8"));
const authorId = process.env.SCHOLAR_AUTHOR_ID || scholar.authorId;
const profileUrl =
  process.env.SCHOLAR_PROFILE_URL ||
  scholar.profileUrl ||
  `https://scholar.google.com/citations?user=${authorId}&hl=en`;
const serpApiKey = process.env.SERPAPI_API_KEY;
const maxCitedByLookups = Math.max(0, Number(process.env.SERPAPI_MAX_CITED_BY_LOOKUPS || 2));
const maxAbstractLookups = Math.max(0, Number(process.env.SERPAPI_MAX_ABSTRACT_LOOKUPS || 2));

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
    num: "100",
    api_key: serpApiKey
  });

  const citedBy = authorMetrics.cited_by?.table?.[0]?.citations;
  const hIndex = authorMetrics.cited_by?.table?.[1]?.h_index;
  const i10Index = authorMetrics.cited_by?.table?.[2]?.i10_index;

  nextScholar.totalCitations = numberOrNull(citedBy?.all);
  nextScholar.hIndex = numberOrNull(hIndex?.all);
  nextScholar.i10Index = numberOrNull(i10Index?.all);
  nextScholar.citationHistory = normalizeCitationGraph(authorMetrics.cited_by?.graph || []);
  nextScholar.knownScholarArticles = await updateNewsFromScholarArticles(authorMetrics.articles || [], scholar.knownScholarArticles || []);
  await autoCreatePublicationsFromScholarArticles(authorMetrics.articles || []);
  await autoPopulateScholarIds(authorMetrics.articles || []);
  await autoPopulateAbstracts(authorMetrics.articles || [], serpApiKey, maxAbstractLookups);
  nextScholar.recentCitations = await collectRecentCitations(serpApiKey, maxCitedByLookups);
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

async function updateNewsFromScholarArticles(articles, knownArticles) {
  const normalizedKnown = new Set(knownArticles.map((article) => normalizeTitle(article.title || article)));
  const currentArticles = normalizeScholarArticles(articles);
  const currentTitles = currentArticles.map((article) => ({
    title: article.title,
    year: article.year,
    publication: article.publication,
    link: article.link
  }));

  if (knownArticles.length === 0 && process.env.SCHOLAR_NEWS_BOOTSTRAP !== "true") {
    console.log("Initialized Scholar article baseline without adding historical news.");
    return currentTitles;
  }

  const newArticles = currentArticles
    .filter((article) => !normalizedKnown.has(normalizeTitle(article.title)))
    .sort((a, b) => (b.year || 0) - (a.year || 0))
    .slice(0, 6);

  if (newArticles.length > 0) {
    const existingNews = await readFile(NEWS_PATH, "utf8");
    const newsEntries = newArticles.map(formatScholarNewsEntry).join("\n\n");
    await writeFile(NEWS_PATH, `${newsEntries}\n\n${existingNews}`);
    console.log(`Added ${newArticles.length} Scholar article(s) to news.md.`);
  }

  return mergeKnownArticles(currentTitles, knownArticles);
}

function normalizeScholarArticles(articles) {
  return articles
    .map((article) => ({
      title: cleanText(article.title || ""),
      year: Number(article.year) || extractYear(article.publication) || null,
      publication: cleanText(article.publication || article.journal || ""),
      authors: cleanText(article.authors || ""),
      link: article.link || "",
      citationId: extractCitationId(article),
      citedById: extractCitesId(article)
    }))
    .filter((article) => article.title);
}

async function autoCreatePublicationsFromScholarArticles(articles) {
  const { readdir, readFile, writeFile } = await import("node:fs/promises");
  const scholarArticles = normalizeScholarArticles(articles).filter((article) => article.year);
  const files = (await readdir(PUBLICATIONS_PATH)).filter((file) => file.endsWith(".md"));
  const localPublications = [];

  for (const file of files) {
    const text = await readFile(new URL(file, PUBLICATIONS_PATH), "utf8");
    const frontMatterMatch = text.match(/^---\n([\s\S]*?)\n---/);
    if (!frontMatterMatch) continue;
    localPublications.push({
      file,
      ...parseFrontMatter(frontMatterMatch[1])
    });
  }

  const localByTitle = new Map(
    localPublications
      .filter((publication) => publication.title)
      .map((publication) => [normalizeTitle(publication.title), publication])
  );
  const latestLocalYear = Math.max(
    0,
    ...localPublications.map((publication) => Number(publication.year) || 0)
  );
  const currentYear = new Date().getFullYear();
  let createdCount = 0;

  for (const article of scholarArticles.sort((a, b) => (b.year || 0) - (a.year || 0))) {
    if (findScholarArticleForPublication(article.title, localByTitle, localPublications)) continue;

    const shouldCreate =
      process.env.SCHOLAR_PUBLICATIONS_BOOTSTRAP === "true" ||
      article.year > latestLocalYear ||
      article.year >= currentYear - 1;
    if (!shouldCreate) continue;

    const filename = uniquePublicationFilename(article, new Set(files));
    const fileUrl = new URL(filename, PUBLICATIONS_PATH);
    await writeFile(fileUrl, formatPublicationMarkdown(article));
    files.push(filename);
    localByTitle.set(normalizeTitle(article.title), { file: filename, title: article.title, year: article.year });
    createdCount += 1;
  }

  if (createdCount > 0) {
    console.log(`Created ${createdCount} publication page(s) from Google Scholar.`);
  }
}

function uniquePublicationFilename(article, existingFiles) {
  const year = article.year || new Date().getFullYear();
  const baseSlug = slugify(article.title).slice(0, 72) || "scholar-publication";
  let filename = `${year}-${baseSlug}.md`;
  let index = 2;

  while (existingFiles.has(filename)) {
    filename = `${year}-${baseSlug}-${index}.md`;
    index += 1;
  }

  return filename;
}

function formatPublicationMarkdown(article) {
  const type = isConferenceVenue(article.publication) ? "Conference Paper" : "Journal Article";
  const topic = isNatureFamily(article.publication) ? "Nature family publication" : "Google Scholar import";

  return `---
title: "${escapeYaml(article.title)}"
authors: "${escapeYaml(article.authors || "Mengyu Chang")}"
year: ${article.year || new Date().getFullYear()}
venue: "${escapeYaml(article.publication || "Google Scholar")}"
type: "${type}"
topic: "${topic}"
doi: ""
paper: "${escapeYaml(article.link || "")}"
code: ""
slides: ""
scholar_citation_id: "${escapeYaml(article.citationId || "")}"
scholar_cites_id: "${escapeYaml(article.citedById || "")}"
abstract: ""
citation: ""
---

Metadata for this publication was imported from Google Scholar. A full abstract and additional links will be added when available.
`;
}

function slugify(value = "") {
  return normalizeTitle(value)
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeYaml(value = "") {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function autoPopulateScholarIds(articles) {
  const { readdir, readFile, writeFile } = await import("node:fs/promises");
  const scholarArticles = normalizeScholarArticles(articles).filter((article) => article.citedById || article.citationId);
  const scholarByTitle = new Map(scholarArticles.map((article) => [normalizeTitle(article.title), article]));
  const files = (await readdir(PUBLICATIONS_PATH)).filter((file) => file.endsWith(".md"));
  let updatedCount = 0;

  for (const file of files) {
    const fileUrl = new URL(file, PUBLICATIONS_PATH);
    const text = await readFile(fileUrl, "utf8");
    const frontMatterMatch = text.match(/^---\n([\s\S]*?)\n---/);
    if (!frontMatterMatch) continue;

    const frontMatter = frontMatterMatch[1];
    const data = parseFrontMatter(frontMatter);
    if (!data.title) continue;

    const scholarArticle = findScholarArticleForPublication(data.title, scholarByTitle, scholarArticles);
    if (!scholarArticle) continue;

    let nextFrontMatter = frontMatter;
    if (scholarArticle.citationId && !(data.scholar_citation_id || "").trim()) {
      nextFrontMatter = nextFrontMatter.match(/^scholar_citation_id:/m)
        ? nextFrontMatter.replace(/^scholar_citation_id:\s*.*$/m, `scholar_citation_id: "${scholarArticle.citationId}"`)
        : `${nextFrontMatter}\nscholar_citation_id: "${scholarArticle.citationId}"`;
    }
    if (scholarArticle.citedById && !(data.scholar_cites_id || "").trim()) {
      nextFrontMatter = nextFrontMatter.match(/^scholar_cites_id:/m)
        ? nextFrontMatter.replace(/^scholar_cites_id:\s*.*$/m, `scholar_cites_id: "${scholarArticle.citedById}"`)
        : `${nextFrontMatter}\nscholar_cites_id: "${scholarArticle.citedById}"`;
    }
    if (nextFrontMatter === frontMatter) continue;
    const nextText = text.replace(frontMatter, nextFrontMatter);
    await writeFile(fileUrl, nextText);
    updatedCount += 1;
  }

  if (updatedCount > 0) {
    console.log(`Populated Scholar IDs for ${updatedCount} publication(s).`);
  }
}

async function autoPopulateAbstracts(articles, apiKey, maxLookups) {
  const { readdir, readFile, writeFile } = await import("node:fs/promises");
  const scholarArticles = normalizeScholarArticles(articles).filter((article) => article.citationId);
  const scholarByTitle = new Map(scholarArticles.map((article) => [normalizeTitle(article.title), article]));
  const files = (await readdir(PUBLICATIONS_PATH)).filter((file) => file.endsWith(".md"));
  let lookupCount = 0;
  let updatedCount = 0;

  for (const file of files) {
    if (lookupCount >= maxLookups) {
      console.log(`Reached SERPAPI_MAX_ABSTRACT_LOOKUPS=${maxLookups}; skipping remaining abstract lookups.`);
      break;
    }

    const fileUrl = new URL(file, PUBLICATIONS_PATH);
    const text = await readFile(fileUrl, "utf8");
    const frontMatterMatch = text.match(/^---\n([\s\S]*?)\n---/);
    if (!frontMatterMatch) continue;

    const frontMatter = frontMatterMatch[1];
    const data = parseFrontMatter(frontMatter);
    if (!data.title || (data.abstract || "").trim()) continue;

    const scholarArticle = data.scholar_citation_id
      ? { citationId: data.scholar_citation_id }
      : findScholarArticleForPublication(data.title, scholarByTitle, scholarArticles);
    if (!scholarArticle?.citationId) continue;

    lookupCount += 1;
    const citationDetails = await fetchSerpApi({
      engine: "google_scholar_author",
      author_id: authorId,
      view_op: "view_citation",
      citation_id: scholarArticle.citationId,
      api_key: apiKey
    });
    const description = cleanText(
      citationDetails.citation?.description ||
      citationDetails.article?.description ||
      citationDetails.description ||
      ""
    );
    if (!description) continue;

    const nextFrontMatter = frontMatter.match(/^abstract:/m)
      ? frontMatter.replace(/^abstract:\s*.*$/m, `abstract: "${escapeYaml(description)}"`)
      : `${frontMatter}\nabstract: "${escapeYaml(description)}"`;
    const nextText = text.replace(frontMatter, nextFrontMatter);
    await writeFile(fileUrl, nextText);
    updatedCount += 1;
  }

  if (updatedCount > 0) {
    console.log(`Populated abstracts for ${updatedCount} publication(s).`);
  }
}

function findScholarArticleForPublication(title, scholarByTitle, scholarArticles) {
  const normalizedTitle = normalizeTitle(title);
  if (scholarByTitle.has(normalizedTitle)) return scholarByTitle.get(normalizedTitle);

  return scholarArticles.find((article) => {
    const normalizedArticleTitle = normalizeTitle(article.title);
    return (
      normalizedArticleTitle.length > 24 &&
      (normalizedArticleTitle.includes(normalizedTitle) || normalizedTitle.includes(normalizedArticleTitle))
    );
  });
}

function extractCitesId(article) {
  const directValue =
    article.cites_id ||
    article.cited_by?.cites_id ||
    article.cited_by?.cites;
  if (directValue) return String(directValue);

  const links = [
    article.cited_by?.link,
    article.cited_by?.serpapi_link,
    article.cited_by?.serpapi_scholar_link,
    article.cited_by?.serpapi_cites_link
  ].filter(Boolean);

  for (const link of links) {
    const match = String(link).match(/[?&]cites=([^&]+)/);
    if (match) return decodeURIComponent(match[1]);
  }

  return "";
}

function extractCitationId(article) {
  const directValue = article.citation_id || article.citationId;
  if (directValue) return String(directValue);

  const links = [article.link, article.serpapi_link].filter(Boolean);
  for (const link of links) {
    const match = String(link).match(/[?&]citation_for_view=([^&]+)/);
    if (match) return decodeURIComponent(match[1]);
  }

  return "";
}

function normalizeCitationGraph(graph) {
  return graph
    .map((point) => ({
      year: Number(point.year),
      citations: numberOrNull(point.citations)
    }))
    .filter((point) => Number.isFinite(point.year) && Number.isFinite(point.citations))
    .sort((a, b) => a.year - b.year);
}

function formatScholarNewsEntry(article) {
  const tags = tagsForArticle(article);
  const tagMarkup = tags.map((tag) => `<span class="badge ${tag.className}">${tag.label}</span>`).join("");
  const venue = article.publication ? ` appeared in <strong>${escapeHtml(article.publication)}</strong>` : " appeared on Google Scholar";
  const linkedTitle = article.link
    ? `<a href="${escapeHtml(article.link)}"><em>${escapeHtml(article.title)}</em></a>`
    : `<em>${escapeHtml(article.title)}</em>`;

  return `<article class="news-item">
  <time>${escapeHtml(article.year || new Date().getFullYear())}</time>
  <p>${tagMarkup} ${linkedTitle}${venue}.</p>
</article>`;
}

function tagsForArticle(article) {
  const tags = [{ label: "PAPER", className: "paper" }];
  if (isConferenceVenue(article.publication)) {
    tags.push({ label: "CONFERENCE", className: "conference" });
  } else if (article.publication) {
    tags.push({ label: "JOURNAL", className: "journal" });
  }
  tags.push(...prestigeJournalTags(article.publication));
  return tags;
}

function prestigeJournalTags(publication = "") {
  const normalized = publication.toLowerCase();
  const journalTags = [
    { pattern: /\bnature communications\b/, label: "NATURE COMM", className: "nature-comm" },
    { pattern: /\bnature nanotechnology\b/, label: "NATURE NANO", className: "nature-nano" },
    { pattern: /\bnature cancer\b/, label: "NATURE CANCER", className: "nature-cancer" },
    { pattern: /\bnature\b/, label: "NATURE", className: "nature" },
    { pattern: /\bscience\b/, label: "SCIENCE", className: "science" },
    { pattern: /\bcell\b/, label: "CELL", className: "cell" },
    { pattern: /\badvanced materials\b|\badv\.?\s+mater/i, label: "ADV MATER", className: "advanced-materials" },
    { pattern: /\bacs nano\b/i, label: "ACS NANO", className: "acs-nano" },
    { pattern: /\bangewandte\b|\bangew\.?\s+chem/i, label: "ANGEW", className: "angew" },
    { pattern: /\bjacs\b|journal of the american chemical society/i, label: "JACS", className: "jacs" },
    { pattern: /\bsmall\b/i, label: "SMALL", className: "small-journal" },
    { pattern: /\bbiomaterials\b/i, label: "BIOMATERIALS", className: "biomaterials" },
    { pattern: /\bnano today\b/i, label: "NANO TODAY", className: "nano-today" },
    { pattern: /\bacs applied materials\b|\bacs appl/i, label: "ACS AMI", className: "acs-ami" },
    { pattern: /\bchemical engineering journal\b/i, label: "CEJ", className: "cej" }
  ];

  const match = journalTags.find((tag) => tag.pattern.test(normalized));
  return match ? [{ label: match.label, className: match.className }] : [];
}

function isConferenceVenue(publication = "") {
  return /\b(conference|proceedings|symposium|workshop|meeting|congress)\b/i.test(publication);
}

function isNatureFamily(publication = "") {
  return /\bnature\b/i.test(publication);
}

function mergeKnownArticles(currentArticles, knownArticles) {
  const merged = [];
  const seen = new Set();

  for (const article of [...currentArticles, ...knownArticles]) {
    const normalized = normalizeTitle(article.title || article);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    merged.push(typeof article === "string" ? { title: article } : article);
  }

  return merged.slice(0, 200);
}

function normalizeTitle(title = "") {
  return cleanText(title).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function cleanText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function collectRecentCitations(apiKey, maxLookups) {
  const publications = (await readPublicationFrontMatter()).sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
  const collected = [];
  let lookupCount = 0;

  for (const publication of publications) {
    if (!publication.scholar_cites_id) continue;
    if (lookupCount >= maxLookups) {
      console.log(`Reached SERPAPI_MAX_CITED_BY_LOOKUPS=${maxLookups}; skipping remaining cited-by lookups.`);
      break;
    }
    lookupCount += 1;
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
