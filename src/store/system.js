import { defineStore } from 'pinia'
import { wallpapers } from '../config/wallpapers'
import { setLocale } from '../i18n'
import { useWindowsStore } from './windows'

const PREFS_KEY = 'itsblog.prefs'
const BOOTED_KEY = 'itsblog.booted'

const defaultPrefs = {
  wallpaper: wallpapers[0].id,
  appearance: 'blue',
  magnification: true,
  minimizeEffect: 'genie',
  // 'auto' follows the browser; otherwise a locale id from src/i18n
  language: 'auto'
}

function loadPrefs() {
  try {
    return { ...defaultPrefs, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }
  } catch (e) {
    return { ...defaultPrefs }
  }
}

function hasBooted() {
  try {
    return sessionStorage.getItem(BOOTED_KEY) === '1'
  } catch (e) {
    return false
  }
}

// Preferences and the power state of the machine
export const useSystemStore = defineStore('system', {
  state: () => ({
    prefs: loadPrefs(),
    // booting → on → sleep | off
    power: hasBooted() ? 'on' : 'booting'
  }),
  actions: {
    setPref({ key, value }) {
      this.prefs = { ...this.prefs, [key]: value }
      if (key === 'language') {
        setLocale(value)
      }
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(this.prefs))
      } catch (e) {
        // Preferences simply won't survive a reload
      }
    },
    booted() {
      this.power = 'on'
      try {
        sessionStorage.setItem(BOOTED_KEY, '1')
      } catch (e) {
        // Boot screen will show again next visit
      }
    },
    sleep() {
      this.power = 'sleep'
    },
    wake() {
      this.power = 'on'
    },
    restart() {
      useWindowsStore().closeAll()
      this.power = 'booting'
    },
    shutDown() {
      useWindowsStore().closeAll()
      this.power = 'off'
    }
  }
})
