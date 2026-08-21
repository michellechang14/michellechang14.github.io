# Website Maintenance Guide

This document keeps the technical notes for maintaining Michelle Chang's academic website. The root `README.md` is reserved for the public-facing academic profile.

## Site Structure

- `_data/profile.json`: name, biography, links, research interests, education, skills, honors, and contact details.
- `_data/scholar.json`: Google Scholar citation metrics, citation history, and recent citing papers.
- `_includes/news.md`: editable homepage news items.
- `_includes/biography.md`: homepage biography section.
- `_includes/research.md`: homepage research section.
- `_includes/publications-home.md`: homepage publication preview section.
- `_includes/education.md`: homepage education and appointments section.
- `_includes/honors.md`: homepage honors section.
- `_publications/*.md`: one Markdown file per publication. Jekyll turns each file into its own detail page.
- `NEWS_TAGS.md`: helper for homepage news labels.
- `assets/css/style.css`: visual design.
- `scripts/update-scholar.mjs`: Google Scholar updater used by GitHub Actions.
- `.github/workflows/update-scholar.yml`: scheduled Scholar updater.
- `.github/workflows/jekyll-gh-pages.yml`: GitHub Pages build and deployment workflow.

## Edit Homepage Content

Most homepage sections are controlled by separate Markdown includes:

- Biography: `_includes/biography.md`
- News: `_includes/news.md`
- Research: `_includes/research.md`
- Publications preview: `_includes/publications-home.md`
- Education and appointments: `_includes/education.md`
- Honors: `_includes/honors.md`

The profile sidebar uses `_data/profile.json` for name, title, department, links, contact details, pronouns, photo, education, skills, honors, and biography text.

## Add News

Edit `_includes/news.md`. Put the newest item at the top.

Each item should follow this shape:

```html
<article class="news-item">
  <time>2026.08</time>
  <p><span class="badge paper">PAPER</span><span class="badge journal">JOURNAL</span> News text here.</p>
</article>
```

Use `NEWS_TAGS.md` for the current tag list. Multiple tags can be combined in the same news item.

The homepage shows only the first six news items.

## Add A Publication Manually

Add a new Markdown file in `_publications/`.

Use this front matter pattern:

```yaml
---
title: "Publication title"
authors: "Author list"
year: 2026
venue: "Journal or conference name"
type: "Journal Article"
topic: "Cancer nanomedicine"
doi: ""
paper: ""
code: ""
slides: ""
scholar_citation_id: ""
scholar_cites_id: ""
abstract: ""
citation: ""
---
```

The publication list and homepage publication preview update automatically after Jekyll builds the site.

## Google Scholar Automation

Google Scholar does not provide an official public API, so the site uses SerpAPI through GitHub Actions.

The scheduled workflow:

- updates citation totals, h-index, i10-index, and citations by year in `_data/scholar.json`;
- watches the Scholar article list and prepends newly detected papers to `_includes/news.md`;
- creates new `_publications/*.md` pages for newly detected Scholar papers;
- fills empty `scholar_citation_id` and `scholar_cites_id` fields when possible;
- collects recent citing papers for `/scholar/`;
- triggers the GitHub Pages deployment workflow after committing Scholar updates.

The workflow is configured for a low SerpAPI budget:

- `SERPAPI_MAX_CITED_BY_LOOKUPS=2`
- `SERPAPI_MAX_ABSTRACT_LOOKUPS=2`
- schedule: once per day

With the current schedule, the normal upper bound is about 150 SerpAPI requests per month, plus any manual workflow runs.

## Bulk Import Scholar Publications

To import all unmatched Scholar publications once:

1. Open GitHub Actions.
2. Select `Update Scholar Metrics`.
3. Choose `Run workflow`.
4. Set `Import all unmatched Scholar publications once` to `true`.

Use this carefully, because it can create many `_publications/*.md` files.

## GitHub Secrets

The Scholar workflow accepts either secret name:

- `SERPAPI_API_KEY`
- `GOOGLESCHOLARAPI`

`SERPAPI_API_KEY` is preferred for clarity.

## Local Preview

If Ruby and Jekyll are installed:

```bash
jekyll serve
```

Then open the local URL printed by Jekyll.

To build once without serving:

```bash
jekyll build
```

GitHub Pages builds and deploys automatically after pushes to `main` and after successful Scholar updates.
