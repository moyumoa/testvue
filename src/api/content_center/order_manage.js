import request from '@/utils/request'

// 获取父订单列表
export const getShopOrderParent = data => {
  return request.post(`/oc/front/getShopOrderParent`, data)
}
