<template>
  <div v-html="source">
  </div>
</template>

<script>
import { getList, findById } from '../api/blog'
export default {
  name: 'Keywords',
  data: () => ({
    source: ''
  }),
  created() {
    findById({id: 1320045424}).then(res => {
      
      this.source = decodeURIComponent(escape(window.atob(res.data.blogHtml)))
    })
  }
}
</script>
