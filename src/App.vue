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
import { mapState } from 'vuex'
import MenuBar from './components/MenuBar'
import Dock from './components/Dock'
import DesktopIcons from './components/DesktopIcons'
import AppWindow from './components/aqua/AppWindow'
import BootScreen from './components/BootScreen'
import PowerOverlay from './components/PowerOverlay'
import { wallpaperBackground } from './config/wallpapers'
import { findPost } from './utils/posts'
import site from './config/site'

export default {
  name: 'App',
  components: { MenuBar, Dock, DesktopIcons, AppWindow, BootScreen, PowerOverlay },
  computed: {
    ...mapState('windows', ['windows']),
    ...mapState('system', ['prefs', 'power']),
    wallpaper() {
      return wallpaperBackground(this.prefs.wallpaper)
    }
  },
  watch: {
    // /posts/:slug opens that post in its own reader window and /places/:id
    // opens Footprints on that place, so links are shareable
    $route: {
      immediate: true,
      handler(route) {
        const post = route.name === 'post' ? findPost(route.params.slug) : null
        if (route.name === 'place') {
          this.$store.dispatch('windows/open', { appId: 'footprints', props: { placeId: Number(route.params.id) } })
        } else if (post) {
          this.$store.dispatch('windows/open', { appId: 'reader', props: { slug: post.slug } })
          document.title = `${post.title} — ${site.title}`
        } else {
          document.title = site.title
          if (route.name === 'post') {
            this.$router.replace('/')
          }
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
    this.$store.dispatch('session/check')
  },
  methods: {
    onDesktopPointerDown(event) {
      if (event.target === this.$el) {
        this.$store.dispatch('windows/blur')
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
