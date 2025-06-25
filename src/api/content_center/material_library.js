import request from '@/utils/request'

// 获取素材信息
export function mediaInfoParam(data) {
  return request.post('/v1/sumvideoup/sv/material/mediaInfoParam', data)
}

// 素材库-素材列表
export const list = data => {
  return request.post(`/cgp/web/media/material/list`, data)
}
// 素材库-素材详情
export const detail = data => {
  return request.post(`/cgp/web/media/material/detail`, data)
}
// 素材库-更新素材
export const save = data => {
  return request.post(`/cgp/web/media/material/save`, data)
}
// 素材库 - 批量更新素材
export const batchSave = data => {
  return request.post(`/cgp/web/media/material/batchSave`, data)
}
// 素材库-所有素材标签添加-返回分组格式
export const add = data => {
  return request.post(`/cgp/web/media/material/tag/group/add`, data)
}

// 素材库-素材'使用记录'列表
export const logList = data => {
  return request.post(`/cgp/web/media/material/use/log/list`, data)
}

// 素材库-所有素材标签删除
export const deleteTag = data => {
  return request.post(`/cgp/web/media/material/tag/delete`, data)
}
// 素材库-下载素材事件
export const use = data => {
  return request.post(`/cgp/web/media/material/use`, data)
}

// 素材库-上传素材文本
export const addContent = data => {
  return request.post(`/cgp/web/media/material/upload/content`, data)
}
// 素材库-素材材关联的标签新增和删除
export const operator = data => {
  return request.post(`/cgp/web/media/material/tag/relate/operator`, data)
}
// 模型关联的标签新增和删除
export const ModalOperator = data => {
  return request.post(`/v1/system/account/media/tag/relate/operator`, data)
}

// 作品库的标签
// 素材库-素材材关联的标签新增和删除
export const creationOperator = data => {
  return request.post(`/cgp/web/media/creation/tag/relate/operator`, data)
}
// 素材库-所有素材标签删除
export const creationDeleteTag = data => {
  return request.post(`/cgp/web/media/creation/tag/delete`, data)
}
// 素材库-所有素材标签添加-返回分组格式
export const creationAdd = data => {
  return request.post(`/cgp/web/media/creation/tag/group/add`, data)
}
// 素材库-阿里-获取临时的STS访问权限
export const getSts = data => {
  return request.post(`/cgp/web/oss/ali/getSts`, data)
}
// 素材库-上传素材V2
export const uploadMaterial = data => {
  return request.post(`/cgp/web/media/material/v2/upload`, data)
}
// 素材库-批量删除
export const batchOpr = data => {
  return request.post(`/cgp/web/media/material/batch/delete`, data)
}
// 素材库-批量打标-去标
export const batchAddRemove = data => {
  return request.post(`/cgp/web/media/material/tag/relate/batch/operator`, data)
}
// 素材库-获取标签列表
export const getTags = data => {
  return request.post(`/cgp/web/media/material/tag/list`, data)
}
// 素材库-获取上传批次号
export const getBatchNum = data => {
  return request.post(`/cgp/web/media/material/batch/number`, data)
}
// 素材库-批量上传存数据库
export const batchUpload = data => {
  return request.post(`/cgp/web/media/material/batch/upload`, data)
}
// 素材库-删除上传的文件-支持批量
export const deleteFile = data => {
  return request.post(`/cgp/web/media/material/file/delete`, data)
}
// 素材库-标签入库确认
export const fileOk = data => {
  return request.post(`/cgp/web/media/material/batch/save`, data)
}

// 获取标签词云的列表
export const getTagCloud = data => {
  return request.post(`/cgp/web/media/tag/tagYun`, data)
}

// 记录标签的查询记录
export const saveStatLog = data => {
  return request.post(`/cgp/web/saveStatLog`, data)
}
// 获取/添加关键词
export const filterTagOperate = data => {
  return request.post(`/cgp/web/clues/filterTagOperate`, data)
}
// 删除关键词
export const delFilterTag = data => {
  return request.post(`/cgp/web/clues/delFilterTag`, data)
}

// 切换音频原料的类型
export const updateUploadSpecificType = data => {
  return request.post(`/cgp/web/media/material/short/updateUploadSpecificType`, data)
}


// 合并拆分(操作)原料
export const operateMaterials = data => {
  return request.post(`/v1/sumvideo/sv/material/operation/operateMaterials`, data)
}

// 查询原料操作记录
export const listOperationRecords = data => {
  return request.post(`/v1/sumvideo/sv/material/operation/listOperationRecords`, data)
}
