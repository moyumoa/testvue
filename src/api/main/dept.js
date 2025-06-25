import request from '@/utils/request'

// 查询部门列表 一级级加载
export function getLazyDeptTree(data) {
  return request.post(`/v1/system/account/dept/getLazyDeptTree`, data)
}
// 查询部门列表 根据名称搜索
export function queryDepartment(data) {
  return request.post(`/v1/system/account/dept/queryDepartment`, data)
}
// 获取全部业务主体部门信息，不带分页
export function listAllBusinessBody(data) {
  return request.post(`/v1/system/account/business/listAllBusinessBody`, data)
}
