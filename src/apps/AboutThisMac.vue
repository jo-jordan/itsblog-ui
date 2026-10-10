<template>
  <div class="about-mac">
    <img :src="appleLogo" alt="" class="about-mac__logo">
    <div class="about-mac__name" role="img" aria-label="Mac OS X" />
    <p class="about-mac__version">{{ $t('about.version', { version }) }}</p>
    <button type="button" class="aqua-button" @click="openSource">{{ $t('about.softwareUpdate') }}</button>
    <dl class="about-mac__specs">
      <dt>{{ $t('about.processor') }}</dt>
      <dd>{{ processor }}</dd>
      <dt>{{ $t('about.memory') }}</dt>
      <dd>{{ memory }}</dd>
      <dt>{{ $t('about.startupDisk') }}</dt>
      <dd>{{ domain }}</dd>
    </dl>
    <button type="button" class="aqua-button" @click="moreInfo">{{ $t('about.moreInfo') }}</button>
    <p class="about-mac__copyright">TM &amp; © {{ since }}–{{ year }} {{ owner }}<br>{{ $t('about.rights') }}</p>
  </div>
</template>

<script>
import { useWindowsStore } from '../store/windows'
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
      return cores ? this.$t('about.cores', { n: cores }) : this.$t('about.engine')
    },
    memory() {
      return navigator.deviceMemory ? this.$t('about.atLeast', { n: navigator.deviceMemory }) : this.$t('about.enough')
    }
  },
  methods: {
    openSource() {
      window.open(site.sourceUrl, '_blank', 'noopener')
    },
    moreInfo() {
      useWindowsStore().open({ appId: 'addressBook' })
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
