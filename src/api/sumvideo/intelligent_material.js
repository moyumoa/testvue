import request from '@/utils/request'

// 解析视频链接
export const resolveLink = params => {
  return request.post('/v1/sumvideo/sv/video/split/resolveLink', params)
}
// 提交视频拆解任务
export const submitVideoSplitTask = params => {
  return request.post('/v1/sumvideo/sv/video/split/submitVideoSplitTask', params)
}
// 拆解记录
export const listVideoSplitRecord = params => {
  return request.post('/v1/sumvideo/sv/video/split/listVideoSplitRecord', params)
}

// 保存到素材库
export const saveToMaterial = params => {
  return request.post('/v1/sumvideo/sv/video/split/saveToMaterial', params)
}
// 拆解失败的重试
export const retrySplit = params => {
  return request.post('/v1/sumvideo/sv/video/split/retry', params)
}
// 保存到模板
export const saveToTemplate = params => {
  return request.post('/v1/sumvideo/sv/video/split/saveToTemplate', params)
}
