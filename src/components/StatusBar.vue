<template>
  <div class="background">
    <div class="menu-bar">
      <div class="menu-item">
        <img src="../assets/macos-x-logo.png" width="18px"/>
      </div>
      <div v-for="(item,index) in menuItems" :key="item" class="menu-item">
        <div v-if="index === 0" class="menu-bold">
          {{item}}
        </div>
        <div v-else>
          {{item}}
        </div>
      </div>
    </div>

    <div class="menu-bar-right">
      {{curTime}}
    </div>
  </div>
</template>

<script>
import '../utils/Date+'
export default {
  name: 'StatusBar',
  components: {
  },
  props: {
  },
  data() {
    return {
      curTime: '',
      menuItems: [
        'Finder',
        'File'
      ]
    }
  },
  created() {
    this.getNow()
    setInterval(this.getNow, 10000)
  },
  methods: {
    getNow: function() {
      const today = new Date()
      var weekday = new Array(7);
      weekday[0] = "周日";
      weekday[1] = "周一";
      weekday[2] = "周二";
      weekday[3] = "周三";
      weekday[4] = "周四";
      weekday[5] = "周五";
      weekday[6] = "周六";

      const day = today.getDate() < 10 ? '0' + today.getDate() : today.getDate()
      const hour = today.getHours() < 10 ? '0' + today.getHours() : today.getHours()
      const minute = today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes()

      const date = (today.getMonth()+1)+'月'+day+'日 ' + weekday[today.getDay()]
      const time = hour + ":" + minute
      const dateTime = date +' '+ time

      const week = dateTime
      this.curTime = week
    }
  }
}
</script>

<style lang="scss" scoped>
.background {
  border-radius: 6px 6px 0 0; 
  height: 22px;
  background: url("../assets/normal-bg.svg") top left;
  box-shadow: 0px 2px 12px black;
}
.menu-bar {
  padding: 0 0 0 10px;
  position: relative;
  z-index: 2;
  height: 22px;
  display: block;
  float: left;
}
.menu-item {
  cursor: pointer;
  display: inline-block;
  padding: 0 8px;
  z-index: 10;
  color: #000;
  position: relative;
  height: 22px;
  vertical-align: top;
  font-size: 15px;
}
.menu-bold {
  font-weight: bold;
}

.menu-bar-right {
  padding: 0 10px 0 10px;
  position: relative;
  z-index: 2;
  height: 22px;
  float: right;
  font-size: 15px;
}

</style>