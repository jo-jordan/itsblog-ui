<template>
  <form class="login" :class="{ 'is-shaking': shaking }" @submit.prevent="submit" @animationend="shaking = false">
    <header class="login__brand">
      <img :src="appleLogo" alt="" class="login__apple">
      <div class="login__wordmark" role="img" aria-label="Mac OS X" />
    </header>

    <div class="login__user">
      <img :src="avatar" alt="" class="login__avatar">
      <strong>{{ owner }}</strong>
    </div>

    <i18n-t v-if="!configured" keypath="login.notConfigured" tag="p" class="login__note" scope="global">
      <template #secret>
        <code>ADMIN_PASSWORD</code>
      </template>
    </i18n-t>
    <template v-else>
      <label class="login__field">
        <span>{{ $t('login.password') }}</span>
        <input ref="password" v-model="password" type="password" class="aqua-field" autocomplete="current-password" :disabled="busy">
      </label>
      <p class="login__error" role="alert">{{ error }}</p>
    </template>

    <div class="login__buttons">
      <button type="button" class="aqua-button" @click="close">{{ $t('login.cancel') }}</button>
      <button type="submit" class="aqua-button aqua-button--default" :disabled="!configured || busy || !password">{{ $t('login.logIn') }}</button>
    </div>
  </form>
</template>

<script>
import { useSessionStore } from '../store/session'
import { useWindowsStore } from '../store/windows'
import site from '../config/site'
import appleLogo from '../assets/macos-x-logo.png'
import avatar from '../assets/logo.png'

export default {
  name: 'Login',
  props: {
    win: { type: Object, required: true }
  },
  data() {
    return {
      appleLogo,
      avatar,
      owner: site.owner.name,
      password: '',
      error: '',
      busy: false,
      shaking: false
    }
  },
  computed: {
    configured() {
      return useSessionStore().configured
    }
  },
  mounted() {
    if (this.$refs.password) {
      this.$refs.password.focus()
    }
  },
  methods: {
    async submit() {
      this.busy = true
      this.error = ''
      try {
        await useSessionStore().login(this.password)
        this.close()
      } catch (e) {
        // Like the real login window, a wrong password shakes the panel
        this.error = e.message
        this.password = ''
        this.shaking = true
        this.$nextTick(() => this.$refs.password && this.$refs.password.focus())
      } finally {
        this.busy = false
      }
    },
    close() {
      useWindowsStore().close(this.win.id)
    }
  }
}
</script>

<style lang="scss">
.login {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 14px 28px 16px;

  &.is-shaking {
    animation: login-shake 0.45s ease-in-out;
  }
}

.login__brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.login__apple {
  width: 40px;
  height: 40px;
}

.login__wordmark {
  width: 130px;
  height: 28px;
  background: url('../assets/loader-macosx.png') left center / contain no-repeat;
}

.login__user {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.login__avatar {
  width: 56px;
  height: 56px;
  padding: 3px;
  border: 1px solid #9c9c9c;
  border-radius: 4px;
  object-fit: contain;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
}

.login__field {
  display: flex;
  align-items: center;
  align-self: stretch;

  span {
    flex: none;
    min-width: 52px;
    text-align: right;

    // The full-width Chinese colon brings its own space; "Password:" does not
    &:lang(en) {
      padding-right: 6px;
    }
  }

  input {
    flex: 1;
  }
}

.login__error {
  min-height: 16px;
  margin: -4px 0 0;
  font-size: 11px;
  color: #c41a12;
}

.login__note {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: #444;
  text-align: center;

  code {
    font-size: 11px;
  }
}

.login__buttons {
  display: flex;
  gap: 12px;
  align-self: flex-end;
  margin-top: auto;
}

@keyframes login-shake {
  0%, 100% { transform: translateX(0); }
  15%, 45%, 75% { transform: translateX(-12px); }
  30%, 60%, 90% { transform: translateX(12px); }
}

@media (prefers-reduced-motion: reduce) {
  .login.is-shaking {
    animation: none;
  }
}
</style>
