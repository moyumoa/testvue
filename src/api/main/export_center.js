import request from '@/utils/request'
// 查询下载任务
export function listDownloadTask(data) {
  return request.post('/v1/system/account/download/listDownloadTaskV2', data)
}
// 取消下载任务
export function updateDownloadTask(data) {
  return request.post('/v1/system/account/download/updateDownloadTask', data)
}
