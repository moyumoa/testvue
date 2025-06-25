import request from '@/utils/request'

// 获取批量发布名称
export const getTaskName = params => {
  return request.post('/cgp/web/batchPublish/getTaskName', params)
}
// 创建批量发布
export const createPublishTask = params => {
  return request.post('/cgp/web/batchPublish/createPublishTask', params)
}
// 获取任务列表
export const listPublishTask = params => {
  return request.post('/cgp/web/batchPublish/listPublishTask', params)
}
// 任务列表导出
export const exportPublishTaskRecord = params => {
  return request.post('/cgp/web/batchPublish/exportPublishTaskRecord', params)
}
// 获取任务详情
export const publishTaskDetail = params => {
  return request.post('/cgp/web/batchPublish/publishTaskDetail', params)
}
// 获取发布记录及数据
export const publishVideoRecord = params => {
  return request.post('/cgp/web/videoPublish/publishVideoRecord', params)
}
// 批量发布记录导出
export const exportBatchPublishRecord = params => {
  return request.post('/cgp/web/videoPublish/exportBatchPublishRecord', params)
}
// 关闭任务
export const closeTask = params => {
  return request.post('/cgp/web/batchPublish/closeTask', params)
}
// 获取发布账号
export const listAccountSnapshot = params => {
  return request.post('/cgp/web/batchPublish/listAccountSnapshot', params)
}


// 二维码发布记录-查询二维码列表
export const listQrCode = params => {
  return request.post('/cgp/web/material/qrcode/listQrCode', params)
}
// 二维码发布记录-二维码发布记录导出
export const exportQrCodePublishRecord = params => {
  return request.post('/cgp/web/material/qrcode/exportQrCodePublishRecord', params)
}
// 二维码发布记录-查询二维码发布记录
export const listQrCodePublishRecord = params => {
  return request.post('/cgp/web/material/qrcode/listQrCodePublishRecord', params)
}
// 二维码发布记录-同步数据
export const syncData = params => {
  return request.post('/cgp/web/material/qrcode/syncData', params)
}
