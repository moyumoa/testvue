import request from '@/utils/request'
// 达人概览--达人概况
export const userOverview = data => {
  return request.post(`/mission/user/growth/userOverview`, data)
}
// 达人概览--达人参与任务图
export const userJoinChart = data => {
  return request.post(`/mission/user/growth/userJoinChart`, data)
}
// 达人概览--达人等级分布
export const userLevelDistributed = data => {
  return request.post(`/mission/user/growth/userLevelDistributed`, data)
}
// 查询成长体系是否开启
export const isEnableGrowth = data => {
  return request.post(`/mission/user/growth/isEnableGrowth`, data)
}
// 开启成长体系
export const enableUserGrowth = data => {
  return request.post(`/mission/user/growth/enableUserGrowth`, data)
}
// PC端成长任务列表
export const growthTasks = data => {
  return request.post(`/mission/user/growth/growthTasks`, data)
}

// 保存成长等级配置
export const saveUserGrowthLevelConfig = data => {
  return request.post(`/mission/user/growth/saveUserGrowthLevelConfig`, data)
}
// 成长体系
export const userGrowthLevel = data => {
  return request.post(`/mission/user/growth/userGrowthLevel`, data)
}
// 删除成长等级
export const deleteGrowthLevel = data => {
  return request.post(`/mission/user/growth/deleteGrowthLevel`, data)
}
