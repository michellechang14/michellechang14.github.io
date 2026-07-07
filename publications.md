---
title: Publications
permalink: /publications/
---

<section class="page-intro">
  <p class="eyebrow">Publications</p>
  <h1>Publications and Projects</h1>
  <p>Each item is a standalone page generated from the CV. Add a new Markdown file in <code>_publications/</code> to publish another work.</p>
</section>

<section class="section compact">
  <div class="filters" aria-label="Publication filters">
    <button class="filter-button active" data-filter="all">All</button>
    {% assign years = site.publications | map: 'year' | uniq | sort | reverse %}
    {% for year in years %}
    <button class="filter-button" data-filter="{{ year }}">{{ year }}</button>
    {% endfor %}
  </div>
  <div class="publication-list" id="publicationList">
    {% assign sorted_publications = site.publications | sort: 'year' | reverse %}
    {% for publication in sorted_publications %}
      {% include publication-card.html publication=publication %}
    {% endfor %}
  </div>
</section>
