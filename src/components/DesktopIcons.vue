<template>
  <ul class="desktop-icons" :aria-label="$t('desktop.label')">
    <li v-for="icon in icons" :key="icon.id">
      <button
        type="button"
        class="desktop-icon"
        :class="{ 'is-selected': selected === icon.id }"
        @pointerdown.stop="selected = icon.id"
        @dblclick="openIcon(icon)"
        @keydown.enter="openIcon(icon)"
        @click="onClick(icon)"
      >
        <img :src="icon.image" alt="" class="desktop-icon__image" draggable="false">
        <span class="desktop-icon__label">{{ icon.label }}</span>
      </button>
    </li>
  </ul>
</template>

<script>
import { findPost } from '../utils/posts'
import { viewport } from '../utils/viewport'
import hardDisk from '../assets/icons/harddisk.svg'
import documentIcon from '../assets/icons/document.svg'

export default {
  name: 'DesktopIcons',
  data() {
    return {
      selected: null
    }
  },
  computed: {
    icons() {
      const icons = [{ id: 'hd', label: 'Macintosh HD', image: hardDisk }]
      if (findPost('welcome')) {
        icons.push({ id: 'readme', label: this.$t('desktop.readMe'), image: documentIcon })
      }
      return icons
    }
  },
  mounted() {
    document.addEventListener('pointerdown', this.deselect)
  },
  beforeDestroy() {
    document.removeEventListener('pointerdown', this.deselect)
  },
  methods: {
    deselect() {
      this.selected = null
    },
    // Phones have no double-click, so a single tap opens
    onClick(icon) {
      if (viewport.compact) {
        this.openIcon(icon)
      }
    },
    openIcon(icon) {
      if (icon.id === 'hd') {
        this.$store.dispatch('windows/open', { appId: 'finder' })
      } else {
        this.$router.push('/posts/welcome').catch(() => {})
      }
    }
  }
}
</script>

<style lang="scss">
.desktop-icons {
  position: fixed;
  top: calc(var(--menubar-height) + 16px);
  right: 14px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.desktop-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 92px;
  padding: 0;
  border: 0;
  font: inherit;
  background: none;
  cursor: default;

  &:focus-visible {
    outline: none;

    .desktop-icon__label {
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8);
    }
  }

  &.is-selected {
    .desktop-icon__image {
      filter: brightness(0.7);
      background: rgba(0, 0, 0, 0.25);
      border-radius: 6px;
    }

    .desktop-icon__label {
      background: var(--aqua-selection);
      text-shadow: none;
    }
  }
}

.desktop-icon__image {
  width: 56px;
  height: 56px;
  padding: 2px;
}

.desktop-icon__label {
  margin-top: 3px;
  padding: 1px 5px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9), 0 0 3px rgba(0, 0, 0, 0.6);
}
</style>
