import request from '@/utils/request'

// 任务标签保存
export const saveTag = data => {
  return request.post(`/mission/task/tag/save`, data)
}
// 任务标签列表
export const tagList = data => {
  return request.post(`/mission/task/tag/list`, data)
}
