import request from '@/utils/request'
// 当前用户权限
export const selectUserPermission = data => {
  return request.post('/v1/system/account/permission/selectUserPermission', data)
}
// 添加修改用户权限
export const addOrUptRolePermission = data => {
  return request.post('/v1/system/account/permission/addOrUptRolePermission', data)
}
// 权限详情
export const selectRolePermission = data => {
  return request.post('/v1/system/account/permission/selectRolePermission', data)
}
