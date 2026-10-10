<template>
  <form class="fp-editor" @submit.prevent="save">
    <h3 class="fp-editor__title">{{ place ? $t('footprints.editor.editPlace', { name: place.name }) : $t('footprints.editor.newPlace') }}</h3>

    <div class="fp-editor__search">
      <input
        v-model.trim="query"
        type="search"
        class="aqua-search"
        :placeholder="$t('footprints.editor.searchPlaceholder')"
        :aria-label="$t('footprints.editor.searchLabel')"
        @keydown.enter.prevent="search"
      >
      <button type="button" class="aqua-button" :disabled="!query || searching" @click="search">{{ $t('footprints.editor.search') }}</button>
    </div>
    <ul v-if="results.length" class="fp-editor__results aqua-scroll" :aria-label="$t('footprints.editor.results')">
      <li v-for="(result, index) in results" :key="index" class="aqua-row" :title="result.label" @click="apply(result)">
        {{ result.label }}
      </li>
    </ul>

    <div class="fp-editor__map">
      <footprints-map ref="map" picking :point="point" @pick="pick" />
      <span class="fp-editor__map-hint">{{ $t('footprints.editor.mapHint') }}</span>
    </div>

    <div class="fp-editor__grid">
      <label>{{ $t('footprints.editor.name') }}<input v-model="form.name" class="aqua-field" required maxlength="100"></label>
      <label>{{ $t('footprints.editor.category') }}
        <select v-model="form.category" class="aqua-field">
          <option v-for="option in categories" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </label>
      <label>{{ $t('footprints.editor.country') }}<input v-model="form.country" class="aqua-field" maxlength="60"></label>
      <label>{{ $t('footprints.editor.region') }}<input v-model="form.region" class="aqua-field" maxlength="60"></label>
      <label>{{ $t('footprints.editor.city') }}<input v-model="form.city" class="aqua-field" maxlength="60"></label>
      <div class="fp-editor__rating" role="radiogroup" :aria-label="$t('footprints.editor.rating')">
        {{ $t('footprints.editor.rating') }}
        <span>
          <button
            v-for="n in 5"
            :key="n"
            type="button"
            role="radio"
            :aria-checked="form.rating === n ? 'true' : 'false'"
            :aria-label="$tc('footprints.detail.stars', n, { n })"
            :class="{ 'is-on': form.rating >= n }"
            @click="form.rating = form.rating === n ? null : n"
          >★</button>
        </span>
      </div>
      <label>{{ $t('footprints.editor.latitude') }}<input v-model.number="form.lat" class="aqua-field" type="number" step="any" min="-90" max="90" required></label>
      <label>{{ $t('footprints.editor.longitude') }}<input v-model.number="form.lng" class="aqua-field" type="number" step="any" min="-180" max="180" required></label>
      <template v-if="!place">
        <label>{{ $t('footprints.editor.arrival') }}<input v-model="visit.start_date" class="aqua-field" type="date"></label>
        <label>{{ $t('footprints.editor.departure') }}<input v-model="visit.end_date" class="aqua-field" type="date"></label>
      </template>
    </div>

    <label class="fp-editor__story">{{ $t('footprints.editor.story') }}
      <textarea v-model="form.story" class="aqua-field aqua-scroll selectable" rows="6" maxlength="20000" />
    </label>

    <label class="fp-editor__publish">
      <input v-model="form.published" type="checkbox"> {{ $t('footprints.editor.published') }}
    </label>

    <p class="fp-editor__error" role="alert">{{ error }}</p>

    <div class="fp-editor__buttons">
      <button type="button" class="aqua-button" @click="$emit('close')">{{ $t('footprints.cancel') }}</button>
      <button type="submit" class="aqua-button aqua-button--default" :disabled="saving">{{ saving ? $t('footprints.editor.saving') : $t('footprints.editor.save') }}</button>
    </div>
  </form>
</template>

<script>
import FootprintsMap from './FootprintsMap.vue'
import { CATEGORIES, categoryLabel } from './shared'
import { footprints as api } from '../../api/client'

export default {
  name: 'PlaceEditor',
  components: { FootprintsMap },
  props: {
    // The place being edited, or null for a new one
    place: { type: Object, default: null }
  },
  emits: ['close', 'saved'],
  data() {
    const p = this.place || {}
    return {
      form: {
        name: p.name || '',
        category: p.category || 'city',
        country: p.country || '',
        region: p.region || '',
        city: p.city || '',
        rating: p.rating || null,
        lat: p.lat != null ? p.lat : '',
        lng: p.lng != null ? p.lng : '',
        story: p.story || '',
        published: p.published !== false
      },
      visit: { start_date: '', end_date: '' },
      query: '',
      results: [],
      searching: false,
      saving: false,
      error: ''
    }
  },
  computed: {
    categories() {
      return CATEGORIES.map(value => ({ value, label: categoryLabel(value) }))
    },
    point() {
      const { lat, lng } = this.form
      return lat !== '' && lng !== '' && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) ? { lat: Number(lat), lng: Number(lng) } : null
    }
  },
  methods: {
    async search() {
      this.searching = true
      this.error = ''
      try {
        this.results = await api.geocode(this.query)
        if (!this.results.length) {
          this.error = this.$t('footprints.editor.notFound')
        }
      } catch (e) {
        this.error = e.message
      } finally {
        this.searching = false
      }
    },
    apply(result) {
      Object.assign(this.form, {
        name: this.form.name || result.name,
        country: result.country,
        region: result.region,
        city: result.city,
        lat: Number(result.lat.toFixed(6)),
        lng: Number(result.lng.toFixed(6))
      })
      this.results = []
      this.$refs.map.centerOn(result.lat, result.lng)
    },
    // Clicking the map sets the coordinates and fills in any blank address parts
    async pick({ lat, lng }) {
      this.form.lat = Number(lat.toFixed(6))
      this.form.lng = Number(lng.toFixed(6))
      try {
        const found = await api.reverse(this.form.lat, this.form.lng)
        if (found) {
          ['country', 'region', 'city'].forEach(key => {
            this.form[key] = this.form[key] || found[key]
          })
          this.form.name = this.form.name || found.name
        }
      } catch (e) {
        // Coordinates alone are enough
      }
    },
    async save() {
      this.saving = true
      this.error = ''
      try {
        const body = { ...this.form, cover_photo_id: this.place ? this.place.cover_photo_id : null }
        let saved = this.place ? await api.update(this.place.id, body) : await api.create(body)
        if (!this.place && this.visit.start_date) {
          saved = await api.addVisit(saved.id, this.visit)
        }
        this.$emit('saved', saved)
      } catch (e) {
        this.error = e.message
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style lang="scss">
.fp-editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 14px 18px 16px;
  font-size: 12px;
}

.fp-editor__title {
  margin: 0;
  font-size: 13px;
}

.fp-editor__search {
  display: flex;
  gap: 8px;

  input {
    flex: 1;
  }
}

.fp-editor__results {
  max-height: 120px;
  margin: -4px 0 0;
  padding: 0;
  list-style: none;
  border: 1px solid #8c8c8c;
  background: #fff;

  .aqua-row:hover {
    color: #fff;
    background: var(--aqua-selection);
  }
}

.fp-editor__map {
  position: relative;
  height: 190px;
  border: 1px solid #8c8c8c;
  isolation: isolate;
}

.fp-editor__map-hint {
  position: absolute;
  left: 8px;
  bottom: 6px;
  z-index: 500;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.85);
  pointer-events: none;
}

.fp-editor__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 14px;

  label {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
}

.fp-editor__rating {
  display: flex;
  flex-direction: column;
  gap: 2px;

  button {
    padding: 0 1px;
    border: 0;
    font-size: 18px;
    line-height: 20px;
    color: #c8c8c8;
    background: none;
    cursor: default;

    &.is-on {
      color: #e8a10c;
      text-shadow: 0 1px 0 rgba(0, 0, 0, 0.25);
    }
  }
}

.fp-editor__story {
  display: flex;
  flex-direction: column;
  gap: 2px;

  textarea {
    height: auto;
    padding: 4px 6px;
    line-height: 1.5;
    resize: vertical;
  }
}

.fp-editor__publish input {
  accent-color: var(--aqua-selection);
}

.fp-editor__error {
  min-height: 14px;
  margin: 0;
  color: #c41a12;
}

.fp-editor__buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 767px) {
  .fp-editor__grid {
    grid-template-columns: 1fr;
  }
}
</style>
