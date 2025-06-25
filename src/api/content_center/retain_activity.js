import request from '@/utils/request'
// 查询活动列表
export const getActivityListPage = data => {
  return request.post(`/v1/brand/app/appDiyPage/getActivityListPage`, data)
}
export const getAppointmentInfoListByIds = data => {
  return request.post(`/v1/brand/app/appDiyPage/getActivityDetail`, data)
}
// export const getActivityListPage = data => {
//   return request.post(`/mission/appointment/listAppointmentActivityProduct`, data)
// }
// export const getAppointmentInfoListByIds = data => {
//   return request.post(`/mission/appointment/getAppointmentInfoListByIds`, data)
// }
