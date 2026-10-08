import aqua from '../assets/wallpaper-default.png'

// Desktop pictures offered in System Preferences > 桌面
export const wallpapers = [
  { id: 'aqua', name: 'Aqua 蓝', background: `#3a6ec4 url(${aqua}) center / cover no-repeat` },
  { id: 'aqua-blue', name: 'Aqua 波纹', background: 'radial-gradient(ellipse at 30% 110%, #9cc8ff 0%, #4f8fe6 28%, #1f56b8 58%, #0b2f78 100%)' },
  { id: 'graphite', name: '石墨', background: 'radial-gradient(ellipse at 50% 120%, #c9ced6 0%, #8a929e 35%, #545b66 70%, #2f343b 100%)' },
  { id: 'solid-blue', name: '纯色 · 蓝', background: '#3c6fb9' },
  { id: 'solid-teal', name: '纯色 · 青', background: '#2f8f9d' },
  { id: 'solid-gray', name: '纯色 · 灰', background: '#7f8790' }
]

export function wallpaperBackground(id) {
  return (wallpapers.find(w => w.id === id) || wallpapers[0]).background
}
