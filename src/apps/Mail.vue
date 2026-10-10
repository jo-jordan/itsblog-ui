<template>
  <form class="mail" @submit.prevent="send">
    <div class="mail__toolbar">
      <button type="submit" class="mail__tool" :disabled="!body.trim()">
        <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 15 29 4 22 28 15 19z" /><path d="M15 19 29 4" /></svg>
        <span>{{ $t('mail.send') }}</span>
      </button>
    </div>
    <div class="mail__headers">
      <label class="mail__field">
        <span>{{ $t('mail.to') }}</span>
        <input class="aqua-field" :value="`${owner} <${email}>`" readonly>
      </label>
      <label class="mail__field">
        <span>{{ $t('mail.subject') }}</span>
        <input v-model="subject" class="aqua-field" :placeholder="$t('mail.subjectPlaceholder')">
      </label>
    </div>
    <textarea v-model="body" class="mail__body aqua-scroll selectable" :placeholder="$t('mail.bodyPlaceholder')" :aria-label="$t('mail.body')" />
  </form>
</template>

<script>
import site from '../config/site'

export default {
  name: 'Mail',
  props: {
    win: { type: Object, required: true }
  },
  data() {
    return {
      owner: site.owner.name,
      email: site.email,
      subject: '',
      body: ''
    }
  },
  computed: {
    title() {
      return this.$t('mail.title')
    }
  },
  watch: {
    title: {
      immediate: true,
      handler(title) {
        this.$emit('title', title)
      }
    }
  },
  methods: {
    send() {
      const params = new URLSearchParams({ subject: this.subject || this.$t('mail.defaultSubject', { domain: site.domain }), body: this.body })
      // URLSearchParams encodes spaces as "+", which mail clients show literally
      window.location.href = `mailto:${this.email}?${params.toString().replace(/\+/g, '%20')}`
    }
  }
}
</script>

<style lang="scss">
.mail {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin: 0;
}

.mail__toolbar {
  display: flex;
  padding: 4px 10px;
  border-bottom: 1px solid #9c9c9c;
}

.mail__tool {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 2px 8px;
  border: 0;
  font: inherit;
  font-size: 11px;
  background: none;
  cursor: default;

  svg {
    width: 28px;
    height: 28px;
    fill: #d9e9fb;
    stroke: #2f6cb8;
    stroke-width: 1.6;
    stroke-linejoin: round;
  }

  &:active:not(:disabled) svg {
    filter: brightness(0.7);
  }

  &:disabled {
    opacity: 0.45;
  }
}

.mail__headers {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 14px;
}

.mail__field {
  display: flex;
  align-items: center;

  span {
    width: 64px;
    text-align: right;
    color: #555;
  }

  input {
    flex: 1;
  }
}

.mail__body {
  flex: 1;
  margin: 0;
  padding: 12px 14px;
  border: 0;
  border-top: 1px solid #9c9c9c;
  font: inherit;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  outline: none;
  background: #fff;
}
</style>
