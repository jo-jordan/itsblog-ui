<template>
  <div @mousedown="bringWindowToTop">
    <div v-show="visible" class="window-backgound" :style="afterDragStyle" ref="mContainer">
      <div class="window-top-action-bar" @mousedown="startDrag">
        <div class="window-top-action-bar-item-outter-common">
          <div class="window-top-action-bar-close-inner window-top-action-bar-item-common">
            <div class="window-top-action-bar-inner-text" @click="unload">x</div>
          </div>
        </div>
        
        <div class="window-top-title">
          <img style="height: 100%;vertical-align: middle;" :src="titleIcon" alt="About" width="14px">
          About
        </div>
      </div>
      <div class="content-details">
        <article class="markdown-body" v-html="markedText"></article>
      </div>
    </div>
  </div>
</template>

<script>
import store from '../../store'
import Event from '../../main'
import titleIcon from '../../assets/logo.png'
import { bringWindowToTop, stopDrag, startDrag, doDrag, resize } from '../../common/Window'
import marked from 'marked'
import 'github-markdown-css'

export default {
  name: 'SystemInfoDialog',
  data () {
    return {
      titleIcon: titleIcon,
      afterDragStyle: {},
      visible: false,
      canvasVisible: false,
      dragging: false,
      x: 0,
      y: 0,
      lastX: 0,
      lastY: 0,
      lastTop: 0,
      lastLeft: 0,

      maxLeft:0,
      maxTop:0,
      minLeft:0,
      minTop:0,
      canvas: null,
      ctx: null,
      p1:0,
      p2:0,
      itemName: '',

      markedText: '',

      style: {
        zIndex: 10
      },
    }
  },
  mounted() {
    // Calculate center left and top value
    this.$nextTick(() => {
      var width = window.getComputedStyle(this.$refs.mContainer).width
      width = Number(width.substring(0, width.indexOf('px')))

      var height = window.getComputedStyle(this.$refs.mContainer).height
      height = Number(height.substring(0, height.indexOf('px')))

      var centerLeft = window.innerWidth / 2 - width / 2
      var centerTop = window.innerHeight / 2 - height / 2

      this.afterDragStyle = {
        left: centerLeft + 'px',
        top: centerTop + 'px'
      }

      Event.$on('about-dialog-load', (data) => {
        
      })
    })

    this.markedText = marked(
        '### This site is still building...' +
        '\r\n' +
        'Any question if you want, please: ' +
        '\r\n' +
        '- Tweet me: <a href="https://twitter.com/maoyidan" target="_blank">@maoyidan</a>' +
        '\r\n' +
        '- Email me: <a href="mailto:tyyzmyd@gmail.com" target="_blank">tyyzmyd@gmail.com</a>' +
        '\r\n' +
        '- Help me: <a href="https://github.com/lzjlxebr/itsblog-ui" target="_blank">itsblog-ui</a>' +
        '\r\n'
    )

    window.addEventListener('mouseup', this.stopDrag);
    window.addEventListener('mousemove', this.doDrag);
  },
  methods: {
    unload() {
      store.dispatch('app/unloadItem', {itemName: 'about'})
    },
    bringWindowToTop, stopDrag, startDrag, doDrag, resize
  }
}
</script>

<style lang="scss" scoped>
@import url('../../style/Window.scss');
.content-details {
  padding: 22px;
}

.window-backgound {
  border: 1px solid black;
  position: fixed;
  height: 240px;
  width: 400px;
  background: url("../../assets/normal-bg.svg") top left;
  box-shadow: 0px 6px 16px black;
  border-radius: 8px 8px 0 0;
}

.window-top-action-bar:hover {
  .window-top-action-bar-inner-text {
    color: rgba(0,0,0, 0.6);
  }
}
</style>