import Vue from 'vue';
import Main from './Window.vue';

let WindowConstructor = Vue.extend(Main)
let instance
let onShow = ()=>{}
// 设置删除组件
const removeDom = (target) => {
  target.parentNode.removeChild(target);
};
// 构造组件添加关闭方法
WindowConstructor.prototype.close = function() {
  instance.vm.progress = 100
  instance.vm.visible = false;
};

const Window = function(options, onshow) {
  instance = new WindowConstructor({
    data: options
  })
  instance.vm = instance.$mount()
  instance.vm.visible = true
  
  document.body.appendChild(instance.$el)
  instance.visible = true
  instance.dom = instance.vm.$el
  if (onshow) {
    onshow()
  }
  return instance.vm
}

export default Window;