import request from '@/utils/request'
// 选择分类列表

export const categoryList = data => {
  return request.post('/v1/sumvideo/sv/category/list', data)
}
// 分页查询模板--图片
export const page = data => {
  return request.post('/v1/sumvideo/sv/template/page', data)
}
// 分页查询模板--表格
export const pageTemplateCountList = data => {
  return request.post('/v1/sumvideo/sv/template/pageTemplateCountList', data)
}

// 查看创意模板
export const details = (data, replace) => {
  return request.get(
    `/v1/sumvideo/sv/template/query?id=${data}${replace ? '&isReplace=' + replace : ''}`
  )
}
// 获取逆向视频
export const getVideoProduce = data => {
  return request.post('/v1/sumvideo/sv/creative/updateCreativeTemplate', data)
}
// 更新创意分类--单个绑定
export const updateBind = params => {
  return request.post('/v1/sumvideo/sv/category/updateBind', params)
}
// 模板分类列表
export const templateCate = params => {
  return request.post('/v1/sumvideo/sv/category/template/templateArray', params)
}
// 修改创意工厂
export const modify = params => {
  return request.post('/v1/sumvideo/sv/factory/modify', params)
}
// 删除创意工厂
export const deleteCreative = params => {
  return request.post('/v1/sumvideo/sv/creative/delete', params)
}
// 导出列表
export const exportExcel = params => {
  return request.post('/v1/sumvideo/sv/template/TemplateCountExport', params)
}

// 获取模板数量信息
export const getTemplateCount = params => {
  return request.post('/v1/sumvideo/sv/template/pageTemplateCountList', params)
}

// 设置公开模板
export const updateOpenTemplate = params => {
  return request.post('/v1/sumvideo/sv/template/updateOpenTemplate', params)
}

// 模板转换成创意【查询有没有合成过视频】
export const hasVideo = params => {
  return request.post('/v1/sumvideo/sv/template/hasVideo', params)
}

// 模板发布详情
export const listTemplatePublishDetail = params => {
  return request.post('/v1/sumvideo/sv/template/listTemplatePublishDetail', params)
}
