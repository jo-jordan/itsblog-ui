<template>
  <div class="sherlock" :class="{ 'is-inactive': !focused }">
    <form class="sherlock__bar" role="search" @submit.prevent="search">
      <img :src="hat" alt="" class="sherlock__hat">
      <input
        ref="input"
        v-model="query"
        type="search"
        class="aqua-search sherlock__input"
        placeholder="输入关键词，搜索全部文章"
        aria-label="搜索关键词"
      >
      <button type="submit" class="sherlock__go" aria-label="搜索">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6" /><path d="M14.5 14.5 20 20" /></svg>
      </button>
    </form>

    <div class="sherlock__results aqua-scroll">
      <table v-if="results.length" class="sherlock__table">
        <thead>
          <tr><th>标题</th><th>分类</th><th>日期</th><th>相关性</th></tr>
        </thead>
        <tbody>
          <tr
            v-for="result in results"
            :key="result.post.slug"
            :class="{ 'is-selected': selected === result.post.slug }"
            @click="selected = result.post.slug"
            @dblclick="open(result.post)"
          >
            <td class="sherlock__title">{{ result.post.title }}</td>
            <td>{{ result.post.category }}</td>
            <td>{{ result.post.date }}</td>
            <td>
              <span class="sherlock__relevance" :aria-label="`相关性 ${Math.round(result.relevance * 100)}%`">
                <span :style="{ width: `${Math.max(8, result.relevance * 100)}%` }" />
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="sherlock__empty">{{ searched ? '没有找到相关文章' : '在上方输入关键词后按回车' }}</p>
    </div>

    <div class="sherlock__detail">
      <template v-if="selectedPost">
        <strong>{{ selectedPost.title }}</strong>
        <p>{{ selectedPost.summary || '双击结果即可阅读全文。' }}</p>
        <button type="button" class="aqua-button aqua-button--default" @click="open(selectedPost)">阅读</button>
      </template>
      <span v-else>{{ results.length ? `找到 ${results.length} 篇文章` : 'Sherlock' }}</span>
    </div>
  </div>
</template>

<script>
import { findPost, searchPosts } from '../utils/posts'
import hat from '../assets/macos-x-search.png'

export default {
  name: 'Sherlock',
  props: {
    win: { type: Object, required: true },
    focused: { type: Boolean, default: false }
  },
  data() {
    return {
      hat,
      query: '',
      results: [],
      searched: false,
      selected: null
    }
  },
  computed: {
    selectedPost() {
      return this.selected ? findPost(this.selected) : null
    }
  },
  mounted() {
    this.$refs.input.focus()
  },
  methods: {
    search() {
      this.results = searchPosts(this.query)
      this.searched = true
      this.selected = this.results.length ? this.results[0].post.slug : null
    },
    open(post) {
      this.$router.push(`/posts/${post.slug}`).catch(() => {})
    }
  }
}
</script>

<style lang="scss">
.sherlock {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.sherlock__bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
}

.sherlock__hat {
  width: 40px;
  height: 40px;
}

.sherlock__input {
  flex: 1;
  height: 24px;
  border-radius: 12px;
  font-size: 14px;
}

// Big round gel "search" button
.sherlock__go {
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1px solid var(--aqua-gel-border);
  border-radius: 50%;
  background: radial-gradient(circle at 50% 30%, #fff 0%, var(--aqua-gel-top) 25%, var(--aqua-gel-mid) 60%, var(--aqua-gel-bottom) 100%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.35);
  cursor: default;

  svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: #0e3c7a;
    stroke-width: 2.6;
    stroke-linecap: round;
  }

  &:active {
    filter: brightness(0.85);
  }
}

.sherlock__results {
  flex: 1;
  margin: 0 14px;
  border: 1px solid #8c8c8c;
  background: #fff;
}

.sherlock__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  th {
    position: sticky;
    top: 0;
    height: 18px;
    padding: 0 8px;
    border-right: 1px solid #b5b5b5;
    border-bottom: 1px solid #8c8c8c;
    font-weight: normal;
    text-align: left;
    background: linear-gradient(to bottom, #fdfdfd, #dedede);
  }

  td {
    height: 20px;
    padding: 0 8px;
    white-space: nowrap;
  }

  tbody tr:nth-child(even) {
    background: #edf3fe;
  }

  tbody tr.is-selected {
    color: #fff;
    background: var(--aqua-selection);
  }
}

.sherlock.is-inactive tbody tr.is-selected {
  color: #000;
  background: var(--aqua-selection-inactive);
}

.sherlock__title {
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sherlock__relevance {
  display: block;
  width: 80px;
  height: 8px;
  border: 1px solid #7a8ea8;
  background: #fff;

  span {
    display: block;
    height: 100%;
    background: repeating-linear-gradient(to right, #3d6fbf 0 3px, #8db6f0 3px 4px);
  }
}

.sherlock__empty {
  padding: 30px;
  text-align: center;
  color: #888;
}

.sherlock__detail {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 8px 14px;

  p {
    flex: 1;
    margin: 0;
    overflow: hidden;
    font-size: 12px;
    color: #444;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
