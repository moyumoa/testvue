import request from '@/utils/request'
// 直播折扣报表列表
export const getRoomListDiscountReport = data => {
  return request.post(`/cgp/web/sale-report/listLiveRoomDiscountReport`, data)
}
// 直播折扣报表列表
export const getAccountDiscountReport = data => {
  return request.post(`/cgp/web/sale-report/xUserDiscountReport`, data)
}
// 折扣报表-导出
export const exportClues = data => {
  return request.post(`/cgp/web/sale-report/exportLiveRoomDiscountReport`, data, {
    headers: {
      'Content-Type': 'application/json-patch+json'
    },
    responseType: 'arraybuffer'
  })
}
