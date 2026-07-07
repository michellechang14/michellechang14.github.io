<section class="content-section" id="honors">
  <h2><span data-lang="en">Honors</span><span data-lang="zh">荣誉奖励</span></h2>
  <ul class="award-list">
    {% for award in profile.awards %}
    <li>{{ award }}</li>
    {% endfor %}
  </ul>
</section>
