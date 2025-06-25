import request from '@/utils/request'

export const updateConfig = data => {
  return request.post(`/mission/sys/config/updateConfig`, data)
}
// export const getConfigByKey = data => {
//   return request.post(`/mission/sys/config/getByKey`, data)
// },
export const getConfigByGroup = data => {
  return request.post(`/mission/sys/config/getByGroup?configGroup=${data.configGroup}`)
}

// 本期推荐本地视频上传信息
export const recommendVideoUpload = data => {
  return request.post(`/mission/v2/video/upload`, data)
}

// 批量获取配置
export const batchGetByGroup = data => {
  return request.post(`/mission/sys/config/batch/getByGroup`, data)
}

// 批量更新配置
export const batchUpdateConfig = data => {
  return request.post(`/mission/sys/config/batch/updateConfig`, data)
}
// 获取创意跟拍模板数量
export const getOpenTemplateCount = data => {
  return request.post(`/mission/sys/config/getOpenTemplateCount`, data)
}
