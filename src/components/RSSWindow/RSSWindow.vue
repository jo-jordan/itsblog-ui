<template>
  <div :style="style">
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
          RSS
        </div>
      </div>
      <div class="window-content">
        <slot name="content"></slot>
      </div>
    </div>
    <canvas></canvas>
  </div>
</template>

<script>
import store from '../../store'
import Event from '../../main'
import titleIcon from '../../assets/macos-x-search.png'
import { bringWindowToTop, fold, unfold, unload, draw, clearRect, scale, stopDrag, startDrag, doDrag, resize} from '../../common/Window'

export default {
  name: 'RSSWindow',
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
        top: centerTop + 'px'
      }

      this.canvas = document.querySelector("canvas");
      this.ctx = this.canvas.getContext("2d");
      Event.$on('window-unfold', (data) => {
        if (data.itemName === this.itemName && this.visible === false) {
          this.unfold()
          this.p1 = data.p1
          this.p2 = data.p2
        }
      })

      Event.$on('window-load', (data) => {
        if (data.itemName === this.itemName) {
          this.p1 = data.p1
          this.p2 = data.p2
        }
      })
    })

    window.addEventListener('mouseup', this.stopDrag);
    window.addEventListener('mousemove', this.doDrag);
  },
  methods: {
    bringWindowToTop, unload, fold, unfold, draw, clearRect, scale, stopDrag, startDrag, doDrag, resize
  }
}
</script>

<style lang="scss" scoped>
@import url('../../style/Window.scss');

.window-backgound {
  border: 1px solid black;
  position: fixed;
  height: 720px;
  width: 900px;
  background: url("../../assets/normal-bg.svg") top left;
  box-shadow: 0px 6px 16px black;
  border-radius: 8px 8px 0 0;
}
</style>