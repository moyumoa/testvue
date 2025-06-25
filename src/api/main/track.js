import request from '@/utils/request'

// 触发埋点
export function triggerTrack(data) {
  return request.post('/v1/system/account/buriedPoint/add', data)
}
