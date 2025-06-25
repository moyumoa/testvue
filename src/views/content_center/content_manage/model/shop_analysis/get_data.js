/**
 * 直播详情-电商分析-数据概览
 */

import { listRetentionVideoOrder } from '@/api/content_center/content_manage.js'

export function pageData({ brandId, itemId, platform }) {
  const dataForm = reactive({
    doudianOrderCount: null,
    retentionOrderCount: null,
    loading: true
  })
  // 获取数据
  function getData() {
    dataForm.loading = true
    listRetentionVideoOrder({
      brandId: brandId,
      itemId: itemId,
      orderSetting: '',
      platform: platform,
      searchCount: true
    })
      .then(res => {
        if (res.code === 0 && res.data) {
          dataForm.doudianOrderCount = res.data.doudianOrderCount || 0
          dataForm.retentionOrderCount = res.data.retentionOrderCount || 0
        }
        dataForm.loading = false
      })
      .catch(() => {
        dataForm.loading = false
      })
  }
  return { dataForm, getData }
}
