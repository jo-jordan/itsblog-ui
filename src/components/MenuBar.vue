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
          :aria-label="menu.key === 'apple' ? $t('menu.appleMenu') : null"
          @click="toggle(menu.key)"
          @mouseenter="hover(menu.key)"
        >
          <img v-if="menu.key === 'apple'" :src="appleLogo" alt="" class="menubar__apple">
          <template v-else>{{ menu.label }}</template>
        </button>
        <div v-if="openKey === menu.key" class="aqua-menu" role="menu">
          <template v-for="(item, index) in menu.items" :key="index">
            <div v-if="item.separator" class="aqua-menu__separator" role="separator" />
            <div
              v-else
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
import { useSessionStore } from '../store/session'
import { useSystemStore } from '../store/system'
import { useWindowsStore } from '../store/windows'
import { mapState } from 'pinia'
import { apps } from '../apps/registry'
import { findPost } from '../utils/posts'
import site from '../config/site'
import { formatLongDate, formatMonthDay, weekdayName } from '../i18n/format'
import appleLogo from '../assets/macos-x-logo.png'

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
    ...mapState(useWindowsStore, ['windows']),
    ...mapState(useWindowsStore, ['focused', 'activeAppId']),
    activeApp() {
      return apps[this.activeAppId]
    },
    today() {
      return { y: this.now.getFullYear(), m: this.now.getMonth() + 1, d: this.now.getDate() }
    },
    clock() {
      const d = this.now
      return this.$t('date.clock', {
        m: d.getMonth() + 1,
        dd: pad(d.getDate()),
        monthDay: formatMonthDay(this.today),
        weekday: weekdayName(d.getDay()),
        time: `${pad(d.getHours())}:${pad(d.getMinutes())}`
      })
    },
    fullDate() {
      const day = this.now.getDay()
      return this.$t('date.fullDate', { date: formatLongDate(this.today), weekday: weekdayName(day), weekdayLong: weekdayName(day, 'long') })
    },
    menus() {
      const name = this.activeApp.name
      const appWindows = this.windows.filter(w => w.appId === this.activeAppId)
      const magnification = useSystemStore().prefs.magnification
      return [
        {
          key: 'apple',
          items: [
            { label: this.$t('menu.aboutThisMac'), action: () => this.open('about') },
            SEPARATOR,
            { label: this.$t('menu.getSource'), href: site.sourceUrl },
            { label: this.$t('menu.preferences'), action: () => this.open('preferences') },
            { label: this.$t(magnification ? 'menu.magnificationOff' : 'menu.magnificationOn'), action: () => this.setPref('magnification', !magnification) },
            SEPARATOR,
            { label: this.$t('menu.forceQuit'), disabled: !this.windows.length, action: () => useWindowsStore().closeAll() },
            SEPARATOR,
            { label: this.$t('menu.sleep'), action: () => useSystemStore().sleep() },
            { label: this.$t('menu.restart'), action: () => useSystemStore().restart() },
            { label: this.$t('menu.shutDown'), action: () => useSystemStore().shutDown() },
            SEPARATOR,
            useSessionStore().loggedIn
              ? { label: this.$t('menu.logOut', { name: site.owner.name }), action: () => useSessionStore().logout() }
              : { label: this.$t('menu.logIn'), action: () => this.open('login') }
          ]
        },
        {
          key: 'app',
          label: name,
          items: [
            { label: this.$t('menu.about', { name }), action: () => this.open('about') },
            SEPARATOR,
            {
              label: this.$t('menu.hide', { name }),
              disabled: !appWindows.some(w => !w.minimized),
              action: () => appWindows.forEach(w => useWindowsStore().minimize(w.id))
            },
            {
              label: this.$t('menu.quit', { name }),
              disabled: this.activeAppId === 'finder' || !appWindows.length,
              action: () => useWindowsStore().closeApp(this.activeAppId)
            }
          ]
        },
        {
          key: 'file',
          label: this.$t('menu.file'),
          items: [
            { label: this.$t('menu.newFinderWindow'), action: () => this.open('finder', { newWindow: Date.now() }) },
            { label: this.$t('menu.find'), action: () => this.open('sherlock') },
            SEPARATOR,
            { label: this.$t('menu.closeWindow'), disabled: !this.focused, action: () => useWindowsStore().close(this.focused.id) }
          ]
        },
        {
          key: 'window',
          label: this.$t('menu.window'),
          items: [
            { label: this.$t('menu.minimize'), disabled: !this.focused || this.isDialog(this.focused), action: () => useWindowsStore().minimize(this.focused.id) },
            { label: this.$t('menu.zoom'), disabled: !this.focused || this.isDialog(this.focused), action: () => useWindowsStore().toggleZoom(this.focused.id) },
            ...(this.windows.length ? [SEPARATOR] : []),
            ...this.windows.map(win => ({
              label: this.windowLabel(win),
              checked: this.focused && this.focused.id === win.id,
              action: () => useWindowsStore().restore(win.id)
            }))
          ]
        },
        {
          key: 'help',
          label: this.$t('menu.help'),
          items: [
            { label: this.$t('menu.itsblogHelp'), action: this.openHelp },
            { label: this.$t('menu.viewSource'), href: site.sourceUrl }
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
  beforeUnmount() {
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
      useWindowsStore().open({ appId, props })
    },
    setPref(key, value) {
      useSystemStore().setPref({ key, value })
    },
    openHelp() {
      this.$router.push('/posts/welcome').catch(() => {})
    },
    isDialog(win) {
      return apps[win.appId].dialog
    },
    windowLabel(win) {
      if (win.appId === 'reader') {
        const post = findPost(win.props.slug)
        return post ? post.title : apps.reader.name
      }
      return win.props.location === 'trash' ? this.$t('desktop.trash') : apps[win.appId].name
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
