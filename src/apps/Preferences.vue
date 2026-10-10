<template>
  <div class="prefs">
    <nav class="prefs__toolbar" role="tablist">
      <button
        v-for="pane in panes"
        :key="pane.id"
        type="button"
        role="tab"
        class="prefs__tab"
        :class="{ 'is-active': current === pane.id }"
        :aria-selected="current === pane.id ? 'true' : 'false'"
        @click="current = pane.id"
      >
        <span class="prefs__tab-icon" :style="pane.iconStyle" />
        <span>{{ pane.name }}</span>
      </button>
    </nav>

    <section v-if="current === 'desktop'" class="prefs__pane" role="tabpanel">
      <div class="prefs__preview" :style="{ background: preview }" />
      <ul class="prefs__wallpapers">
        <li v-for="paper in wallpapers" :key="paper.id">
          <button
            type="button"
            class="prefs__swatch"
            :class="{ 'is-selected': prefs.wallpaper === paper.id }"
            :style="{ background: paper.background }"
            :aria-label="localize(paper.name)"
            :title="localize(paper.name)"
            @click="set('wallpaper', paper.id)"
          />
        </li>
      </ul>
    </section>

    <section v-else-if="current === 'dock'" class="prefs__pane prefs__form" role="tabpanel">
      <label class="prefs__row">
        <span class="prefs__label">{{ $t('prefs.magnification') }}</span>
        <input type="checkbox" :checked="prefs.magnification" @change="set('magnification', $event.target.checked)">
        <span>{{ $t('prefs.magnify') }}</span>
      </label>
      <fieldset class="prefs__row">
        <legend class="prefs__label">{{ $t('prefs.minimizeEffect') }}</legend>
        <label><input type="radio" value="genie" :checked="prefs.minimizeEffect === 'genie'" @change="set('minimizeEffect', 'genie')"> {{ $t('prefs.genie') }}</label>
        <label><input type="radio" value="scale" :checked="prefs.minimizeEffect === 'scale'" @change="set('minimizeEffect', 'scale')"> {{ $t('prefs.scale') }}</label>
      </fieldset>
    </section>

    <section v-else-if="current === 'international'" class="prefs__pane prefs__form" role="tabpanel">
      <div class="prefs__row">
        <label class="prefs__label" for="prefs-language">{{ $t('prefs.language') }}</label>
        <select id="prefs-language" class="aqua-popup" :value="prefs.language" @change="set('language', $event.target.value)">
          <option value="auto">{{ $t('prefs.auto') }}</option>
          <option v-for="locale in locales" :key="locale.id" :value="locale.id" :lang="locale.id">{{ locale.name }}</option>
        </select>
      </div>
      <p class="prefs__note">{{ $t('prefs.languageNote', { name: browserLanguage }) }}</p>
    </section>

    <section v-else class="prefs__pane prefs__form" role="tabpanel">
      <fieldset class="prefs__row">
        <legend class="prefs__label">{{ $t('prefs.appearance') }}</legend>
        <label><input type="radio" value="blue" :checked="prefs.appearance === 'blue'" @change="set('appearance', 'blue')"> {{ $t('prefs.blue') }}</label>
        <label><input type="radio" value="graphite" :checked="prefs.appearance === 'graphite'" @change="set('appearance', 'graphite')"> {{ $t('prefs.graphite') }}</label>
      </fieldset>
      <p class="prefs__note">{{ $t('prefs.appearanceNote') }}</p>
    </section>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { wallpapers, wallpaperBackground } from '../config/wallpapers'
import finderIcon from '../assets/macos-x-finder.png'
import preferencesIcon from '../assets/icons/preferences.svg'
import internationalIcon from '../assets/icons/international.svg'
import { LOCALES, browserLocale, localize } from '../i18n'

export default {
  name: 'Preferences',
  props: {
    win: { type: Object, required: true }
  },
  data() {
    return {
      wallpapers,
      locales: LOCALES,
      current: 'desktop'
    }
  },
  computed: {
    ...mapState('system', ['prefs']),
    preview() {
      return wallpaperBackground(this.prefs.wallpaper)
    },
    // What "Automatic" resolves to in this browser
    browserLanguage() {
      return LOCALES.find(locale => locale.id === browserLocale()).name
    },
    panes() {
      return [
        { id: 'desktop', name: this.$t('prefs.desktop'), iconStyle: { background: wallpapers[0].background }},
        { id: 'dock', name: this.$t('prefs.dock'), iconStyle: { background: `url(${finderIcon}) center / contain no-repeat` }},
        { id: 'general', name: this.$t('prefs.general'), iconStyle: { background: `url(${preferencesIcon}) center / contain no-repeat` }},
        { id: 'international', name: this.$t('prefs.international'), iconStyle: { background: `url(${internationalIcon}) center / contain no-repeat` }}
      ]
    }
  },
  methods: {
    localize,
    set(key, value) {
      this.$store.dispatch('system/setPref', { key, value })
    }
  }
}
</script>

<style lang="scss">
.prefs {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.prefs__toolbar {
  display: flex;
  gap: 4px;
  padding: 6px 12px;
  border-bottom: 1px solid #9c9c9c;
}

.prefs__tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  min-width: 70px;
  padding: 4px 6px;
  border: 0;
  border-radius: 6px;
  font: inherit;
  font-size: 11px;
  background: none;
  cursor: default;

  &.is-active {
    background: rgba(0, 0, 0, 0.12);
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
  }
}

.prefs__tab-icon {
  display: block;
  width: 32px;
  height: 32px;
  border-radius: 4px;
}

.prefs__pane {
  flex: 1;
  padding: 18px 24px;
  overflow: auto;
}

.prefs__preview {
  width: 220px;
  height: 140px;
  margin: 0 auto 16px;
  border: 6px solid #e8e8e8;
  border-radius: 3px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45), inset 0 0 0 1px #999;
}

.prefs__wallpapers {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
  gap: 10px;
  margin: 0;
  padding: 10px;
  border: 1px solid #9c9c9c;
  list-style: none;
  background: #fff;
}

.prefs__swatch {
  display: block;
  width: 100%;
  height: 48px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  cursor: default;

  &.is-selected {
    border-color: var(--aqua-selection);
    box-shadow: 0 0 0 2px var(--aqua-selection);
  }
}

.prefs__form {
  display: flex;
  flex-direction: column;
  gap: 16px;

  input {
    accent-color: var(--aqua-selection);
  }
}

.prefs__row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 0;
  border: 0;
}

.prefs__label {
  float: left;
  flex: none;
  width: 110px;
  padding: 0;
  text-align: right;
}

.prefs__note {
  margin: 0 0 0 120px;
  font-size: 11px;
  color: #666;
}
</style>
