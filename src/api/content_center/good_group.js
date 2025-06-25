import request from '@/utils/request'

// 商品分组-商品分组列表
export const selectList = data => {
  return request.post(`/product/center/productGroup/selectList`, data)
}
// 商品分组-更新商品分组
export const updateGroup = data => {
  return request.post(`/product/center/productGroup/update`, data)
}
