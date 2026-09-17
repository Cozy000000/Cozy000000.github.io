---
layout: default
title: "Blog"
permalink: /blog/
---

<h2>All Posts</h2>

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
      - {{ post.date | date: "%Y年%m月%d日" }}
    </li>
  {% endfor %}
</ul>