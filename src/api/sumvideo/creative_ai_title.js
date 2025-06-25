import request from '@/utils/request'

// 查询热词
export const hotWord = data => {
  return request.post('/cgp/web/dict/hotword/query', data)
}
// AI文案创作券生产记录
export const listCreationTicketLog = data => {
  return request.post('/v1/system/account/balance-log/sumvideo/listCreationTicketLog', data)
}
// 生成标题 票据
export const generate = data => {
  return request.post('/v1/sumvideo/sv/creative/copy/generate', data)
}
// 查询标题文案库
export const listTitleAndDesc = data => {
  return request.post('/v1/sumvideo/sv/creative/copy/listTitleAndDesc', data)
}
// 回收或还原标题文案
export const recycleOrRestoreCreativeTitleDesc = data => {
  return request.post('/v1/sumvideo/sv/creative/copy/recycleOrRestoreCreativeTitleDesc', data)
}
// 一键还原
export const allRestoreCreativeTitleDesc = data => {
  return request.post('/v1/sumvideo/sv/creative/copy/allRestoreCreativeTitleDesc', data)
}
// 获取生成结果
export const getGenerateResult = data => {
  return request.post('/v1/sumvideo/sv/creative/copy/getGenerateResult', data)
}
// 获取上次生成入参以及获取接口需要的参数
export const getGenerateParam = data => {
  return request.post('/v1/sumvideo/sv/creative/copy/getGenerateParam', data)
}
// 清空数据
export const deleteGenerateResult = data => {
  return request.post('/v1/sumvideo/sv/creative/copy/deleteGenerateResult', data)
}
// 添加或编辑
export const saveOrUpdateTitleAndDesc = data => {
  return request.post('/v1/sumvideo/sv/creative/copy/saveOrUpdateTitleAndDesc', data)
}
// 获取批量添加标题模版
export const getBatchSaveTitleAndDescTemplate = data => {
  return request({
    url: '/v1/sumvideo/sv/creative/copy/getBatchSaveTitleAndDescTemplate',
    method: 'POST',
    data: data,
    responseType: 'arraybuffer'
  })
}
// 删除
export const deleteTitleAndDesc = data => {
  return request.post('/v1/sumvideo/sv/creative/copy/deleteTitleAndDesc', data)
}
// AI文案创作记录导出
export const statExportV2 = data => {
  return request.post(`/scrm/event/daily/account/stat/export`, data)
}
