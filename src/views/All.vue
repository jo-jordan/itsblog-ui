<template>
  <div class="main-container">
    <transition >
      <BlogList v-if="!showBlogPage" :items="items" @onShowBlogPage="handleBlogPageShow"/>
    </transition>
    <transition >
      <BlogPage v-if="showBlogPage" :blogId="blogId" @onShowBlogPage="handleBlogPageGone"/>
    </transition>
  </div>
</template>

<script>
import BlogList from '../components/BlogList'
import BlogPage from '../components/BlogPage'
import { getList } from '../api/blog'
export default {
  components: { BlogList, BlogPage },
  name: 'All',
  data: () => ({
    title: 'All',
    items: [],
    showBlogPage: false,
    blogId: 0,
    params: {
      next: 1,
      keyword: ''
    }
  }),
  created() {
    this.getList()
  },
  methods: {
    handleBlogPageGone() {
      this.showBlogPage = false
    },
    handleBlogPageShow(val) {
      this.showBlogPage = val.show
      this.blogId = val.data.blogSourceId
    },
    getList(params) {
      getList(this.params).then(res => {
        if (res.code === 1) {
          this.items = res.data
        }
        
        console.log(res)
      })
      console.log('res')
    }
  }
}
</script>

<style lang="scss" scoped>
.main-container {
  width: 100%;
  height: 100%;
}
.overflow-hide {
  overflow: hidden;
}
.overflow-y-auto {
  overflow-y: auto;
}
</style>
