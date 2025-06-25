import request from '@/utils/request'

/**
 * 首页
 */
// 查询品牌号小程序主页
export const getDiyPage = data => {
  return request.post('/v1/brand/app/appDiyPage/getDiyPage', data)
}
// 添加小程序配置
export const saveOrUpDiyPage = data => {
  return request.post('/v1/brand/app/appDiyPage/saveOrUpDiyPage', data)
}
// 获取门店首页
export const getIndex = data => {
  return request.post('/v1/brand/app/appDiyPage/getIndex', data)
}

/**
 * 品牌号
 */
// 查询品牌号分页列表
export const getAppBrandUserList = data => {
  return request.post('/v1/brand/app/appVideoDiy/getAppBrandUserList', data)
}
// 查询当前品牌视频样式
export const getVideoDiy = data => {
  return request.post('/v1/brand/app/appVideoDiy/getVideoDiy', data)
}
// 查询品牌选择的视频
export const pageBrandVideoList = data => {
  return request.post('/v1/brand/app/appVideoDiy/pageBrandVideoList', data)
}
// 查询品牌下方的视频
export const pageVideoBrandUserList = data => {
  return request.post('/v1/brand/app/appVideoDiy/pageVideoBrandUserList', data)
}
// 设置品牌的视频样式
export const saveOrUpVideoDiy = data => {
  return request.post('/v1/brand/app/appVideoDiy/saveOrUpVideoDiy', data)
}
// 查询选择账号下的所有视频
export const getUserVideoList = data => {
  return request.post('/v1/brand/app/appVideoDiy/getUserVideoList', data)
}

// 导航
// 保存修改
export const saveOrUpdateAppExtJson = data => {
  return request.post('/v1/brand/app/appExtJson/saveOrUpdateAppExtJson', data)
}
// 查询
export const getAppExtJson = data => {
  return request.post('/v1/brand/app/appExtJson/getAppExtJson', data)
}

// 查询悬浮窗页面
export const getFloatWinPage = data => {
  return request.post('/v1/brand/app/appDiyPage/getFloatWinPage', data)
}
