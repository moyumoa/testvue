import request from '@/utils/request'

// 销售报表-列表
export const getRoomList = data => {
  return request.post(`/cgp/web/sale-report/listSaleReport`, data)
}

// 销售报表-导出
export const exportClues = data => {
  return request.post(`/cgp/web/sale-report/exportSaleReport`, data, {
    headers: {
      'Content-Type': 'application/json-patch+json'
    },
    responseType: 'arraybuffer'
  })
}
