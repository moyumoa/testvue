import request from '@/utils/request'

// 查询二级行业以及通用行业-专属接口
export const findTrades = data => {
  return request.post('/cgp/web/dict/findTrades', data)
}
