<template>
  <div class="labs" :class="{ 'is-inactive': !focused }">
    <ul class="labs__icons aqua-scroll" :aria-label="$t('apps.labs')" @click.self="selected = null">
      <li
        v-for="project in projects"
        :key="project.id"
        class="labs__item"
        :class="{ 'is-selected': project.id === selected }"
        :title="project.url"
        @click="selected = project.id"
        @dblclick="launch(project)"
      >
        <img :src="project.icon" alt="" class="labs__icon" draggable="false">
        <span class="labs__label">{{ $t(`labs.${project.id}.name`) }}</span>
      </li>
    </ul>

    <section class="labs__info">
      <template v-if="current">
        <img :src="current.icon" alt="" class="labs__info-icon">
        <div class="labs__info-text selectable">
          <h3>{{ $t(`labs.${current.id}.name`) }} <small>{{ $t(`labs.${current.id}.kind`) }}</small></h3>
          <p>{{ $t(`labs.${current.id}.description`) }}</p>
          <a :href="current.url" target="_blank" rel="noopener">{{ host(current) }}</a>
        </div>
        <button type="button" class="aqua-button aqua-button--default labs__open" @click="launch(current)">{{ $t('labs.open') }}</button>
      </template>
      <p v-else class="labs__hint">{{ $t('labs.hint') }}</p>
    </section>

    <footer class="labs__status">{{ $tc('labs.items', projects.length) }}</footer>
  </div>
</template>

<script>
import projects from '../config/labs'

export default {
  name: 'Labs',
  props: {
    win: { type: Object, required: true },
    focused: { type: Boolean, default: false }
  },
  data() {
    return {
      projects,
      selected: null
    }
  },
  computed: {
    current() {
      return this.projects.find(project => project.id === this.selected) || null
    }
  },
  methods: {
    host(project) {
      return new URL(project.url).host
    },
    launch(project) {
      window.open(project.url, '_blank', 'noopener')
    }
  }
}
</script>

<style lang="scss">
.labs {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-top: 1px solid #9c9c9c;
}

.labs__icons {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
  align-content: start;
  gap: 14px 6px;
  margin: 0;
  padding: 22px 16px;
  list-style: none;
  background: #fff;
}

.labs__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: default;
}

.labs__icon {
  width: 72px;
  height: 72px;
  padding: 3px;
  border: 1px solid transparent;
  border-radius: 6px;

  .is-selected > & {
    border-color: #a3a3a3;
    background: rgba(0, 0, 0, 0.14);
  }
}

// Finder icon view: the selected name sits in a rounded highlight
.labs__label {
  max-width: 112px;
  padding: 1px 7px;
  border-radius: 9px;
  font-size: 12px;
  text-align: center;

  .is-selected > & {
    color: #fff;
    background: var(--aqua-selection);
  }

  .is-inactive .is-selected > & {
    color: #000;
    background: var(--aqua-selection-inactive);
  }
}

.labs__info {
  flex: none;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 74px;
  padding: 8px 14px;
  border-top: 1px solid #9c9c9c;

  h3 {
    margin: 0;
    font-size: 13px;

    small {
      margin-left: 4px;
      font-weight: normal;
      color: #6a6a6a;
    }
  }

  p {
    margin: 3px 0;
    font-size: 11px;
    line-height: 1.4;
    color: #333;
  }

  a {
    font-size: 11px;
    color: var(--aqua-selection);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.labs__info-icon {
  flex: none;
  width: 48px;
  height: 48px;
}

.labs__info-text {
  flex: 1;
  min-width: 0;
}

.labs__open {
  flex: none;
}

.labs__hint {
  flex: 1;
  margin: 0;
  font-size: 11px;
  text-align: center;
  color: #555;
}

.labs__status {
  flex: none;
  height: 18px;
  font-size: 11px;
  line-height: 18px;
  text-align: center;
  color: #333;
  border-top: 1px solid #9c9c9c;
}

@media (max-width: 767px) {
  .labs__icons {
    grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
    padding: 16px 8px;
  }

  .labs__info {
    flex-wrap: wrap;
  }
}
</style>
