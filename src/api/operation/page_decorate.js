import request from '@/utils/request'

// 页面装修--微页面列表
export const getDiyPage = data => {
  return request.post(`/v1/brand/app/appDiyPage/getAllDiyPage`, data)
}
// 页面装修--删除微页面
export const delDiyPage = data => {
  return request.post(`/v1/brand/app/appDiyPage/delDiyPage`, data)
}
// 页面装修--获取微页面短链
export const putDiyPageUrl = data => {
  return request.post(`/v1/brand/app/appDiyPage/putDiyPageUrl`, data)
}

// 页面装修--获取微页面短链
export const getBaseCode = data => {
  return request.post(`/v1/brand/app/appDiyPage/getBaseCode`, data)
}
// 页面装修--判断当前是否存在小程序
export const getIsApp = data => {
  return request.post('/v1/brand/app/appDiyPage/getIsApp', data)
}
