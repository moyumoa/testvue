import request from '@/utils/request'

// 创建傻瓜式流水线
export const createFoolishPipeline = params => {
  return request.post('/v1/sumvideo/sv/pipeline/foolish/createFoolishPipeline', params)
}
// 根据商品大类返回关键词
export const aggregationRefine = params => {
  return request.post('/v1/sumvideo/sv/pipeline/foolish/aggregationRefine', params)
}
// 流水线详情
export const getFoolishPipelineDetail = params => {
  return request.post('/v1/sumvideo/sv/pipeline/foolish/getFoolishPipelineDetail', params)
}
// 预估生产数量
export const foolishGuessNum = params => {
  return request.post('/v1/sumvideo/sv/pipeline/foolish/guessNum', params)
}
// 生产视频
export const produce = params => {
  return request.post('/v1/sumvideo/sv/pipeline/foolish/produce', params)
}
// 移除素材，仅传pipelineId、resourcesIds即可
export const removeMaterial = params => {
  return request.post('/v1/sumvideo/sv/pipeline/foolish/removeMaterial', params)
}
// 移除素材，仅传pipelineId、resourcesIds即可
export const foolishRemoveMaterial = params => {
  return request.post('/v1/sumvideo/sv/pipeline/foolish/removeMaterial', params)
}
// 保存流水线配置
export const savePipelineConfig = params => {
  return request.post('/v1/sumvideo/sv/pipeline/foolish/savePipelineConfig', params)
}
// 检查素材时长
export const checkMaterial = params => {
  return request.post('/v1/sumvideo/sv/pipeline/foolish/checkMaterial', params)
}
// 根据品牌和当前日期查询节日
export const listFestival = params => {
  return request.post('/v1/sumvideo/sv/pipeline/foolish/listFestival', params)
}
