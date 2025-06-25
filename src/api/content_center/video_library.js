import request from '@/utils/request'

// 灵感视频库-获取对应的字典
export const findChildrenByKey = data => {
  return request.post(`/cgp/web/dict/findChildrenByKey`, data)
}

// 灵感视频库-根据key查询字典
export const findByKey = data => {
  return request.post(`/cgp/web/dict/findByKey`, data)
}

// 灵感视频库-根据订阅词查询列表
export const listSubscribeWord = data => {
  return request.post(`/cgp/web/inspiration/subscribe/listSubscribeWord`, data)
}

// 灵感视频库-添加订阅词
export const saveWord = data => {
  return request.post(`/cgp/web/inspiration/subscribe/saveWord`, data)
}

// 灵感视频库-删除订阅词
export const deleteWord = data => {
  return request.post(`/cgp/web/inspiration/subscribe/delete/${data}`, {})
}

// 灵感视频库-获取视频列表
export const inspirationVideoPage = data => {
  return request.post(`/cgp/web/inspiration/video/inspirationVideoPage`, data)
}

// 灵感视频库-获取视频详情
export const inspirationVideoDetail = data => {
  return request.post(`/cgp/web/inspiration/video/inspirationVideoDetail`, data)
}
// 保存视频详情
export const saveInspirationVideo = data => {
  return request.post(`/cgp/web/inspiration/video/saveInspirationVideo`, data)
}

// 创建自动提取视频中的文案的任务
export const createRecTask = data => {
  return request.post(`/cgp/web/inspiration/video/createRecTask`, data)
}

// 查询自动提取视频中的文案的任务结果
export const queryTaskStatus = data => {
  return request.post(`/cgp/web/inspiration/video/queryTaskStatus`, data)
}
// 根据列表获取对应的视频
export const resolveDyLink = data => {
  return request.post(`/cgp/web/inspiration/video/resolveDyLink`, data)
}

// 添加字典
export const saveDict = data => {
  return request.post(`/cgp/web/dict/saveDict`, data)
}
