import request from '@/utils/request'

// 验证码登录
export function codeLogin(data) {
  return request.post(`/v1/system/account/loginByPhone`, data)
}

// 获取系统模块权限
export function getSystemPermission(data) {
  return request.post(`/v1/system/account/permission/selectUserPermission`, data)
}

// 登出
export function setLoginOut() {
  return request.post(`/v1/system/account/loginout`)
}

// 新版本的登录  密码/验证码/切换品牌都是这个
export function loginByPhone(data) {
  return request.post(`/v1/system/account/loginByPhone`, data)
}
// 海尔用户登录
export function loginByHaier(data) {
  return request.post(`/v1/system/account/loginByHaier`, data)
}
