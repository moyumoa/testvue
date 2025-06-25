import request from '@/utils/request'

// 任务日历列表
export const list = data => {
  return request.post(`/mission/task/calendar/group/date/list`, data)
}
// 获取任务详情详情页
export const taskSimpleDetail = data => {
  return request.post(`/mission/task/simple/detail`, data)
}

// 活动-----
// 保存活动-创建/修改
export const saveActivity = data => {
  return request.post(`/mission/activity/saveActivity`, data)
}
// 获取活动列表
export const activityCalendar = data => {
  return request.post(`/mission/activity/activityCalendar`, data)
}
// 活动列表的排序
export const activitySort = data => {
  return request.post(`/mission/activity/activitySort`, data)
}
// 删除一个活动
export const deleteActivity = data => {
  return request.post(`/mission/activity/deleteActivity`, data)
}
// 切换活动开启状态
export const switchEnable = data => {
  return request.post(`/mission/activity/switchEnable`, data)
}
// 获取活动详情
export const activityDetail = data => {
  return request.post(`/mission/activity/activityDetail`, data)
}
// 活动数据
export const activityData = data => {
  return request.post(`/mission/activity/activityData`, data)
}
// 排行榜数据
export const activityRank = data => {
  return request.post(`/mission/activity/activityRank`, data)
}
// 任务列表排序
export const activityTaskSort = data => {
  return request.post(`/mission/activity/activityTaskSort`, data)
}
// -----
