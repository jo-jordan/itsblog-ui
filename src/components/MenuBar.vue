<template>
  <header class="menubar pinstripe" @pointerdown.stop>
    <nav class="menubar__menus" role="menubar">
      <div
        v-for="menu in menus"
        :key="menu.key"
        class="menubar__menu"
        :class="[`menubar__menu--${menu.key}`, { 'is-open': openKey === menu.key }]"
      >
        <button
          type="button"
          class="menubar__title"
          :class="{ 'is-app': menu.key === 'app' }"
          role="menuitem"
          aria-haspopup="true"
          :aria-expanded="openKey === menu.key ? 'true' : 'false'"
          :aria-label="menu.key === 'apple' ? 'Apple 菜单' : null"
          @click="toggle(menu.key)"
          @mouseenter="hover(menu.key)"
        >
          <img v-if="menu.key === 'apple'" :src="appleLogo" alt="" class="menubar__apple">
          <template v-else>{{ menu.label }}</template>
        </button>
        <div v-if="openKey === menu.key" class="aqua-menu" role="menu">
          <template v-for="(item, index) in menu.items">
            <div v-if="item.separator" :key="index" class="aqua-menu__separator" role="separator" />
            <div
              v-else
              :key="index"
              class="aqua-menu__item"
              :class="{ 'is-disabled': item.disabled, 'is-checked': item.checked }"
              role="menuitem"
              :aria-disabled="item.disabled ? 'true' : null"
              @click="choose(item)"
            >
              {{ item.label }}
            </div>
          </template>
        </div>
      </div>
    </nav>
    <div class="menubar__clock" :title="fullDate">{{ clock }}</div>
  </header>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { apps } from '../apps/registry'
import { findPost } from '../utils/posts'
import site from '../config/site'
import appleLogo from '../assets/macos-x-logo.png'

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const pad = n => String(n).padStart(2, '0')
const SEPARATOR = { separator: true }

export default {
  name: 'MenuBar',
  data() {
    return {
      appleLogo,
      openKey: null,
      now: new Date(),
      timer: null
    }
  },
  computed: {
    ...mapState('windows', ['windows']),
    ...mapGetters('windows', ['focused', 'activeAppId']),
    activeApp() {
      return apps[this.activeAppId]
    },
    clock() {
      const d = this.now
      return `${d.getMonth() + 1}月${pad(d.getDate())}日 ${WEEKDAYS[d.getDay()]} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    },
    fullDate() {
      return `${this.now.getFullYear()}年${this.now.getMonth() + 1}月${this.now.getDate()}日 ${WEEKDAYS[this.now.getDay()]}`
    },
    menus() {
      const name = this.activeApp.name
      const appWindows = this.windows.filter(w => w.appId === this.activeAppId)
      const magnification = this.$store.state.system.prefs.magnification
      return [
        {
          key: 'apple',
          items: [
            { label: '关于本机', action: () => this.open('about') },
            SEPARATOR,
            { label: '获取 itsblog 源代码…', href: site.sourceUrl },
            { label: '系统偏好设置…', action: () => this.open('preferences') },
            { label: magnification ? '关闭 Dock 放大' : '打开 Dock 放大', action: () => this.setPref('magnification', !magnification) },
            SEPARATOR,
            { label: '强制退出…', disabled: !this.windows.length, action: () => this.dispatch('windows/closeAll') },
            SEPARATOR,
            { label: '睡眠', action: () => this.dispatch('system/sleep') },
            { label: '重新启动…', action: () => this.dispatch('system/restart') },
            { label: '关机…', action: () => this.dispatch('system/shutDown') }
          ]
        },
        {
          key: 'app',
          label: name,
          items: [
            { label: `关于 ${name}`, action: () => this.open('about') },
            SEPARATOR,
            {
              label: `隐藏 ${name}`,
              disabled: !appWindows.some(w => !w.minimized),
              action: () => appWindows.forEach(w => this.dispatch('windows/minimize', w.id))
            },
            {
              label: `退出 ${name}`,
              disabled: this.activeAppId === 'finder' || !appWindows.length,
              action: () => this.dispatch('windows/closeApp', this.activeAppId)
            }
          ]
        },
        {
          key: 'file',
          label: '文件',
          items: [
            { label: '新建 Finder 窗口', action: () => this.open('finder', { newWindow: Date.now() }) },
            { label: '查找…', action: () => this.open('sherlock') },
            SEPARATOR,
            { label: '关闭窗口', disabled: !this.focused, action: () => this.dispatch('windows/close', this.focused.id) }
          ]
        },
        {
          key: 'window',
          label: '窗口',
          items: [
            { label: '最小化', disabled: !this.focused || this.isDialog(this.focused), action: () => this.dispatch('windows/minimize', this.focused.id) },
            { label: '缩放', disabled: !this.focused || this.isDialog(this.focused), action: () => this.dispatch('windows/toggleZoom', this.focused.id) },
            ...(this.windows.length ? [SEPARATOR] : []),
            ...this.windows.map(win => ({
              label: this.windowLabel(win),
              checked: this.focused && this.focused.id === win.id,
              action: () => this.dispatch('windows/restore', win.id)
            }))
          ]
        },
        {
          key: 'help',
          label: '帮助',
          items: [
            { label: 'itsblog 帮助', action: () => this.$router.push('/posts/welcome').catch(() => {}) },
            { label: '在 GitHub 上查看源代码', href: site.sourceUrl }
          ]
        }
      ]
    }
  },
  created() {
    this.timer = setInterval(() => {
      this.now = new Date()
    }, 1000)
  },
  mounted() {
    document.addEventListener('pointerdown', this.close)
    document.addEventListener('keydown', this.onKeydown)
  },
  beforeDestroy() {
    clearInterval(this.timer)
    document.removeEventListener('pointerdown', this.close)
    document.removeEventListener('keydown', this.onKeydown)
  },
  methods: {
    toggle(key) {
      this.openKey = this.openKey === key ? null : key
    },
    // Once a menu is open, sliding across the bar opens its neighbours
    hover(key) {
      if (this.openKey) {
        this.openKey = key
      }
    },
    close() {
      this.openKey = null
    },
    onKeydown(event) {
      if (event.key === 'Escape') {
        this.close()
      }
    },
    choose(item) {
      if (item.disabled) {
        return
      }
      this.close()
      if (item.href) {
        window.open(item.href, '_blank', 'noopener')
      } else {
        item.action()
      }
    },
    open(appId, props) {
      this.dispatch('windows/open', { appId, props })
    },
    dispatch(type, payload) {
      this.$store.dispatch(type, payload)
    },
    setPref(key, value) {
      this.dispatch('system/setPref', { key, value })
    },
    isDialog(win) {
      return apps[win.appId].dialog
    },
    windowLabel(win) {
      if (win.appId === 'reader') {
        const post = findPost(win.props.slug)
        return post ? post.title : apps.reader.name
      }
      return win.props.location === 'trash' ? '废纸篓' : apps[win.appId].name
    }
  }
}
</script>

<style lang="scss">
.menubar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--menubar-height);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
  font-size: 14px;
}

.menubar__menus {
  display: flex;
  height: 100%;
  padding-left: 8px;
}

.menubar__menu {
  position: relative;

  &.is-open > .menubar__title {
    color: #fff;
    background: linear-gradient(to bottom, var(--aqua-highlight-top), var(--aqua-highlight) 50%, var(--aqua-highlight-bottom));
  }

  .aqua-menu {
    top: 100%;
    left: 0;
  }
}

.menubar__title {
  display: flex;
  align-items: center;
  height: var(--menubar-height);
  padding: 0 10px;
  border: 0;
  font: inherit;
  color: #000;
  background: none;
  cursor: default;

  &.is-app {
    font-weight: bold;
  }

  &:focus-visible {
    outline: 2px solid rgba(61, 128, 223, 0.8);
    outline-offset: -2px;
  }
}

.menubar__apple {
  width: 18px;
  height: 18px;
}

.menubar__clock {
  padding: 0 12px;
  white-space: nowrap;
}

@media (max-width: 767px) {
  .menubar__menu--file,
  .menubar__menu--window,
  .menubar__menu--help {
    display: none;
  }

  .menubar__clock {
    font-size: 12px;
  }
}
</style>
