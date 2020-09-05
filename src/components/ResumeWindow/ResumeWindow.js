import Vue from 'vue';
import Main from './ResumeWindow.vue';

let ResumeWindowConstructor = Vue.extend(Main)
let instance


const ResumeWindow = function(options, onshow) {
  instance = new ResumeWindowConstructor({
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

export default ResumeWindow;