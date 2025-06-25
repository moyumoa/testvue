import request from '@/utils/request'

// 发送验证码
export function sendCode(data) {
  return request.post(`/v1/system/account/sendCheckCode`, data)
}

// 查询大屏概览数据
export function getScreenOverview(data) {
  return request.post('/cgp/web/big-screen/dataOverview', data)
}

// 获取矩阵号总数和粉丝总数
export function getHomePageData(data) {
  return request.post('/cgp/web/big-screen/homePageData', data)
}

// 未读消息列表-版本升级
export function unReadMsgList(data) {
  return request.post('/v1/system/account/userMessage/unReadMsgList', data)
}

// 已读消息-版本升级
export function readMsg(data) {
  return request.post('/v1/system/account/userMessage/readMsg', data)
}
// 是否开启新版本发布抖音视频
export function getEnableNewVersion(data) {
  return request.post('/mission/common/isDyScanCodePublishMode', data)
}

//  是否开启新版本发布抖音视频
export function getSupportedPublishWays(data) {
  return request.post('/mission/common/getSupportedPublishWays', data)
}
