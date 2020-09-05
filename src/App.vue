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
      appHeight: 0,
      appWidth: 0,
      style: ''
    }
  },
  watch: {
    appHeight(newVal, oldVal) {
      this.style = `width:${this.appWidth}px; height:${newVal}px`
      store.dispatch('app/setHeight', {
        newVal
      })
    },
    appWidth(newVal, oldVal) {
      this.style = `width:${newVal}px; height:${this.appHeight}px`
      store.dispatch('app/setWidth', {
        newVal
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
      this.appWidth = window.innerWidth
      this.appHeight = window.innerHeight
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
  background: no-repeat url('./assets/wallpaper-default.png');
  background-size: cover;
}
</style>
