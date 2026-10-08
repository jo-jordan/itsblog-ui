<template>
  <div @mousedown="bringWindowToTop">
    <div v-show="visible" class="window-backgound" :style="afterDragStyle" ref="mContainer">
      <div class="window-top-action-bar" @mousedown="startDrag">
        <div class="window-top-action-bar-item-outter-common">
          <div class="window-top-action-bar-close-inner window-top-action-bar-item-common">
            <div class="window-top-action-bar-inner-text" @click="unload">x</div>
          </div>
        </div>
        <div class="window-top-action-bar-item-outter-common">
          <div class="window-top-action-bar-min-inner window-top-action-bar-item-common">
            <div class="window-top-action-bar-inner-text" @click="fold">-</div>
          </div>
        </div>
        <div class="window-top-action-bar-item-outter-common">
          <div class="window-top-action-bar-max-inner window-top-action-bar-item-common">
            <div class="window-top-action-bar-inner-text">+</div>
          </div>
        </div>

        <div class="window-top-title">
          <img style="height: 100%;vertical-align: middle;" :src="titleIcon" alt="Blog Viewer" width="14px">
          My App List
        </div>
      </div>
      <div class="window-content">
      </div>
    </div>
    <canvas ref="mCanvas"></canvas>
  </div>
</template>

<script>
import store from '../../store'
import titleIcon from '../../assets/macos-x-address-book.png'
import { bringWindowToTop, fold, unfold, unload, draw, clearRect, scale, stopDrag, startDrag, doDrag, resize, onWindowUnfold, onWindowLoad, attachWindowEvents, detachWindowEvents } from '../../common/Window'

export default {
  name: 'Window',
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
        top: centerTop + 'px',
        zIndex: 0
      }

      this.canvas = this.$refs.mCanvas
      this.ctx = this.canvas.getContext("2d");
    })

    this.attachWindowEvents()
  },
  beforeDestroy() {
    this.detachWindowEvents()
  },
  methods: {
    bringWindowToTop, fold, unfold, unload, draw, clearRect, scale, stopDrag, startDrag, doDrag, resize,
    onWindowUnfold, onWindowLoad, attachWindowEvents, detachWindowEvents
  }
}
</script>

<style lang="scss" scoped>
@import url('../../style/Window.scss');

.window-top-action-bar:hover {
  .window-top-action-bar-inner-text {
    color: rgba(0,0,0, 0.6);
  }
}
</style>