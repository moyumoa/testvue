import request from '@/utils/request'

// 获取消息通知开关
export function getNoticeConfig(data) {
  return request.post(`/v1/system/account/message/config/getMessageConfig`, data)
}
// 设置消息通知
export function setNoticeConfig(data) {
  return request.post(`/v1/system/account/message/config/updateMessageConfig`, data)
}
// 查询存在机器人的群聊列表
export function getChatPage(data) {
  return request.post(`/v1/system/account/message/config/getChatPage`, data)
}

// 企微群设置-聊天机器人分页
export function chatConfigPage(data) {
  return request.post(`/v1/system/account/social/chatConfig/chatConfigPage`, data)
}

// 企微群设置-创建聊天机器人配置
export function createChatConfig(data) {
  return request.post(`/v1/system/account/social/chatConfig/createChatConfig`, data)
}

// 企微群设置-更新聊天机器人配置
export function updateChatConfig(data) {
  return request.post(`/v1/system/account/social/chatConfig/updateChatConfig`, data)
}

// 企微群设置-删除聊天机器人配置
export function deleteChatConfig(data) {
  return request.post(`/v1/system/account/social/chatConfig/deleteChatConfig`, data)
}

// 获取运营者数量
export function getOperatorCount(data) {
  return request.post(`/v1/system/account/message/config/getOperatorCount`, data)
}
// 手动通知
export function manualSendAuthNotice(data) {
  return request.post(`/v1/system/account/message/config/manualSendAuthNotice`, data)
}
// 时候可以点击手动提醒按钮
export function beforeManualSendAuthNoticeCheck(data) {
  return request.post(`/v1/system/account/message/config/beforeManualSendAuthNoticeCheck`, data)
}

// 用户通知配置设置
export function updateUserNoticeConfig(data) {
  return request.post(`/v1/system/account/user/updateUserNoticeConfig`, data)
}
