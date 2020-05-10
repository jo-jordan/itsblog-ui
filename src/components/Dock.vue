<template>
  <div class="dock-backgound">
    <div class="container">
      <dock-item :src="item.src" v-for="(item, index) in items" :key="index" />
    </div>
    
  </div>
</template>

<script>
import DockItem from './DockItem'
import mailIcon from '../assets/macos-x-mail.png'
import finderIcon from '../assets/macos-x-finder.png'
import searchIcon from '../assets/macos-x-search.png'
import defaultIcon from '../assets/macos-x-logo.png'
export default {
  name: 'Dock',
  components: { DockItem },
  data() {
    return {
      items: [
        {
          name: '全部',
          src: finderIcon
        },
        {
          name: '全部',
          src: mailIcon
        },
        {
          name: '全部',
          src: searchIcon
        },
      ]
    }
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