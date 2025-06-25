import request from '@/utils/request'
// 获取模型
export const listAllFaceModel = params => {
  return request.post('/v1/system/account/faceModel/listAllFaceModel', params)
}
// 更新模型
export const updateModel = params => {
  return request.post('/v1/system/account/faceModel/updateModel', params)
}
// 上传模型视频
export const uploadModelVideo = params => {
  return request.post('/v1/system/account/faceModel/uploadModelVideo', params)
}
// 查询用户可用模型
export const listUserCanUseModel = params => {
  return request.post('/v1/system/account/operation/faceModel/listUserCanUseModel', params)
}
// 获取阿里云上传的封面
export const grabParam = params => {
  return request.post('/v1/sumvideoup/sv/material/grabParam', params)
}
