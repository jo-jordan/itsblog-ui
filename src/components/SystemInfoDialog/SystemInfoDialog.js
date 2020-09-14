import Vue from 'vue';
import Main from './SystemInfoDialog.vue';

let SystemInfoDialogConstructor = Vue.extend(Main)
let instance


const SystemInfoDialog = function(options, onshow) {
  instance = new SystemInfoDialogConstructor({
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

export default SystemInfoDialog;