import Vue from 'vue';
import Main from './BlogWindow.vue';

let WindowConstructor = Vue.extend(Main)
let instance


const BlogWindow = function(options, onshow) {
  instance = new WindowConstructor({
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

export default BlogWindow;