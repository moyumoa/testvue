import request from '@/utils/request'

// 获取角色列表
export const selectRole = data => {
  return request.post('/v1/system/account/role/selectRole', data)
}
// 创建修改角色
export const addOrUptRole = data => {
  return request.post('/v1/system/account/role/addOrUptRole', data)
}
// 删除角色
export const deleteRole = data => {
  return request.post('/v1/system/account/role/deleteRole', data)
}
// 筛选框专用
export const selectRoleList = data => {
  return request.post('/v1/system/account/role/selectRoleList', data)
}
