---
title: Scholar
permalink: /scholar/
---

{% assign scholar = site.data.scholar %}

<section class="page-intro">
  <p class="eyebrow">Scholar Monitor</p>
  <h1>Google Scholar Citation Tracker</h1>
  <p>This page is populated from <code>_data/scholar.json</code>. The GitHub Action can refresh totals and the latest citing papers on a schedule for Mengyu Chang's Google Scholar profile.</p>
</section>

<section class="section scholar-strip">
  <div>
    <p class="eyebrow">{{ scholar.source }}</p>
    <h2>Profile Metrics</h2>
    <p>{% if scholar.lastUpdated %}Last updated {{ scholar.lastUpdated }}.{% else %}Waiting for the first automated update.{% endif %}</p>
    <a class="text-link" href="{{ scholar.profileUrl }}">Open Google Scholar profile</a>
  </div>
  <div class="metrics">
    <div><span>{{ scholar.totalCitations | default: 'Pending' }}</span><small>Citations</small></div>
    <div><span>{{ scholar.hIndex | default: 'Pending' }}</span><small>h-index</small></div>
    <div><span>{{ scholar.i10Index | default: 'Pending' }}</span><small>i10-index</small></div>
  </div>
</section>

<section class="section compact">
  <div class="section-heading">
    <p class="eyebrow">Recent citing papers</p>
    <h2>Latest 10 Citations</h2>
  </div>
  {% if scholar.recentCitations and scholar.recentCitations.size > 0 %}
  <div class="citation-feed">
    {% for item in scholar.recentCitations limit:10 %}
    <article class="citation-item">
      <p class="eyebrow">{{ item.year }}{% if item.sourcePublication %} · citing {{ item.sourcePublication }}{% endif %}</p>
      <h3>{% if item.url %}<a href="{{ item.url }}">{{ item.title }}</a>{% else %}{{ item.title }}{% endif %}</h3>
      <p>{{ item.authors }}</p>
      {% if item.venue %}<p class="venue">{{ item.venue }}</p>{% endif %}
    </article>
    {% endfor %}
  </div>
  {% else %}
  <p class="empty-state">No recent citing papers have been collected yet. Add SerpAPI credentials and Scholar citation IDs to enable this feed.</p>
  {% endif %}
</section>
