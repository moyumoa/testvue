import request from '@/utils/request'

// 数据总计
export const getTotalDetail = data => {
  return request.post(`/mission/index/totalData`, data)
}
// 账号排行
export const getUserRank = data => {
  return request.post(`/mission/index/userRank`, data)
}
// 任务排行
export const getTaskRank = data => {
  return request.post(`/mission/index/taskRank`, data)
}
// 运营数据
export const getTaskData = data => {
  return request.post(`/mission/index/taskData`, data)
}
// 直播 ，视频数据
export const getBizDayData = data => {
  return request.post(`/mission/index/bizDayData`, data)
}
