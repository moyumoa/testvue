import request from '@/utils/request'

// 直播中心-列表
export const getRoomList = data => {
  return request.post(`/cgp/web/liveroom/getRoomList`, data)
}

// 直播中心-是否对接百应
export const getUserBuyPermit = data => {
  return request.post(`/cgp/web/account/getUserBuyPermit`, data)
}
// 直播中心-详情
export const getRoomDetailsInfo = data => {
  return request.post(`/cgp/web/liveroom/getRoomDetailsInfo`, data)
}
// 直播中心-详情-数据概览-图表
export const getRoomDetailsChart = data => {
  return request.post(`/cgp/web/liveroom/getRoomDetailsChart`, data)
}
// 直播中心-详情-数据概览-列表
export const getRoomDetailsList = data => {
  return request.post(`/cgp/web/liveroom/getRoomDetailsList`, data)
}
// 直播中心-详情-电商分析-数据概览
export const orderOverview = data => {
  return request.post(`/cgp/web/liveroom/order/overview`, data)
}
// 直播中心-详情-电商分析-数据概览
export const orderList = data => {
  return request.post(`/cgp/web/liveroom/order/list`, data)
}
// 直播中心-详情-百应
export const getLiveDashBoardOverView = data => {
  return request.post(`/cgp/web/liveroom/getLiveDashBoardOverView`, data)
}

// 直播中心-详情-百应-流量趋势
export const getLiveTrendByRoomIdAndTypes = data => {
  return request.post(`/cgp/web/liveroom/getLiveTrendByRoomIdAndTypes`, data)
}
// 直播中心-详情-百应-商品列表
export const getBoardLiveRoomGoods = data => {
  return request.post(`/cgp/web/liveroom/v2/getBoardLiveRoomGoods`, data)
}

// 直播中心-详情-百应-获取流量的占比
export const getLiveFlowPercentage = data => {
  return request.post(`/cgp/web/liveroom/getLiveFlowPercentage`, data)
}
// 直播中心-详情-百应-获取直播间流量转化的数据
export const getLiveFlowTrends = data => {
  return request.post(`/cgp/web/liveroom/getLiveFlowTrends`, data)
}

// 直播中心-详情-百应-获取直播间的短视频引流
export const getVideoList = data => {
  return request.post(`/cgp/web/liveroom/getVideoList`, data)
}
// 导出飞书文档
export const liveExport = data => {
  return request.post(`/cgp/web/liveroom/liveExport`, data)
}
// 导出excel
// export const liveExportExcel = data => {
//   return request.post(`/cgp/web/liveroom/liveExportExcelV2`, data, {
//     headers: {
//       'Content-Type': 'application/json-patch+json'
//     },
//     responseType: 'arraybuffer'
//   })
// }
export const liveExportExcel = data => {
  return request.post(`/cgp/web/liveroom/liveExportExcelV2`, data)
}
// 获取视频
export const getLiveRoomVideo = data => {
  return request.post(`/cgp/web/liveroom/getLiveRoomVideo`, data)
}
// 获取弹幕
export const getMessage = data => {
  return request.post(`/cgp/web/liveroom/getMessage`, data)
}
// 趋势图
export const getLiveTrendByRoomId = data => {
  return request.post(`/cgp/web/liveroom/getLiveTrendByRoomIdAndTypes`, data)
}

// 获取录屏信息
export const getVideoInfo = data => {
  return request.post(`/cgp/web/liveroom/hasRecordSite`, data)
}

// 商品讲解
export const selectEventRibbon = data => {
  return request.post(`cgp/web/liveroom/selectEventRibbon`, data)
}
// 排班
export const getAnchorInfo = data => {
  return request.post(`cgp/web/liveroom/getRoomVideoAnchorInfo`, data)
}

// 直播间详情线索明细
export const getLiveRoomClueInfo = data => {
  return request.post(`/cgp/web/clues/getLiveRoomClueInfo`, data)
}

// 直播间线索明细导出
export const exportLiveRoomClueInfo = data => {
  return request.post(`/cgp/web/clues/exportLiveRoomClueInfo`, data, {
    headers: {
      'Content-Type': 'application/json-patch+json'
    },
    responseType: 'arraybuffer'
  })
}
