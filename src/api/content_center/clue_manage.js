import request from '@/utils/request'

// 直播质检-列表
export const queryClues = data => {
  return request.post(`/cgp/web/clues/list`, data)
}
// 直播质检-列表
export const exportClues = data => {
  return request.post(`/cgp/web/clues/exportV2`, data)
}
// 根据订单 id 查询留资订单详情
export const getAppointmentOrderDetail = id => {
  return request.post(`/mission/appointment/appointmentOrderDetail?orderId=${id}`)
}

// 线索推送配置页地址获取
export const getClueConfigGuideUrl = id => {
  return request.post(`/cgp/web/clues/getClueConfigGuideUrl`)
}
