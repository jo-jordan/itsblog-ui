<template>

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
      keyword: '',
      isArchived: 1
    }
  }),
  created() {
    this.getList()
  },
  methods: {
    handleClick() {
      this.showBlogPage = false
      this.getList()
    },
    handleBlogPageGone() {
      this.showBlogPage = false
    },
    handleBlogPageShow(val) {
      this.showBlogPage = val.show
      this.blogId = val.data.blogSourceId
    },
    getList() {
      getList(this.params).then(res => {
        if (res.code === 1) {
          this.items = res.data
        }
      })
    }
  }
}
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all .18s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-leave-active {
  transition: all .18s cubic-bezier(1.0, 0.8, 0.5, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active for below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}

.scale-fade-enter-active {
  transition: all .28s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.scale-fade-leave-active {
  transition: all .28s cubic-bezier(1.0, 0.8, 0.5, 1.0);
}
.scale-fade-enter, .scale-fade-leave-to {
  transform: scale(0);
  opacity: 0;
}
</style>

<style lang="scss" scoped>
.fab-back-position{
  position: fixed;
  left: 280px;
}
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
