<section class="content-section" id="news">
  <h2><span data-lang="en">News</span><span data-lang="zh">最新动态</span></h2>
  <div class="news-list">
    {% capture news_content %}{% include news.md %}{% endcapture %}
    {% assign news_items = news_content | split: '</article>' %}
    {% for news_item in news_items limit:6 %}
      {% if news_item contains 'news-item' %}
        {{ news_item | append: '</article>' | markdownify }}
      {% endif %}
    {% endfor %}
  </div>
</section>
