<template>
  <article class="fp-detail">
    <header class="fp-detail__header">
      <button type="button" class="fp-detail__close" aria-label="关闭详情" @click="$emit('close')">×</button>
      <div v-if="place.cover" class="fp-detail__cover" :style="{ backgroundImage: `url(${place.cover.url})` }" />
      <h2 class="selectable">{{ place.name }}</h2>
      <p class="fp-detail__location">{{ location }}</p>
      <p class="fp-detail__meta">
        <span class="fp-badge">{{ category }}</span>
        <span v-if="place.rating" class="fp-stars" :aria-label="`${place.rating} 星`">{{ stars }}</span>
        <span v-if="!place.published" class="fp-badge fp-badge--draft">未公开</span>
      </p>
      <div v-if="admin" class="fp-detail__admin">
        <button type="button" class="aqua-button" @click="$emit('edit')">编辑…</button>
        <button type="button" class="aqua-button" @click="$emit('delete')">删除…</button>
      </div>
    </header>

    <section class="fp-detail__section">
      <h3>到访记录</h3>
      <ul class="fp-visits">
        <li v-for="visit in place.visits" :key="visit.id">
          <time :datetime="visit.start_date">{{ range(visit) }}</time>
          <span v-if="visit.note" class="fp-visits__note">{{ visit.note }}</span>
          <button v-if="admin" type="button" class="fp-remove" aria-label="删除这次到访" @click="removeVisit(visit)">×</button>
        </li>
        <li v-if="!place.visits.length" class="fp-muted">还没有记录日期</li>
      </ul>
      <form v-if="admin" class="fp-visit-form" @submit.prevent="addVisit">
        <input v-model="visit.start_date" type="date" class="aqua-field" aria-label="到访日期" required>
        <span>–</span>
        <input v-model="visit.end_date" type="date" class="aqua-field" aria-label="离开日期">
        <input v-model="visit.note" class="aqua-field" placeholder="备注" aria-label="备注" maxlength="500">
        <button type="submit" class="aqua-button" :disabled="!visit.start_date || busy">添加</button>
      </form>
    </section>

    <section v-if="html" class="fp-detail__section">
      <h3>游记</h3>
      <div class="markdown-body" v-html="html" />
    </section>

    <section v-if="place.photos.length || admin" class="fp-detail__section">
      <h3>照片 <small v-if="place.photos.length">{{ place.photos.length }}</small></h3>
      <ul class="fp-photos">
        <li v-for="(photo, index) in place.photos" :key="photo.id">
          <button type="button" class="fp-photos__thumb" :aria-label="photo.caption || `照片 ${index + 1}`" @click="$emit('open-photo', index)">
            <img :src="photo.thumb" :alt="photo.caption" loading="lazy">
          </button>
          <div v-if="admin" class="fp-photos__tools">
            <input
              class="aqua-field"
              :value="photo.caption"
              placeholder="说明"
              aria-label="照片说明"
              maxlength="300"
              @change="updateCaption(photo, $event.target.value)"
            >
            <button type="button" class="fp-link" :disabled="isCover(photo)" @click="setCover(photo)">{{ isCover(photo) ? '封面' : '设为封面' }}</button>
            <button type="button" class="fp-remove" aria-label="删除照片" @click="removePhoto(photo)">×</button>
          </div>
        </li>
      </ul>
      <div v-if="admin" class="fp-upload">
        <label class="aqua-button" :class="{ 'is-disabled': busy }">
          添加照片…
          <input type="file" accept="image/*" multiple hidden :disabled="busy" @change="upload($event.target.files); $event.target.value = ''">
        </label>
        <div v-if="progress" class="fp-progress" role="progressbar" :aria-valuenow="progress.done" :aria-valuemax="progress.total">
          <div class="fp-progress__bar"><span :style="{ width: `${(progress.done / progress.total) * 100}%` }" /></div>
          <span>{{ progress.done }} / {{ progress.total }}</span>
        </div>
      </div>
    </section>

    <p v-if="error" class="fp-error" role="alert">{{ error }}</p>
    <p class="fp-detail__coords">{{ place.lat.toFixed(4) }}, {{ place.lng.toFixed(4) }}</p>
  </article>
</template>

<script>
import { renderMarkdown } from '../../utils/markdown'
import { resizeImage } from '../../utils/images'
import { footprints as api } from '../../api/client'
import { CATEGORIES, placeLocation, stars, visitRange } from './shared'
import 'github-markdown-css'

export default {
  name: 'PlaceDetail',
  props: {
    place: { type: Object, required: true },
    admin: { type: Boolean, default: false }
  },
  data() {
    return {
      visit: { start_date: '', end_date: '', note: '' },
      busy: false,
      progress: null,
      error: ''
    }
  },
  computed: {
    html() {
      return this.place.story ? renderMarkdown(this.place.story) : ''
    },
    location() {
      return placeLocation(this.place)
    },
    category() {
      return CATEGORIES[this.place.category] || CATEGORIES.other
    },
    stars() {
      return stars(this.place.rating)
    }
  },
  methods: {
    range(visit) {
      return visitRange(visit.start_date, visit.end_date)
    },
    isCover(photo) {
      return this.place.cover && this.place.cover.url === photo.url
    },
    // Every edit returns the updated place, which the window takes over
    async run(task) {
      this.busy = true
      this.error = ''
      try {
        this.$emit('changed', await task())
      } catch (e) {
        this.error = e.message
      } finally {
        this.busy = false
      }
    },
    addVisit() {
      return this.run(async () => {
        const place = await api.addVisit(this.place.id, this.visit)
        this.visit = { start_date: '', end_date: '', note: '' }
        return place
      })
    },
    removeVisit(visit) {
      return this.run(() => api.removeVisit(visit.id))
    },
    updateCaption(photo, caption) {
      return this.run(() => api.updatePhoto(photo.id, { caption, taken_at: photo.taken_at, sort: photo.sort }))
    },
    setCover(photo) {
      const { name, lat, lng, country, region, city, category, rating, story, published } = this.place
      return this.run(() => api.update(this.place.id, { name, lat, lng, country, region, city, category, rating, story, published, cover_photo_id: photo.id }))
    },
    removePhoto(photo) {
      return this.run(() => api.removePhoto(photo.id))
    },
    // Photos are shrunk in the browser (2048px and a 480px thumbnail) and
    // uploaded one at a time
    upload(files) {
      const list = Array.from(files)
      if (!list.length) {
        return
      }
      this.progress = { done: 0, total: list.length }
      return this.run(async () => {
        let place = this.place
        for (const file of list) {
          const [full, thumb] = await Promise.all([resizeImage(file, 2048, 0.85), resizeImage(file, 480, 0.8)])
          const form = new FormData()
          form.append('photo', full.blob, 'photo.jpg')
          form.append('thumb', thumb.blob, 'thumb.jpg')
          form.append('width', full.width)
          form.append('height', full.height)
          place = await api.addPhoto(this.place.id, form)
          this.$emit('changed', place)
          this.progress.done++
        }
        return place
      }).finally(() => {
        this.progress = null
      })
    }
  }
}
</script>

<style lang="scss">
.fp-detail {
  position: relative;
  padding: 0 0 16px;
  font-size: 12px;

  h3 {
    margin: 0 0 6px;
    font-size: 12px;
    color: #555;

    small {
      font-weight: normal;
      color: #999;
    }
  }
}

.fp-detail__header {
  padding: 14px 16px 10px;
  border-bottom: 1px solid #e3e3e3;

  h2 {
    margin: 0;
    font-size: 20px;
  }
}

.fp-detail__close {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  width: 22px;
  height: 22px;
  border: 1px solid rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  font-size: 14px;
  line-height: 18px;
  color: #333;
  background: linear-gradient(to bottom, #fff, #dadada);
  cursor: default;
}

.fp-detail__cover {
  height: 160px;
  margin: -14px -16px 12px;
  background: #ddd center / cover no-repeat;
}

.fp-detail__location {
  margin: 4px 0 6px;
  color: #555;
}

.fp-detail__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.fp-badge {
  padding: 0 8px;
  border: 1px solid #7aa7e3;
  border-radius: 9px;
  font-size: 11px;
  line-height: 16px;
  color: #1d4f9c;
  background: linear-gradient(to bottom, #eef5ff, #d6e7fd);
}

.fp-badge--draft {
  border-color: #c9a227;
  color: #7a5a00;
  background: linear-gradient(to bottom, #fff9e0, #f5e2a0);
}

.fp-stars {
  color: #e8a10c;
  letter-spacing: 1px;
}

.fp-detail__admin {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.fp-detail__section {
  padding: 12px 16px 4px;

  .markdown-body {
    font-family: var(--aqua-font);
    font-size: 13px;
    line-height: 1.7;
  }
}

.fp-visits {
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 3px 0;
    border-bottom: 1px dotted #ddd;
  }

  time {
    flex: none;
    font-weight: bold;
  }
}

.fp-visits__note {
  flex: 1;
  color: #555;
}

.fp-muted {
  color: #999;
}

.fp-remove {
  margin-left: auto;
  padding: 0 4px;
  border: 0;
  font-size: 14px;
  color: #b33;
  background: none;
  cursor: default;
}

.fp-visit-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 8px;

  input[type='date'] {
    width: 128px;
  }

  input:not([type]) {
    flex: 1;
    min-width: 80px;
  }
}

.fp-photos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.fp-photos__thumb {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  padding: 3px;
  border: 1px solid #b5b5b5;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  cursor: zoom-in;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.fp-photos__tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px 4px;
  margin-top: 4px;

  input {
    width: 100%;
    height: 18px;
    font-size: 11px;
  }
}

.fp-link {
  padding: 0;
  border: 0;
  font: inherit;
  font-size: 11px;
  color: var(--aqua-selection);
  background: none;
  cursor: default;

  &:disabled {
    color: #888;
  }
}

.fp-upload {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;

  .is-disabled {
    opacity: 0.6;
  }
}

// Aqua's striped "barber pole" progress bar
.fp-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.fp-progress__bar {
  flex: 1;
  height: 12px;
  overflow: hidden;
  border: 1px solid #7a8ea8;
  border-radius: 6px;
  background: linear-gradient(to bottom, #eee, #fff);

  span {
    display: block;
    height: 100%;
    background: repeating-linear-gradient(-45deg, var(--aqua-gel-mid) 0 6px, var(--aqua-gel-top) 6px 12px);
    background-size: 17px 100%;
    animation: fp-barber 0.6s linear infinite;
    transition: width 0.3s;
  }
}

@keyframes fp-barber {
  to { background-position: 17px 0; }
}

.fp-error {
  margin: 8px 16px 0;
  color: #c41a12;
}

.fp-detail__coords {
  margin: 12px 16px 0;
  font-size: 10px;
  color: #999;
}
</style>
