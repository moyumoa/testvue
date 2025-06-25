import request from '@/utils/request'

// 个人信息
export const selectUserInfo = data => {
  return request.post('/v1/system/account/user/selectUserInfo', data)
}
// 修改名字
export const uptUserBrandName = data => {
  return request.post('/v1/system/account/user/uptUserBrandName', data)
}
// 手机验证码
export const checkByPhone = data => {
  return request.post('/v1/system/account/user/checkByPhone', data)
}
// 修改密码
export const updatePasswordByPhone = data => {
  return request.post('/v1/system/account/updatePasswordByPhone', data)
}
// 修改头像
export const uptUserPhoto = data => {
  return request.post('/v1/system/account/user/uptUserPhoto', data)
}
// 查询用户详情
export const selectUserInfoData = data => {
  return request.post('/v1/system/account/user/selectUserInfoData', data)
}
// 编辑用户回显
export const userInfoEditData = data => {
  return request.post('/v1/system/account/user/userInfoEditData', data)
}
// 分页查询数据权限矩阵号
export const getUserActDataPmsPage = data => {
  return request.post(
    '/v1/system/account/userAccountDataPermissionsRelation/getUserActDataPmsPage',
    data
  )
}
// 获取矩阵号分组列表
export const getAccountGroupList = data => {
  return request.post(
    '/v1/system/account/userAccountDataPermissionsRelation/getAccountGroupList',
    data
  )
}

// 更新初始化密码状态
export const updateInitPwdStatus = data => {
  return request.post('/v1/system/account/updateInitPwdStatus', data)
}
// 切影[抖店]/基础版的抖店快捷登录
export const getQyQuickLoginUrl = data => {
  return request.post('/v1/auth/center/dyShop/getQyQuickLoginUrl', data)
}

// 获取用户详情有品牌用户名称
export function getUserBrandInfo(data) {
  return request.post(`/v1/system/account/getUserBrandInfo`, data)
}

