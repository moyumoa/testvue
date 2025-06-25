import request from '@/utils/request'
// 矩阵管理-获取table数据
export const listAccountBySumVideo = params => {
  return request.post('/cgp/web/account/listAccountBySumVideo', params)
}
// 矩阵号管理-绑定/更换绑定POI
export const updateAccountPoiData = params => {
  return request.post('/cgp/web/account/updateAccountPoiData', params)
}
// 矩阵号管理-获取批量授权地址
export const getBatchAuthUrl = params => {
  return request.post('/v1/system/account/auth/getBatchAuthUrl', params)
}
// 矩阵号管理-获取小程序批量授权地址
export const getBatchAuthUrlV2 = params => {
  return request.post('/v1/system/account/auth/getBatchAuthUrlV2', params)
}
