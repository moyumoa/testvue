import request from '@/utils/request'

// 创建剧本式流水线
export const createScriptPipeline = params => {
  return request.post('/v1/sumvideo/sv/pipeline/script/createScriptPipeline', params)
}

// 创建/修改剧本式分镜
export const saveScriptClip = params => {
  return request.post('/v1/sumvideo/sv/pipeline/script/saveScriptClip', params)
}
// 删除剧本式分镜
export const removeScriptClip = params => {
  return request.post('/v1/sumvideo/sv/pipeline/script/removeScriptClip', params)
}
// 批量删除剧本式分镜
export const removeScriptClipBatch = params => {
  return request.post('/v1/sumvideo/sv/pipeline/script/removeScriptClipBatch', params)
}
// 查询流水线详情
export const getScriptPipelineDetail = params => {
  return request.post('/v1/sumvideo/sv/pipeline/script/getScriptPipelineDetail', params)
}
// ai制作分镜
export const aiGenerateScriptClip = params => {
  return request.post('/v1/sumvideo/sv/pipeline/script/aiGenerateScriptClip', params)
}

// 保存分镜信息
export const saveClipConfig = params => {
  return request.post('/v1/sumvideo/sv/pipeline/script/saveClipConfig', params)
}
// 导入剧本式流水线分镜素材
export const importMaterialByScript = params => {
  return request.post('/v1/sumvideo/sv/pipeline/script/importMaterial', params)
}
// 分页查询剧本式流水线分镜导入的素材
export const listImportMaterialByScript = params => {
  return request.post('/v1/sumvideo/sv/pipeline/script/listImportMaterial', params)
}
// 保存公共配置
export const saveScriptConfig = params => {
  return request.post('/v1/sumvideo/sv/pipeline/script/saveScriptConfig', params)
}
// 获取转场效果列表
export const listTransition = params => {
  return request.post('/v1/sumvideo/sv/pipeline/script/listTransition', params)
}
// 生产视频
export const produce = params => {
  return request.post('/v1/sumvideo/sv/pipeline/script/produce', params)
}

//  删除已导入的素材
export const removeMaterial = params => {
  return request.post('/v1/sumvideo/sv/pipeline/script/removeMaterial', params)
}

// 获取特点
export const getItemAICharacteristic = params => {
  return request.post('/v1/sumvideo/sv/pipeline/script/getVideoTargerCharacteristic', params)
}
