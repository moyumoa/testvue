import request from '@/utils/request'

// 获取登录用户信息
export function getData(data) {
  return request.post(`/v1/system/account/getLoginUserInfo`, data)
}
