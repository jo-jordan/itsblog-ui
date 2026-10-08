<template>
  <div class="finder" :class="{ 'is-inactive': !focused }">
    <div class="finder__toolbar">
      <div class="finder__history">
        <button type="button" class="aqua-button finder__nav" :disabled="!canGoBack" aria-label="后退" @click="goBack">◀</button>
        <button type="button" class="aqua-button finder__nav" :disabled="!canGoForward" aria-label="前进" @click="goForward">▶</button>
      </div>
      <span class="finder__location">
        <img :src="trash ? trashIcon : hardDisk" alt="">
        {{ trash ? '废纸篓' : 'Macintosh HD' }}
      </span>
      <input
        v-if="!trash"
        v-model.trim="query"
        type="search"
        class="aqua-search finder__search"
        placeholder="搜索文章"
        aria-label="搜索文章"
      >
    </div>

    <div v-if="trash" class="finder__empty">
      <img :src="trashIcon" alt="">
      <p>废纸篓是空的</p>
    </div>

    <div v-else-if="!posts.length" class="finder__empty">
      <img :src="folderIcon" alt="">
      <p>还没有文章</p>
    </div>

    <div v-else class="finder__columns">
      <ul class="finder__column aqua-scroll" aria-label="分类">
        <li v-if="query" class="aqua-row is-selected">
          <img :src="searchIcon" alt="" class="finder__row-icon">
          <span class="finder__row-label">搜索 “{{ query }}”</span>
        </li>
        <template v-else>
          <li
            v-for="category in categories"
            :key="category"
            class="aqua-row"
            :class="{ 'is-selected': category === selection.category }"
            @click="select({ category, slug: null })"
          >
            <img :src="folderIcon" alt="" class="finder__row-icon">
            <span class="finder__row-label">{{ category }}</span>
            <span class="finder__row-arrow">▶</span>
          </li>
        </template>
      </ul>

      <ul class="finder__column aqua-scroll" aria-label="文章">
        <li
          v-for="post in visiblePosts"
          :key="post.slug"
          class="aqua-row"
          :class="{ 'is-selected': post.slug === selection.slug }"
          :title="post.title"
          @click="select({ category: selection.category, slug: post.slug })"
          @dblclick="openPost(post)"
        >
          <img :src="documentIcon" alt="" class="finder__row-icon">
          <span class="finder__row-label">{{ post.title }}</span>
        </li>
        <li v-if="query && !visiblePosts.length" class="finder__no-results">没有找到匹配的文章</li>
      </ul>

      <section class="finder__preview aqua-scroll" aria-label="预览">
        <template v-if="selectedPost">
          <div class="finder__preview-bar">
            <button type="button" class="aqua-button aqua-button--default" @click="openPost(selectedPost)">打开</button>
          </div>
          <post-article :post="selectedPost" />
        </template>
        <div v-else class="finder__hint">
          <img :src="selection.category ? folderIcon : hardDisk" alt="">
          <p>{{ selection.category || 'Macintosh HD' }}</p>
          <small>{{ hint }}</small>
        </div>
      </section>
    </div>

    <footer class="finder__status">{{ status }}</footer>
  </div>
</template>

<script>
import PostArticle from '../components/PostArticle'
import { categories, findPost, posts, postsIn, searchPosts } from '../utils/posts'
import folderIcon from '../assets/icons/folder.svg'
import documentIcon from '../assets/icons/document.svg'
import hardDisk from '../assets/icons/harddisk.svg'
import trashIcon from '../assets/icons/trash.svg'
import searchIcon from '../assets/macos-x-search.png'

export default {
  name: 'Finder',
  components: { PostArticle },
  props: {
    win: { type: Object, required: true },
    focused: { type: Boolean, default: false }
  },
  data() {
    const first = { category: categories[0] || null, slug: null }
    return {
      posts,
      categories,
      query: '',
      history: [first],
      historyIndex: 0,
      folderIcon,
      documentIcon,
      hardDisk,
      trashIcon,
      searchIcon
    }
  },
  computed: {
    trash() {
      return this.win.props.location === 'trash'
    },
    selection() {
      return this.history[this.historyIndex]
    },
    visiblePosts() {
      if (this.query) {
        return searchPosts(this.query).map(result => result.post)
      }
      return this.selection.category ? postsIn(this.selection.category) : []
    },
    selectedPost() {
      return this.selection.slug ? findPost(this.selection.slug) : null
    },
    canGoBack() {
      return this.historyIndex > 0
    },
    canGoForward() {
      return this.historyIndex < this.history.length - 1
    },
    hint() {
      return this.selection.category ? `${postsIn(this.selection.category).length} 篇文章，双击即可在新窗口阅读` : '选择左侧的分类'
    },
    status() {
      if (this.trash) {
        return '0 项'
      }
      const count = this.query ? this.visiblePosts.length : this.selection.category ? this.visiblePosts.length : this.categories.length
      return `${count} 项 · 共 ${this.posts.length} 篇文章`
    },
    windowTitle() {
      if (this.trash) {
        return '废纸篓'
      }
      return this.query ? `搜索 “${this.query}”` : this.selection.category || 'Macintosh HD'
    }
  },
  watch: {
    windowTitle: {
      immediate: true,
      handler(title) {
        this.$emit('title', title)
      }
    }
  },
  methods: {
    select(selection) {
      this.history = this.history.slice(0, this.historyIndex + 1).concat(selection)
      this.historyIndex = this.history.length - 1
    },
    goBack() {
      this.historyIndex--
    },
    goForward() {
      this.historyIndex++
    },
    openPost(post) {
      this.$router.push(`/posts/${post.slug}`).catch(() => {})
    }
  }
}
</script>

<style lang="scss">
.finder {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.finder__toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 38px;
  padding: 0 10px;
  border-bottom: 1px solid #9c9c9c;
}

.finder__history {
  display: flex;
}

.finder__nav {
  min-width: 0;
  width: 30px;
  padding: 0;
  font-size: 9px;

  &:first-child {
    border-radius: 11px 0 0 11px;
  }

  &:last-child {
    border-left: 0;
    border-radius: 0 11px 11px 0;
  }
}

.finder__location {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: bold;

  img {
    width: 18px;
    height: 18px;
  }
}

.finder__search {
  width: 180px;
  margin-left: auto;
}

.finder__columns {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(150px, 0.8fr) minmax(190px, 1.1fr) minmax(260px, 2.4fr);
  min-height: 0;
  background: #fff;
}

.finder__column {
  margin: 0;
  padding: 2px 0;
  list-style: none;
  border-right: 1px solid #c5c5c5;
}

.finder__row-icon {
  flex: none;
  width: 16px;
  height: 16px;
}

.finder__row-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.finder__row-arrow {
  font-size: 8px;
  color: #6b6b6b;

  .is-selected > & {
    color: #fff;
  }
}

.finder__no-results {
  padding: 12px;
  color: #888;
}

.finder__preview {
  position: relative;
}

.finder__preview-bar {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  justify-content: flex-end;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid #eee;
}

.finder__preview .post-article {
  padding: 18px 22px 32px;
}

.finder__hint,
.finder__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 100%;
  color: #444;

  img {
    width: 96px;
    height: 96px;
  }

  p {
    margin: 6px 0 0;
    font-weight: bold;
  }

  small {
    color: #888;
  }
}

.finder__empty {
  flex: 1;
  background: #fff;
}

.finder__status {
  flex: none;
  height: 18px;
  font-size: 11px;
  line-height: 18px;
  text-align: center;
  color: #333;
  border-top: 1px solid #9c9c9c;
}

@media (max-width: 767px) {
  .finder__columns {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr;
  }

  .finder__column {
    max-height: 120px;
    border-right: 0;
    border-bottom: 1px solid #c5c5c5;
  }

  .finder__search {
    width: 120px;
  }
}
</style>
