import request from '@/utils/request'

// 创建图文模板流水线
export const createImagePipeline = params => {
  return request.post('/v1/sumvideo/sv/pipeline/image/createImagePipelineV2', params)
}
// 获取流水线详情
export const getImageTextPipelineDetail = params => {
  return request.post('/v1/sumvideo/sv/pipeline/image/getImageTextPipelineDetail', params)
}
// 获取图文模板详情
export const getImageCreativeDetail = params => {
  return request.post('/v1/sumvideo/sv/imageCreative/getImageCreativeDetail', params)
}
// 保存配置
export const saveImagePipelineConfig = params => {
  return request.post('/v1/sumvideo/sv/pipeline/image/saveImagePipelineConfig', params)
}
// 预估生产条数
export const guessNumImgText = params => {
  return request.post('/v1/sumvideo/sv/pipeline/image/guessNum', params)
}
// 提交图文合成
export const produceImgText = params => {
  return request.post('/v1/sumvideo/sv/pipeline/image/produce', params)
}
