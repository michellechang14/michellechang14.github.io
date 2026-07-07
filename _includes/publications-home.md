<section class="content-section" id="publications">
  <div class="section-row">
    <h2>Publications</h2>
    <a class="text-link" href="{{ '/publications/' | relative_url }}">Full list</a>
  </div>
  <div class="publication-compact-list">
    {% for publication in sorted_publications limit:8 %}
    <article class="publication-compact">
      <span class="pub-number">{{ forloop.index }}</span>
      <div>
        <h3><a href="{{ publication.url | relative_url }}">{{ publication.title }}</a></h3>
        <p><strong>{{ publication.authors }}</strong></p>
        <p>{{ publication.venue }}{% if publication.doi %} · DOI: <a href="https://doi.org/{{ publication.doi }}">{{ publication.doi }}</a>{% endif %}</p>
      </div>
    </article>
    {% endfor %}
  </div>
</section>
