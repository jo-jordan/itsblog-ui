<template>

</template>

<script>

export default {
  name: 'BlogList',
  components: {
  },
  props: {
    items: Array,
    onShowBlogPage: Object
  },
  data: () => ({
    title: 'All'
  }),
  methods: {
    handleClick(item) {
      this.$emit('onShowBlogPage', {show: true, data: item})
    }
  }
}
</script>

<style lang="scss" scoped>
.overflow-hide {
  overflow: hidden;
}
.overflow-y-auto {
  overflow-y: auto;
}
.search-bar {
  width: 20px;
}
</style>
