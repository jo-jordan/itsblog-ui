<template>
  <div class="dock-item" @click="dockItemClicked" ref="mItem">
    <img :src="src" :alt="name" :class="{'bounce animated': animated}" style="display: block;height: 60px;width:60px;" width="60px">
    <img :src="indicator" v-if="isIndicatorShow" style="display: table;height: 5.5px;width: auto;margin: auto;padding: 4px" width="2px">
  </div>
</template>

<script>
import BlogWindow from '../components/BlogWindow/BlogWindow'
import ResumeWindow from '../components/ResumeWindow/ResumeWindow'
import MyAppsWindow from '../components/MyAppsWindow/MyAppsWindow'
import RSSWindow from '../components/RSSWindow/RSSWindow'
import indicatorIcon from '../assets/macos-x-indicator.png'
import Event from '../main'
import store from '../store'

export default {
  name: 'DockItem',
  props: {
    src: {
      type: String,
      default: '../assets/macos-x-logo.png'
    },
    name: {
      type: String,
      default: '全部'
    },
    index: {
      type: Number,
      default: 0
    },
    parentLeft: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      animated: false,
      indicator: indicatorIcon,
      isIndicatorShow: false
    }
  },
  mounted() {
    this.$nextTick(() => {
      Event.$on('window-unload', (data) => {
        if (data.itemName === this.name) {
          this.isIndicatorShow = false
        }
      })
    })
    
  },
  methods: {
    dockItemClicked() {
      var self = this

      var width = window.getComputedStyle(this.$refs.mItem).width
      width = Number(width.substring(0, width.indexOf('px')))

      var leftOffset = window.getComputedStyle(this.$refs.mItem).left
      leftOffset = Number(leftOffset.substring(0, leftOffset.indexOf('px')))

      const p1 = this.parentLeft + this.index * (width + 8)
      const p2 = p1 + width
      
      if (!store.getters.loadedItems[this.name]) {
        self.isIndicatorShow = true
        self.animated = true

        switch (this.name) {
          case 'finder': {
            let window = BlogWindow({itemName: this.name}, ()=>{
              setTimeout(()=>{
                self.animated = false
                window.visible = true
                Event.$emit('window-load', {itemName:this.name, p1: p1, p2: p2})
                store.dispatch('app/loadItem', {itemName:this.name, instance: window})
              }, 800)
            })
            break
          }
          case 'email': {
            let window = ResumeWindow({itemName: this.name}, ()=>{
              setTimeout(()=>{
                self.animated = false
                window.visible = true
                Event.$emit('window-load', {itemName:this.name, p1: p1, p2: p2})
                store.dispatch('app/loadItem', {itemName:this.name, instance: window})
              }, 800)
            })
            break
          }
          case 'archieve': {
            let window = RSSWindow({itemName: this.name}, ()=>{
              setTimeout(()=>{
                self.animated = false
                window.visible = true
                Event.$emit('window-load', {itemName:this.name, p1: p1, p2: p2})
                store.dispatch('app/loadItem', {itemName:this.name, instance: window})
              }, 800)
            })
            break
          }
          case 'address': {
            let window = MyAppsWindow({itemName: this.name}, ()=>{
              setTimeout(()=>{
                self.animated = false
                window.visible = true
                Event.$emit('window-load', {itemName:this.name, p1: p1, p2: p2})
                store.dispatch('app/loadItem', {itemName:this.name, instance: window})
              }, 800)
            })
            break
          }
        }
        
      } else {
        self.isIndicatorShow = true
        Event.$emit('window-unfold', {itemName:this.name, p1: p1, p2: p2})
      }
    }
  }
}
</script>

<style>
@charset "UTF-8";

.dock-item {
  margin: 0 4px;
  width: 60px;
  height: 74px;
  display: block;
  float: left;
  opacity: 1.0;
}
.animated {
  -webkit-animation-duration: .8s;
  animation-duration: .8s;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-timing-function: linear;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  -webkit-animation-iteration-count: infinite;
}
@-webkit-keyframes bounce {
  0%, 100% {
    -webkit-transform: translateY(0);
  }
  50% {
    -webkit-transform: translateY(-25px);
  }
}
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-25px);
  }
}
.bounce {
  -webkit-animation-name: bounce;
  animation-name: bounce;
}
#animated-example {
  width: 20px;
  height: 20px;
  background-color: red;
  position: relative;
  top: 100px;
  left: 100px;
  border-radius: 50%;
}
</style>