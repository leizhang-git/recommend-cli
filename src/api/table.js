import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/document/getAllData',
    method: 'get',
    params
  })
}

export function getAllDClass() {
  return request({
    url: '/document/getAllDClass',
    method: 'get'
  })
}

export function searchData(data) {
  return request({
    url: '/document/searchData',
    method: 'post',
    data
  })
}

export function exportExcel(data) {
  return request({
    url: '/document/exportExcel',
    method: 'post',
    header: {
      headers: { 'Content-Type': 'application/x-download' }
    },
    data
  })
}

export function deleteById(id) {
  return request({
    url: `/document/delete/${id}`,
    method: 'get'
  })
}

export function insertDocument(data) {
  return request({
    url: '/document/insert',
    method: 'post',
    data
  })
}

export function uploadDocument(file) {
  return request({
    url: '/document/upload',
    method: 'post',
    header: {
      headers: { 'Content-Type': 'multipart/form-data' }
    },
    file
  })
}
