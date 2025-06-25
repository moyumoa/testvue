import request from '@/utils/request'


// 图片组合
export const combination = data => {
  return request.post('/cgp/web/media/material/picture/combination', data)
}

// 获取最近最常使用的标签
export const getRecentMostUseTag = data => {
  return request.post('/cgp/web/media/tag/getRecentMostUseTag', data)
}