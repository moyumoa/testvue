/**
 * 直播详情-电商分析-数据概览
 */

import { orderOverview } from '@/api/content_center/live_center.js'

export function pageData(roomId, haveBy) {
  const dataForm = reactive({
    sellNum: null,
    sellAmount: null,
    clueNum: null,
    loading: true
  })
  // 获取数据
  function getData() {
    dataForm.loading = true
    orderOverview({
      platform: 1,
      roomId: roomId,
      type: haveBy ? 2 : null
    })
      .then(res => {
        if (res.code === 0) {
          dataForm.sellNum = res.data.sellNum || 0
          dataForm.sellAmount = res.data.sellAmount || 0
          dataForm.clueNum = res.data.clueNum || 0
        }
        dataForm.loading = false
      })
      .catch(() => {
        dataForm.loading = false
      })
  }
  return { dataForm, getData }
}
