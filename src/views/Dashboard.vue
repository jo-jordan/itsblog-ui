<template>

</template>

<script>
export default {
  name: 'Dashboard',
  data: () => ({
    drawer: null,
    length: 3,
    window: 0,
    curRoute: ''
  }),
  created() {
  },
  computed: {
    routeKey() {
      return this.$route.path
    }
  },
  methods: {
    handleViewChange(e) {
    }
  }
}

</script>

<style lang="scss" scoped>
.remove-underline {
  text-decoration: none;
}
</style>
