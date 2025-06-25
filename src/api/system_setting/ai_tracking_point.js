import request from '@/utils/request'

// 获取一级页面访问统计
export const getAccessStatistics = data => {
  return request.post('/v1/system/account/buriedPointCount/buriedPointCountData', data)
}
// 导出
export const exportAIStatistics = data => {
  return request.post(`/v1/system/account/buriedPointCount/exportBuriedPointCountData`, data)
}
