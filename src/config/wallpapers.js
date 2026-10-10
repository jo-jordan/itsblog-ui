import aqua from '../assets/wallpaper-default.png'

// Desktop pictures offered in System Preferences > Desktop
export const wallpapers = [
  { id: 'aqua', name: { 'zh-CN': 'Aqua 蓝', en: 'Aqua Blue' }, background: `#3a6ec4 url(${aqua}) center / cover no-repeat` },
  { id: 'aqua-blue', name: { 'zh-CN': 'Aqua 波纹', en: 'Aqua Ripple' }, background: 'radial-gradient(ellipse at 30% 110%, #9cc8ff 0%, #4f8fe6 28%, #1f56b8 58%, #0b2f78 100%)' },
  { id: 'graphite', name: { 'zh-CN': '石墨', en: 'Graphite' }, background: 'radial-gradient(ellipse at 50% 120%, #c9ced6 0%, #8a929e 35%, #545b66 70%, #2f343b 100%)' },
  { id: 'solid-blue', name: { 'zh-CN': '纯色 · 蓝', en: 'Solid Blue' }, background: '#3c6fb9' },
  { id: 'solid-teal', name: { 'zh-CN': '纯色 · 青', en: 'Solid Teal' }, background: '#2f8f9d' },
  { id: 'solid-gray', name: { 'zh-CN': '纯色 · 灰', en: 'Solid Gray' }, background: '#7f8790' }
]

export function wallpaperBackground(id) {
  return (wallpapers.find(w => w.id === id) || wallpapers[0]).background
}
