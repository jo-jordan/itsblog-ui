import Vue from 'vue';
import Main from './MyAppsWindow.vue';

let MyAppsWindowConstructor = Vue.extend(Main)
let instance


const MyAppsWindow = function(options, onshow) {
  instance = new MyAppsWindowConstructor({
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

export default MyAppsWindow;