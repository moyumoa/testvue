import request from '@/utils/request'

// 直播详情--》获取直播分享链接（用于生成二维码
export const getShareUrl = data => {
  return request.post(`/cgp/web/liveroom/getRoomRecordShareLink`, data)
}
