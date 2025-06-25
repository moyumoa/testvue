import request from '@/utils/request'

// 聚合商品-查询列表[店铺矩阵]
export const polymerization = data => {
  return request.post(`/product/center/shopProduct/polymerization`, data)
}
// 聚合商品-查询列表[运营报表]
export const daily = data => {
  return request.post(`/product/center/shopProduct/product/daily`, data)
}
