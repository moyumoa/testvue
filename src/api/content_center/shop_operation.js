import request from '@/utils/request'

// 店铺运营报表--店铺成交分析
export const shopTransactionAnalysis = data => {
  return request.post(`/oc/shopTransactionAnalysis`, data)
}
// 店铺运营报表--导出店铺成交分析
export const exportShopTransactionAnalysis = data => {
  return request.post(`/oc/exportShopTransactionAnalysis`, data, {
    headers: {
      'Content-Type': 'application/json-patch+json'
    },
    responseType: 'arraybuffer'
  })
}
// 下载中心 店铺运营报表--导出店铺成交分析
export const exportShopTransactionAnalysisV2 = data => {
  return request.post(`/oc/exportShopTransactionAnalysisV2`, data)
}
