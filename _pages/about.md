---
permalink: /
title: ''
home: true
redirect_from:
  - /about/
  - /about.html
---

<section class="profile-hero" aria-labelledby="profile-name">
  <figure class="profile-photo">
    <div class="portrait-frame"><img src="{{ site.author.avatar | relative_url }}" alt="Zhiyi Chen" width="5472" height="3648" fetchpriority="high"></div>
    <figcaption><span class="location-dot" aria-hidden="true"></span> {{ site.author.location }}</figcaption>
  </figure>
  <div class="profile-intro">
    <p class="eyebrow">Artificial intelligence · HKUST(GZ)</p>
    <h1 id="profile-name">Zhiyi Chen <span lang="zh-CN">陈志屹</span></h1>
    <p class="profile-role">Undergraduate student &amp; researcher</p>
    <p class="profile-affiliation">The Hong Kong University of Science and Technology (Guangzhou)</p>
    <p class="profile-lede">Exploring how to make language models<br class="desktop-break"> more <em>efficient</em> and <em>capable</em>.</p>
    <div class="social-links" aria-label="Contact and research profiles">
      <a href="mailto:{{ site.author.email }}">Email <span aria-hidden="true">↗</span></a>
      <a href="{{ site.author.googlescholar }}" target="_blank" rel="noopener noreferrer">Google Scholar <span aria-hidden="true">↗</span></a>
      <a href="https://github.com/{{ site.author.github }}" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a>
    </div>
  </div>
</section>

{% include section-nav.html %}

<section class="content-section" id="about-me" aria-labelledby="about-title">
  <div class="section-heading"><span class="section-number" aria-hidden="true">01</span><h2 id="about-title">About me</h2><span class="section-rule" aria-hidden="true"></span></div>
  <div class="prose about-prose">
    <p>I am <strong>Zhiyi Chen (陈志屹)</strong>, an undergraduate studying Artificial Intelligence at <a href="https://www.hkust-gz.edu.cn/" target="_blank" rel="noopener noreferrer">HKUST(GZ)</a>, advised by <a href="https://zeyiwen.github.io/" target="_blank" rel="noopener noreferrer">Prof. Zeyi Wen</a>.</p>
    <p>My research interests lie in natural language processing, efficient large language models, hyperparameter optimization, and machine learning.</p>
  </div>
  <ul class="research-topics" aria-label="Research interests"><li>Natural language processing</li><li>Efficient LLMs</li><li>Hyperparameter optimization</li></ul>
</section>

<section class="content-section" id="news" aria-labelledby="news-title">
  <span id="-news" class="legacy-anchor"></span>
  <div class="section-heading"><span class="section-number" aria-hidden="true">02</span><h2 id="news-title">What's new</h2><span class="section-rule" aria-hidden="true"></span></div>
  <div class="news-list">
    <div class="news-item"><time datetime="2026-05">May 2026</time><p><span class="news-label">Award</span> First Prize in the <strong>ASC26 Student Supercomputer Challenge</strong> in Wuxi, Jiangsu.</p></div>
    <div class="news-item"><time datetime="2025-08">Aug 2025</time><p>Two papers accepted to <strong>EMNLP 2025</strong> (main track, oral) and <strong>CIKM 2025</strong>.</p></div>
  </div>
</section>

<section class="content-section" id="publications" aria-labelledby="publications-title">
  <span id="-publications" class="legacy-anchor"></span>
  <div class="section-heading"><span class="section-number" aria-hidden="true">03</span><h2 id="publications-title">Selected publications</h2><span class="section-rule" aria-hidden="true"></span></div>
  <p class="section-description">Research on efficient learning and language models. <a href="{{ site.author.googlescholar }}" target="_blank" rel="noopener noreferrer">Google Scholar <span aria-hidden="true">↗</span></a></p>
  <div class="publication-grid">
    {% for paper in site.data.profile.publications %}
    <article class="publication" aria-labelledby="{{ paper.id }}-title">
      <div class="publication-meta"><span class="venue">{{ paper.venue }}</span>{% if paper.distinction %}<span class="distinction">{{ paper.distinction }}</span>{% endif %}<span class="paper-number" aria-hidden="true">0{{ forloop.index }}</span></div>
      <h3 id="{{ paper.id }}-title"><a href="{{ paper.paper }}" target="_blank" rel="noopener noreferrer">{{ paper.title }}</a></h3>
      <p class="paper-authors">{{ paper.authors }}</p>
      <p class="paper-summary">{{ paper.summary }}</p>
      <div class="paper-links">
        <a href="{{ paper.paper }}" target="_blank" rel="noopener noreferrer">Paper <span aria-hidden="true">↗</span></a>
        <a href="{{ paper.pdf }}" target="_blank" rel="noopener noreferrer">PDF <span aria-hidden="true">↗</span></a>
        <span class="paper-topic">{{ paper.topic }}</span>
      </div>
      <details class="citation">
        <summary>BibTeX <span aria-hidden="true">+</span></summary>
        <div class="citation-content"><pre><code>{{ paper.bibtex | escape }}</code></pre><button type="button" class="copy-citation" hidden>Copy citation</button><span class="copy-status" role="status" aria-live="polite"></span></div>
      </details>
    </article>
    {% endfor %}
  </div>
</section>

<section class="content-section" id="education" aria-labelledby="education-title">
  <span id="-educations" class="legacy-anchor"></span>
  <div class="section-heading"><span class="section-number" aria-hidden="true">04</span><h2 id="education-title">Education</h2><span class="section-rule" aria-hidden="true"></span></div>
  <div class="education-list">
    {% for entry in site.data.profile.education %}
    <div class="education-item{% if entry.current %} is-current{% endif %}">
      <p class="education-period">{{ entry.period }}</p>
      <div><h3>{{ entry.school }}</h3><p class="education-degree">{{ entry.degree }}</p>{% if entry.detail %}<p class="education-detail">{{ entry.detail }}</p>{% endif %}</div>
    </div>
    {% endfor %}
  </div>
</section>

<section class="content-section" id="awards" aria-labelledby="awards-title">
  <span id="-honors-and-awards" class="legacy-anchor"></span>
  <div class="section-heading"><span class="section-number" aria-hidden="true">05</span><h2 id="awards-title">Honors &amp; awards</h2><span class="section-rule" aria-hidden="true"></span></div>
  <ul class="awards-list">
    {% for award in site.data.profile.awards %}
    <li><span class="award-year">{{ award.year }}</span><div><h3>{{ award.title }}</h3><p>{{ award.event }}</p></div></li>
    {% endfor %}
  </ul>
</section>

<section class="content-section" id="activities" aria-labelledby="activities-title">
  <span id="-professional-activities" class="legacy-anchor"></span>
  <div class="section-heading"><span class="section-number" aria-hidden="true">06</span><h2 id="activities-title">Academic activities</h2><span class="section-rule" aria-hidden="true"></span></div>
  <div class="activity-row"><span class="activity-year">2025</span><p><span class="activity-label">Conferences</span> CIKM <span class="activity-divider" aria-hidden="true">/</span> EMNLP</p></div>
</section>

<section class="contact-strip" aria-label="Contact">
  <div><p class="eyebrow">Get in touch</p><p class="contact-heading">Let's talk research.</p></div>
  <a href="mailto:{{ site.author.email }}">{{ site.author.email }} <span aria-hidden="true">↗</span></a>
</section>

<details class="visitor-map">
  <summary>Visitors around the world <span aria-hidden="true">+</span></summary>
  <div class="visitor-map-content" data-map-src="https://clustrmaps.com/map_v2.js?d=WLf9b66ilDZRnTA1p3jOxQp-T_d738h0cJKCEfhFM8s&amp;cl=faf9f5&amp;w=a"></div>
</details>
