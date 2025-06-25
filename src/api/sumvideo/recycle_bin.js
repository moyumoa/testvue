import request from '@/utils/request'
// 查询回收站
export const getRecycleList = params => {
  return request.post('/v1/sumvideo/sv/recycle/list', params)
}
// 还原回收站
export const recycleRollback = params => {
  return request.post('/v1/sumvideo/sv/recycle/rollback', params)
}
// 删除回收站
export const recycleDelete = params => {
  return request.post('/v1/sumvideo/sv/recycle/delete', params)
}
