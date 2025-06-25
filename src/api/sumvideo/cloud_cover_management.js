import request from '@/utils/request'
// 封面列表
export const coverPage = params => {
  return request.post('/v1/sumvideo/sv/overprint/coverPage', params)
}
// 封面详情, 只传id即可
export const coverDetail = params => {
  return request.post('/v1/sumvideo/sv/overprint/coverDetail', params)
}

// 保存封面
export const saveCover = params => {
  return request.post('/v1/sumvideo/sv/overprint/save', params)
}
// 删除封面
export const deleteCover = params => {
  return request.post('/v1/sumvideo/sv/overprint/delete', params)
}
// 上传 base64 图片
export const base64Img = params => {
  return request.post('/v1/sumvideo/sv/utils/upload/base64Img', params)
}
