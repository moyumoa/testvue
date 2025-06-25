import request from '@/utils/request'

// 获取所有配置值
export const getAllConfiguration = data => {
  return request.post(`/mission/sys/config/getAll`, data)
}

// 获取指定的配置值
export const getConfigurationByKey = params => {
  return request.post(`/mission/sys/config/getByKey?configKey=${params.key}`)
}

// 更新配置值
export const updateConfig = data => {
  return request.post(`/mission/sys/config/updateConfig`, data)
}
