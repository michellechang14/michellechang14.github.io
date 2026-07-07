<section class="content-section" id="honors">
  <h2>Honors</h2>
  <ul class="award-list">
    {% for award in profile.awards %}
    <li>{{ award }}</li>
    {% endfor %}
  </ul>
</section>
