<template>
  <div id="app" class="desktop" :class="`appearance-${prefs.appearance}`" :style="{ background: wallpaper }" @pointerdown="onDesktopPointerDown">
    <menu-bar />
    <desktop-icons />
    <app-window v-for="win in windows" :key="win.id" :win="win" />
    <dock />
    <power-overlay />
    <boot-screen v-if="power === 'booting'" />
  </div>
</template>

<script>
import { useSessionStore } from './store/session'
import { useSystemStore } from './store/system'
import { useWindowsStore } from './store/windows'
import { mapState } from 'pinia'
import MenuBar from './components/MenuBar.vue'
import Dock from './components/Dock.vue'
import DesktopIcons from './components/DesktopIcons.vue'
import AppWindow from './components/aqua/AppWindow.vue'
import BootScreen from './components/BootScreen.vue'
import PowerOverlay from './components/PowerOverlay.vue'
import { wallpaperBackground } from './config/wallpapers'
import { findPost } from './utils/posts'
import site from './config/site'

export default {
  name: 'App',
  components: { MenuBar, Dock, DesktopIcons, AppWindow, BootScreen, PowerOverlay },
  computed: {
    ...mapState(useWindowsStore, ['windows']),
    ...mapState(useSystemStore, ['prefs', 'power']),
    wallpaper() {
      return wallpaperBackground(this.prefs.wallpaper)
    },
    // Follows the post in the URL, in the current language
    pageTitle() {
      const post = this.$route.name === 'post' ? findPost(this.$route.params.slug) : null
      return post ? `${post.title} — ${site.title}` : site.title
    }
  },
  watch: {
    pageTitle: {
      immediate: true,
      handler(title) {
        document.title = title
      }
    },
    // /posts/:slug opens that post in its own reader window and /places/:id
    // opens Footprints on that place, so links are shareable
    $route: {
      immediate: true,
      handler(route) {
        const post = route.name === 'post' ? findPost(route.params.slug) : null
        if (route.name === 'place') {
          useWindowsStore().open({ appId: 'footprints', props: { placeId: Number(route.params.id) }})
        } else if (post) {
          useWindowsStore().open({ appId: 'reader', props: { slug: post.slug }})
        } else if (route.name === 'post') {
          this.$router.replace('/')
        }
      }
    },
    // Closing the window that shows the URL's post or place returns to the bare desktop
    windows(windows) {
      const slug = this.$route.name === 'post' && this.$route.params.slug
      const lostPost = slug && !windows.some(w => w.appId === 'reader' && w.props.slug === slug)
      const lostPlace = this.$route.name === 'place' && !windows.some(w => w.appId === 'footprints')
      if (lostPost || lostPlace) {
        this.$router.replace('/')
      }
    }
  },
  created() {
    useSessionStore().check()
  },
  methods: {
    onDesktopPointerDown(event) {
      if (event.target === this.$el) {
        useWindowsStore().blur()
      }
    }
  }
}
</script>

<style lang="scss">
.desktop {
  position: fixed;
  inset: 0;
  overflow: hidden;
}
</style>
