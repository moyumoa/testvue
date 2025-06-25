import request from '@/utils/request'

// 品牌信息详情
export const selectBrand = data => {
  return request.post('/v1/system/account/brand/selectBrand', data)
}
// 套餐使用情况
export const getProductUseInfo = data => {
  return request.post('/v1/system/account/product/getProductUseInfo', data)
}
// 矩阵号接入记录
export const getAccountRecord = data => {
  return request.post('/v1/system/account/auth/getShopAccount', data)
}
// 直播录屏记录
export const getLiveRecord = data => {
  return request.post('/v1/system/account/liveRecord/listLog', data)
}
// 充值记录
export const getListOrder = data => {
  return request.post('/v1/system/account/product/listOrder', data)
}
// 产品单价查询
export const getProductGoodsPrice = data => {
  return request.post('/v1/system/account/product/getProductGoods', data)
}
// 创建订单
export const createOrder = data => {
  return request.post('/v1/system/account/product/createOrder', data)
}
// 获取订单状态
export const getOrderStatus = data => {
  return request.post('/v1/system/account/product/getOrderStatus', data)
}
// 查询智能视频生产日志
export const getVideoRecord = data => {
  return request.post('/v1/system/account/balance-log/sumvideo/listLog', data)
}

// 更换品牌logo
export const updateBrandLogo = data => {
  return request.post('/v1/system/account/updateBrandLogo', data)
}

// 视频智能合成记录导出
export const statExportV2 = data => {
  return request.post(`/v1/system/account/balance-log/sumvideo/exportSumvideoChangeList`, data)
}

// 获取单个成员使用上限列表
export const listUsersSumvideoConfig = data => {
  return request.post(`/v1/system/account/api/brandUser/listUsersSumvideoConfig`, data)
}

export const updateUserSumvideoConfig = data => {
  return request.post(`/v1/system/account/api/brandUser/updateUserSumvideoConfig`, data)
}


