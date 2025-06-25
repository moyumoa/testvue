import request from '@/utils/request'

// 策略模板列表
export const getPolicyList = data => {
  return request.post(`/scrm/account/interaction/strategy/template/list`, data)
}
// 策略模板详情
export const getPolicyDetail = data => {
  return request.post(`/scrm/account/interaction/strategy/template/detail`, data)
}
// 策略模板保存
export const savePolicyDetail = data => {
  return request.post(`/scrm/account/interaction/strategy/template/save`, data)
}
// 互动策略模板
export const getMessagePolicyList = data => {
  return request.post(`/scrm/account/interaction/strategy/list`, data)
}
// 互动策略保存
export const saveMessagePolicy = data => {
  return request.post(`/scrm/account/interaction/strategy/save`, data)
}
// 群聊列表
export const getGroupList = data => {
  return request.post(`/scrm/api/dy/enterprise/group/list`, data)
}
// 消息卡片列表
export const getCardList = data => {
  return request.post(`/scrm/api/dy/enterprise/card/list`, data)
}
// 图片素材列表
export const getMediaList = data => {
  return request.post(`/scrm/api/dy/enterprise/media/list`, data)
}
// 图片素材上传
export const uploadMedia = data => {
  return request.post(`/scrm/api/dy/enterprise/media/upload`, data)
}
// 图片素材删除
export const deleteMedia = data => {
  return request.post(`/scrm/api/dy/enterprise/media/delete`, data)
}

// 2023/2/27 SCRM 需求 五期 接口对接
// 获取互动策略 （矩阵号）列表
export const getStrategyList = data => {
  return request.post(`/scrm/strategy/list`, data)
}
// 批量设置
export const strategyOpenSet = data => {
  return request.post(`/scrm/strategy/openSet`, data)
}
// 获取关键词列表
export const keywordList = data => {
  return request.post(`/scrm/keyword/listNopage`, data)
}
// 获取互动策略详情
export const strategyDetail = data => {
  return request.post(`/scrm/strategy/detail`, data)
}

// 获取触达记录列表
export const strategyRecordList = data => {
  return request.post(`/scrm/strategy/strategyRecordList`, data)
}

// 策略开关的信息
export const strategyOverview = data => {
  return request.post(`/scrm/strategy/oveview`, data)
}
