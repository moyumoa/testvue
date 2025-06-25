import request from '@/utils/request'

// 获取关键字组
export const getKeywordGroupApi = data => {
  return request.post(`/scrm/keyword/group/list`, data)
}
// 新增关键字组
export const addKeywordGroupApi = data => {
  return request.post(`/scrm/keyword/group/save`, data)
}

// 获取关键字列表
export const getKeywordList = data => {
  return request.post(`/scrm/keyword/list`, data)
}
// 新增关键字
export const addKeywordApi = data => {
  return request.post(`/scrm/keyword/save`, data)
}

// 关键词导出
export const keywordExport = data => {
  return request.post(`/scrm/keyword/keywordExport`, data)
}
