/*
 * @Author: your name
 * @Date: 2022-04-11 16:44:11
 * @LastEditTime: 2022-04-11 16:44:23
 * @LastEditors: your name
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \sumwhy-fly-view\src\api\content_center\content_repository.js
 */
import request from '@/utils/request'

// 内容库-作品库-获取作品库列表
export const getWorkLibraryList = data => {
  return request.post(`/cgp/web/media/creation/list`, data)
}
// 智能短视频-成品库-获取列表
export const getWorkLibraryListV2 = data => {
  return request.post(`/cgp/web/media/creation/productList`, data)
}

// 内容库-作品库-获取作品详情
export const getWorkDetail = data => {
  return request.post(`/cgp/web/media/creation/detail`, data)
}

// 内容库-作品库-更新一个作品的数据
export const updateWork = data => {
  return request.post(`/cgp/web/media/creation/save`, data)
}

// 内容库-作品库-添加标签或查询标签
export const getWorkTabList = data => {
  return request.post(`/cgp/web/media/creation/tag/group/add`, data)
}

// 内容库-作品库-作品详情页面获取作品使用记录
export const getUsageRecordList = data => {
  return request.post(`/cgp/web/media/creation/use/log/list`, data)
}

// 内容库-作品库-删除所有标签
export const delAllTags = data => {
  return request.post(`/cgp/web/media/creation/tag/delete`, data)
}

// 内容库-作品库-下载作品前调用的接口
export const beforUpdateWorks = data => {
  return request.post(`/cgp/web/media/creation/use/log/save`, data)
}
// 内容库-作品库-批量下载作品记录次数
export const saveBatch = data => {
  return request.post(`/cgp/web/media/creation/use/log/saveBatch`, data)
}

// 内容库-作品库-上传作品V2
export const uploadWork = data => {
  return request.post(`/cgp/web/media/creation/v2/upload`, data)
}

// 导入酷家乐视频--
export const importKJL = data => {
  return request.post(`/cgp/web/kujialeVideo/import`, data)
}

// 导入记录--
export const importRecordList = data => {
  return request.post(`/cgp/web/kujialeVideo/importRecordList`, data)
}
// 成品库-批量上传
export const batchUploadV2 = data => {
  return request.post(`/cgp/web/media/creation/v2/batchUpload`, data)
}
// 成品库-批量打标/去标/删除
export const batchAddTagOrDel = data => {
  return request.post(`/cgp/web/media/creation/batchAddTagOrDel`, data)
}

// 成品库-创建二维码
export const createOrUpdateQrCode = data => {
  return request.post(`/cgp/web/material/qrcode/createOrUpdateQrCode`, data)
}
