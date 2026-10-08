import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'

// The only admin credential is the ADMIN_PASSWORD secret. Sessions are
// HMAC-signed with a key derived from it, so changing the password signs
// everybody out.
const COOKIE = 'itsblog_admin'
const MAX_AGE = 30 * 24 * 3600
const MAX_FAILURES = 10
const FAILURE_WINDOW = 15 * 60
const encoder = new TextEncoder()

function sessionKey(password) {
  return crypto.subtle.importKey('raw', encoder.encode(`itsblog-session:${password}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

function toBase64Url(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text) {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(binary, ch => ch.charCodeAt(0))
}

async function sign(password, expires) {
  const signature = await crypto.subtle.sign('HMAC', await sessionKey(password), encoder.encode(`admin:${expires}`))
  return `${expires}.${toBase64Url(signature)}`
}

async function verify(password, value) {
  const [expires, signature] = (value || '').split('.')
  if (!password || !expires || !signature || Number(expires) < Date.now() / 1000) {
    return false
  }
  try {
    return await crypto.subtle.verify('HMAC', await sessionKey(password), fromBase64Url(signature), encoder.encode(`admin:${expires}`))
  } catch (e) {
    return false
  }
}

// Compare digests so the comparison takes the same time for any input
async function passwordMatches(given, expected) {
  const [a, b] = await Promise.all([given, expected].map(text => crypto.subtle.digest('SHA-256', encoder.encode(text))))
  const x = new Uint8Array(a)
  const y = new Uint8Array(b)
  let diff = 0
  for (let i = 0; i < x.length; i++) {
    diff |= x[i] ^ y[i]
  }
  return diff === 0
}

export function isConfigured(c) {
  return Boolean(c.env.ADMIN_PASSWORD)
}

export function isAdmin(c) {
  return verify(c.env.ADMIN_PASSWORD, getCookie(c, COOKIE))
}

function clientIp(c) {
  return c.req.header('CF-Connecting-IP') || 'local'
}

export async function login(c, password) {
  if (!isConfigured(c)) {
    throw new HTTPException(503, { message: '尚未设置管理员密码' })
  }
  const db = c.env.DB
  const ip = clientIp(c)
  const now = Math.floor(Date.now() / 1000)
  const { failures } = await db.prepare('SELECT COUNT(*) AS failures FROM login_attempts WHERE ip = ? AND at > ?')
    .bind(ip, now - FAILURE_WINDOW).first()
  if (failures >= MAX_FAILURES) {
    throw new HTTPException(429, { message: '尝试次数过多，请 15 分钟后再试' })
  }
  if (!(await passwordMatches(String(password || ''), c.env.ADMIN_PASSWORD))) {
    await db.batch([
      db.prepare('INSERT INTO login_attempts (ip, at) VALUES (?, ?)').bind(ip, now),
      db.prepare('DELETE FROM login_attempts WHERE at < ?').bind(now - 86400)
    ])
    throw new HTTPException(401, { message: '密码不正确' })
  }
  await db.prepare('DELETE FROM login_attempts WHERE ip = ?').bind(ip).run()
  setCookie(c, COOKIE, await sign(c.env.ADMIN_PASSWORD, now + MAX_AGE), {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: MAX_AGE
  })
}

export function logout(c) {
  deleteCookie(c, COOKIE, { path: '/', secure: true })
}

// Admin routes need a valid session; writes must also carry the custom
// header our own client sends, which a cross-site form or image cannot.
export async function requireAdmin(c, next) {
  if (c.req.method !== 'GET' && c.req.header('X-Requested-With') !== 'itsblog') {
    throw new HTTPException(403, { message: 'Forbidden' })
  }
  if (!(await isAdmin(c))) {
    throw new HTTPException(401, { message: '请先登录' })
  }
  await next()
}
