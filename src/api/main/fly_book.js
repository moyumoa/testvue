import request from '@/utils/request'

// 飞书授权信息查询
export function getAuthInfo(data) {
  return request.get(
    `/v1/system/account/oauth/callback/feishu?code=${data.code}&state=${data.state}`
  )
}

// 企业微信授权信息查询
export function getWeChatAuthInfo(data) {
  return request.get(
    `/v1/system/account/oauth/callback/weChatEnterprise?code=${data.code}&state=${data.state}`
  )
}

// 飞书登录
export function flyBookLogin(data) {
  return request.post(`/v1/system/account/socialLoginByPhone`, data)
}
// 获取Ticket
export function getTicket(data) {
  return request.post('/v1/system/account/getTicket', data)
}
