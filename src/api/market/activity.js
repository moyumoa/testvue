import request from '@/utils/request'

// 获取营销活动列表
export const getActivityList = data => {
  return request.post(`/mission/activity/listActivityReport`, data)
}

// 导出营销活动列表
export const exportListActivityReport = data => {
  return request.post(`/mission/activity/exportListActivityReport`, data)
}

// 运营概览-营销活动列表
export const listActivity = data => {
  return request.post(`/mission/activity/listActivity`, data)
}

// 任务创建时选择活动 海尔定制
export const getActivityListBindTask = data => {
  return request.post(`/mission/activity/listHaierActivity`, data)
}

// 把任务与活动相关联
export const bindActivity = data => {
  return request.post(`/mission/activity/listActivity`, data)
}