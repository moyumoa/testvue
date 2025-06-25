import request from '@/utils/request'

// 成员数据
export const getMemberList = data => {
  return request.post(`/mission/operationalAnalysis/employeeDataList`, data)
}
// 组织架构
export const getOrganization = data => {
  return request.post(`/mission/operationalAnalysis/organizationalStructureInfo`, data || {})
}
// 查询指标名
export const getTargetsInfo = data => {
  return request.post(`/mission/operationalAnalysis/targetsInfo`, data)
}
// 导出成员数据
export const exportMemberData = data => {
  return request.post(`/mission/operationalAnalysis/exportEmployeeDataListV2`, data)
  // return request({
  //   url: '/mission/operationalAnalysis/exportEmployeeDataListV2',
  //   method: 'POST',
  //   data: data,
  //   responseType: 'arraybuffer'
  // })
}
// 任务数据
export const getTaskDataList = data => {
  return request.post(`/mission/operationalAnalysis/taskDataList`, data)
}
// 导出任务数据
export const exportTaskData = data => {
  return request({
    url: '/mission/operationalAnalysis/exportTaskDataList',
    method: 'POST',
    data: data,
    responseType: 'arraybuffer'
  })
}
// 部门数据
export const getPartDataList = data => {
  return request.post(`/mission/operationalAnalysis/orgDataList`, data)
}
// 导出部门数据
export const exportPartData = data => {
  return request.post(`/mission/operationalAnalysis/exportOrgDataListV2`, data)
  // return request({
  //   url: '/mission/operationalAnalysis/exportOrgDataListV2',
  //   method: 'POST',
  //   data: data,
  //   responseType: 'arraybuffer'
  // })
}
// 数据总计
export const getAllDataOverview = data => {
  return request.post(`/mission/operationalAnalysis/allDataOverview`, data)
}
// 指标数据接口
export const getCoreTargets = data => {
  return request.post(`/mission/operationalAnalysis/coreTargets`, data)
}
// 成员管理
export const getMemberMangeList = data => {
  return request.post(`/mission/employee/listInfo`, data)
}
// 变更金币
export const updateUserGold = data => {
  return request.post(`/mission/employee/updateGold`, data)
}
// 获取用户金币类型与余额
export const getCustomerGoldBalance = data => {
  return request.post(`/mission/miniApp/gold/getCurrentGoldDetail`, data)
}
// 批量修改金币模板
export const exportModifyCoinsTemplate = data => {
  return request({
    url: '/mission/employee/exportModifyCoinsTemplate',
    method: 'POST',
    data: data,
    responseType: 'arraybuffer'
  })
}
// 内部达人导出
export const exporMemberMangementFile = data => {
  return request.post(`/mission/employee/exportListInfoV2`, data)
  // return request({
  //   url: '/mission/employee/exportListInfoV2',
  //   method: 'POST',
  //   data: data,
  //   responseType: 'arraybuffer'
  // })
}
// 人为修改金币记录列表
export const getUpdateGoldLog = data => {
  return request.post(`/mission/employee/goldRecordManuallyList`, data)
}
// 查询KOC配置
export const getOutsiderConfig = data => {
  return request.post(`/v1/system/account/orgSyncConfig/getOutsiderConfig`, data)
}
// 更新KOC配置
export const updateOutsiderConfig = data => {
  return request.post(`/v1/system/account/orgSyncConfig/updateOutsiderConfig`, data)
}
// KOC邀请信息
export const getInvitationInfo = data => {
  return request.post(`/v1/system/account/wxm/getInvitationInfo`, data)
}
// 获取品牌koc定制小程序
export const getBrandKOCMinigram = data => {
  return request.post(`/v1/system/account/wxThird/miniprogram/getBrandKOCMinigram`, data)
}
// 导出部门数据
export const exportDepartmentData = data => {
  return request.post(`/mission/org/task/exportV2`, data)
  // return request({
  //   url: '/mission/org/task/exportV2',
  //   method: 'POST',
  //   data: data,
  //   responseType: 'arraybuffer'
  // })
}
// 矩阵号分组列表
export const getUserGroup = data => {
  return request.post(`/cgp/web/xUserGroup/list`, data)
}
// 部门任务数据
export const getTaskDepartmentData = data => {
  return request.post(`/mission/org/task/data`, data)
}
// 部门任务数据字段
export const getTaskDepartmentDataField = data => {
  return request.post(`/mission/org/task/export/column`, data)
}
// 修改员工部门信息
export const udpateStaffDepart = data => {
  return request.post(`/v1/system/account/staff/udpateStaffDepart`, data)
}

// 根据部门ID查询子部门
export const queryChildrenDeptIdsPage = data => {
  return request.post(`/v1/system/account/dept/queryChildrenDeptIdsPage`, data)
}

// 获取成员动态
export const getTaskCenter = data => {
  return request.post(`/mission/miniApp/task/getTaskCenter`, data)
}
// 查询是否展示员工工号
export const isShowEmployeeId = data => {
  return request.post(`/mission/common/isShowEmployeeId`, data)
}
