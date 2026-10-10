<script>
import { h } from 'vue'

// Small 16 × 16 list icons for the toolbox source list, drawn as plain SVG shapes
const glyphs = {
  almanac: [
    ['rect', { x: 2.5, y: 1.5, width: 11, height: 13, rx: 1.5, fill: '#fffdf4', stroke: '#8a6d3b' }],
    ['path', { d: 'M2.5 5.5V3a1.5 1.5 0 0 1 1.5-1.5h8A1.5 1.5 0 0 1 13.5 3v2.5z', fill: '#d42a1e', stroke: '#8f1610' }],
    ['path', { d: 'M5 8h6M5 10h6M5 12h4', stroke: '#c0392b', 'stroke-width': 1 }]
  ],
  calendar: [
    ['rect', { x: 1.5, y: 2.5, width: 13, height: 12, rx: 1.5, fill: '#fff', stroke: '#5a6b80' }],
    ['path', { d: 'M1.5 6V4a1.5 1.5 0 0 1 1.5-1.5h10A1.5 1.5 0 0 1 14.5 4v2z', fill: '#3d80df', stroke: '#1d5fc8' }],
    ['path', { d: 'M4 8.5h1.5M7.25 8.5h1.5M10.5 8.5H12M4 11h1.5M7.25 11h1.5M4 13h1.5', stroke: '#7a8796', 'stroke-width': 1.3 }],
    ['path', { d: 'M10.5 11H12', stroke: '#d42a1e', 'stroke-width': 1.3 }]
  ],
  converter: [
    ['path', { d: 'M9.5 1.8a6.2 6.2 0 1 0 4.8 9.8A5 5 0 0 1 9.5 1.8z', fill: '#f6cf4a', stroke: '#b8860b' }],
    ['path', { d: 'M11 4.5h3.5M12.8 3l1.7 1.5-1.7 1.5', stroke: '#2a5fa8', fill: 'none', 'stroke-width': 1.2 }]
  ],
  terms: [
    ['path', { d: 'M8 .8v2.4M8 12.8v2.4M.8 8h2.4M12.8 8h2.4M2.9 2.9l1.7 1.7M11.4 11.4l1.7 1.7M2.9 13.1l1.7-1.7M11.4 4.6l1.7-1.7', stroke: '#f08a00', 'stroke-width': 1.4 }],
    ['circle', { cx: 8, cy: 8, r: 3.6, fill: '#fbb829', stroke: '#c2660a' }]
  ],
  holidays: [
    ['path', { d: 'M8 .5v2', stroke: '#8a6d3b' }],
    ['rect', { x: 5.5, y: 2.5, width: 5, height: 1.6, rx: 0.5, fill: '#e2b13c', stroke: '#9c7414', 'stroke-width': 0.6 }],
    ['ellipse', { cx: 8, cy: 8.3, rx: 5.6, ry: 4.4, fill: '#e0261b', stroke: '#9c120c' }],
    ['path', { d: 'M8 4v8.6M5 4.6c-1.5 2-1.5 5.4 0 7.4M11 4.6c1.5 2 1.5 5.4 0 7.4', stroke: '#ff8a7a', 'stroke-width': 0.7, fill: 'none' }],
    ['rect', { x: 5.5, y: 12.4, width: 5, height: 1.4, rx: 0.5, fill: '#e2b13c', stroke: '#9c7414', 'stroke-width': 0.6 }],
    ['path', { d: 'M8 13.8V16', stroke: '#e2b13c', 'stroke-width': 1.2 }]
  ],
  diff: [
    ['path', { d: 'M2 2.5v11M14 2.5v11', stroke: '#4c535c', 'stroke-width': 1.6 }],
    ['path', { d: 'M3.5 8h9M5.5 5.8 3.5 8l2 2.2M10.5 5.8l2 2.2-2 2.2', stroke: '#2a6fd6', 'stroke-width': 1.4, fill: 'none' }]
  ],
  shift: [
    ['rect', { x: 1.5, y: 2.5, width: 10, height: 10, rx: 1.2, fill: '#fff', stroke: '#5a6b80' }],
    ['path', { d: 'M1.5 5.5v-1.8A1.2 1.2 0 0 1 2.7 2.5h7.6a1.2 1.2 0 0 1 1.2 1.2v1.8z', fill: '#3d80df' }],
    ['circle', { cx: 11.5, cy: 11.5, r: 3.8, fill: '#3fa63b', stroke: '#1f6d1c' }],
    ['path', { d: 'M11.5 9.6v3.8M9.6 11.5h3.8', stroke: '#fff', 'stroke-width': 1.5 }]
  ],
  countdown: [
    ['path', { d: 'M3.5 1v14.5', stroke: '#5b5b5b', 'stroke-width': 1.4 }],
    ['path', { d: 'M4.2 1.8h9.3l-2.4 3.3 2.4 3.3H4.2z', fill: '#e0261b', stroke: '#9c120c' }],
    ['path', { d: 'M5.2 3h5', stroke: '#ff9a8c', 'stroke-width': 0.8 }]
  ],
  age: [
    ['path', { d: 'M8 1.5c.9 1 .9 1.9 0 2.6-.9-.7-.9-1.6 0-2.6z', fill: '#f7a21b' }],
    ['rect', { x: 7.3, y: 4.2, width: 1.4, height: 3.3, fill: '#5aa7f0' }],
    ['rect', { x: 2, y: 7.5, width: 12, height: 7, rx: 1.4, fill: '#f6a6c1', stroke: '#b4527a' }],
    ['path', { d: 'M2.3 9.4c1.2 1 2.4 1 3.6 0s2.4-1 3.6 0 2.4 1 3.6 0 .6-.4.6-.4V8.8A1.3 1.3 0 0 0 12.6 7.5H3.4A1.3 1.3 0 0 0 2 8.8z', fill: '#fff' }]
  ],
  week: [
    ['rect', { x: 1.5, y: 2.5, width: 13, height: 11, rx: 1.5, fill: '#fff', stroke: '#5a6b80' }],
    ['path', { d: 'M3.3 5v6.5M5.2 5v6.5M7.1 5v6.5M8.9 5v6.5M10.8 5v6.5', stroke: '#9aa6b4', 'stroke-width': 1.3 }],
    ['path', { d: 'M12.7 5v6.5', stroke: '#d42a1e', 'stroke-width': 1.3 }]
  ],
  timestamp: [
    ['rect', { x: 1.5, y: 2.5, width: 13, height: 11, rx: 1.8, fill: '#1e2127', stroke: '#000' }],
    ['path', { d: 'M3.5 6l2 1.8-2 1.8M7 10.5h4', stroke: '#5df36a', 'stroke-width': 1.3, fill: 'none' }]
  ],
  worldclock: [
    ['circle', { cx: 8, cy: 8, r: 6.5, fill: '#3d80df', stroke: '#1d4f9c' }],
    ['path', { d: 'M4 4.5c1.5.3 2 1.5 1.3 2.6-.6 1 .3 2 1.4 2.2.9.2.7 1.6.2 2.6M9.5 2.4c-.2 1.2.6 1.6 1.6 1.7 1.2.1 1.7 1.2 1 2.1', fill: 'none', stroke: '#7ed36f', 'stroke-width': 1.6 }],
    ['path', { d: 'M1.5 8h13M8 1.5c-3.2 3.6-3.2 9.4 0 13M8 1.5c3.2 3.6 3.2 9.4 0 13', fill: 'none', stroke: '#d6e9ff', 'stroke-width': 0.6 }]
  ],
  duration: [
    ['path', { d: 'M3 1.5h10M3 14.5h10', stroke: '#8a6d3b', 'stroke-width': 1.6 }],
    ['path', { d: 'M4.2 2c0 3 3 4.4 3 6s-3 3-3 6h7.6c0-3-3-4.4-3-6s3-3 3-6z', fill: '#e8f3ff', stroke: '#6b8bb0' }],
    ['path', { d: 'M5.6 13.6c.6-1.6 2.4-2.2 2.4-2.2s1.8.6 2.4 2.2zM6.2 4.6h3.6L8 6.6z', fill: '#e2b13c' }]
  ],
  cron: [
    ['circle', { cx: 8, cy: 8, r: 5.4, fill: 'none', stroke: '#6b7480', 'stroke-width': 2.6, 'stroke-dasharray': '2.1 2.14' }],
    ['circle', { cx: 8, cy: 8, r: 4.4, fill: '#b8c0ca', stroke: '#5c6470' }],
    ['circle', { cx: 8, cy: 8, r: 1.6, fill: '#fff', stroke: '#5c6470' }]
  ],
  timer: [
    ['rect', { x: 6.5, y: 0.5, width: 3, height: 2, rx: 0.5, fill: '#8a9099' }],
    ['path', { d: 'M12.2 3.4l1.2-1.2', stroke: '#8a9099', 'stroke-width': 1.5 }],
    ['circle', { cx: 8, cy: 9, r: 6, fill: '#fff', stroke: '#4c535c', 'stroke-width': 1.3 }],
    ['path', { d: 'M8 9V5.2', stroke: '#d42a1e', 'stroke-width': 1.3 }],
    ['circle', { cx: 8, cy: 9, r: 0.9, fill: '#4c535c' }]
  ]
}

export default {
  name: 'ToolGlyph',
  props: {
    name: { type: String, required: true }
  },
  render() {
    const shapes = glyphs[this.name] || []
    return h('svg', {
      class: 'tool-glyph', viewBox: '0 0 16 16', width: 16, height: 16, 'aria-hidden': 'true', focusable: 'false'
    }, shapes.map(([tag, attrs]) => h(tag, { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...attrs })))
  }
}
</script>
