import { defineStore } from 'pinia'
import { session as api } from '../api/client'

// Whether the site owner is signed in (enables editing footprints)
export const useSessionStore = defineStore('session', {
  state: () => ({
    checked: false,
    configured: true,
    loggedIn: false
  }),
  actions: {
    set({ configured, loggedIn }) {
      this.checked = true
      this.configured = configured
      this.loggedIn = loggedIn
    },
    async check() {
      try {
        this.set(await api.get())
      } catch (e) {
        // No API (e.g. plain static hosting): the site stays read-only
        this.set({ configured: false, loggedIn: false })
      }
    },
    async login(password) {
      await api.login(password)
      this.set({ configured: this.configured, loggedIn: true })
    },
    async logout() {
      await api.logout()
      this.set({ configured: this.configured, loggedIn: false })
    }
  }
})
