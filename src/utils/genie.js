// Mac OS X "Genie" and "Scale" minimise effects built from Web Animations.
// `from` is the window's rect and `to` the Dock tile it disappears into.

const ROWS = 12
const STEPS = 16

function smoothstep(t) {
  return t * t * (3 - 2 * t)
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

// Clip the window into a funnel whose bottom edge narrows towards the target
function funnel(width, height, left, right, squeeze) {
  const leftSide = []
  const rightSide = []
  for (let i = 0; i <= ROWS; i++) {
    const y = (i / ROWS) * height
    const s = smoothstep(i / ROWS) * squeeze
    leftSide.push(`${lerp(0, left, s).toFixed(1)}px ${y.toFixed(1)}px`)
    rightSide.unshift(`${lerp(width, right, s).toFixed(1)}px ${y.toFixed(1)}px`)
  }
  return `polygon(${leftSide.concat(rightSide).join(', ')})`
}

function genieFrames(from, to) {
  const left = to.left - from.left
  const right = left + to.width
  const dy = to.top + to.height / 2 - from.top
  const frames = []
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS
    // First the bottom of the window bends towards the Dock, then it slides in
    const squeeze = Math.min(1, t / 0.45)
    const slide = Math.max(0, (t - 0.35) / 0.65)
    frames.push({
      clipPath: funnel(from.width, from.height, left, right, squeeze),
      transform: `translateY(${(smoothstep(slide) * dy).toFixed(1)}px) scaleY(${(1 - 0.97 * smoothstep(slide)).toFixed(3)})`,
      opacity: 1 - 0.5 * slide
    })
  }
  return frames
}

function scaleFrames(from, to) {
  return [
    { transform: 'none', opacity: 1 },
    {
      transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width}, ${to.height / from.height})`,
      opacity: 0.4
    }
  ]
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function animateMinimize(el, to, { effect = 'genie', reverse = false } = {}) {
  if (!to || !el.animate || prefersReducedMotion()) {
    return Promise.resolve()
  }
  const from = el.getBoundingClientRect()
  const frames = effect === 'scale' ? scaleFrames(from, to) : genieFrames(from, to)
  // Origin at the top so the genie slide squashes the window downwards
  el.style.transformOrigin = effect === 'scale' ? 'top left' : 'top center'
  const animation = el.animate(reverse ? frames.reverse() : frames, {
    duration: effect === 'scale' ? 280 : 520,
    easing: reverse ? 'ease-out' : 'ease-in'
  })
  return animation.finished.catch(() => {}).then(() => {
    el.style.transformOrigin = ''
  })
}
