<template>
  <div @mousedown="bringWindowToTop">
    <div v-show="visible" class="window-backgound" :style="afterDragStyle" ref="mContainer">
      <div class="window-top-action-bar" @mousedown="startDrag">
        <div class="window-top-action-bar-item-outter-common">
          <div class="window-top-action-bar-close-inner window-top-action-bar-item-common">
            <div class="window-top-action-bar-inner-text" @click="unload">x</div>
          </div>
        </div>
        <div class="window-top-action-bar-item-outter-common">
          <div class="window-top-action-bar-min-inner window-top-action-bar-item-common">
            <div class="window-top-action-bar-inner-text" @click="fold">-</div>
          </div>
        </div>
        <div class="window-top-action-bar-item-outter-common">
          <div class="window-top-action-bar-max-inner window-top-action-bar-item-common">
            <div class="window-top-action-bar-inner-text">+</div>
          </div>
        </div>

        <div class="window-top-title">
          <img style="height: 100%;vertical-align: middle;" :src="titleIcon" alt="Blog Viewer" width="14px">
          Mao Yidan's Resume
        </div>
      </div>
      <div class="window-tool-bar">

      </div>
      <div class="window-content">
        
        <article id="9fb05b4a-62d8-49f7-9c5d-dfc03fd3d8c8" class="page mono"><header><h1 class="page-title">毛义丹的个人简历</h1></header><div class="page-body"><blockquote id="4bdca8eb-2fdc-4292-b7c5-d91c603fee6d" class="">Java后端开发工程师，3年+工作经验，2年工业互联网行业开发经验。</blockquote><h1 id="122ce854-7359-48b7-b75b-2313746581f2" class="">☎️ 个人信息</h1><p id="4395576f-0b82-46b9-8d25-a717894637c3" class="">✒️  个人博客 👉 <a href="https://edgeless.me">edgeless.me</a></p><p id="1e40364d-3fbb-4fd4-91cb-f968e3748f6a" class="">🔗  GitHub 👉 <a href="https://github.com/lzjlxebr">lzjlxebr</a></p><p id="c7fb2bbf-3976-4dab-a8eb-a62b270c6b2f" class="">🐦  推特 👉 <a href="https://twitter.com/maoyidan">@maoyidan</a></p><p id="a784de6f-dcea-4289-aefe-3380aa6beb75" class="">📧  联系方式：邮箱 👉 <a href="mailto:tyyzmyd@gmail.com">tyyzmyd@gmail.com</a>; 手机: 👉 +8615926225933</p><hr id="c25472e0-f806-4c5f-b350-59e6b65fb71d"/><h1 id="4ad1f466-161c-446f-9bdb-adcda430726f" class="">💻 技能水平</h1><h3 id="df36d27a-5d8d-45a4-8fb5-cf22803aef82" class="">Java ⭐️⭐️⭐️⭐️⭐️</h3><ul id="c72ea50c-de85-4ae2-a7c1-b86b342b4898" class="bulleted-list"><li>熟悉JVM模型以及原理，了解一定的JVM调优知识；</li></ul><ul id="4f5b7d27-8e85-449f-97b4-ce93bbeed46a" class="bulleted-list"><li>熟悉Java线程内存模型(JMM)；</li></ul><ul id="0135bae0-de98-4430-bdc6-a8a4e9d5dff0" class="bulleted-list"><li>擅长多线程编程;</li></ul><ul id="2c2f8451-ed99-46cd-815d-dc5c1be21b91" class="bulleted-list"><li>熟练使用Java常用框架如：Spring Boot、JPA、Quartz等。</li></ul><h3 id="48cebf35-5ecf-499d-b28d-8934e26087ea" class="">数据库 ⭐️⭐️⭐️⭐️</h3><ul id="0396e4fa-11d7-4a64-ba01-a7644124868b" class="bulleted-list"><li>MySQL: <ul id="862bca32-795b-447c-9377-2c2dc746a990" class="bulleted-list"><li>熟悉数据索引原理以及不同存储引擎机制；</li></ul><ul id="857ac44a-1da2-4d0e-a81d-1fd07f6f402c" class="bulleted-list"><li>擅长优化SQL查询效率；</li></ul><ul id="58ae6425-91fa-43ac-ad74-23cb68fb4f09" class="bulleted-list"><li>熟悉数据表分区原理以及操作。</li></ul></li></ul><ul id="9072ff19-9068-405e-846c-ae51c2035150" class="bulleted-list"><li>Redis: 了解原理、熟悉使用。</li></ul><h3 id="53fee30a-371b-4f50-8eef-e024fe1a67ea" class="">App开发 &amp; 其他能力 ⭐️⭐️⭐️⭐️</h3><ul id="e6484d8b-4c7d-4145-bb84-5a43a9b1acf3" class="bulleted-list"><li>1个已经上架的<a href="https://apps.apple.com/cn/app/%E6%99%BA%E8%81%94%E4%B9%90%E5%AE%B6/id1510552192"><strong>iOS APP</strong></a>，1个月时间自学，从0到1编写此APP；</li></ul><ul id="ad0bb109-61f6-49c9-85e5-a6932ec7e9c4" class="bulleted-list"><li>使用Mac Catalyst编写在Apple三端通用的个人App；</li></ul><ul id="334729bd-0622-490e-926d-2b5a8385c756" class="bulleted-list"><li>编写过4个Android App，其中一个<a href="http://www.yxdown.com/app/794982.html">已上架</a>；</li></ul><ul id="43fcd822-6803-4042-ac58-bd761425499c" class="bulleted-list"><li>使用Vue.js编写2个后台管理前端界面以及我的个人博客；</li></ul><ul id="c7eeb8de-4e76-409e-a76a-b4b631820386" class="bulleted-list"><li>了解go语言语法，编写过1个<a href="https://github.com/lzjlxebr/blog-middleware">小型服务</a>，使用过gRPC框架。</li></ul><hr id="5314cc4a-55ef-4518-a450-24977e51447c"/><h1 id="e749b8ff-29f6-4da3-bd8e-5dad7eb703b7" class="">⌨️<strong> </strong>工作经历</h1><h2 id="b348312e-0d17-4aaf-8a13-ebf1543cd175" class="">Java后端开发工程师</h2><p id="cc72ffee-8e74-401b-9219-698c61c9e029" class="block-color-gray"><em>中冶南方都市环保工程技术股份有限公司, 中国武汉 – (2019年07月-2020年10月)</em></p><p id="c907af25-a6cc-4624-b8cd-6d586c05aea4" class="">负责开发“CCEPC工业信息化平台”项目：</p><ul id="2745bfd7-76fb-4642-a38f-151f92335f92" class="bulleted-list"><li>100%的后台核心服务；</li></ul><ul id="aa360d66-0951-4ba4-9c74-aca7cf36efbf" class="bulleted-list"><li>100%的数据处理与计算服务；</li></ul><ul id="2f9ed705-0964-498d-aea7-ddc7eac0ae43" class="bulleted-list"><li>100%的WCF数据获取服务；</li></ul><ul id="c58dd682-ed23-4eb9-b188-ae82f9f3e349" class="bulleted-list"><li>30%的平台管理前端界面；</li></ul><ul id="35ee5faa-6f35-4776-ad98-069ef503174c" class="bulleted-list"><li>5%的微信小程序。</li></ul><h2 id="f28ba1cd-c9b3-4a38-bb71-1a15aaa88a22" class="">Java后端开发工程师、Android开发工程师</h2><p id="1e8bc3c9-4aba-4c99-b385-af05fe1352aa" class="block-color-gray"><em>必腾移动科技有限责任公司, 中国武汉 – (2018年07月-2019年07月)</em></p><p id="c96fb046-a012-4f9b-9c17-5f9514c3770a" class="">负责开发两个Android App；</p><p id="5f1b60f7-87b5-4857-98cf-861fba12870b" class="">负责开发两个Java后台项目。</p><h2 id="9d59836c-b9db-439a-ad65-463d11a628da" class="">Java后端开发工程师</h2><p id="215217c6-eba2-4c8f-a5d4-e622617006ec" class="block-color-gray"><em>天利阁服饰有限公司, 中国武汉 – (2017年07月-2018年05月)</em></p><p id="fd89b2ba-22af-46a2-8a6b-e7120b70fd5c" class="">负责公司定制考勤软件开发；</p><p id="d1c18e8b-413b-461e-bc7d-a9d61e7455a1" class="">负责公司内部销售软件的维护。</p><hr id="4c145100-beb9-49bc-a07a-2599aa202a2d"/><h1 id="f408d444-6559-455b-985e-6549d9dbd05e" class="">📜 读过的书</h1><ul id="a5a203df-1685-44ed-a449-e6e805cc3466" class="bulleted-list"><li>Effective Java (Third Edition) 英文原版；</li></ul><ul id="dd11d2b6-6237-4773-8870-c51ccca6ceab" class="bulleted-list"><li>Thinking in Java (Forth Edition) 中文版。</li></ul><hr id="70059e9b-fdd3-45b7-a50c-ad45419de933"/><h1 id="b414d384-cd28-48b9-a618-0a04653c7bbb" class="">📚 教育</h1><h2 id="5b1178b9-2771-4ae6-8e23-156846449c57" class="">河北工程大学</h2><p id="88bcff75-31a5-457b-88fe-50c4dedb3342" class="block-color-gray"><em>资源勘查工程</em></p><p id="7d402345-fb68-45ae-8ccd-fed0e2972d67" class="">关于我的大学：大四下半期“觉醒”后开始自学Java编程。毕业后一直从事IT相关行业。</p><p id="af3e0ece-160c-45df-a794-59f31c68ed33" class="">
          </p><p id="da944388-c0f0-4c37-b51e-ef2e5b83acba" class="">
          </p><p id="93e3e559-f454-4fd6-a6b1-5a2ec37cd063" class="">
          </p></div>
        </article>
      </div>
    </div>
    <canvas></canvas>
  </div>
</template>

<script>
import store from '../../store'
import Event from '../../main'
import titleIcon from '../../assets/macos-x-mail.png'
import { bringWindowToTop, fold, unfold, unload, draw, clearRect, scale, stopDrag, startDrag, doDrag, resize } from '../../common/Window'

export default {
  name: 'Window',
  data () {
    return {
      titleIcon: titleIcon,
      afterDragStyle: {},
      visible: false,
      canvasVisible: false,
      dragging: false,
      x: 0,
      y: 0,
      lastX: 0,
      lastY: 0,
      lastTop: 0,
      lastLeft: 0,

      maxLeft:0,
      maxTop:0,
      minLeft:0,
      minTop:0,
      canvas: null,
      ctx: null,
      p1:0,
      p2:0,
      itemName: '',

      style: {
        zIndex: 10
      },
    }
  },
  mounted() {
    // Calculate center left and top value
    this.$nextTick(() => {
      var width = window.getComputedStyle(this.$refs.mContainer).width
      width = Number(width.substring(0, width.indexOf('px')))

      var height = window.getComputedStyle(this.$refs.mContainer).height
      height = Number(height.substring(0, height.indexOf('px')))

      var centerLeft = window.innerWidth / 2 - width / 2
      var centerTop = window.innerHeight / 2 - height / 2

      this.afterDragStyle = {
        left: centerLeft + 'px',
        top: centerTop + 'px'
      }

      this.canvas = document.querySelector("canvas");
      this.ctx = this.canvas.getContext("2d");
      Event.$on('window-unfold', (data) => {
        if (data.itemName === this.itemName && this.visible === false) {
          this.unfold()
          this.p1 = data.p1
          this.p2 = data.p2
        }
      })

      Event.$on('window-load', (data) => {
        if (data.itemName === this.itemName) {
          this.p1 = data.p1
          this.p2 = data.p2
        }
      })
    })

    window.addEventListener('mouseup', this.stopDrag);
    window.addEventListener('mousemove', this.doDrag);
  },
  methods: {
    bringWindowToTop, unload, fold, unfold, draw, clearRect, scale, stopDrag, startDrag, doDrag, resize
  }
}
</script>

<style scoped src="../../style/markdown.css">
  
</style>

<style lang="scss" scoped>
@import url('../../style/Window.scss');

.window-backgound {
  border: 1px solid black;
  position: fixed;
  height: 720px;
  width: 900px;
  background: url("../../assets/normal-bg.svg") top left;
  box-shadow: 0px 6px 16px black;
  border-radius: 8px 8px 0 0;
}

.window-content {
  height: calc(100% - 46px - 21px);
  width: 100%;
  padding: 0 48px;
  overflow-y: scroll;
  background: white;
  display: block;
}

.window-tool-bar {
  height: 46px;
  width: 100%;
  display: block;
  background: url("../../assets/normal-bg.svg") top left;
  border-bottom: 1px solid #c3c3c3;
}

.window-top-action-bar:hover {
  .window-top-action-bar-inner-text {
    color: rgba(0,0,0, 0.6);
  }
}

</style>