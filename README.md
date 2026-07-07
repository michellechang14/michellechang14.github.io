# Mengyu Chang Academic Website

This is a Jekyll academic homepage for GitHub Pages. It is structured for Mengyu Chang's postdoctoral researcher profile, publication detail pages, upcoming conference activity, and an automated Google Scholar metrics feed.

## Structure

- `_data/profile.json`: name, bio, links, research interests, and contact details.
- `_data/events.json`: upcoming conferences, talks, posters, and visits.
- `_data/scholar.json`: citation metrics and the latest citing papers shown on `/scholar/`.
- `_publications/*.md`: one Markdown file per publication. Jekyll turns each file into its own subpage.
- `assets/css/style.css`: visual design.
- `scripts/update-scholar.mjs`: Scholar updater used by GitHub Actions.
- `.github/workflows/update-scholar.yml`: scheduled updater that runs hourly.

## Add a publication

Duplicate `_publications/2026-example-cancer-biology.md`, rename it, and edit the front matter. The page will appear in the publication list automatically.

For the "latest citing papers" feed, add a `scholar_cites_id` value to each publication when you know its Google Scholar cited-by ID.

## Update conferences

Edit `_data/events.json`. Items are sorted by date on the homepage.

## Scholar automation

Google Scholar does not provide an official public API. The updater supports two modes:

1. With `SERPAPI_API_KEY` configured as a GitHub repository secret, it fetches profile metrics and can gather recent citing papers for publications with `scholar_cites_id`.
2. Without that secret, it attempts a lightweight profile fetch for citation totals, but recent citing papers are left unchanged because direct Scholar scraping is unreliable and can be blocked.

The profile is already configured for:

`https://scholar.google.com/citations?user=WaHuZvMAAAAJ&hl=en`

## Local preview

Install Ruby/Jekyll if needed, then run:

```bash
bundle exec jekyll serve
```

GitHub Pages will build the site automatically after pushing to `main`.
