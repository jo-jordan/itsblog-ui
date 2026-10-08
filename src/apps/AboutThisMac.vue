<template>
  <div class="about-mac">
    <img :src="appleLogo" alt="" class="about-mac__logo">
    <div class="about-mac__name" role="img" aria-label="Mac OS X" />
    <p class="about-mac__version">itsblog 版本 {{ version }}</p>
    <button type="button" class="aqua-button" @click="openSource">软件更新…</button>
    <dl class="about-mac__specs">
      <dt>处理器</dt>
      <dd>{{ processor }}</dd>
      <dt>内存</dt>
      <dd>{{ memory }}</dd>
      <dt>启动磁盘</dt>
      <dd>{{ domain }}</dd>
    </dl>
    <button type="button" class="aqua-button" @click="moreInfo">更多信息…</button>
    <p class="about-mac__copyright">TM &amp; © {{ since }}–{{ year }} {{ owner }}<br>保留所有权利。</p>
  </div>
</template>

<script>
import site from '../config/site'
import appleLogo from '../assets/macos-x-logo.png'

export default {
  name: 'AboutThisMac',
  props: {
    win: { type: Object, required: true }
  },
  data() {
    return {
      appleLogo,
      version: site.version,
      domain: site.domain,
      since: site.since,
      owner: site.owner.name,
      year: new Date().getFullYear()
    }
  },
  computed: {
    processor() {
      const cores = navigator.hardwareConcurrency
      return cores ? `${cores} 核浏览器引擎` : '浏览器引擎'
    },
    memory() {
      return navigator.deviceMemory ? `至少 ${navigator.deviceMemory} GB` : '足够了'
    }
  },
  methods: {
    openSource() {
      window.open(site.sourceUrl, '_blank', 'noopener')
    },
    moreInfo() {
      this.$store.dispatch('windows/open', { appId: 'addressBook' })
    }
  }
}
</script>

<style lang="scss">
.about-mac {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 18px 20px 14px;
  text-align: center;
}

.about-mac__logo {
  width: 72px;
  height: 72px;
}

.about-mac__name {
  width: 150px;
  height: 30px;
  background: url('../assets/loader-macosx.png') center / contain no-repeat;
}

.about-mac__version {
  margin: 0 0 4px;
  font-size: 11px;
  color: #444;
}

.about-mac__specs {
  display: grid;
  grid-template-columns: auto auto;
  gap: 3px 10px;
  margin: 8px 0;
  font-size: 11px;

  dt {
    font-weight: bold;
    text-align: right;
  }

  dd {
    margin: 0;
    text-align: left;
  }
}

.about-mac__copyright {
  margin: auto 0 0;
  font-size: 10px;
  color: #666;
}
</style>
