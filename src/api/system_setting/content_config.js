import request from '@/utils/request'

// 获取知识库配置信息
export function getKnowledgeBaseSettingPage(data) {
  return request.post(`/v1/system/account/knowledgeBaseSetting/getKnowledgeBaseSettingPage`, data)
}
// 新增知识库
export function addKnowledgeBaseSetting(data) {
  return request.post(`/v1/system/account/knowledgeBaseSetting/addKnowledgeBaseSetting`, data)
}
// 修改知识库
export function updateKnowledgeBaseSetting(data) {
  return request.post(`/v1/system/account/knowledgeBaseSetting/updateKnowledgeBaseSetting`, data)
}
// 删除知识库
export function deleteKnowledgeBaseSetting(data) {
  return request.post(`/v1/system/account/knowledgeBaseSetting/deleteKnowledgeBaseSetting`, data)
}
