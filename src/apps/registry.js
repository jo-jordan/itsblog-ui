import finderIcon from '../assets/macos-x-finder.png'
import mailIcon from '../assets/macos-x-mail.png'
import sherlockIcon from '../assets/macos-x-search.png'
import addressBookIcon from '../assets/macos-x-address-book.png'
import appleIcon from '../assets/macos-x-logo.png'
import documentIcon from '../assets/icons/document.svg'
import preferencesIcon from '../assets/icons/preferences.svg'
import toolboxIcon from '../assets/icons/toolbox.svg'

// Every window on the desktop belongs to one of these applications.
export const apps = {
  finder: {
    name: 'Finder',
    icon: finderIcon,
    component: () => import(/* webpackChunkName: "finder" */ './Finder.vue'),
    size: { width: 900, height: 540 },
    instanceKey: props => (props.location === 'trash' ? 'finder:trash' : props.newWindow ? `finder:${props.newWindow}` : 'finder')
  },
  reader: {
    name: '文本编辑',
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
    name: '地址簿',
    icon: addressBookIcon,
    component: () => import(/* webpackChunkName: "address-book" */ './AddressBook.vue'),
    size: { width: 640, height: 400 }
  },
  // Calendar and time utilities; lunar-javascript only loads with this chunk
  toolbox: {
    name: '实用工具',
    icon: toolboxIcon,
    component: () => import(/* webpackChunkName: "toolbox" */ './Toolbox.vue'),
    size: { width: 860, height: 560 }
  },
  preferences: {
    name: '系统偏好设置',
    icon: preferencesIcon,
    component: () => import(/* webpackChunkName: "preferences" */ './Preferences.vue'),
    size: { width: 620, height: 440 },
    resizable: false
  },
  about: {
    name: '关于本机',
    icon: appleIcon,
    component: () => import(/* webpackChunkName: "about" */ './AboutThisMac.vue'),
    size: { width: 320, height: 380 },
    resizable: false,
    dialog: true
  }
}

// Order of the application icons in the Dock
export const dockApps = ['finder', 'mail', 'sherlock', 'addressBook', 'toolbox', 'preferences']
