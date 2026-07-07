<section class="content-section" id="education">
  <h2><span data-lang="en">Education and Appointments</span><span data-lang="zh">教育与工作经历</span></h2>
  <div class="timeline">
    {% for item in profile.education %}
    <article class="event">
      <time>{{ item.period }}</time>
      <div>
        <h3>{{ item.role }}</h3>
        <p>{{ item.institution }}</p>
        {% if item.supervisor %}<p class="venue"><span data-lang="en">Supervisor</span><span data-lang="zh">导师</span>: {{ item.supervisor }}</p>{% endif %}
      </div>
    </article>
    {% endfor %}
  </div>
</section>
