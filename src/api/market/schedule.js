import request from '@/utils/request'

// 所有直播间
export const getShopAccount = data => {
  return request.post(`/v1/system/account/auth/getShopAccount`, data)
}
// 已选直播间
export const selectSchedulingAccoount = data => {
  return request.post(`/mission/schedulingAccount/selectSchedulingAccoount`, data)
}

// 添加直播间
export const addSchedulingAccoount = data => {
  return request.post(`/mission/schedulingAccount/addSchedulingAccoount`, data)
}

// 小组列表
export const selectGroup = data => {
  return request.post(`/mission/group/selectGroup`, data)
}

// 排班列表
export const selectStaffScheduling = data => {
  return request.post(`/mission/staffScheduling/selectStaffScheduling`, data)
}

// 添加排班
export const addStaffScheduling = data => {
  return request.post(`/mission/staffScheduling/addStaffScheduling`, data)
}
// 修改排班
export const updateStaffScheduling = data => {
  return request.post(`/mission/staffScheduling/updateStaffScheduling`, data)
}
// 修改排班
export const deleteStaffScheduling = data => {
  return request.post(`/mission/staffScheduling/deleteStaffScheduling`, data)
}
// 排班是否冲突
export const getStaffConflictList = data => {
  return request.post(`/mission/staffScheduling/getStaffConflictList`, data)
}
// 排班详情
export const selectStaffSchedulingInfo = data => {
  return request.get(`/mission/staffScheduling/selectStaffSchedulingInfo?staffSchedulingId=${data}`)
}
// 排班详情
export const schedulingExport = ({ openId, year, month }) => {
  return request.get(
    `/mission/staffScheduling/schedulingExport?openId=${openId}&year=${year}&month=${month}`,
    { responseType: 'blob' }
  )
}
// 可选排班人员
export const getChoosePerson = data => {
  return request.post(`/mission/staffScheduling/getAllChoosePerson`, data)
}
