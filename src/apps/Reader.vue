<template>
  <div class="reader">
    <div ref="page" class="reader__page aqua-scroll">
      <post-article v-if="post" :post="post" />
      <nav v-if="post" class="reader__nav">
        <a v-if="links.newer" :href="`/posts/${links.newer.slug}`" @click.prevent="go(links.newer)">← {{ links.newer.title }}</a>
        <span v-else />
        <a v-if="links.older" :href="`/posts/${links.older.slug}`" @click.prevent="go(links.older)">{{ links.older.title }} →</a>
      </nav>
      <p v-else class="reader__missing">{{ $t('posts.missing') }}</p>
    </div>
  </div>
</template>

<script>
import PostArticle from '../components/PostArticle'
import { findPost, neighbours } from '../utils/posts'

export default {
  name: 'Reader',
  components: { PostArticle },
  props: {
    win: { type: Object, required: true }
  },
  computed: {
    post() {
      return findPost(this.win.props.slug)
    },
    links() {
      return neighbours(this.win.props.slug)
    }
  },
  watch: {
    'post.title': {
      immediate: true,
      handler(title) {
        this.$emit('title', title ? `${title}.md` : null)
      }
    }
  },
  methods: {
    go(post) {
      this.$router.push(`/posts/${post.slug}`).catch(() => {})
    }
  }
}
</script>

<style lang="scss">
.reader {
  flex: 1;
  display: flex;
  min-height: 0;
  background: #fff;
}

.reader__page {
  flex: 1;
}

.reader__nav {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 32px 40px;
  font-size: 13px;

  a {
    color: var(--aqua-selection);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.reader__missing {
  padding: 40px;
  text-align: center;
  color: #777;
}
</style>
