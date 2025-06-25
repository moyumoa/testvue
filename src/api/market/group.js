import request from '@/utils/request'

// 添加分组
export const addOrUpdateGroup = data => {
  return request.post(`/mission/group/addOrUpdateGroup`, data)
}
// 删除分组
export const deleteGroup = data => {
  return request.post(`/mission/group/deleteGroup`, data)
}

// 分组列表
export const fetchGroup = data => {
  return request.post(`/mission/group/selectGroup`, data)
}
// 查询小组排班信息
export const getGroupStaffSchedulingList = data => {
  return request.post(`/mission/group/getGroupStaffSchedulingList`, data)
}
// 团队添加成员
export const addGroupStaff = data => {
  return request.post(`/mission/group/addGroupStaff`, data)
}
// 删除添加成员
export const deleteGroupStaff = data => {
  return request.post(`/mission/group/deleteGroupStaff`, data)
}

// 删除添加成员角色
export const addOrUptGroupAccountRole = data => {
  return request.post(`/mission/group/addOrUptGroupAccountRole`, data)
}
