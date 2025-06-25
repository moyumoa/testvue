import request from '@/utils/request'

// 直播违规-违规矩阵号-违规矩阵号列表
export const getViolationList = data => {
  return request.post(`/cgp/web/violation/getViolationList`, data)
}

// 直播违规-违规矩阵号-违规矩阵号名称
export const getViolationNickNameList = data => {
  return request.post(`/cgp/web/violation/getViolationNickNameList`, data)
}
// 直播违规-违规记录-违规矩阵号记录列表
export const getViolationLogList = data => {
  return request.post(`/cgp/web/violation/getViolationLogList`, data)
}
// 直播违规-违规关键词-违规关键词记录列表
export const getViolationKeyWordList = data => {
  return request.post(`/cgp/web/violation/getViolationKeyWordList`, data)
}

// 直播违规-提醒设置-违规设置
export const settingRemind = data => {
  return request.post(`/cgp/web/violation/setting`, data)
}

// 直播违规-提醒设置-设置通知详情保存
export const saveRemind = data => {
  return request.post(`/cgp/web/violation/setting/save`, data)
}
