import request from '@/utils/request'

// 粉丝列表
export const list = data => {
  return request.post(`/scrm/fans/list`, data)
}
