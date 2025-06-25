import request from '@/utils/request'

// 店铺管理-获取抖店店铺列表
export const listDouDian = data => {
  return request.post(`/cgp/web/DouDian/listDouDian`, data)
}
