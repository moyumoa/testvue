import request from '@/utils/request'

// 直播质检-列表
export const liveList = data => {
  return request.post(`/cgp/web/check/room/list`, data)
}
// 作品质检-列表
export const videoList = data => {
  return request.post(`/cgp/web/check/video/list`, data)
}

// 质检详情
export const getCheckDetail = data => {
  return request.post(`/cgp/web/check/getCheckDetail`, data)
}

// 创建质检
export const createCheck = data => {
  return request.post(`/cgp/web/check/createCheck`, data)
}
