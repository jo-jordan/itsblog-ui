<template>
  <div class="dock-backgound" ref="mItem">
    <div class="container">
      <dock-item :src="item.src" v-for="(item, index) in items" :key="index" v-bind:name="item.name" :app-name="item.appName" :index="index" :parentLeft="left" />
    </div>
    
  </div>
</template>

<script>
import DockItem from './DockItem'
import mailIcon from '../assets/macos-x-mail.png'
import finderIcon from '../assets/macos-x-finder.png'
import searchIcon from '../assets/macos-x-search.png'
import addresssBook from '../assets/macos-x-address-book.png'
import defaultIcon from '../assets/macos-x-logo.png'
export default {
  name: 'Dock',
  components: { DockItem },
  data() {
    return {
      items: [
        {
          name: 'finder',
          src: finderIcon,
          appName: 'Blog Viewer'
        },
        {
          name: 'email',
          src: mailIcon,
          appName: 'Resume'
        },
        {
          name: 'archieve',
          src: searchIcon,
          appName: 'RSS'
        },
        {
          name: 'address',
          src: addresssBook,
          appName: 'My Apps List'
        },
      ],
      left: 0
    }
  },
  mounted() {
    var width = window.getComputedStyle(this.$refs.mItem).width
    width = Number(width.substring(0, width.indexOf('px')))

    var leftOffset = window.getComputedStyle(this.$refs.mItem).left
    this.left = Number(leftOffset.substring(0, leftOffset.indexOf('px'))) - width / 2
  }
}
</script>

<style>
.dock-backgound {
  
  bottom: 0;
  transform: translate(-50%, 0%);
  margin: auto;
  position: fixed;
  left: 50%;
  height: 74px;
  min-width: 60px;
  border-top: 1px solid rgba(255, 255, 255, 0.8);
  border-left: 1px solid rgba(255, 255, 255, 0.8);
  border-right: 1px solid rgba(255, 255, 255, 0.8);
}
.container {
  padding: 0 4px;
  background: url("../assets/opcity-bg.svg") top left;
  height: inherit;
  width: inherit;
}
</style>