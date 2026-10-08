import store from '../store'
import Event from '../main'

export function bringWindowToTop () {
  let instances = store.getters.loadItemInstances
  for (const [key, value] of Object.entries(instances)) {

    if (value) {
      let old = value.afterDragStyle
      Object.assign(old, {zIndex: 0})
      value.afterDragStyle = null
      value.afterDragStyle = old
    }
  }

  let old = this.afterDragStyle
  Object.assign(old, {zIndex: 1})
  this.afterDragStyle = null
  this.afterDragStyle = old
}

export function unload() {
  store.dispatch('app/unloadItem', {itemName: this.itemName})
  Event.$emit('window-unload', {itemName:this.itemName})
}

export function fold() {
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
}

export function unfold() {
  
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
}

export function draw(s1, s2, p1, p2) {
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.beginPath();
  this.ctx.moveTo(s1, 0);
  this.ctx.bezierCurveTo(s1, this.canvas.height * 0.2, p1, this.canvas.height * 0.6, p1, this.canvas.height);
  this.ctx.lineTo(p2, this.canvas.height);
  this.ctx.bezierCurveTo(p2, this.canvas.height * 0.6, s2, this.canvas.height * 0.2, s2, 0);
  this.ctx.lineTo(s1, 0);
  this.ctx.fillStyle = "rgba(255, 255, 255, 1)";
  this.ctx.fill();
}

export function clearRect(y, speed, type) {
  if(type === "zoomout") {
    this.ctx.clearRect(0, y, this.canvas.width, speed);
  } else if(type === "zoomin") {
    this.ctx.clearRect(0, 0, this.canvas.width, y);
  }
}

export function scale(s1, s2, p1, p2, type, callback) {
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
}

export function onWindowUnfold(data) {
  if (data.itemName === this.itemName && this.visible === false) {
    this.p1 = data.p1
    this.p2 = data.p2
    this.unfold()
  }
}

export function onWindowLoad(data) {
  if (data.itemName === this.itemName) {
    this.p1 = data.p1
    this.p2 = data.p2
  }
}

export function attachWindowEvents() {
  Event.$on('window-unfold', this.onWindowUnfold)
  Event.$on('window-load', this.onWindowLoad)
  window.addEventListener('mouseup', this.stopDrag)
  window.addEventListener('mousemove', this.doDrag)
}

export function detachWindowEvents() {
  Event.$off('window-unfold', this.onWindowUnfold)
  Event.$off('window-load', this.onWindowLoad)
  window.removeEventListener('mouseup', this.stopDrag)
  window.removeEventListener('mousemove', this.doDrag)
}

export function stopDrag() {
  this.dragging = false
}

export function startDrag(event) {
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

  // maxTop keeps the title bar above the dock so the window can still be dragged back
  this.maxTop = window.innerHeight - 74 - 21
}

export function doDrag(event) {
  if (this.dragging) {
    this.x = event.clientX
    this.y = event.clientY

    this.resize()
  }
}

export function resize() {
  let offsetX = this.x - this.lastX
  let offsetY = this.y - this.lastY

  let curLeft = Math.ceil(this.lastLeft + offsetX)
  let curTop = Math.ceil(this.lastTop + offsetY)

  let obj = this.afterDragStyle
  if (curLeft >= this.minLeft && curLeft <= this.maxLeft) {
    Object.assign(obj, {left: curLeft + 'px'})
  }

  if (curTop >= this.minTop && curTop <= this.maxTop) {
    Object.assign(obj, {top: curTop + 'px'})
  }

  Object.assign(obj, {zIndex: 1})
  
  this.afterDragStyle = null
  this.afterDragStyle = obj
}
