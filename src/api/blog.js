import request from '../utils/request'

export function getCategories() {
  return request({
    url: '/',
    method: 'get',
  })
}

export function getBlogs(category) {
  return request({
    url: '/' + category,
    method: 'get',
  })
}

export function getBlog(category, id) {
  return request({
    url: '/' + category + '/' + id,
    method: 'get',
  })
}
