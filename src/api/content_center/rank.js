import request from '@/utils/request'
// 查询当前用户的部门及其下级部门树--12.29不用了
// export const getDepartmentTree = data => {
//   return request.post(`/cgp/web/ranking/currentUserDepartmentTree`, data)
// }
// 直播排行榜
export const getroomRanking = data => {
  return request.post(`/cgp/web/ranking/roomRanking`, data)
}
// 视频排行榜
export const getvideoRanking = data => {
  return request.post(`/cgp/web/ranking/videoRanking`, data)
}
// 视频人气榜按视频发布时间统计接口
export const getListVideo = data => {
  return request.post(`/cgp/web/video/listVideo`, data)
}
// 矩阵排行榜
export const getsalesRanking = data => {
  return request.post(`/cgp/web/ranking/salesRanking`, data)
}
// 直播商品排行榜
export const getliveProductRanking = data => {
  return request.post(`/cgp/web/ranking/liveProductRanking`, data)
}
// 直播商品排行榜分析
export const getliveProductRankingStatistics = data => {
  return request.post(`/cgp/web/ranking/liveProductRankingStatistics`, data)
}
// 直播排行榜分析结果
export const getRoomRankingStatisticsData = data => {
  return request.post(`/cgp/web/ranking/getRoomRankingStatisticsData`, data)
}
// 视频排行榜分析结果
export const getVideoRankingStatisticsData = data => {
  return request.post(`/cgp/web/ranking/getVideoRankingStatisticsData`, data)
}
// 矩阵排行榜分析结果
export const getSalesRankingStatisticsData = data => {
  return request.post(`/cgp/web/ranking/getSalesRankingStatisticsData`, data)
}
// 矩阵号查询分组
export const getGroupList = data => {
  return request.post(`/cgp/web/xUserGroup/listGroup`, data)
}
// 新增下载中心导出
export const exportGetUserListV2 = data => {
  return request.post(`/cgp/web/account/exportGetUserListV2`, data)
}
