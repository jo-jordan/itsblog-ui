// Talks to the Worker API. The custom header proves the request came from
// our own pages (the Worker rejects admin writes without it).
export async function request(path, { method = 'GET', body, form } = {}) {
  const headers = { 'X-Requested-With': 'itsblog' }
  let payload
  if (form) {
    payload = form
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }
  let response
  try {
    response = await fetch(`/api${path}`, { method, headers, body: payload, credentials: 'same-origin' })
  } catch (e) {
    throw new Error('无法连接到服务器')
  }
  if (response.status === 204) {
    return null
  }
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error((data && data.error) || `请求失败（${response.status}）`)
  }
  return data
}

export const footprints = {
  list: () => request('/places'),
  get: id => request(`/places/${id}`),
  create: place => request('/admin/places', { method: 'POST', body: place }),
  update: (id, place) => request(`/admin/places/${id}`, { method: 'PUT', body: place }),
  remove: id => request(`/admin/places/${id}`, { method: 'DELETE' }),
  addVisit: (placeId, visit) => request(`/admin/places/${placeId}/visits`, { method: 'POST', body: visit }),
  removeVisit: id => request(`/admin/visits/${id}`, { method: 'DELETE' }),
  addPhoto: (placeId, form) => request(`/admin/places/${placeId}/photos`, { method: 'POST', form }),
  updatePhoto: (id, photo) => request(`/admin/photos/${id}`, { method: 'PUT', body: photo }),
  removePhoto: id => request(`/admin/photos/${id}`, { method: 'DELETE' }),
  geocode: q => request(`/admin/geocode?q=${encodeURIComponent(q)}`),
  reverse: (lat, lng) => request(`/admin/reverse?lat=${lat}&lng=${lng}`)
}

export const session = {
  get: () => request('/session'),
  login: password => request('/session', { method: 'POST', body: { password }}),
  logout: () => request('/session', { method: 'DELETE' })
}
