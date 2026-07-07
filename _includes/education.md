<section class="content-section" id="education">
  <h2>Education and Appointments</h2>
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
