import request from '@/utils/request'

// 内容概览-数据总览
export const allDataView = data => {
  return request.post(`/cgp/web/generalView/allDataView`, data)
}

// 内容概览-问答芝士
export const listKnowledge = data => {
  return request.post(`/cgp/web/generalView/listKnowledge`, data)
}
// 内容概览-内容周报
export const weeklyReport = data => {
  return request.post(`/cgp/web/generalView/weeklyReport`, data)
}

// 内容概览-视频数据图表
export const videoChart = data => {
  return request.post(`/cgp/web/generalView/videoChart`, data)
}
// 内容概览-直播数据图表
export const liveChart = data => {
  return request.post(`/cgp/web/generalView/liveChart`, data)
}
// 内容概览-效果数据图表
export const collectionChart = data => {
  return request.post(`/cgp/web/generalView/collectionChart`, data)
}

// 内容概览-视频播放排行榜
export const videoPlayRanking = data => {
  return request.post(`/cgp/web/generalView/videoPlayRanking`, data)
}

// 内容概览-视频点赞排行榜
export const videoDiggRanking = data => {
  return request.post(`/cgp/web/generalView/videoDiggRanking`, data)
}

// 内容概览-直播观看排行榜
export const roomWatchRanking = data => {
  return request.post(`/cgp/web/generalView/roomWatchRanking`, data)
}

// 内容概览-直播点赞排行榜
export const roomDiggRanking = data => {
  return request.post(`/cgp/web/generalView/roomDiggRanking`, data)
}

// 内容概览-直播涨粉排行榜
export const roomFansAddRanking = data => {
  return request.post(`/cgp/web/generalView/roomFansAddRanking`, data)
}

// 内容概览-视频带货排行榜
export const videoSalesRanking = data => {
  return request.post(`/cgp/web/generalView/videoSalesRanking`, data)
}

// 内容概览-直播带货排行榜
export const liveSalesRanking = data => {
  return request.post(`/cgp/web/generalView/liveSalesRanking`, data)
}

// 平台热词
export const getHotWords = (data = {}) => {
  return request.post(`/cgp/web/generalView/hotWords`, data)
}

// 行业热词
export const industryHotWordsList = (data = {}) => {
  return request.post(`/cgp/web/inspiration/video/industryHotWordsList`, data)
}

// 平台热点
export const getHotRends = data => {
  return request.post(`/cgp/web/generalView/hotTrends`, data)
}

// 行业热点
export const getIndustryRends = data => {
  return request.post(`/cgp/web/inspiration/video/inspirationHotVideoList`, data)
}
// 行业热点V2
export const getIndustryRendsV2 = data => {
  return request.post(`/cgp/web/inspiration/video/inspirationHotVideoListV2`, data)
}

// 数据总览
export const getVideoTrendData = data => {
  return request.post(`/cgp/web/generalView/videoTrendData`, data)
}
// 数据总览V2
export const getVideoTrendDataV2 = data => {
  return request.post(`/cgp/web/generalView/videoTrendDataV2`, data)
}

// 矩阵指数榜
export const getAccountGradeRank = data => {
  return request.post(`/cgp/web/generalView/accountGradeRank`, data)
}

// 首页概览数据
export const overviewCountData = data => {
  return request.post(`/cgp/web/generalView/overviewCountData`, data)
}

// 首页概览活跃矩阵号趋势图
export const overviewChartDataV2 = data => {
  return request.post(`/cgp/web/generalView/overviewChartDataV2`, data)
}

// 首页概览受时间筛选影响数据
export const overviewStageData = data => {
  return request.post(`/cgp/web/generalView/overviewStageData`, data)
}
