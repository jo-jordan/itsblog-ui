<template>
  <div class="footprints" :class="{ 'is-inactive': !focused }">
    <div class="footprints__toolbar">
      <div class="aqua-segmented" role="tablist" :aria-label="$t('footprints.views.label')">
        <button
          v-for="option in views"
          :key="option.id"
          type="button"
          role="tab"
          :class="{ 'is-selected': view === option.id }"
          :aria-selected="view === option.id ? 'true' : 'false'"
          @click="view = option.id"
        >{{ option.label }}</button>
      </div>
      <p class="footprints__stats">
        <strong>{{ stats.places }}</strong> {{ $tc('footprints.stats.places', stats.places) }} ·
        <strong>{{ stats.countries }}</strong> {{ $tc('footprints.stats.countries', stats.countries) }} ·
        <strong>{{ stats.cities }}</strong> {{ $tc('footprints.stats.cities', stats.cities) }}
        <template v-if="stats.since"> · {{ $t('footprints.stats.since', { year: stats.since }) }}</template>
      </p>
      <input v-model.trim="query" type="search" class="aqua-search footprints__search" :placeholder="$t('footprints.filter')" :aria-label="$t('footprints.filterLabel')">
      <button v-if="admin" type="button" class="aqua-button" @click="editing = { place: null }">{{ $t('footprints.newPlaceButton') }}</button>
    </div>

    <div class="footprints__body">
      <aside class="footprints__sidebar aqua-scroll" :aria-label="$t('footprints.placeList')">
        <template v-for="group in groups">
          <h3 :key="`h-${group.country}`">{{ group.country }} <small>{{ group.places.length }}</small></h3>
          <div
            v-for="place in group.places"
            :key="place.id"
            class="aqua-row"
            :class="{ 'is-selected': place.id === selectedId }"
            role="button"
            tabindex="0"
            @click="select(place.id)"
            @keydown.enter="select(place.id)"
          >
            <span class="footprints__dot" :class="{ 'is-draft': !place.published }" aria-hidden="true" />
            <span class="footprints__row-name">{{ place.name }}</span>
            <small>{{ place.city || place.region }}</small>
          </div>
        </template>
        <p v-if="!loading && !filtered.length" class="footprints__empty-list">{{ query ? $t('footprints.noMatches') : $t('footprints.noPlaces') }}</p>
      </aside>

      <main class="footprints__main">
        <div v-if="error" class="footprints__state">
          <img :src="icon" alt="">
          <p>{{ $t('footprints.loadFailed', { message: error }) }}</p>
          <button type="button" class="aqua-button" @click="load">{{ $t('footprints.retry') }}</button>
        </div>

        <template v-else>
          <footprints-map
            v-show="view === 'map'"
            :places="filtered"
            :selected-id="selectedId"
            :offset-right="selectedId && !compact ? 380 : 0"
            @select="select"
          />

          <div v-if="view === 'cards'" class="fp-cards aqua-scroll">
            <button v-for="place in filtered" :key="place.id" type="button" class="fp-card" @click="select(place.id)">
              <span class="fp-card__photo" :style="place.cover ? { backgroundImage: `url(${place.cover.thumb})` } : null">
                <img v-if="!place.cover" :src="icon" alt="">
              </span>
              <strong>{{ place.name }} <span v-if="!place.published" class="fp-badge fp-badge--draft">{{ $t('footprints.draft') }}</span></strong>
              <small>{{ location(place) }}</small>
              <small>{{ range(place) }}</small>
            </button>
          </div>

          <div v-if="view === 'timeline'" class="fp-timeline aqua-scroll">
            <section v-for="year in timeline" :key="year.year">
              <h3>{{ year.year }}</h3>
              <button v-for="place in year.places" :key="place.id" type="button" class="fp-timeline__item" @click="select(place.id)">
                <span class="fp-timeline__date">{{ range(place) }}</span>
                <strong>{{ place.name }}</strong>
                <small>{{ location(place) }}<template v-if="place.visit_count > 1"> · {{ $t('footprints.visitCount', { n: place.visit_count }) }}</template></small>
              </button>
            </section>
            <p v-if="!timeline.length" class="footprints__empty-list">{{ $t('footprints.noDatedPlaces') }}</p>
          </div>

          <div v-if="!loading && !places.length" class="footprints__welcome">
            <img :src="icon" alt="">
            <p>{{ $t('footprints.welcome') }}</p>
            <small v-if="admin">{{ $t('footprints.welcomeHint') }}</small>
          </div>
        </template>

        <transition name="fp-drawer">
          <aside v-if="selectedId" class="footprints__drawer aqua-scroll" :aria-label="$t('footprints.placeDetails')">
            <place-detail
              v-if="detail"
              :place="detail"
              :admin="admin"
              @close="deselect"
              @edit="editing = { place: detail }"
              @delete="confirmDelete = true"
              @changed="onChanged"
              @open-photo="lightbox = $event"
            />
            <p v-else class="footprints__loading">{{ detailError || $t('footprints.loading') }}</p>
          </aside>
        </transition>

        <div v-if="lightbox !== null && detail" class="fp-lightbox" role="dialog" :aria-label="$t('footprints.lightbox.label')" tabindex="-1" @click.self="lightbox = null" @keydown.esc="lightbox = null" @keydown.left="step(-1)" @keydown.right="step(1)">
          <figure>
            <img :src="detail.photos[lightbox].url" :alt="detail.photos[lightbox].caption">
            <figcaption>{{ detail.photos[lightbox].caption }} <small>{{ lightbox + 1 }} / {{ detail.photos.length }}</small></figcaption>
          </figure>
          <button type="button" class="fp-lightbox__nav fp-lightbox__nav--prev" :aria-label="$t('footprints.lightbox.previous')" @click="step(-1)">‹</button>
          <button type="button" class="fp-lightbox__nav fp-lightbox__nav--next" :aria-label="$t('footprints.lightbox.next')" @click="step(1)">›</button>
          <button type="button" class="fp-lightbox__close" :aria-label="$t('footprints.lightbox.close')" @click="lightbox = null">×</button>
        </div>
      </main>
    </div>

    <aqua-sheet :open="Boolean(editing)" :label="$t('footprints.editSheet')" width="600px" @close="editing = null">
      <place-editor v-if="editing" :place="editing.place" @close="editing = null" @saved="onSaved" />
    </aqua-sheet>

    <aqua-sheet :open="confirmDelete" :label="$t('footprints.deleteSheet')" width="380px" @close="confirmDelete = false">
      <div v-if="detail" class="fp-confirm">
        <img :src="icon" alt="">
        <div>
          <strong>{{ $t('footprints.deleteTitle', { name: detail.name }) }}</strong>
          <p>{{ $tc('footprints.deleteBody', detail.photos.length, { n: detail.photos.length }) }}</p>
          <div class="fp-confirm__buttons">
            <button type="button" class="aqua-button aqua-button--default" @click="confirmDelete = false">{{ $t('footprints.cancel') }}</button>
            <button type="button" class="aqua-button" @click="remove">{{ $t('footprints.delete') }}</button>
          </div>
        </div>
      </div>
    </aqua-sheet>
  </div>
</template>

<script>
import FootprintsMap from './footprints/FootprintsMap'
import PlaceDetail from './footprints/PlaceDetail'
import PlaceEditor from './footprints/PlaceEditor'
import AquaSheet from '../components/aqua/AquaSheet'
import { footprints as api } from '../api/client'
import { placeLocation, visitRange } from './footprints/shared'
import site from '../config/site'
import { viewport } from '../utils/viewport'
import icon from '../assets/icons/footprints.svg'

export default {
  name: 'Footprints',
  components: { FootprintsMap, PlaceDetail, PlaceEditor, AquaSheet },
  props: {
    win: { type: Object, required: true },
    focused: { type: Boolean, default: false }
  },
  data() {
    return {
      icon,
      view: 'map',
      places: [],
      loading: true,
      error: '',
      query: '',
      selectedId: null,
      detail: null,
      detailError: '',
      editing: null,
      confirmDelete: false,
      lightbox: null
    }
  },
  computed: {
    admin() {
      return this.$store.state.session.loggedIn
    },
    compact() {
      return viewport.compact
    },
    views() {
      return ['map', 'cards', 'timeline'].map(id => ({ id, label: this.$t(`footprints.views.${id}`) }))
    },
    // Window and page titles, recomputed when the language changes
    titles() {
      const place = this.detail
      return {
        window: place ? this.$t('footprints.titleWithPlace', { name: place.name }) : this.$t('footprints.title'),
        document: place ? this.$t('footprints.documentTitle', { name: place.name, site: site.title }) : site.title
      }
    },
    filtered() {
      const q = this.query.toLowerCase()
      return q
        ? this.places.filter(p => [p.name, p.city, p.region, p.country].some(v => (v || '').toLowerCase().includes(q)))
        : this.places
    },
    // Sidebar: countries with the most places first, places by name
    groups() {
      const byCountry = {}
      this.filtered.forEach(place => {
        const country = place.country || this.$t('footprints.otherCountry')
        ;(byCountry[country] = byCountry[country] || []).push(place)
      })
      return Object.keys(byCountry)
        .map(country => ({ country, places: byCountry[country].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN')) }))
        .sort((a, b) => b.places.length - a.places.length || a.country.localeCompare(b.country, 'zh-CN'))
    },
    timeline() {
      const years = {}
      this.filtered.filter(p => p.last_visit).forEach(place => {
        const year = place.last_visit.slice(0, 4)
        ;(years[year] = years[year] || []).push(place)
      })
      return Object.keys(years)
        .sort((a, b) => b.localeCompare(a))
        .map(year => ({ year, places: years[year].sort((a, b) => b.last_visit.localeCompare(a.last_visit)) }))
    },
    stats() {
      const visible = this.places.filter(p => p.published)
      const firsts = visible.map(p => p.first_visit).filter(Boolean).sort()
      return {
        places: visible.length,
        countries: new Set(visible.map(p => p.country).filter(Boolean)).size,
        cities: new Set(visible.filter(p => p.city).map(p => `${p.country}/${p.city}`)).size,
        since: firsts.length ? firsts[0].slice(0, 4) : null
      }
    }
  },
  watch: {
    // /places/:id and the Dock can ask an open window to show a place
    'win.props.placeId': {
      immediate: true,
      handler(id) {
        if (id) {
          this.select(id)
        }
      }
    },
    titles(titles) {
      this.$emit('title', titles.window)
      document.title = titles.document
    },
    // Signing in or out changes which places (drafts) are visible
    admin() {
      this.load()
    },
    lightbox(index) {
      if (index !== null) {
        this.$nextTick(() => this.$el.querySelector('.fp-lightbox').focus())
      }
    }
  },
  created() {
    this.load()
  },
  beforeDestroy() {
    document.title = site.title
  },
  methods: {
    location: placeLocation,
    range(place) {
      return visitRange(place.first_visit, place.last_visit)
    },
    async load() {
      this.loading = true
      this.error = ''
      try {
        this.places = await api.list()
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    async select(id) {
      // Selecting updates the URL, whose watcher asks for the same place again
      if (this.selectedId === id && !this.detailError) {
        return
      }
      this.selectedId = id
      this.detail = null
      this.detailError = ''
      this.lightbox = null
      if (this.$route.path !== `/places/${id}`) {
        this.$router.replace(`/places/${id}`).catch(() => {})
      }
      try {
        const place = await api.get(id)
        if (this.selectedId === id) {
          this.detail = place
        }
      } catch (e) {
        this.detailError = e.message
      }
    },
    deselect() {
      this.selectedId = null
      this.detail = null
      if (this.$route.name === 'place') {
        this.$router.replace('/').catch(() => {})
      }
    },
    onChanged(place) {
      this.detail = place
      const index = this.places.findIndex(p => p.id === place.id)
      if (index >= 0) {
        this.places.splice(index, 1, { ...this.places[index], ...place })
      }
    },
    async onSaved(place) {
      this.editing = null
      await this.load()
      this.selectedId = null
      this.select(place.id)
    },
    async remove() {
      const id = this.detail.id
      this.confirmDelete = false
      try {
        await api.remove(id)
        this.deselect()
        await this.load()
      } catch (e) {
        this.detailError = e.message
      }
    },
    step(delta) {
      const count = this.detail.photos.length
      this.lightbox = (this.lightbox + delta + count) % count
    }
  }
}
</script>

<style lang="scss">
.footprints {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.footprints__toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 38px;
  padding: 0 10px;
  border-bottom: 1px solid #9c9c9c;
}

.footprints__stats {
  flex: 1;
  margin: 0;
  overflow: hidden;
  font-size: 11px;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #333;
}

.footprints__search {
  width: 140px;
}

.footprints__body {
  flex: 1;
  display: flex;
  min-height: 0;
  // Keep Leaflet's and the drawer's z-indexes below the window's sheets
  isolation: isolate;
}

.footprints__sidebar {
  flex: none;
  width: 210px;
  padding-bottom: 8px;
  border-right: 1px solid #9c9c9c;
  background: #e8edf3;

  h3 {
    margin: 0;
    padding: 8px 10px 3px;
    font-size: 11px;
    text-transform: uppercase;
    color: #6b7380;

    small {
      font-weight: normal;
    }
  }

  .aqua-row {
    padding-left: 14px;

    small {
      font-size: 11px;
      color: #7a7a7a;
    }

    &.is-selected small {
      color: #e6eefc;
    }
  }
}

.footprints__dot {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #ffb3a8, #e8352a 50%, #8e1410);

  &.is-draft {
    background: #c9c9c9;
  }
}

.footprints__row-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.footprints__empty-list {
  padding: 16px;
  color: #888;
  text-align: center;
}

.footprints__main {
  position: relative;
  flex: 1;
  min-width: 0;
  background: #fff;
}

.footprints__state,
.footprints__welcome {
  position: absolute;
  inset: 0;
  // Above Leaflet's panes (400) and controls (1000)
  z-index: 1050;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #444;
  background: rgba(255, 255, 255, 0.92);

  img {
    width: 88px;
    height: 88px;
  }

  p {
    margin: 0;
    font-weight: bold;
  }

  small {
    color: #888;
  }
}

.footprints__welcome {
  background: rgba(255, 255, 255, 0.8);
  pointer-events: none;
}

.footprints__drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1100;
  width: min(380px, 100%);
  border-left: 1px solid #9c9c9c;
  background: #fff;
  box-shadow: -4px 0 14px rgba(0, 0, 0, 0.25);
}

.fp-drawer-enter-active,
.fp-drawer-leave-active {
  transition: transform 0.22s ease-out;
}

.fp-drawer-enter,
.fp-drawer-leave-to {
  transform: translateX(100%);
}

.footprints__loading {
  padding: 30px;
  text-align: center;
  color: #888;
}

.fp-cards {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  align-content: start;
  gap: 16px;
  padding: 16px;
}

.fp-card {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 6px 8px;
  border: 1px solid #c5c5c5;
  font: inherit;
  font-size: 12px;
  text-align: left;
  background: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.18);
  cursor: default;

  small {
    font-size: 11px;
    color: #777;
  }

  &:focus-visible,
  &:hover {
    border-color: var(--aqua-selection);
  }
}

.fp-card__photo {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 4 / 3;
  margin-bottom: 4px;
  background: #eef2f6 center / cover no-repeat;

  img {
    width: 56px;
    opacity: 0.6;
  }
}

.fp-timeline {
  position: absolute;
  inset: 0;
  padding: 10px 24px 24px;

  h3 {
    position: sticky;
    top: 0;
    margin: 12px 0 4px;
    padding: 2px 0;
    font-size: 18px;
    color: var(--aqua-selection);
    background: rgba(255, 255, 255, 0.95);
  }
}

.fp-timeline__item {
  display: grid;
  grid-template-columns: 190px 1fr;
  gap: 0 12px;

  // "September 30, 2025 – January 12, 2026" needs more room than the Chinese dates
  &:lang(en) {
    grid-template-columns: 250px 1fr;
  }
  width: 100%;
  padding: 6px 0 6px 14px;
  border: 0;
  border-left: 2px solid #c8d8ef;
  font: inherit;
  font-size: 12px;
  text-align: left;
  background: none;
  cursor: default;

  small {
    grid-column: 2;
    color: #777;
  }

  &:hover strong {
    color: var(--aqua-selection);
  }
}

.fp-timeline__date {
  grid-row: span 2;
  color: #555;
}

.fp-lightbox {
  position: absolute;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.82);
  outline: none;

  figure {
    margin: 0;
    max-width: calc(100% - 100px);
    max-height: calc(100% - 40px);
    text-align: center;
  }

  img {
    max-width: 100%;
    max-height: calc(100% - 30px);
    border: 4px solid #fff;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);
  }

  figcaption {
    margin-top: 8px;
    font-size: 12px;
    color: #eee;

    small {
      margin-left: 8px;
      color: #aaa;
    }
  }
}

.fp-lightbox__nav,
.fp-lightbox__close {
  position: absolute;
  width: 34px;
  height: 34px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  font-size: 22px;
  line-height: 30px;
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
  cursor: default;
}

.fp-lightbox__nav--prev {
  left: 14px;
}

.fp-lightbox__nav--next {
  right: 14px;
}

.fp-lightbox__close {
  top: 12px;
  right: 14px;
  font-size: 18px;
}

.fp-confirm {
  display: flex;
  gap: 14px;
  padding: 16px 18px;
  font-size: 12px;

  img {
    width: 52px;
    height: 52px;
  }

  p {
    margin: 6px 0 12px;
    color: #444;
  }
}

.fp-confirm__buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 767px) {
  .footprints__sidebar,
  .footprints__stats {
    display: none;
  }

  .footprints__search {
    flex: 1;
  }

  .fp-timeline__item,
  .fp-timeline__item:lang(en) {
    grid-template-columns: 1fr;

    small {
      grid-column: 1;
    }
  }
}
</style>
