import request from '@/utils/request'

// 获取后台账号列表
export const getAccount = data => {
  return request.post('/v1/system/account/user/selectUser', data)
}
// 获取后台账号列表-有权限
export const listUserForPc = data => {
  return request.post('/v1/system/account/user/listUserForPc', data)
}
// 添加修改后台账号
export const addOrUptUser = data => {
  return request.post('/v1/system/account/user/addOrUptUser', data)
}
// 删除后台账号
export const deleteUserInfo = data => {
  return request.post('/v1/system/account/user/deleteUserInfo', data)
}
// 后台账号切换状态
export const changeUserInfo = data => {
  return request.post('/v1/system/account/user/changeUserInfo', data)
}
// 运营权限账号
export const getOperatorAccount = data => {
  return request.post('/v1/system/account/user/getOperatorAccount', data)
}

// 获取部门员工
export const deptStaffPage = data => {
  return request.post('/v1/system/account/staff/deptStaffPage', data)
}
// 解除飞书用户绑定
export const relieveFsAccount = data => {
  return request.post('/v1/system/account/user/relieveFsAccount', data)
}

// 员工解除绑定帐户
export const relieveFsAccountByStaffId = data => {
  return request.post('/v1/system/account/user/relieveFsAccountByStaffId', data)
}
// 员工绑定帐户
export const staffBindAccount = data => {
  return request.post('/v1/system/account/user/staffBindAccount', data)
}

// 设置品牌自动开启账号
export const changeBrandAutoEnableAccount = data => {
  return request.post('/v1/system/account/brand/changeBrandAutoEnableAccount', data)
}
// 批量操作账号开关
export const changeUserLoginSwitchBatch = data => {
  return request.post('/v1/system/account/user/changeUserLoginSwitchBatch', data)
}

// 导出用户数据
export const exportUserData = data => {
  return request.post(`/v1/system/account/user/exportUserList`, data)
}
