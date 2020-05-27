<template>
  <div v-show="visible" class="window-backgound">

  </div>
</template>

<script>
export default {
  name: 'Window',
  data () {
    return {
      visible: false
    }
  },
}
</script>

<style>
.window-backgound {
  border: 1px solid black;
  position: fixed;
  height: 600px;
  width: 480px;
  background: url("../../assets/normal-bg.svg") top left;
  box-shadow: 0px 6px 16px black;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 8px 8px 0 0;
}
</style>