import request from '@/utils/request'

// 批量变更员工部门
export function udpateStaffDepart(data) {
  return request.post(`/v1/system/account/staff/udpateStaffDepart`, data)
}
// 新建/编辑部门
export function createDept(data) {
  return request.post(`/v1/system/account/dept/createDept`, data)
}
// 删除子部门
export function deleteDeptRelation(data) {
  return request.post(`/v1/system/account/dept/deleteDeptRelation`, data)
}
// 离职
export function userResign(data) {
  return request.post(`/v1/system/account/staff/userResign`, data)
}

// 部门是否存在离职人员
export function hasResign(data) {
  return request.post(`/v1/system/account/dept/hasResign`, data)
}
// 批量导入
export const downloadTemplate = data => {
  return request({
    url: '/v1/system/account/download/template/批量导入成员模板.xlsx',
    method: 'POST',
    data: data,
    responseType: 'arraybuffer'
  })
}

// 生成/刷新部门邀请二维码
export function generateInvitation(data) {
  return request.post(`/v1/system/account/dept/generateInvitation`, data)
}

// 链接转二维码
export function generateAPPInvitation(data) {
  return request.post(`/v1/system/account/dept/convertQrCode`, data)
}

// 停用/开启部门邀请状态
export function disableDepartmentInvitation(data) {
  return request.post(`/v1/system/account/dept/disableDepartmentInvitation`, data)
}

// 获取业务主体类型的信息
export function getBusinessEntity(data) {
  return request.post(`/v1/system/account/dept/disableDepartmentInvitation`, data)
}
// 获取公众号二维码
export function getWxOfficialQrCode(data) {
  return request.post(`/v1/system/account/wxm/getWxOfficialQrCode`, data)
}
// 导出部门内部人员列表
export function exportDeptStaffPage(data) {
  return request.post(`/v1/system/account/staff/exportDeptStaffPage`, data)
}
