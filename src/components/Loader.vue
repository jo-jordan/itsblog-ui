<template>
  <div class="loader-backgound">
    <div class="loader-logo"></div>
    <div class="loader-name"></div>

    <div class="loader-progress-bg">
      <div class="loader-progress" :style="progressWidth"></div>
    </div>
    
    <div class="loader-progress-text">{{loadingText}}</div>
  </div>
</template>

<script>
export default {
  name: 'Loader',
  data () {
    return {
      progressWidth: 'width: 0',
      progress: 0,
      maxWidth: 220,
      timer: null,
      loadingText: '正在加载...'
    }
  },
  mounted() {
    this.loading()
  },
  methods: {
    loading() {
      var self = this
      if (self.timer == null) {
        self.timer = setInterval(()=> {
          self.progress += 3
          if (self.progress >= 100) {
            self.progress = 100
            self.loadingText = '加载完成'
            clearInterval(self.timer)
          } else {
            if (self.progress > 60) {
              self.loadingText = '正在加载系统资源...'
            } else if (self.progress > 30) {
              self.loadingText = '正在配置网络...'
            } else if (self.progress > 1) {
              self.loadingText = '正在挖鼻屎...'
            }
          }

          
          const width = 'width:' + (self.maxWidth * self.progress / 100) + 'px'
          self.progressWidth = width

          console.log('timer')
        }, 100)
      }
      
    }
  }
}
</script>

<style>
.loader-backgound {
  border: 1px solid black;
  position: fixed;
  height: 360px;
  width: 480px;
  background: url("../assets/normal-bg.svg") top left;
  box-shadow: 0px 6px 16px black;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.loader-logo {
  background: no-repeat url("../assets/macos-x-logo.png") center;
  background-size: contain;
  top: 38px;
  display: block;
  position: fixed;
  margin: auto;
  width: 86px;
  height: 86px;
  left: 50%;
  transform: translate(-50%, 0);
}

.loader-name {
  background: no-repeat url("../assets/loader-macosx.png") center;
  background-size: contain;
  position: fixed;
  display: block;
  top: 50%;
  min-width: 200px;
  height: 42px;
  left: 50%;
  transform: translate(-50%, -50%);
}

.loader-progress-bg {
  position: fixed;
  height: 15px;
  width: 220px;
  background: no-repeat url("../assets/loader-progress-bg.png") center;
  box-shadow: 0px 4px 8px grey;
  top: 75%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.loader-progress {
  position: fixed;
  height: 15px;
  width: 0px;
  background: url("../assets/loader-progress.png") top left;
  top: 0%;
  left: 0;
}

.loader-progress-text {
  position: fixed;
  height: 15px;
  min-width: 22px;
  top: 85%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>