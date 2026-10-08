// localStorage for the toolbox; every access may throw (private mode, blocked storage)
const PREFIX = 'itsblog.toolbox.'

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch (e) {
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch (e) {
    // The setting simply won't survive a reload
  }
}
