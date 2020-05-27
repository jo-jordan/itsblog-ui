import Vue from 'vue';
import Main from './Loader.vue';

let LoaderConstructor = Vue.extend(Main)
let instance

// 设置删除组件
const removeDom = (target) => {
  target.parentNode.removeChild(target);
};
// 构造组件添加关闭方法
LoaderConstructor.prototype.close = function() {
  instance.vm.progress = 100
  setTimeout(() => {
    instance.vm.visible = false;
    removeDom(instance.vm.$el);
  }, 300)
  
};

const Loader = function(options) {
  instance = new LoaderConstructor({
    data: options
  })
  instance.vm = instance.$mount()
  instance.vm.visible = true
  
  document.body.appendChild(instance.$el)
  instance.visible = true
  instance.dom = instance.vm.$el

  return instance.vm
}

export default Loader;
