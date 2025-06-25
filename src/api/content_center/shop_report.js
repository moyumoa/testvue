import request from '@/utils/request'

// 店铺商品统计-列表
export const getListReport = data => {
  return request.post(`/oc/report/product-analysis/list-report`, data)
}

// 店铺商品统计-导出
export const exportReport = data => {
  return request.post(`/oc/report/product-analysis/export-report`, data)
}
// 下载中心 店铺商品统计-导出
export const exportReportV2 = data => {
  return request.post(`/oc/report/product-analysis/export-reportV2`, data)
}
// 店铺商品统计-导出Excel
export const exportReportExcel = data => {
  return request.post(`/oc/report/product-analysis/export-excel`, data, {
    headers: {
      'Content-Type': 'application/json-patch+json'
    },
    responseType: 'arraybuffer'
  })
}
// 下载中心 店铺商品统计-导出Excel
export const exportReportExcelV2 = data => {
  return request.post(`/oc/report/product-analysis/export-excelV2`, data)
}
