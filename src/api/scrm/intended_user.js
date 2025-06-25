import request from '@/utils/request'

// 意向用户列表
export const list = data => {
  return request.post(`/scrm/enterprise/list`, data)
}
