<template>
  <div>
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
      itemName: ''
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
    unload() {
      store.dispatch('app/unloadItem', {itemName: this.itemName})
      Event.$emit('window-unload', {itemName:this.itemName})
    },
    fold() {
      var width = window.getComputedStyle(this.$refs.mContainer).width
      width = Number(width.substring(0, width.indexOf('px')))

      var height = window.getComputedStyle(this.$refs.mContainer).height
      height = Number(height.substring(0, height.indexOf('px')))

      var topOffset = window.getComputedStyle(this.$refs.mContainer).top
      topOffset = Number(topOffset.substring(0, topOffset.indexOf('px')))

      var leftOffset = window.getComputedStyle(this.$refs.mContainer).left
      leftOffset = Number(leftOffset.substring(0, leftOffset.indexOf('px')))
      this.canvasVisible = true
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight  - topOffset - 76
      this.canvas.style.top = topOffset + 'px'
      this.canvas.style.zIndex = 1
      this.visible = false
      
      var s1 = leftOffset
      var s2 = leftOffset + width
      // TODO
      var p1 = this.p1
      var p2 = this.p2
      var self = this
      this.scale(s1, s2, p1, p2, "zoomout", function () {
        self.canvas.style.zIndex = -1
        self.canvasVisible = false
        self.visible = false
        self.canvas.width = 0
      })
    },
    unfold() {
      
      var width = window.getComputedStyle(this.$refs.mContainer).width
      width = Number(width.substring(0, width.indexOf('px')))

      var height = window.getComputedStyle(this.$refs.mContainer).height
      height = Number(height.substring(0, height.indexOf('px')))

      var topOffset = window.getComputedStyle(this.$refs.mContainer).top
      topOffset = Number(topOffset.substring(0, topOffset.indexOf('px')))

      var leftOffset = window.getComputedStyle(this.$refs.mContainer).left
      leftOffset = Number(leftOffset.substring(0, leftOffset.indexOf('px')))
      this.canvasVisible = true
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight  - topOffset - 76
      this.canvas.style.top = topOffset + 'px'
      this.canvas.style.zIndex = 1
      
      this.visible = false
      var s1 = leftOffset
      var s2 = leftOffset + width
      // TODO
      var p1 = this.p1
      var p2 = this.p2
      var self = this
      this.scale(s1, s2, p1, p2, "zoomin", function () {
        self.canvas.style.zIndex = -1
        self.canvasVisible = false
        self.visible = true
        self.canvas.width = 0
      })
    },
    draw(s1, s2, p1, p2) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.beginPath();
      this.ctx.moveTo(s1, 0);
      this.ctx.bezierCurveTo(s1, this.canvas.height * 0.2, p1, this.canvas.height * 0.6, p1, this.canvas.height);
      this.ctx.lineTo(p2, this.canvas.height);
      this.ctx.bezierCurveTo(p2, this.canvas.height * 0.6, s2, this.canvas.height * 0.2, s2, 0);
      this.ctx.lineTo(s1, 0);
      this.ctx.fillStyle = "rgba(255, 255, 255, 1)";
      this.ctx.fill();
    },
    clearRect(y, speed, type) {
      if(type === "zoomout") {
        this.ctx.clearRect(0, y, this.canvas.width, speed);
      } else if(type === "zoomin") {
        this.ctx.clearRect(0, 0, this.canvas.width, y);
      }
    },
    scale(s1, s2, p1, p2, type, callback) {
      var dist1 = Math.abs(p1 - s1);
      var dist2 = Math.abs(p2 - s2);
      var d1, d2, _p1, _p2, speed1, y, speed2;
      var self = this
      if(dist1 === 0 || dist2 === 0) {
        dist1 = 1;
        dist2 = 1;
      }
      speed1 = 30;
      speed2 = 30;
      if(type === "zoomout") {
        d1 = (p1 >= s1 && p1 < speed1) ? 0 : p1 < s1 ? -speed1 : speed1;
        d2 = p2 < s2 ? -speed1 * dist2 / dist1 : speed1 * dist2 / dist1;
        _p1 = s1;
        _p2 = s2;
        y = 0;
        var t = setInterval(function () {
          if(_p2 - _p1 <= p2 - p1) {
            clearInterval(t);
            var timer = setInterval(function () {
              if(y > self.canvas.height) {
                clearInterval(timer);
                callback && callback();
              }
              self.clearRect(y, speed2, type);
              y += speed2;
              speed2 += 1;
            }, 14);
          }
          self.draw(s1, s2, _p1, _p2);
          _p1 += d1;
          _p2 += d2;
          if((d1 < 0 && _p1 <= p1) || (d1 > 0 && _p1 >= p1)) {
            _p1 = p1;
          }
          if((d2 < 0 && _p2 <= p2) || (d2 > 0 && _p2 >= p2)) {
            _p2 = p2;
          }
        }, 14);
      } else if(type === "zoomin") {
        d1 = (p1 >= s1 && p1 < speed1) ? 0 : p1 < s1 ? speed1 : -speed1;
        d2 = p2 < s2 ? speed1 * dist2 / dist1 : -speed1 * dist2 / dist1;
        _p1 = p1;
        _p2 = p2;
        y = self.canvas.height;
        var timer = setInterval(function () {
          if(y <= 0) {
            clearInterval(timer);
            var t = setInterval(function () {
              if(_p2 - _p1 >= s2 - s1) {
                clearInterval(t);
                callback && callback();
              }
              self.draw(s1, s2, _p1, _p2);
              _p1 += d1;
              _p2 += d2;
            }, 14);
          }
          self.draw(s1, s2, _p1, _p2);
          self.clearRect(y, speed2, type);
          y -= speed2;
          speed2 += 1;
        }, 14);
      }
    },
    stopDrag() {
      this.dragging = false
    },
    startDrag(event) {
      this.dragging = true
      this.lastX = event.clientX
      this.lastY = event.clientY
      
      const left = window.getComputedStyle(this.$refs.mContainer).left
      this.lastLeft = Number(left.substring(0, left.indexOf('px')))

      const top = window.getComputedStyle(this.$refs.mContainer).top
      this.lastTop = Number(top.substring(0, top.indexOf('px')))

      var width = window.getComputedStyle(this.$refs.mContainer).width
      width = Number(width.substring(0, width.indexOf('px')))

      var height = window.getComputedStyle(this.$refs.mContainer).height
      height = Number(height.substring(0, height.indexOf('px')))

      // minLeft = window.width - app.width
      // var appWidth = store.getters.appWidth
      this.minLeft = 0

      // maxLeft = window.width - container.width
      this.maxLeft = window.innerWidth - width - this.minLeft
      
      // minTop = statusbar.height
      this.minTop = 22

      // maxTop = container.height + dock.height
      this.maxTop = 74 + outerHeight
    },
    doDrag(event) {
      if (this.dragging) {
        this.x = event.clientX
        this.y = event.clientY

        this.resize()
      }
    },
    resize() {
      let offsetX = this.x - this.lastX
      let offsetY = this.y - this.lastY

      let curLeft = Math.ceil(this.lastLeft + offsetX)
      let curTop = Math.ceil(this.lastTop + offsetY)

      let obj = this.afterDragStyle
      if (curLeft >= this.minLeft && curLeft <= this.maxLeft) {
        Object.assign(obj, {left: curLeft + 'px'})
      }

      if (curTop >= this.minTop) {
        Object.assign(obj, {top: curTop + 'px'})
      }
      
      this.afterDragStyle = null
      this.afterDragStyle = obj
    }
  }
}
</script>

<style lang="scss" scoped>
canvas{position: fixed;z-index:-1;}
.window-top-action-bar-inner-text {
  line-height: 12px;
  font-size: 8px;
  text-align: center;
  color: rgba(0,0,0, 0);
  padding-left: 1px;
  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none;
}
.window-top-action-bar-item-common {
  position: relative;
  width: 12px;
  height: 12px;
  border-radius: 7px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0px 1px 1px rgba(0,0,0, 0.8);
}
.window-top-action-bar-item-common:active{
  filter: brightness(80%);
}
.window-top-action-bar-item-outter-common {
  position: relative;
  display: block;
  float: left;
  width: 21px;
  height: 21px;
}
.window-top-action-bar-close-inner {
  background: no-repeat url("../../assets/action-close.png") center;
}
.window-top-action-bar-min-inner {
  background: no-repeat url("../../assets/action-min.png") center;
}
.window-top-action-bar-max-inner {
  background: no-repeat url("../../assets/action-max.png") center;
}

.window-top-title {
  width: 50%;
  font-weight: bold;
  margin: 0 auto;
  text-align: center;
  font-size: small;
}

.window-top-action-bar {
  padding-left: 4px;
  position: relative;
  right: 0;
  left: 0;
  top: 0;
  height: 21px;
  border-bottom: 1px;
  border-bottom-color: rgba(0,0,0, 0.4);
  border-bottom-style: solid;
  box-shadow: 0px 1px 1px rgba(0,0,0, 0.4);
}
.window-top-action-bar:hover {
  .window-top-action-bar-inner-text {
    color: rgba(0,0,0, 0.6);
  }
}
.window-backgound {
  border: 1px solid black;
  position: fixed;
  height: 600px;
  width: 480px;
  background: url("../../assets/normal-bg.svg") top left;
  box-shadow: 0px 6px 16px black;

  border-radius: 8px 8px 0 0;
}
</style>