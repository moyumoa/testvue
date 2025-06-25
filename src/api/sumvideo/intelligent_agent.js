import request from '@/utils/request'

// 查询智能体
export const listIntelligent = params => {
  return request.post('/v1/sumvideo/sv/intelligent/listIntelligent', params)
}

// 解析小红书链接文案
export const resolveXhsTitle = params => {
  return request.post('/v1/sumvideo/sv/intelligent/resolveXhsTitle', params)
}
// 保存小红书学习文案到知识库
export const saveTitleStudy = params => {
  return request.post('/v1/sumvideo/sv/intelligent/saveTitleStudy', params)
}

// 小红书爆款文案知识库文件列表
export const listXhsStudyTitle = params => {
  return request.post('/v1/sumvideo/sv/intelligent/listXhsStudyTitle', params)
}
// 保存文档到知识库

export const saveKnowledgeDocument = params => {
  return request.post('/v1/sumvideo/sv/intelligent/saveKnowledgeDocument', params)
}
// 删除知识库文档

export const deleteKnowledgeDocument = params => {
  return request.post('/v1/sumvideo/sv/intelligent/deleteKnowledgeDocument', params)
}
