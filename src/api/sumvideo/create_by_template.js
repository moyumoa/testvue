import request from '@/utils/request'

// 创建模板式流水线
export const createTemplatePipeline = params => {
  return request.post('/v1/sumvideo/sv/pipeline/template/createTemplatePipeline', params)
}
// 查询模板式流水线详情
export const getTemplatePipelineDetail = params => {
  return request.post('/v1/sumvideo/sv/pipeline/template/getTemplatePipelineDetail', params)
}
// 批量生产产品
export const produce = params => {
  return request.post('/v1/sumvideo/sv/product/produce', params)
}

// 预估生产数 模板式生成
export const getProductNum = params => {
  return request.post('/v1/sumvideo/sv/product/getProductNum', params)
}

// 预估生产数 剧本式生成
export const guessNum = params => {
  return request.post('/v1/sumvideo/sv/pipeline/script/guessNum', params)
}

// 更新流水线步骤 合成成功跳转到第四步的时候用
export const updateStep = params => {
  return request.post('/v1/sumvideo/sv/pipeline/updateStep', params)
}

// 移除导入的素材
export const removeMaterial = params => {
  return request.post('/v1/sumvideo/sv/pipeline/template/removeMaterial', params)
}

// 导入模板式流水线分镜素材
export const importMaterial = params => {
  return request.post('/v1/sumvideo/sv/pipeline/template/importMaterial', params)
}

// 批量导入模板式流水线分镜素材
export const importMaterialBatch = params => {
  return request.post('/v1/sumvideo/sv/pipeline/template/importMaterialBatch', params)
}

// 设置模板式流水线分镜长素材处理方式
export const setClipReplaceModel = params => {
  return request.post('/v1/sumvideo/sv/pipeline/template/setClipReplaceModel', params)
}

// 查询剩余合成数量
export const getProductUseInfoForServ = params => {
  return request.post('/v1/sumvideo/sv/company/getProductUseInfoForServ', params)
}

// 分页查询导入的素材
export const listImportMaterial = params => {
  return request.post('/v1/sumvideo/sv/pipeline/template/listImportMaterial', params)
}
