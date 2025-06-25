import request from '@/utils/request'

// 实拍图分页
export const pageShoot = data => {
  return request.post('/cgp/web/media/shoot/page', data)
}
// 提交全图分割api，立即返回，但没有结果
export const submitInteractiveFullSegmentationAdvanceTask = data => {
  return request.post('/v1/sumvideo/sv/ai/submitInteractiveFullSegmentationAdvanceTask', data)
}
// 预处理图片 适用于多个场景
export const resizeImg = data => {
  return request.post('/cgp/web/media/resizeImgV2', data)
}
// 获取全图分割api结果
export const getInteractiveFullSegmentationAdvanceResult = data => {
  return request.post('/v1/sumvideo/sv/ai/getInteractiveFullSegmentationAdvanceResult', data)
}
// 创建商品
export const saveProduct = data => {
  return request.post('/cgp/web/media/shoot/product/save', data)
}
// 编辑商品
export const updateProduct = data => {
  return request.post('/cgp/web/media/shoot/product/update', data)
}
// 删除商品
export const deleteProduct = data => {
  return request.post('/cgp/web/media/shoot/product/delete', data)
}
// 删除商品
export const pageProduct = data => {
  return request.post('/cgp/web/media/shoot/product/page', data)
}
// 创建实拍模特
export const saveMannequin = data => {
  return request.post('/cgp/web/media/shoot/mannequin/save', data)
}
// 商品添加实拍模特
export const bindMannequin = data => {
  return request.post('/cgp/web/media/shoot/mannequin/bind', data)
}
// 实拍模特名称列表
export const nameList = data => {
  return request.post('/cgp/web/media/shoot/mannequin/nameList', data)
}
// 编辑实拍模特
export const updateMannequin = data => {
  return request.post('/cgp/web/media/shoot/mannequin/update', data)
}
// 删除实拍模特
export const deleteMannequin = data => {
  return request.post('/cgp/web/media/shoot/mannequin/delete', data)
}
// 删除模特实拍图
export const deleteShoot = data => {
  return request.post('/cgp/web/media/shoot/delete', data)
}
// 上传模特实拍图
export const uploadShoot = data => {
  return request.post('/cgp/web/media/shoot/mannequin/upload', data)
}
// 全部模特实拍图分页
export const pageMannequinShoot = data => {
  return request.post('/cgp/web/media/shoot/mannequin/page', data)
}

// 开放至AI终端开关
export const switchAi = data => {
  return request.post('/v1/system/account/brand/updateBrandConfig', data)
}

// webp格式转png
export const webp2Png = data => {
  return request.post('/cgp/web/media/webp2Png', data)
}
