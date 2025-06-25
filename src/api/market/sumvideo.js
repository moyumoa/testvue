import request from '@/utils/request'

// 模板列表
export const getTemplateList = data => {
  return request.post('/v1/sumvideo/sv/template/page', data)
}

// 模板分类
export const getTemplateCategoryList = data => {
  return request.get('/v1/sumvideo/sv/category/serve/list', data)
}

// 获取sumvideo客户端的下载地址
export const getSumvideoClientDownloadUrl = data => {
  return request.post('/v1/system/account/api/config/getSumvideoClientDownloadUrl', data)
}
