/**
 * 获取直播详情左侧的数据【直播+达人信息】
 */
import { getUserBuyPermit, getRoomDetailsInfo } from '@/api/content_center/live_center.js'

export function pageInfo(roomId) {
  const statusInfo = reactive({
    byStatus: 0, // 0未授权 1已授权/授权失效但已拉倒数据 2授权失效 //
    byAuth: 0, // 0未授权 1已授权 2授权失效
    shopAuth: 0, // 0未授权 1已授权 2授权失效
    dyAuth: 0 // 0未授权 1已授权 2授权失效
  })
  // 对接百应
  const infoLoading = ref(true)
  const haveBy = ref(false)
  // 详情数据
  const byInfo = ref({
    roomStat: { openIdAuthStatusVo: {} },
    getBuyRoomInfo: {}
  })
  // 获取是否对接百应
  function getHaveBy() {
    getUserBuyPermit({ roomId })
      .then(res => {
        if (res.code === 0) {
          haveBy.value = res.data.buyOpenStatus === 1
          statusInfo.byStatus = res.data.buyOpenStatus
          statusInfo.byAuth = res.data.byAuth
          statusInfo.shopAuth = res.data.shopAuth
          statusInfo.dyAuth = res.data.dyAuth
        }
      })
      .finally(() => {
        getBYDetail()
      })
  }
  getHaveBy()
  // 获取数据详情
  function getBYDetail() {
    getRoomDetailsInfo({ roomId: roomId, buyAuth: haveBy.value ? 1 : 0 })
      .then(res => {
        if (res.code === 0) {
          byInfo.value = res.data || {}
        }
      })
      .finally(() => {
        infoLoading.value = false
      })
  }

  return { statusInfo, infoLoading, haveBy, byInfo }
}
