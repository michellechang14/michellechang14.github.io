# News Tag Helper

Use these tags inside `_includes/news.md`. You can combine multiple tags in the same news item.

## Common Tags

```html
<span class="badge site">SITE</span>
<span class="badge update">UPDATE</span>
<span class="badge paper">PAPER</span>
<span class="badge journal">JOURNAL</span>
<span class="badge conference">CONFERENCE</span>
<span class="badge talk">TALK</span>
<span class="badge poster">POSTER</span>
<span class="badge award">AWARD</span>
<span class="badge grant">GRANT</span>
<span class="badge service">SERVICE</span>
<span class="badge career">CAREER</span>
<span class="badge teaching">TEACHING</span>
<span class="badge nature">NATURE</span>
```

## Journal Tags

Use these when the news item involves a notable journal or magazine.

```html
<span class="badge nature">NATURE</span>
<span class="badge nature-cancer">NATURE CANCER</span>
<span class="badge nature-comm">NATURE COMM</span>
<span class="badge nature-nano">NATURE NANO</span>
<span class="badge science">SCIENCE</span>
<span class="badge cell">CELL</span>
<span class="badge advanced-materials">ADV MATER</span>
<span class="badge acs-nano">ACS NANO</span>
<span class="badge angew">ANGEW</span>
<span class="badge jacs">JACS</span>
<span class="badge small-journal">SMALL</span>
<span class="badge biomaterials">BIOMATERIALS</span>
<span class="badge nano-today">NANO TODAY</span>
<span class="badge acs-ami">ACS AMI</span>
<span class="badge cej">CEJ</span>
```

## Example

```html
<article class="news-item">
  <time>2026.08</time>
  <p><span class="badge paper">PAPER</span><span class="badge journal">JOURNAL</span><span class="badge nature">NATURE</span> <em>Paper title</em> appeared in <strong>Nature Nanotechnology</strong>.</p>
</article>
```

## Notes

- Put the newest news item at the top of `_includes/news.md`.
- The homepage displays only the first 6 news items.
- The Scholar bot automatically adds `PAPER`, then `JOURNAL` or `CONFERENCE` when it can infer the venue type.
- The Scholar bot automatically adds distinctive journal tags for notable venues, including Nature-family journals, Science, Cell, Advanced Materials, ACS Nano, Angewandte Chemie, JACS, Small, Biomaterials, Nano Today, ACS Applied Materials & Interfaces, and Chemical Engineering Journal.
