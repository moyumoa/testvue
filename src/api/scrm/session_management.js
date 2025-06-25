import request from '@/utils/request'

// 获取用户信息
export const getUserDetail = data => {
  return request.post(`/scrm/focus/user/detail`, data)
}
// 存储用户信息--备注
export const saveRemark = data => {
  return request.post(`/scrm/focus/user/save`, data)
}
// 创建会话
export const createSession = data => {
  return request.post(`/scrm/flow/conversation/create`, data)
}
// 消息列表
export const getMessageList = data => {
  return request.post(`/scrm/interaction/list`, data)
}
// 获取用户聊天消息
export const getUserMessageList = data => {
  return request.post(`/scrm/message/list`, data)
}
// 发送消息
export const sendSessionMessage = data => {
  return request.post(`/scrm/message/send`, data)
}
// 账号列表
export const getAccountList = data => {
  return request.post(`/scrm/account/list`, data)
}
export const getAccountListV1 = data => {
  return request.post(`/scrm/account/listV1`, data)
}

// 会话管理- 矩阵号搜索list
export const getAccountSearchList = data => {
  return request.post(`/scrm/account/search`, data)
}

// 信息流详情
export const getFlowDetail = data => {
  return request.post(`/scrm/flow/detail`, data)
}
// 设置消息已读
export const readMessage = data => {
  return request.post(`/scrm/message/read`, data)
}
// scrm运营看板-昨日数据
export const getScrmOverview = data => {
  return request.post(`/scrm/event/daily/home/overview`, data)
}
// scrm运营看板-图表
export const getScrmChart = data => {
  return request.post(`/scrm/event/daily/home/chart`, data)
}
// scrm运营看板-用户信息统计
export const getScrmAccountStat = data => {
  return request.post(`/scrm/event/daily/account/stat`, data)
}
// 触达记录
export const getTriggerList = data => {
  return request.post(`/scrm/strategy/strategyRecordList`, data)
}
// 互动记录
export const getEventList = data => {
  return request.post(`/scrm/account/event/list`, data)
}
// 未读
export const getTabsUnread = data => {
  return request.post(`/scrm/interaction/unread`, data)
}
// 更改粉丝标签
export const changeDetail = data => {
  return request.post(`/scrm/client/stage/change`, data)
}

// 会话列表是否进入轮巡
export const changeTime = data => {
  return request.post(`/scrm/pull/setting/change`, data)
}
// 拉取小红书消息的频率
export const pullXhsMessage = data => {
  return request.post(`/scrm/message/pullXhsMessage`, data)
}

// 清空当前矩阵号列表
export const clearUnread = data => {
  return request.post(`/scrm/interaction/clearUnread`, data)
}

// 互动数据导出
export const statExportV2 = data => {
  return request.post(`/scrm/event/daily/account/stat/export`, data)
}
