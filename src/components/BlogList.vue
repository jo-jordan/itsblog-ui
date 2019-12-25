<template>
  <v-list min-width="550" three-line>
    <template v-for="(item, index) in items">
      <v-subheader
        v-if="item.header"
        :key="item.header"
        v-text="item.header"
      ></v-subheader>

      <v-divider
        v-else-if="item.divider"
        :key="index"
        :inset="item.inset"
      ></v-divider>

      <v-list-item
        v-else
        :key="item.title"
        @click="handleClick(item)"
      >
        <v-list-item-avatar>
          <v-img :src="item.icon"></v-img>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title v-html="item.title"></v-list-item-title>
          <v-list-item-subtitle v-html="item.updateTime"></v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-action>
          <v-list-item-action-text>Read Count: {{item.readCount}}</v-list-item-action-text>
          <v-list-item-action-text>Like: {{item.likeCount}}</v-list-item-action-text>
          <v-list-item-action-text>Duration: {{item.readDuration}}</v-list-item-action-text>

        </v-list-item-action>
      </v-list-item>
    </template>
  </v-list>
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
