import request from '@/utils/request'

// 商品分组-商品分组列表
export const uploadFile = data => {
  return request.post(`/cgp/web/oss/uploadFile`, data)
}
