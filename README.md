# Mengyu Chang Academic Website

This is a Jekyll academic homepage for GitHub Pages. It is structured for Mengyu Chang's postdoctoral researcher profile, publication detail pages, upcoming conference activity, and an automated Google Scholar metrics feed.

## Structure

- `_data/profile.json`: name, bio, links, research interests, and contact details.
- `_data/events.json`: upcoming conferences, talks, posters, and visits.
- `_data/scholar.json`: citation metrics and the latest citing papers shown on `/scholar/`.
- `_includes/news.md`: homepage news items.
- `_includes/biography.md`: homepage biography section.
- `_includes/research.md`: homepage research section.
- `_includes/publications-home.md`: homepage publication preview section.
- `_includes/education.md`: homepage education and appointments section.
- `_includes/honors.md`: homepage honors section.
- `NEWS_TAGS.md`: tag helper for homepage news labels.
- `_publications/*.md`: one Markdown file per publication. Jekyll turns each file into its own subpage.
- `assets/css/style.css`: visual design.
- `scripts/update-scholar.mjs`: Scholar updater used by GitHub Actions.
- `.github/workflows/update-scholar.yml`: scheduled updater that runs daily.

## Add a publication

Duplicate `_publications/2026-example-cancer-biology.md`, rename it, and edit the front matter. The page will appear in the publication list automatically.

For the "latest citing papers" feed, add a `scholar_cites_id` value to each publication when you know its Google Scholar cited-by ID.

## Update conferences

Edit `_data/events.json`. Items are sorted by date on the homepage.

## Scholar automation

Google Scholar does not provide an official public API. The updater supports two modes:

1. With `SERPAPI_API_KEY` configured as a GitHub repository secret, it fetches profile metrics, citation history by year, watches the Scholar author article list, creates new publication pages for newly detected papers, and can gather recent citing papers for publications with `scholar_cites_id`.
2. Without that secret, it attempts a lightweight profile fetch for citation totals, but recent citing papers are left unchanged because direct Scholar scraping is unreliable and can be blocked.

The first SerpAPI-backed run initializes `_data/scholar.json` with known Scholar article titles and does not add historical papers to News. After that, any newly detected Scholar article is prepended to `_includes/news.md` automatically. To intentionally add existing Scholar articles during the first run, set `SCHOLAR_NEWS_BOOTSTRAP=true` in the workflow environment.

The workflow is configured for a low SerpAPI budget. It runs once per day, which is about 30 scheduled runs per month. Each run always uses one author-profile lookup, and the same response is used to automatically create `_publications/*.md` pages for Scholar articles newer than the local publication list and to fill empty `scholar_cites_id` fields by matching Scholar article titles. `SERPAPI_MAX_CITED_BY_LOOKUPS=2` limits extra cited-by searches to at most two publications per run. With the current schedule, the normal upper bound is about 90 SerpAPI requests per month, plus any manual workflow runs.

By default, historical Scholar articles are not bulk-imported unless they are newer than the local publication list. To intentionally import all unmatched Scholar articles, manually run the `Update Scholar Metrics` workflow and set `Import all unmatched Scholar publications once` to `true`.

News items can use multiple tags:

```html
<span class="badge paper">PAPER</span><span class="badge journal">JOURNAL</span><span class="badge nature">NATURE</span>
```

The profile is already configured for:

`https://scholar.google.com/citations?user=WaHuZvMAAAAJ&hl=en`

## Local preview

Install Ruby/Jekyll if needed, then run:

```bash
bundle exec jekyll serve
```

GitHub Pages will build the site automatically after pushing to `main`.
