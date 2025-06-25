import request from '@/utils/request'
// 视频部分接口

// 抖店订单列表
export const listDoudianVideoOrder = data => {
  return request.post(`/cgp/web/video/listDoudianVideoOrder`, data)
}

// 留资订单列表
export const listRetentionVideoOrder = data => {
  return request.post(`/cgp/web/video/listRetentionVideoOrder`, data)
}

// 分页查询视频基础数据
export const listVideo = data => {
  return request.post(`/cgp/web/video/listVideo`, data)
}
// 分页查询视频基础数据V2
export const listVideoV2 = data => {
  return request.post(`/cgp/web/video/listVideoV2`, data)
}

// 视频评论列表
export const listVideoComment = data => {
  return request.post(`/cgp/web/video/listVideoComment`, data)
}

// 视频基础分析
export const videoBaseAnalysis = data => {
  return request.post(`/cgp/web/video/videoBaseAnalysis`, data)
}

// 视频评论热词分析
export const videoCommentHotWordAnalysis = data => {
  return request.post(`/cgp/web/video/videoCommentHotWordAnalysis`, data)
}

// 电商分析数据概览
// export const videoCommerceStatistics = data => {
//   return request.post(`/cgp/web/video/videoCommerceStatistics`, data)
// }
// 视频信息数据
export const videoStatisticsInfo = data => {
  return request.post(`/cgp/web/video/videoStatisticsInfo`, data)
}
// 导出飞书文档
// export const exportVideoWithFeiShu = data => {
//   return request.post(`/cgp/web/video/exportVideoWithFeiShu`, data)
// }

// 导出excel
export const exportVideoV2 = data => {
  return request.post(`/cgp/web/video/exportVideoV2`, data)
}

// 获取标签
export const getSearchLabel = data => {
  return request.post(`/cgp/web/media/creation/tag/list`, data)
}

// 关键词排行
export const keywordRanking = data => {
  return request.post(`/cgp/web/video/keywordRanking`, data)
}

// 评论列表
export const videoCommentListByItemId = data => {
  return request.post(`/cgp/web/video/scrm/videoComment/videoCommentListByItemId`, data)
}
