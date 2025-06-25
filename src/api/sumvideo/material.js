import request from '@/utils/request'
// 获取查询音色标签列表
export const getVoiceLabel = params => {
  return request.post('/v1/sumvideo/sv/material/voice/getVoiceLabel', params)
}
// 根据条件查询音色列表
export const getVoices = params => {
  return request.post('/v1/sumvideo/sv/material/voice/getVoices', params)
}
