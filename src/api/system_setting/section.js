import request from '@/utils/request'

// 获取组织架构tree
export function getSectionTree(data) {
  return request.post(`/v1/system/account/dept/getDeptTree`, data)
}
// 同步组织架构
export function syncOrg(data) {
  return request.post(`/v1/system/account/orgSyncConfig/syncOrg`, data)
}
// 是否允许员工自动注册
export function updateAutoRegisterStatus(data) {
  return request.post(`/v1/system/account/orgSyncConfig/updateAutoRegisterStatus`, data)
}
// 设置默认角色
export function setDefaultRole(data) {
  return request.post(`/v1/system/account/orgSyncConfig/setDefaultRole`, data)
}
// 修改企业编号
export function updateDisplayId(data) {
  return request.post(`/v1/system/account/orgSyncConfig/updateDisplayId`, data)
}
// 组织架构同步信息
export function orgSyncConfig(data) {
  return request.post(`/v1/system/account/orgSyncConfig/getOrgSyncInfoVO`, data)
}
// 查询部门列表
export function dept(data) {
  return request.post(`/v1/system/account/dept/queryDepartment`, data)
}
// 查询品牌下的全部层级别名
export function aliasList(data) {
  return request.post(`/v1/system/account/dept/alias/list`, data)
}
// 批量添加层级别名
export function aliasAdd(data) {
  return request.post(`/v1/system/account/dept/alias/add`, data)
}
