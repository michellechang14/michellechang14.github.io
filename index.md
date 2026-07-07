---
title: Home
---

{% assign profile = site.data.profile %}

<section class="hero">
  <div class="hero-copy">
    <p class="eyebrow">{{ profile.title }} · {{ profile.institution }}</p>
    <h1>{{ profile.name }}</h1>
    <p class="lede">{{ profile.bio[0] }}</p>
    <div class="hero-actions">
      <a class="button" href="{{ '/publications/' | relative_url }}">View Publications</a>
      <a class="button ghost" href="{{ profile.googleScholar }}">Google Scholar</a>
      <a class="button ghost" href="{{ profile.cv | relative_url }}">CV</a>
      <a class="button ghost" href="mailto:{{ profile.email }}">Email</a>
    </div>
  </div>
  <aside class="profile-panel" aria-label="Profile summary">
    <img src="{{ profile.photo | relative_url }}" alt="{{ profile.name }} portrait">
    <dl>
      <div><dt>Role</dt><dd>{{ profile.title }}</dd></div>
      <div><dt>Institution</dt><dd>{{ profile.institution }}</dd></div>
      <div><dt>Department</dt><dd>{{ profile.department }}</dd></div>
      <div><dt>Location</dt><dd>{{ profile.location }}</dd></div>
    </dl>
  </aside>
</section>

<section class="section" id="research">
  <div class="section-heading">
    <p class="eyebrow">Research</p>
    <h2>Research Interests</h2>
  </div>
  <div class="topic-grid">
    {% for area in profile.researchAreas %}
    <div class="topic">{{ area }}</div>
    {% endfor %}
  </div>
  <div class="prose">
    {% for paragraph in profile.bio offset:1 %}
    <p>{{ paragraph }}</p>
    {% endfor %}
  </div>
</section>

<section class="section" id="experience">
  <div class="section-heading">
    <p class="eyebrow">Training</p>
    <h2>Education and Appointments</h2>
  </div>
  <div class="timeline">
    {% for item in profile.education %}
    <article class="event">
      <time>{{ item.period }}</time>
      <div>
        <h3>{{ item.role }}</h3>
        <p>{{ item.institution }}</p>
        {% if item.supervisor %}<p class="venue">Supervisor: {{ item.supervisor }}</p>{% endif %}
      </div>
    </article>
    {% endfor %}
  </div>
</section>

<section class="section">
  <div class="section-heading">
    <p class="eyebrow">Expertise</p>
    <h2>Professional Skills</h2>
  </div>
  <ul class="skill-list">
    {% for skill in profile.skills %}
    <li>{{ skill }}</li>
    {% endfor %}
  </ul>
</section>

<section class="section">
  <div class="section-heading inline">
    <div>
      <p class="eyebrow">Selected Work</p>
      <h2>Recent Publications</h2>
    </div>
    <a class="text-link" href="{{ '/publications/' | relative_url }}">All publications</a>
  </div>
  <div class="publication-list">
    {% assign sorted_publications = site.publications | sort: 'year' | reverse %}
    {% for publication in sorted_publications limit:3 %}
      {% include publication-card.html publication=publication %}
    {% endfor %}
  </div>
</section>

<section class="section">
  <div class="section-heading">
    <p class="eyebrow">Recognition</p>
    <h2>Honors and Awards</h2>
  </div>
  <ul class="award-list">
    {% for award in profile.awards %}
    <li>{{ award }}</li>
    {% endfor %}
  </ul>
</section>

<section class="section scholar-strip">
  <div>
    <p class="eyebrow">Live Metrics</p>
    <h2>Google Scholar</h2>
    <p>Updated by the scheduled Scholar workflow when credentials are configured.</p>
  </div>
  <div class="metrics">
    <div><span>{{ site.data.scholar.totalCitations | default: 'Pending' }}</span><small>Citations</small></div>
    <div><span>{{ site.data.scholar.hIndex | default: 'Pending' }}</span><small>h-index</small></div>
    <div><span>{{ site.data.scholar.i10Index | default: 'Pending' }}</span><small>i10-index</small></div>
  </div>
</section>

<section class="section" id="events">
  <div class="section-heading">
    <p class="eyebrow">Calendar</p>
    <h2>Upcoming Conferences and Talks</h2>
  </div>
  <div class="timeline">
    {% assign events = site.data.events | sort: 'date' %}
    {% for event in events %}
    <article class="event">
      <time datetime="{{ event.date }}">{{ event.date | date: "%b %-d, %Y" }}</time>
      <div>
        <h3>{% if event.url %}<a href="{{ event.url }}">{{ event.title }}</a>{% else %}{{ event.title }}{% endif %}</h3>
        <p>{{ event.type }} · {{ event.venue }} · {{ event.location }}</p>
      </div>
    </article>
    {% endfor %}
  </div>
</section>

