import request from '@/utils/request'

// 留资商品-获取留资商品列表
export const selectList = data => {
  return request.post(`/product/center/leaveInformation/selectList`, data)
}
// 留资商品-批量保存或者更新留资商品
export const saveOrUpdateLIProduct = data => {
  return request.post(`/product/center/leaveInformation/saveOrUpdateLIProduct`, data)
}
// 留资商品-批量保存或者更新留资配置
export const saveOrUpdateConfig = data => {
  return request.post(`/product/center/leaveInformation/saveOrUpdateConfig`, data)
}
// 留资商品-获取留资配置
export const getConfig = data => {
  return request.post(`/product/center/leaveInformation/getConfig`, data)
}
// 留资商品-获取单个留资商品
export const getLIProduct = data => {
  return request.post(`/product/center/leaveInformation/getLIProduct`, data)
}
