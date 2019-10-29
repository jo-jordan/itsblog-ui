import request from '../utils/request'

export function getList(query) {
  return request({
    url: '/app/blog/list',
    method: 'get',
    params: query
  })
}

export function findById(query) {
  return request({
    url: '/app/blog/find-by-id',
    method: 'get',
    params: query
  })
}
