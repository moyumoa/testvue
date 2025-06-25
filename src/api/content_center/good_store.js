import request from '@/utils/request'

// 抖店商品-查询所有小店信息
export const queryAllShop = data => {
  return request.post(`/product/center/shopAuth/queryAllShop`, data)
}
// 抖店商品-商品分组列表
export const selectSimpleList = data => {
  return request.post(`/product/center/productGroup/selectSimpleList`, data)
}
// 抖店商品-获取抖店商品列表
export const selectList = data => {
  return request.post(`/product/center/shopProduct/selectList`, data)
}
// 抖店商品-批量更新抖店商品
export const UpdateShopProduct = data => {
  return request.post(`/product/center/shopProduct/UpdateShopProduct`, data)
}
// 抖店商品-新增商品分组
export const addGroup = data => {
  return request.post(`/product/center/productGroup/add`, data)
}
