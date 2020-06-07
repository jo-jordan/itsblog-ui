<template>
  <div id="app" class="app" :style="style" ref="mApp">
    <status-bar />
    <router-link to="/"></router-link>
    <router-view/>

    <dock class="dock-style" />
  </div>
</template>

<script>
import StatusBar from './components/StatusBar'
import Dock from './components/Dock'
import store from './store'

export default {
  components: { StatusBar, Dock },
  name: 'App',
  data() {
    return {
      windowHeight: 0,
      style: ''
    }
  },
  watch: {
    windowHeight(newHeight, oldHeight) {
      let width = newHeight * 4 / 3
      this.style = `width:${width}px; height:${newHeight}px`
      store.dispatch('app/setWidth', {
        width
      })
      store.dispatch('app/setHeight', {
        newHeight
      })
    }
  },
  mounted () {
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize);
    })
    this.onResize()
  },
  methods: {
    onResize() {
      this.windowHeight = window.innerHeight
    }
  },

  beforeDestroy() { 
    window.removeEventListener('resize', this.onResize);
  }
}
</script>

<style>

body {
  margin: auto;
  background: black;
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none;
}
.app {
  z-index: 1;
  margin: auto;
  background: no-repeat center url('./assets/wallpaper-default.png');
  background-size: contain;
}
</style>
