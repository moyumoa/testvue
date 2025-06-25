import request from '@/utils/request'
// 保存分类
export const saveCategory = params => {
  return request.post('/v1/sumvideo/sv/category/save', params)
}
// 查询分类信息列表
export const templateArray = params => {
  return request.post('/v1/sumvideo/sv/category/list', params)
}

// 修改分类 --不要了
export const modifyCategory = params => {
  return request.post('/v1/sumvideo/sv/category/modify', params)
}
// 新增分类--不要了
export const createCategory = params => {
  return request.post('/v1/sumvideo/sv/category/create', params)
}
// 删除分类
export const deleteCategory = params => {
  return request.post('/v1/sumvideo/sv/category/delete', params)
}
// 查询创意
export const creativeList = params => {
  return request.post('/v1/sumvideo/sv/template/page', params)
}

// 绑定分类弹窗接口 --不要了
export const dialogList = params => {
  return request.post('/v1/sumvideo/sv/category/window/list', params)
}

// 绑定创意分类--批量绑定 --不要了
export const bind = params => {
  return request.post('/v1/sumvideo/sv/category/bind', params)
}

// 解绑创意分类--批量解绑 --不要了
export const unbind = params => {
  return request.post('/v1/sumvideo/sv/category/unbind', params)
}
// 更新创意分类--单个绑定
export const updateBind = params => {
  return request.post('/v1/sumvideo/sv/category/updateBind', params)
}
