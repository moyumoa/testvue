import request from '@/utils/request'

// 评论列表
export const videoCommentList = data => {
  return request.post(`/scrm/videoComment/videoCommentList`, data)
}
// 评论详情
export const videoCommentDetail = data => {
  return request.post(`/scrm/videoComment/videoCommentDetail`, data)
}

// 弹幕列表
export const liveChatMessageList = data => {
  return request.post(`/scrm/live/chat/liveChatMessageList`, data)
}

// 弹幕详情
export const liveChatMessageDetailByRoomId = data => {
  return request.post(`/scrm/live/chat/scrm/videoComment/liveChatMessageDetailByRoomId`, data)
}
