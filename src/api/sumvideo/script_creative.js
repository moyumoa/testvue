import request from '@/utils/request'

// 创建剧本式模板
export const createCreativeScript = params => {
  return request.post('/v1/sumvideo/sv/scriptCreative/createCreativeScript', params)
}

// 保存剧本式模板分镜
export const saveCreativeScriptClip = params => {
  return request.post('/v1/sumvideo/sv/scriptCreative/saveOrTransformCreativeScriptClip', params)
}
// 剧本模板分镜列表
export const listCreativeScripts = params => {
  return request.post('/v1/sumvideo/sv/scriptCreative/listCreativeScripts', params)
}

// 爆款拆解创建
export const resolveHotVideoScript = params => {
  return request.post('/v1/sumvideo/sv/scriptCreative/resolveHotVideoScript', params)
}
// 获取推荐的产品

export const listRecommendProduct = params => {
  return request.post('/v1/sumvideo/sv/scriptCreative/listRecommendProduct', params)
}
// 获取产品特点

export const getRecommendProductFeat = params => {
  return request.post('/v1/sumvideo/sv/scriptCreative/getRecommendProductFeat', params)
}
// 产品信息创建

export const resolveProductInfoScript = params => {
  return request.post('/v1/sumvideo/sv/scriptCreative/resolveProductInfoScript', params)
}
