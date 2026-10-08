import Vue from 'vue'

// Reactive window size shared by the desktop components
export const viewport = Vue.observable({
  width: window.innerWidth,
  height: window.innerHeight,
  get compact() {
    return this.width < 768
  }
})

window.addEventListener('resize', () => {
  viewport.width = window.innerWidth
  viewport.height = window.innerHeight
})
