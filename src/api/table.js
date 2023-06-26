import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/document/getAllData',
    method: 'get',
    params
  })
}
