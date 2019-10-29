<template>
  <div class="blog-page-contailer">
    <v-btn @click="handleClick" fab dark large left top>
      <v-icon dark>mdi-arrow-left</v-icon>
    </v-btn>
    <div class="blog-contailer" v-html="blog">
    </div>
  </div>
</template>

<script>
import { findById } from '../api/blog'
export default {
  name: 'BlogPage',
  props: {
    blogId: Number,
    onShowBlogPage: Object
  },
  created() {
    this.getBlog()
  },
  watch: {
    blogId: function(val) {
      this.getBlog()
    }
  },
  data() {
    return {
      blog: ''
    }
  },
  methods: {
    handleClick() {
      this.$emit('onShowBlogPage', {show: false})
    },
    getBlog() {
      findById({id: this.blogId}).then(res => {
        if (res.code === 1) {
          this.blog = decodeURIComponent(escape(window.atob(res.data.blogHtml)))
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.blog-page-contailer{
  width: 100%;
  height: 100%;
}
.blog-contailer{
  width: 100%;
  height: 100%;
  padding: 20px;
}
</style>
