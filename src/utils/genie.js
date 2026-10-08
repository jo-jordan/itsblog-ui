// Mac OS X minimise effects.
//
// Genie: the window is drawn on a full-screen canvas and warped, row by row,
// down a funnel whose curved sides run from the window into its Dock tile.
// The picture is a snapshot of the real window; without one we fall back to
// a plain white silhouette (the effect this site always had).
//
// Scale: the real window shrinks straight into the Dock tile.

const GENIE_MS = 520
const SCALE_MS = 280
const SNAPSHOT_TIMEOUT_MS = 450

function smoothstep(t) {
  return t * t * (3 - 2 * t)
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Resolves to a canvas picture of `el`, or null if it can't be taken in time
export function snapshot(el) {
  const capture = import(/* webpackChunkName: "snapshot" */ 'html-to-image')
    .then(({ toCanvas }) => toCanvas(el, {
      pixelRatio: 1,
      skipFonts: true,
      // The clone copies every computed style, including the window's fixed
      // position; static positioning puts it at the picture's origin. It must
      // also be visible while the real window is hidden for a restore.
      style: { position: 'static', margin: '0', visibility: 'visible', transform: 'none' }
    }))
    .catch(() => null)
  const timeout = new Promise(resolve => setTimeout(() => resolve(null), SNAPSHOT_TIMEOUT_MS))
  return Promise.race([capture, timeout])
}

function createStage() {
  const canvas = document.createElement('canvas')
  const ratio = window.devicePixelRatio || 1
  canvas.width = Math.round(window.innerWidth * ratio)
  canvas.height = Math.round(window.innerHeight * ratio)
  // Above every window, below the Dock the window disappears into
  canvas.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;z-index:8999;pointer-events:none'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  ctx.scale(ratio, ratio)
  return { canvas, ctx }
}

// One frame of the genie at progress t (0 = window, 1 = inside the tile)
function drawGenie(ctx, from, to, picture, t) {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

  // First the bottom of the window bends down into the Dock (bend), then the
  // rest of the window is pulled through the funnel after it (suck).
  const bend = easeInOut(Math.min(1, t / 0.45))
  const suck = Math.max(0, (t - 0.45) / 0.55)
  const top = lerp(from.top, to.bottom, suck * suck)
  const bottom = lerp(from.bottom, to.bottom, bend)
  const height = bottom - top
  if (height < 1) {
    return
  }

  const funnelTop = from.top
  const funnelHeight = to.bottom - from.top
  const sourceHeight = picture ? picture.height : 0
  const step = 1
  for (let y = top; y < bottom; y += step) {
    const along = smoothstep(Math.min(1, Math.max(0, (y - funnelTop) / funnelHeight))) * bend
    const left = lerp(from.left, to.left, along)
    const right = lerp(from.right, to.right, along)
    if (picture) {
      const sy = ((y - top) / height) * sourceHeight
      const sh = Math.max(1, (step / height) * sourceHeight)
      ctx.drawImage(picture, 0, sy, picture.width, sh, left, y, right - left, step + 0.5)
    } else {
      ctx.fillStyle = '#fff'
      ctx.fillRect(left, y, right - left, step + 0.5)
    }
  }
}

function runGenie(from, to, picture, reverse) {
  const { canvas, ctx } = createStage()
  return new Promise(resolve => {
    const start = performance.now()
    const frame = now => {
      const elapsed = Math.min(1, (now - start) / GENIE_MS)
      drawGenie(ctx, from, to, picture, reverse ? 1 - elapsed : elapsed)
      if (elapsed < 1) {
        requestAnimationFrame(frame)
      } else {
        canvas.remove()
        resolve()
      }
    }
    requestAnimationFrame(frame)
  })
}

function runScale(el, from, to, reverse) {
  const frames = [
    { transform: 'none', opacity: 1 },
    {
      transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width}, ${to.height / from.height})`,
      opacity: 0.4
    }
  ]
  el.style.transformOrigin = 'top left'
  const animation = el.animate(reverse ? frames.reverse() : frames, {
    duration: SCALE_MS,
    easing: reverse ? 'ease-out' : 'ease-in'
  })
  return animation.finished.catch(() => {}).then(() => {
    el.style.transformOrigin = ''
  })
}

// Animates `el` into the Dock tile `to` (or out of it when `reverse`).
// `hide(true/false)` hides the real window while the canvas stands in for it.
export function animateMinimize(el, to, { effect = 'genie', reverse = false, picture = null, hide } = {}) {
  if (!to || prefersReducedMotion()) {
    return Promise.resolve()
  }
  const from = el.getBoundingClientRect()
  if (effect === 'scale') {
    return el.animate ? runScale(el, from, to, reverse) : Promise.resolve()
  }
  hide(true)
  return runGenie(from, to, picture, reverse).then(() => hide(false))
}
