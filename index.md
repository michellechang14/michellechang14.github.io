---
layout: default
title: Home
---

{% assign profile = site.data.profile %}
{% assign sorted_publications = site.publications | sort: 'year' | reverse %}

<div class="academic-layout">
  <aside class="academic-sidebar" id="contact">
    <img class="portrait" src="{{ profile.photo | relative_url }}" alt="{{ profile.name }} portrait">
    <h1>{{ profile.name }}</h1>
    <p class="sidebar-title">{{ profile.title }}</p>
    <p class="sidebar-department">{{ profile.department }}</p>

    <div class="institution-card">
      <strong>MD Anderson</strong>
      <span>Cancer Center</span>
    </div>

    <p class="tagline">
      <span data-lang="en">Multifunctional nanomaterials for imaging-guided cancer therapy and immunotherapy.</span>
      <span data-lang="zh">面向影像引导肿瘤治疗与免疫治疗的多功能纳米材料。</span>
    </p>

    <ul class="contact-list">
      <li><span class="contact-icon" aria-label="Email">✉️</span><a href="mailto:{{ profile.email }}">{{ profile.email }}</a></li>
      <li><span class="contact-icon" aria-label="Location">📍</span>{{ profile.location }}</li>
      <li><span class="contact-icon" aria-label="Department">🏥</span>{{ profile.department }}</li>
    </ul>

    <div class="sidebar-actions">
      <a class="button small ghost" href="{{ profile.googleScholar }}"><span class="button-icon" aria-hidden="true">🎓</span>Google Scholar</a>
      <a class="button small ghost" href="{{ profile.cv | relative_url }}"><span class="button-icon" aria-hidden="true">📄</span>CV</a>
      <a class="button small ghost" href="{{ profile.linkedin }}"><span class="button-icon" aria-hidden="true">💼</span>LinkedIn</a>
      <a class="button small ghost" href="mailto:{{ profile.email }}"><span class="button-icon" aria-hidden="true">✉️</span><span data-lang="en">Email</span><span data-lang="zh">邮件</span></a>
    </div>

    <div class="sidebar-scholar" aria-label="Google Scholar metrics">
      <div class="sidebar-section-title">Google Scholar</div>
      <p><span data-lang="en">Updated by the scheduled Scholar workflow.</span><span data-lang="zh">由定时 Scholar 工作流自动更新。</span></p>
      <div class="metrics vertical">
        <div><span>{{ site.data.scholar.totalCitations | default: 'Pending' }}</span><small><span data-lang="en">Citations</span><span data-lang="zh">引用</span></small></div>
        <div><span>{{ site.data.scholar.hIndex | default: 'Pending' }}</span><small>h-index</small></div>
        <div><span>{{ site.data.scholar.i10Index | default: 'Pending' }}</span><small>i10-index</small></div>
      </div>
      {% assign citation_history = site.data.scholar.citationHistory %}
      <div class="citation-chart" aria-label="Cumulative citations by year">
        <div class="chart-title"><span data-lang="en">Citations by year</span><span data-lang="zh">年度引用量</span></div>
        {% if citation_history and citation_history.size > 0 %}
          {% assign max_citations = 0 %}
          {% for point in citation_history %}
            {% if point.citations > max_citations %}
              {% assign max_citations = point.citations %}
            {% endif %}
          {% endfor %}
          {% if max_citations < 1 %}
            {% assign max_citations = 1 %}
          {% endif %}
          {% assign chart_width = 210 %}
          {% assign chart_height = 84 %}
          {% assign plot_left = 8 %}
          {% assign plot_top = 8 %}
          {% assign plot_width = 194 %}
          {% assign plot_height = 58 %}
          {% assign point_count = citation_history.size %}
          {% assign denominator = point_count | minus: 1 %}
          {% if denominator < 1 %}
            {% assign denominator = 1 %}
          {% endif %}
          {% capture chart_points %}
            {% for point in citation_history %}
              {% assign x = forloop.index0 | times: plot_width | divided_by: denominator | plus: plot_left %}
              {% assign scaled_y = point.citations | times: plot_height | divided_by: max_citations %}
              {% assign y = plot_top | plus: plot_height | minus: scaled_y %}
              {{ x }},{{ y }}
            {% endfor %}
          {% endcapture %}
          <svg viewBox="0 0 {{ chart_width }} {{ chart_height }}" role="img" aria-labelledby="citation-chart-title">
            <title id="citation-chart-title">Cumulative citations by year</title>
            <line x1="{{ plot_left }}" y1="{{ plot_top | plus: plot_height }}" x2="{{ plot_left | plus: plot_width }}" y2="{{ plot_top | plus: plot_height }}" />
            <polyline points="{{ chart_points | strip_newlines }}" />
            {% for point in citation_history %}
              {% assign x = forloop.index0 | times: plot_width | divided_by: denominator | plus: plot_left %}
              {% assign scaled_y = point.citations | times: plot_height | divided_by: max_citations %}
              {% assign y = plot_top | plus: plot_height | minus: scaled_y %}
              <circle cx="{{ x }}" cy="{{ y }}" r="2.5" />
            {% endfor %}
            <text x="{{ plot_left }}" y="82">{{ citation_history.first.year }}</text>
            <text x="{{ plot_left | plus: plot_width }}" y="82" text-anchor="end">{{ citation_history.last.year }}</text>
            <text x="{{ plot_left }}" y="8">{{ max_citations }}</text>
          </svg>
        {% else %}
          <div class="chart-empty"><span data-lang="en">Waiting for Scholar history.</span><span data-lang="zh">等待 Scholar 年度数据。</span></div>
        {% endif %}
      </div>
      {% assign wordcloud_path = '/assets/img/wordmap/wordcloud_s.png' %}
      {% assign wordcloud_image = site.static_files | where: 'path', wordcloud_path | first %}
      <a class="text-link" href="{{ '/scholar/' | relative_url }}"><span data-lang="en">View citation tracker</span><span data-lang="zh">查看引用追踪</span></a>
      {% if wordcloud_image %}
      <figure class="scholar-wordcloud">
        <img src="{{ wordcloud_path | relative_url }}" alt="Research keyword word cloud">
      </figure>
      {% endif %}
    </div>
  </aside>

  <div class="academic-content">
    {% include biography.md %}
    {% include news-section.md %}
    {% include research.md %}
    {% include publications-home.md %}
    {% include education.md %}
    {% include honors.md %}
  </div>
</div>
