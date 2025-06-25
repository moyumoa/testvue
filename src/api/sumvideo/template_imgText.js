import request from '@/utils/request'
// 保存图文模板
export const saveImageCreative = data => {
  return request.post('/v1/sumvideo/sv/imageCreative/saveImageCreative', data)
}

// 获取模板详情,只传模板id
export const getImageCreativeDetail = data => {
  return request.post('/v1/sumvideo/sv/imageCreative/getImageCreativeDetail', data)
}

// 保存图文模板设置
export const saveImageCreativeSetting = data => {
  return request.post('/v1/sumvideo/sv/imageCreative/saveImageCreativeSetting', data)
}

// 保存图文模板的实拍图-虚拟模特-场景图
export const saveImageCreativeMedia = data => {
  return request.post('/v1/sumvideo/sv/imageCreative/saveImageCreativeMedia', data)
}

// 删除图文模板的实拍图-虚拟模特-场景图
export const removeImageCreativeMedia = data => {
  return request.post('/v1/sumvideo/sv/imageCreative/removeImageCreativeMedia', data)
}

// 生成预览文案，只传模板id
export const generatePreviewTitle = data => {
  return request.post('/v1/sumvideo/sv/imageCreative/generatePreviewTitle', data)
}