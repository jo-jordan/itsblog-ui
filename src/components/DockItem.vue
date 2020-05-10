<template>
  <div class="dock-item" @click="dockItemClicked">
    <img :src="src" :alt="name" :class="{'bounce animated': animated}" width="60px">
  </div>
</template>

<script>
export default {
  name: 'DockItem',
  props: {
    src: {
     type: String,
     default: '../assets/macos-x-logo.png'
    },
    name: {
      type: String,
      default: '全部'
    }
  },
  data() {
    return {
      animated: false
    }
  },
  methods: {
    dockItemClicked() {
      var self = this;
      self.animated = true;
      setTimeout(()=>{
        self.animated = false
      }, 8000)
      console.log('dockItemClicked')
    }
  }
}
</script>

<style>
@charset "UTF-8";

.dock-item {
  margin: 0 4px;
  width: 60px;
  height: 74px;
  display: block;
  float: left;
  opacity: 1.0;
}
.animated {
  -webkit-animation-duration: .8s;
  animation-duration: .8s;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation-timing-function: linear;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  -webkit-animation-iteration-count: infinite;
}
@-webkit-keyframes bounce {
  0%, 100% {
    -webkit-transform: translateY(0);
  }
  50% {
    -webkit-transform: translateY(-25px);
  }
}
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-25px);
  }
}
.bounce {
  -webkit-animation-name: bounce;
  animation-name: bounce;
}
#animated-example {
  width: 20px;
  height: 20px;
  background-color: red;
  position: relative;
  top: 100px;
  left: 100px;
  border-radius: 50%;
}
</style>