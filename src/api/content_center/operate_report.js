import request from '@/utils/request'

// 矩阵号列表
export const accountListQuery = data => {
  return request.post(`/cgp/web/common/getNowXUsers`, data)
}
// 列表
export const dailyOperationReport = data => {
  return request.post(`/cgp/web/dailyReport/dailyOperationReport`, data)
}
// 导出
export const dailyOperationReportExport = data => {
  return request.post(`/cgp/web/dailyReport/dailyOperationReportExport`, data)
}
// 下载中心导出
export const dailyOperationReportExportV2 = data => {
  return request.post(`/cgp/web/dailyReport/dailyOperationReportExportV2`, data)
}
// 导出excel
export const dailyOperationReportExportExcel = data => {
  return request.post(`/cgp/web/dailyReport/dailyOperationReportExportExcelV2`, data)
}
// 下载中心导出excel
export const dailyOperationReportExportExcelV2 = data => {
  return request.post(`/cgp/web/dailyReport/dailyOperationReportExportExcelV2`, data)
}
// 列表-汇总
export const dailyOperationReportSummary = data => {
  return request.post(`/cgp/web/dailyReport/dailyOperationReportSummary`, data)
}

// 成员报表-列表
export const getMemberList = data => {
  return request.post(`/cgp/web/dailyReport/dailyOperationReportByUser`, data)
}
// 成员报表-总和
export const getMemberSummary = data => {
  return request.post(`/cgp/web/dailyReport/dailyOperationReportSummaryByUser`, data)
}

// 成员报表-导出
export const memberReportExport = data => {
  return request.post(`/cgp/web/dailyReport/userDailyReportExport`, data)
}
// 业务主体-列表
export const getPrincipalList = data => {
  return request.post(`/cgp/web/dailyReport/dailyOperationReportByPrincipal`, data)
}

// 业务主体-导出
export const principalReportExport = data => {
  return request.post(`/cgp/web/dailyReport/principalDailyReportExport`, data)
}
