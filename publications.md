---
title: Publications
permalink: /publications/
---

<section class="page-intro">
  <p class="eyebrow">Publications</p>
  <h1>Publications and Projects</h1>
  <p>Selected peer-reviewed publications and research projects by Mengyu Chang.</p>
</section>

<section class="section compact">
  <div class="filters" aria-label="Publication filters">
    <button class="filter-button active" data-filter="all" data-year-filter="all">All</button>
    {% assign years = site.publications | map: 'year' | uniq | sort | reverse %}
    {% for year in years %}
    <button class="filter-button" data-filter="{{ year }}" data-year-filter="{{ year }}">{{ year }}</button>
    {% endfor %}
  </div>
  <div class="publication-list" id="publicationList">
    {% assign sorted_publications = site.publications | sort: 'year' | reverse %}
    {% for publication in sorted_publications %}
      {% include publication-card.html publication=publication %}
    {% endfor %}
  </div>
</section>
