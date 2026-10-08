<template>
  <article class="post-article">
    <header class="post-article__header">
      <h1 class="post-article__title selectable">{{ post.title }}</h1>
      <p class="post-article__meta">
        <time :datetime="post.date">{{ date }}</time>
        <span>· {{ post.category }}</span>
        <span>· 约 {{ minutes }} 分钟</span>
      </p>
      <ul v-if="post.tags.length" class="post-article__tags">
        <li v-for="tag in post.tags" :key="tag">{{ tag }}</li>
      </ul>
    </header>
    <div class="markdown-body" v-html="html" />
  </article>
</template>

<script>
import { renderMarkdown } from '../utils/markdown'
import { formatDate, readingMinutes } from '../utils/posts'
import 'github-markdown-css'

export default {
  name: 'PostArticle',
  props: {
    post: { type: Object, required: true }
  },
  computed: {
    html() {
      return renderMarkdown(this.post.body)
    },
    date() {
      return formatDate(this.post.date)
    },
    minutes() {
      return readingMinutes(this.post.body)
    }
  }
}
</script>

<style lang="scss">
.post-article {
  max-width: 720px;
  margin: 0 auto;
  padding: 28px 32px 48px;
}

.post-article__header {
  margin-bottom: 24px;
  padding-bottom: 14px;
  border-bottom: 1px solid #e1e4e8;
}

.post-article__title {
  margin: 0 0 8px;
  font-size: 26px;
  line-height: 1.3;
}

.post-article__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 0;
  font-size: 12px;
  color: #6a737d;
}

.post-article__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;

  li {
    padding: 0 9px;
    border: 1px solid #7aa7e3;
    border-radius: 9px;
    font-size: 11px;
    line-height: 17px;
    color: #1d4f9c;
    background: linear-gradient(to bottom, #eef5ff, #d6e7fd);
  }
}

.post-article .markdown-body {
  font-family: var(--aqua-font);
  font-size: 15px;
  line-height: 1.75;

  pre {
    border: 1px solid #d8dde3;
    background: #fbfbfb;
  }
}
</style>
