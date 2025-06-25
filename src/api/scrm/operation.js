import request from '@/utils/request'

// 数据概览数据
export const getOperationData = data => {
  return request.post(`/scrm/home/overview`, data)
}
// 账号排行榜接口
export const getAccountRank = data => {
  return request.post(`/scrm/home/accountRank`, data)
}
// 层级排行榜接口
export const getClientClueRank = data => {
  return request.post(`/scrm/home/deptClientClueRank`, data)
}

// 客户意向度分析
export const getClientIntentionAnalysis = data => {
  return request.post(`/scrm/home/clientIntentionAnalysis`, data)
}
// 留资客户来源
export const getClientUserSource = data => {
  return request.post(`/scrm/home/clueClientUserSource`, data)
}

// 客户转化率漏斗图
export const getFunnelData = data => {
  return request.post(`/scrm/home/clientTransfer`, data)
}

// 客户趋势
export const getLineChartData = data => {
  return request.post(`/scrm/home/clientTrends`, data)
}

// 留资区域分布图
export const getClientClueArea = data => {
  return request.post(`/scrm/home/clientClueArea`, data)
}

// 潜客区域分布图
export const getclientUserArea = data => {
  return request.post(`/scrm/home/clientUserArea`, data)
}

// 潜客来源
export const getclientUserSourceAnalysis = data => {
  return request.post(`/scrm/home/clientUserSourceAnalysis`, data)
}

// 潜客转换漏斗
export const getclientUserTransfer = data => {
  return request.post(`/scrm/home/clientUserTransfer`, data)
}

// 获客排行榜 - 矩阵/留资排行榜
export const getCustomerRanking = data => {
  return request.post(`/scrm/home/clientRankingsByAccount`, data)
}

// 获客排行榜 - 直播
export const clientRankingsByLiveRoom = data => {
  return request.post(`/scrm/home/clientRankingsByLiveRoom`, data)
}

// 获客排行榜 - 视频
export const clientRankingsByVideo = data => {
  return request.post(`/scrm/home/clientRankingsByVideo`, data)
}

// 数据大盘接口
export const getCustomerOverview = data => {
  return request.post(`/scrm/home/newOverview`, data)
}
