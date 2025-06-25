import request from '@/utils/request'

// 获取素材标签文件夹
export const listTagFolder = params => {
  return request.post('/cgp/web/media/tag/listTagFolder', params)
}
// 获取成品标签文件夹
export const listCreationTagFolder = params => {
  return request.post('/cgp/web/creation/tag/listCreationTagFolder', params)
}
// 根据名称查询素材文件夹
export const queryTagFolder = params => {
  return request.post('/cgp/web/media/tag/queryTagFolder', params)
}
// 根据名称查询成品文件夹
export const queryCreationTagFolder = params => {
  return request.post('/cgp/web/creation/tag/queryCreationTagFolder', params)
}
// 获取素材文件夹下一层级数量
export const getTagFolderCount = params => {
  return request.post('/cgp/web/media/tag/getTagFolderCount', params)
}
// 获取成品文件夹下一层级数量
export const getCreationTagFolderCount = params => {
  return request.post('/cgp/web/creation/tag/getCreationTagFolderCount', params)
}

// 新建、删除、重命名素材文件夹
export const updateTagFolder = params => {
  return request.post('/cgp/web/media/tag/updateTagFolder', params)
}
// 新建、删除、重命名成品文件夹
export const updateCreationTagFolder = params => {
  return request.post('/cgp/web/creation/tag/updateCreationTagFolder', params)
}
// 移动素材文件夹
export const moveTagFolder = params => {
  return request.post('/cgp/web/media/tag/moveTagFolder', params)
}
// 移动成品文件夹
export const moveCreationTagFolder = params => {
  return request.post('/cgp/web/creation/tag/moveCreationTagFolder', params)
}
// 移动素材至文件夹
export const operatorV2 = params => {
  return request.post('/cgp/web/media/material/tag/relate/batch/operatorV2', params)
}
