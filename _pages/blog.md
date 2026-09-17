---
layout: default
title: Blog
description: Notes on language models, machine learning, and research by Zhiyi Chen.
permalink: /blog/
---

<header class="page-heading"><p class="eyebrow">Notes &amp; ideas</p><h1>Blog</h1><p>Thoughts on language models, machine learning, and the things I learn along the way.</p></header>
{% if site.posts.size > 0 %}
<div class="post-list">
  {% for post in site.posts %}
  <article class="post-preview"><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: '%b %d, %Y' }}</time><h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>{% if post.description %}<p>{{ post.description }}</p>{% endif %}</article>
  {% endfor %}
</div>
{% else %}
<div class="empty-notes"><p class="empty-notes-mark" aria-hidden="true">✳</p><h2>A notebook in the making.</h2><p>No posts published yet.</p><a href="{{ '/#publications' | relative_url }}">Explore my research <span aria-hidden="true">↗</span></a></div>
{% endif %}
