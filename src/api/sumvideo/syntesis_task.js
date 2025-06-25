import request from '@/utils/request'

// 合成任务列表
export const page = params => {
  return request.post('/v1/sumvideo/sv/productJob/page', params)
}
// 合成任务列表导出
export const exportBatchTask = params => {
  return request.post('/v1/sumvideo/sv/productJob/exportBatchTask', params)
}
// 合成任务详情
export const info = params => {
  return request.post('/v1/sumvideo/sv/productJob/info', params)
}
// 终止任务
export const finishProduce = params => {
  return request.post('/v1/sumvideo/sv/productJob/finishProduce', params)
}
// 继续生成
export const proceedProduce = params => {
  return request.post('/v1/sumvideo/sv/productJob/proceedProduce', params)
}
// 克隆任务
export const copyBatchTask = params => {
  return request.post('/v1/sumvideo/sv/productJob/copyBatchTask', params)
}
// 编辑成品视频
export const editVideo = params => {
  return request.post('/v1/sumvideo/sv/product/editVideo', params)
}
// 删除流水线
export const pipelineDelete = id => {
  return request.get(`/v1/sumvideo/sv/pipeline/delete?id=${id}`)
}
