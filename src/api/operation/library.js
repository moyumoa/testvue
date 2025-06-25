import request from '@/utils/request'

// 素材库--添加/修改分组
export const saveOrUpdateAttachmentCategory = data => {
  return request.post(`/v1/brand/app/appAttachmentCategory/saveOrUpdateAttachmentCategory`, data)
}
// 素材库--删除分组
export const delAttachmentCategroy = data => {
  return request.post(`/v1/brand/app/appAttachmentCategory/delAttachmentCategroy`, data)
}
// 素材库--获取分组列表
export const getAttachmentCategory = data => {
  return request.post(`/v1/brand/app/appAttachmentCategory/getAttachmentCategory`, data)
}

// 素材库--根据分组ID获取素材
export const pageAttachment = data => {
  return request.post(`/v1/brand/app/appAttachment/pageAttachment`, data)
}
// 素材库--添加/修改素材
export const saveOrUpdateAttachment = data => {
  return request.post(`/v1/brand/app/appAttachment/saveOrUpdateAttachment`, data)
}
// 素材库--删除素材
export const delAttachment = data => {
  return request.post(`/v1/brand/app/appAttachment/delAttachment`, data)
}
