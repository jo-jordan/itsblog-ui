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
        
<article id="9fb05b4a-62d8-49f7-9c5d-dfc03fd3d8c8" class="page mono"><header><h1 class="page-title">毛义丹的个人简历</h1></header><div class="page-body"><blockquote id="4bdca8eb-2fdc-4292-b7c5-d91c603fee6d" class="">Java后端开发工程师，3年工作经验，2年工业互联网行业开发经验。</blockquote><h1 id="122ce854-7359-48b7-b75b-2313746581f2" class="">☎️ 个人信息</h1><p id="4395576f-0b82-46b9-8d25-a717894637c3" class="">✒️  个人博客 👉 <a href="https://edgeless.me">edgeless.me</a></p><p id="1e40364d-3fbb-4fd4-91cb-f968e3748f6a" class="">🔗  GitHub 👉 <a href="https://github.com/lzjlxebr">lzjlxebr</a></p><p id="c7fb2bbf-3976-4dab-a8eb-a62b270c6b2f" class="">🐦  推特 👉 <a href="https://twitter.com/maoyidan">@maoyidan</a></p><p id="a784de6f-dcea-4289-aefe-3380aa6beb75" class="">📧  联系方式：邮箱 👉 <a href="mailto:tyyzmyd@gmail.com">tyyzmyd@gmail.com</a>; 手机: 👉 +8615926225933</p><hr id="c25472e0-f806-4c5f-b350-59e6b65fb71d"/><h1 id="4ad1f466-161c-446f-9bdb-adcda430726f" class="">💻 技能水平</h1><ul id="0135bae0-de98-4430-bdc6-a8a4e9d5dff0" class="bulleted-list"><li>擅长Java并发编程；熟悉Java线程内存模型(JMM)；</li></ul><ul id="2c2f8451-ed99-46cd-815d-dc5c1be21b91" class="bulleted-list"><li>熟练使用Spring Boot、JPA、Quartz、QLExpress等框架；</li></ul><ul id="c72ea50c-de85-4ae2-a7c1-b86b342b4898" class="bulleted-list"><li>熟悉JVM模型以及原理，了解一定的JVM调优知识；了解NIO原理；</li></ul><ul id="0e33f51c-0b44-4b30-93b9-ddd1156c6c38" class="bulleted-list"><li>了解并使用过SpringCloud中的Eureake、Zuul，以及Feign；</li></ul><ul id="862bca32-795b-447c-9377-2c2dc746a990" class="bulleted-list"><li>熟悉MySQL索引原理以及不同存储引擎机制；</li></ul><ul id="58ae6425-91fa-43ac-ad74-23cb68fb4f09" class="bulleted-list"><li>熟悉MySQL表分区原理以及操作，擅长优化SQL查询效率；</li></ul><ul id="5db806f1-48c9-42a9-949a-ac5c9463e854" class="bulleted-list"><li>了解并使用过SQLServer、Oracle数据库；</li></ul><ul id="9072ff19-9068-405e-846c-ae51c2035150" class="bulleted-list"><li>了解Redis原理与使用；熟悉Nginx的使用；熟悉Linux系统基础指令；</li></ul><ul id="334729bd-0622-490e-926d-2b5a8385c756" class="bulleted-list"><li>上架过1个<a href="https://apps.apple.com/cn/app/%E6%99%BA%E8%81%94%E4%B9%90%E5%AE%B6/id1510552192"><strong>iOS APP</strong></a><strong>；</strong>编写过4个Android App，其中一个<a href="http://www.yxdown.com/app/794982.html">已上架</a>；</li></ul><ul id="43fcd822-6803-4042-ac58-bd761425499c" class="bulleted-list"><li>使用Vue.js编写2个后台管理前端界面以及我的<a href="https://edgeless.me">个人博客</a>；</li></ul><ul id="c7eeb8de-4e76-409e-a76a-b4b631820386" class="bulleted-list"><li>了解go语言语法，编写过1个<a href="https://github.com/lzjlxebr/blog-middleware">小型服务</a>，使用过gRPC框架。</li></ul><hr id="5314cc4a-55ef-4518-a450-24977e51447c"/><h1 id="e749b8ff-29f6-4da3-bd8e-5dad7eb703b7" class="">⌨️<strong> 项目</strong>经历</h1><h2 id="b348312e-0d17-4aaf-8a13-ebf1543cd175" class="">CCEPC工业信息化平台</h2><p id="cc72ffee-8e74-401b-9219-698c61c9e029" class="block-color-gray"><mark class="highlight-gray"><em>中冶南方都市环保工程技术股份有限公司(</em></mark><mark class="highlight-gray"><strong><em>非正式</em></strong></mark><mark class="highlight-gray"><em>), 武汉 – (2019年07月-至今)</em></mark></p><ul id="35eca4fc-ffb5-4c0a-8644-33b6393bce30" class="bulleted-list"><li>项目背景：工业信息化4.0，中国制造2025，“两化融合”。所属工业互联网行业。</li></ul><ul id="5752f3e4-2572-4fe5-b600-c80ff5eba0d9" class="bulleted-list"><li>项目目的：对实时、历史工业数据进行一系列的数据处理与分析，为工厂端提供生产指导意见。</li></ul><ul id="63c46539-4441-4628-b653-36515ffc4fe9" class="bulleted-list"><li>项目周期：2018年9月至今。</li></ul><ul id="20afb7f7-59be-4358-be7f-68d1d6ee1d07" class="bulleted-list"><li>项目技术栈：<ul id="9b1af8af-56c8-49cc-86d3-3c6a0b836f89" class="bulleted-list"><li>后台服务：SpringBoot、MySQL、Redis、Nginx、HttpClient、QLExpress等；</li></ul><ul id="4e7025b4-aa90-42c3-8fcc-9641797a3c6e" class="bulleted-list"><li>调度服务：Quartz、Executors、SpringBoot等；</li></ul><ul id="010e8717-ccdd-4fbb-ac2c-854c385a970b" class="bulleted-list"><li>WCF服务：C#、log4net、MathNet.Numerics(曲线拟合)等；</li></ul><ul id="d11e7325-be64-435a-bc90-75c669a57891" class="bulleted-list"><li>平台管理前端界面：Vue.js + ElementUI；</li></ul><ul id="e27151e1-f12a-44a6-a13a-0f9578d606e5" class="bulleted-list"><li>移动端：小程序、公众号。</li></ul></li></ul><ul id="91230d59-18af-463e-8e88-cce7cf61b5ba" class="bulleted-list"><li>开发人员数量：4人。</li></ul><ul id="2ae41dd7-c922-483a-9a89-d0b11e849682" class="bulleted-list"><li>我在项目中：<ul id="1e68be33-5cd0-41d4-8fd1-39a848f985cc" class="bulleted-list"><li>担任开发负责人的角色；负责阶段性汇报项目成果等；</li></ul><ul id="9db81992-f360-4921-a1fd-8c0f1d57f2b1" class="bulleted-list"><li>负责设计项目中所有数据表结构；</li></ul><ul id="4d614b90-7d3c-49ee-8123-a2ace11dc21a" class="bulleted-list"><li>负责后台服务核心部分开发任务；</li></ul><ul id="53fa56c5-dac7-4602-9767-a37c363c4f6c" class="bulleted-list"><li>负责所有调度服务、WCF服务开发任务；</li></ul><ul id="d04eff38-3fcd-4d45-b5c1-771271c708b5" class="bulleted-list"><li>负责部分平台管理前端界面、移动端的开发任务。</li></ul></li></ul><ul id="c32241a3-8f00-4190-8198-adf3e7bcb3db" class="bulleted-list"><li>我的贡献：<ul id="517bd7ae-5b24-481e-8fe2-0db7fdc4a85e" class="bulleted-list"><li>优化20余处数据库查询缓慢问题(秒到毫秒)；</li></ul><ul id="9cde3b20-e365-440e-8ebc-95e67e8bcb8d" class="bulleted-list"><li>提升3次调度服务中并发执行部分的效率(业务计算效率提升2倍)；</li></ul><ul id="e7a9f7a4-059e-40b4-a6e6-f87ecdff3927" class="bulleted-list"><li>重构2处项目初期由于设计不合理的功能模块。</li></ul></li></ul><h2 id="cb1dcbb0-ced4-4071-a384-fa103fc8cb7f" class="">享动健身房项目(Java后端)</h2><p id="9e7d7bd5-594d-4796-88b6-3c0b8a3a2eab" class=""><mark class="highlight-gray"><em>必腾移动科技有限责任公司, 武汉 – (2018年07月-2019年07月)</em></mark></p><ul id="4cc264b8-91fe-4963-998d-80da776a6aa9" class="bulleted-list"><li>项目简介：健身房的用户、活动、订单等相关的管理服务。</li></ul><ul id="9c2823c0-c110-4954-9aff-cec5c6e2d6b3" class="bulleted-list"><li>项目周期：2019年7月-2019年8月。</li></ul><ul id="6ca16514-b756-485e-affe-4d8bc8c86abf" class="bulleted-list"><li>项目技术栈：SpringCloud、SpringBoot、Eureka、Zuul、Feign、MySQL、Nginx、Redis。</li></ul><ul id="de4bce79-64cf-4775-bc27-c419b53d77fc" class="bulleted-list"><li>我在项目中：担任后端开发角色。</li></ul><h2 id="2c40280d-74b1-4cd8-9795-6cea85ef47f1" class="">美雕塑APP(Android)</h2><p id="1e8bc3c9-4aba-4c99-b385-af05fe1352aa" class="block-color-gray"><mark class="highlight-gray"><em>必腾移动科技有限责任公司, 武汉 – (2018年07月-2019年07月)</em></mark></p><ul id="a735cae7-aefe-479f-9e29-49dd16da3caf" class="bulleted-list"><li>项目简介：提供对美容仪器管理。</li></ul><ul id="e757eed3-b4ef-4e8e-b711-23fb5922191b" class="bulleted-list"><li>项目周期：2018年6月-2018年7月。</li></ul><ul id="25e8b970-a4c6-4c5d-86ea-a129a77b662d" class="bulleted-list"><li>项目功能：首页、充值、美容设备管理、我的个人信息等。</li></ul><ul id="4928c2e0-6943-4772-8509-ac98b4dcaac1" class="bulleted-list"><li>所有功能均由我一人开发完成，使用单Activity多Fragment的模式开发。</li></ul><h2 id="9d59836c-b9db-439a-ad65-463d11a628da" class="">公司内部后台管理系统</h2><p id="215217c6-eba2-4c8f-a5d4-e622617006ec" class="block-color-gray"><mark class="highlight-gray"><em>天利阁服饰有限公司, 中国武汉 – (2017年07月-2018年05月)</em></mark></p><p id="fd89b2ba-22af-46a2-8a6b-e7120b70fd5c" class="">负责公司定制考勤软件开发 - C#；</p><p id="d1c18e8b-413b-461e-bc7d-a9d61e7455a1" class="">负责公司内部销售软件的维护 - JSP。</p><hr id="4c145100-beb9-49bc-a07a-2599aa202a2d"/><h1 id="f408d444-6559-455b-985e-6549d9dbd05e" class="">⌨️<strong> </strong>个人项目经历</h1><h3 id="35774b8a-100e-4f66-916a-bf51c063a620" class="">智联乐家APP(iOS)</h3><ul id="1f3d0c8d-79b2-483e-9c9a-9c03bab553f1" class="bulleted-list"><li>项目简介：智联乐家是一款主要用于提供用户便捷操作智能床垫设备功能的APP。具体功能包括设备模式、控制设备、我的定制、定时关闭、定制灯光、定制震动、健康报告、个人中心以及软件设置等。软件需搭配设备使用，支持智能模式、灯光定制等功能，界面清爽，操作简单，用户智能生活必备软件。</li></ul><ul id="83dc95f9-c3e7-413e-aa71-acd638ac941a" class="bulleted-list"><li>项目周期：2020年4月-2020年7月。</li></ul><ul id="a5a0d75b-321f-4b74-8a46-ba068a1f39ad" class="bulleted-list"><li>项目技术栈：Swift、SnapKit、AFNetworking、Charts、SwiftyJSON等。</li></ul><h3 id="4a4a9967-d864-4cac-b22e-6960e7c835a1" class="">个人博客</h3><ul id="82b26046-1b1e-49eb-add1-00675d2d7046" class="bulleted-list"><li>项目技术栈：GoLang、Vue.js</li></ul><h1 id="44c2f2a9-cfbc-45db-9fef-ac08f5593c66" class="">📜 读过的书</h1><ul id="a5a203df-1685-44ed-a449-e6e805cc3466" class="bulleted-list"><li>Effective Java (Third Edition) 英文原版；</li></ul><ul id="dd11d2b6-6237-4773-8870-c51ccca6ceab" class="bulleted-list"><li>Thinking in Java (Forth Edition) 中文版。</li></ul><hr id="70059e9b-fdd3-45b7-a50c-ad45419de933"/><h1 id="b414d384-cd28-48b9-a618-0a04653c7bbb" class="">📚 教育</h1><h2 id="5b1178b9-2771-4ae6-8e23-156846449c57" class="">河北工程大学-2017年毕业</h2><p id="88bcff75-31a5-457b-88fe-50c4dedb3342" class="block-color-gray"><em>资源勘查工程（非计算机相关）</em></p><p id="8babc024-58b7-4d9a-bbc5-38bd92384d97" class=""><strong>选择非计算机专业是我的错误，但选择当一个程序员一定不是我的错误。</strong></p><p id="af3e0ece-160c-45df-a794-59f31c68ed33" class="">
</p><p id="da944388-c0f0-4c37-b51e-ef2e5b83acba" class="">
</p><p id="93e3e559-f454-4fd6-a6b1-5a2ec37cd063" class="">
</p></div></article>
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