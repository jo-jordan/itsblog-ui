import finderIcon from '../assets/macos-x-finder.png'
import mailIcon from '../assets/macos-x-mail.png'
import sherlockIcon from '../assets/macos-x-search.png'
import addressBookIcon from '../assets/macos-x-address-book.png'
import appleIcon from '../assets/macos-x-logo.png'
import documentIcon from '../assets/icons/document.svg'
import preferencesIcon from '../assets/icons/preferences.svg'
import footprintsIcon from '../assets/icons/footprints.svg'
import loginIcon from '../assets/logo.png'
import toolboxIcon from '../assets/icons/toolbox.svg'
import { t } from '../i18n'

// Every window on the desktop belongs to one of these applications. Translated
// names are getters so they follow the language wherever they are rendered.
export const apps = {
  finder: {
    name: 'Finder',
    icon: finderIcon,
    component: () => import(/* webpackChunkName: "finder" */ './Finder.vue'),
    size: { width: 900, height: 540 },
    instanceKey: props => (props.location === 'trash' ? 'finder:trash' : props.newWindow ? `finder:${props.newWindow}` : 'finder')
  },
  reader: {
    get name() { return t('apps.reader') },
    icon: documentIcon,
    component: () => import(/* webpackChunkName: "reader" */ './Reader.vue'),
    size: { width: 760, height: 620 },
    instanceKey: props => `reader:${props.slug}`
  },
  mail: {
    name: 'Mail',
    icon: mailIcon,
    component: () => import(/* webpackChunkName: "mail" */ './Mail.vue'),
    size: { width: 580, height: 460 }
  },
  sherlock: {
    name: 'Sherlock',
    icon: sherlockIcon,
    component: () => import(/* webpackChunkName: "sherlock" */ './Sherlock.vue'),
    size: { width: 640, height: 480 }
  },
  addressBook: {
    get name() { return t('apps.addressBook') },
    icon: addressBookIcon,
    component: () => import(/* webpackChunkName: "address-book" */ './AddressBook.vue'),
    size: { width: 640, height: 400 }
  },
  footprints: {
    get name() { return t('apps.footprints') },
    icon: footprintsIcon,
    component: () => import(/* webpackChunkName: "footprints" */ './Footprints.vue'),
    size: { width: 1020, height: 640 }
  },
  login: {
    get name() { return t('apps.login') },
    icon: loginIcon,
    component: () => import(/* webpackChunkName: "login" */ './Login.vue'),
    size: { width: 380, height: 330 },
    resizable: false,
    dialog: true
  },
  // Calendar and time utilities; lunar-javascript only loads with this chunk
  toolbox: {
    get name() { return t('apps.toolbox') },
    icon: toolboxIcon,
    component: () => import(/* webpackChunkName: "toolbox" */ './Toolbox.vue'),
    size: { width: 860, height: 560 }
  },
  preferences: {
    get name() { return t('apps.preferences') },
    icon: preferencesIcon,
    component: () => import(/* webpackChunkName: "preferences" */ './Preferences.vue'),
    size: { width: 620, height: 440 },
    resizable: false
  },
  about: {
    get name() { return t('apps.about') },
    icon: appleIcon,
    component: () => import(/* webpackChunkName: "about" */ './AboutThisMac.vue'),
    size: { width: 320, height: 380 },
    resizable: false,
    dialog: true
  }
}

// Order of the application icons in the Dock
export const dockApps = ['finder', 'mail', 'sherlock', 'addressBook', 'toolbox', 'footprints', 'preferences']
