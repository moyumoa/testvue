import request from '@/utils/request'

// 查询员工（通用）
export const getListUserInfo = data => {
  return request.post(`/mission/audit/video/listUserInfo`, data)
}

// 添加审核人（任务）
export const addAuditTaskUser = data => {
  return request.post(`/mission/audit/video/addAuditTaskUser`, data)
}
// 删除审核人（任务）
export const deleteAuditTaskUser = data => {
  return request.post(`/mission/audit/video/deleteAuditTaskUser`, data)
}
// 获取审核人列表(任务)
export const getAuditTaskUser = data => {
  return request.post(`/mission/audit/video/getAuditTaskUser`, data)
}

// 添加审核节点（视频）
export const addAuditNodeUser = data => {
  return request.post(`/mission/audit/video/addAuditNodeUser`, data)
}

// 删除审核节点（视频）
export const deleteAuditNode = data => {
  return request.post(`/mission/audit/video/deleteAuditNode`, data)
}

// 查询审核节点（视频）
export const listAuditNode = data => {
  return request.post(`/mission/audit/video/listAuditNode`, data)
}
