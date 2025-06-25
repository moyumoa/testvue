import request from '@/utils/request'
// 团购数据-列表
export const guestOrderList = data => {
  return request.post(`/oc/life/order/page`, data)
}

// 团购数据-列表导出
export const exportClues = data => {
  return request.post(`/oc/life/order/export`, data)
}

// 来客商家列表
export const listLifeAuthAccount = data => {
  return request.post('/v1/system/account/api/locallife/listLifeAuthAccount', data)
}
// 抖音来客-授权-获取二维码
export const getLifeAuthGuid = data => {
  return request.post(`/v1/system/account/api/locallife/accountLifeAuthLink`, data)
}
// 抖音来客-授权-轮询授权状态
export const getLifeAuthStatus = data => {
  return request.post(`/v1/system/account/api/locallife/accountLifeAuthFresh`, data)
}
// 抖音来客-授权-继续授权
export const continueLifeAuth = data => {
  return request.post(`/v1/system/account/api/locallife/accountContinueLifeAuth`, data)
}
// 抖音来客-列表-解除授权
export const cancelLifeAccountAuth = data => {
  return request.post(`/v1/system/account/api/locallife/cancelLifeAccountAuth`, data)
}
// 抖音来客-批量授权-获取地址以及二维码
export const getBatchLifeAuthLink = data => {
  return request.post(`/v1/system/account/api/locallife/getBatchLifeAuthLink`, data)
}

// 券列表
export const getCouponsPage = data => {
  return request.post(`/oc/life/order/certificate/page`, data)
}
// 券列表导出
export const exportCoupons = data => {
  return request.post(`/oc/life/order/certificate/export`, data)
}
