import request from '@/utils/request'

// 获取业务主体信息
export function getBusinessEntity(data = {}) {
  return request.post(`/v1/system/account/business/principalData`, data)
}

// 切换业务主体开启/关闭状态
export function switchBusinessEntity(data) {
  return request.post(`/v1/system/account/business/openOrClosePrincipalByType`, data)
}

// 分页获取 被标记的业务主体信息
export function getBusinessEntityByPage(data) {
  return request.post(`/v1/system/account/business/principalList`, data)
}

// 修改业务主体名称
export function principalRename(data) {
  return request.post(`/v1/system/account/business/principalRename`, data)
}

// 获取业务主体部门信息
export function listBusinessBody(data) {
  return request.post(`/v1/system/account/business/listBusinessBody`, data)
}

// 查询部门分组 - 分页
export function getGroupList(data) {
  return request.post(`/v1/system/account/dept/group/listGroup`, data)
}
// 查询部门分组 - 无分页
export function allGroupList(data) {
  return request.post(`/v1/system/account/dept/group/listAllGroup`, data)
}
// 创建分组
export function createDeptGroup(data) {
  return request.post(`/v1/system/account/dept/group/createDeptGroup`, data)
}
// 删除分组
export function deleteDeptGroup(data) {
  return request.post(`/v1/system/account/dept/group/deleteDeptGroup`, data)
}
// 修改分组部门
export function updateGroupDepts(data) {
  return request.post(`/v1/system/account/dept/group/updateGroupDepts`, data)
}
// 修改分组信息
export function updateDeptGroup(data) {
  return request.post(`/v1/system/account/dept/group/updateDeptGroup`, data)
}
// 移动部门至分组
export function moveGroupDepts(data) {
  return request.post(`/v1/system/account/dept/group/moveGroupDepts`, data)
}
// 有分组时筛选组件列表
export function listBusinessGroupBody(data) {
  return request.post(`/v1/system/account/business/listBusinessGroupBody`, data)
}
// 查询是否有分组
export function principalStatus(data) {
  return request.post(`/v1/system/account/dept/group/principalStatus`, data)
}
