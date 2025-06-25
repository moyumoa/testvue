import request from '@/utils/request'

// 成员跟进报表
export const userClueData = data => {
  return request.post(`/scrm/account/userClueData`, data)
}

// 成员跟进报表导出
export const exportUserClueData = data => {
  return request.post(`/scrm/account/exportUserClueData`, data)
}
