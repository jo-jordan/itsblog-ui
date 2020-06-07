<template>
  
</template>

<script>
import { getDashboard, findById } from '../api/blog'

export default {
  name: 'Dashboard',
  data: () => ({
    length: 3,
    window: 0,
    blogs: [],
    blogSourceMap: new Map()
  }),
  created() {
    this.getDashboard()
  },
  methods: {
    getDashboard() {
      getDashboard().then(res => {
        this.blogs = res.data
        this.blogSourceMap = new Map()
        this.blogs.forEach(item => {
          this.findById(item.blogSourceId)
        })
      })
    },
    findById(id) {
      findById({id}).then(res => {
        const obj = { id: id, data: res.data }
        
        this.blogSourceMap.set(id, decodeURIComponent(escape(window.atob(res.data.blogHtml))))
      })
    }
  }
}

</script>

<style lang="scss" scoped>
.remove-underline {
  text-decoration: none;
}
.limit-height {
  height: 400px;
}
.over-flow {
  overflow-y: hidden;
}
</style>
