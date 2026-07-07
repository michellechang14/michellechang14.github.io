<section class="content-section" id="biography">
  <h2>Biography</h2>
  <div class="prose">
    {% for paragraph in profile.bio %}
    <p>{{ paragraph }}</p>
    {% endfor %}
  </div>
  <div class="notice">
    <strong>Research focus</strong>
    <p>Mengyu's work develops multifunctional nanomaterials, single-atom nanozymes, and tumor microenvironment-responsive platforms for multimodal imaging-guided cancer therapy.</p>
  </div>
</section>
