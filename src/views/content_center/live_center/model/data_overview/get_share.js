import { getShareUrl } from '@/api/content_center/live_share'

// 获取与分享有关系的内容
export function getShare(roomId) {
  const shareAbout = reactive({})
  const userId = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo')).userId
    : ''

  getShareUrl({ roomId }).then(res => {
    if (res.code === 0) {
      shareAbout.value = res.data
      shareAbout.value.pcUrl = `${shareAbout.value.pcUrl}&userId=${userId}`
    }
  })

  return {
    shareAbout
  }
}
