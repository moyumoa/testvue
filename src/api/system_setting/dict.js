import request from '@/utils/request'

// 获取字典列表
export function getDictType() {
  return request.post(`/v1/system/account/dim/dimSupportList`)
}
// 获取字典子集
export function getDictChildList(data) {
  return request.post(`/v1/system/account/dim/list/${data}`)
}

// 新增字典子集
export function addDictChild(data, dimType) {
  return request.post(`/v1/system/account/dim/add/${dimType}`, data)
}

// 编辑字典子集
export function updateDictChild(data, dimType) {
  return request.post(`/v1/system/account/dim/update/${dimType}`, data)
}

// 删除字典子集
export function delDictChild(data, dimType) {
  return request.post(`/v1/system/account/dim/delete/${dimType}`, data)
}
