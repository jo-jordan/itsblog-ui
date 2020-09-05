import Vue from 'vue';
import Main from './RSSWindow.vue';

let RSSWindowConstructor = Vue.extend(Main)
let instance


const RSSWindow = function(options, onshow) {
  instance = new RSSWindowConstructor({
    data: options
  })
  instance.vm = instance.$mount()
  instance.vm.visible = false
  
  document.body.appendChild(instance.$el)
  instance.dom = instance.vm.$el
  if (onshow) {
    onshow()
  }
  return instance.vm
}

export default RSSWindow;