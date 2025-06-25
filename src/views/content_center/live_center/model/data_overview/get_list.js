/**
 * 直播详情-电商分析-订单详情
 */
import { getRoomDetailsList } from '@/api/content_center/live_center.js'

export function pageList(roomId) {
  const tableForm = reactive({
    loading: true,
    listData: [],
    page: {
      index: 1,
      size: 10,
      total: 0
    }
  })

  function getList(obj) {
    getRoomDetailsList({
      orderSetting: '',
      roomId: roomId,
      pageNo: tableForm.page.index,
      pageSize: tableForm.page.size,
      searchCount: true
    })
      .then(res => {
        if (res.code === 0) {
          tableForm.listData = res.data.records || []
          tableForm.page.total = res.data.total || 0
        } else {
          if (tableForm.page.index === 1) {
            tableForm.listData = []
          }
        }
        tableForm.loading = false
      })
      .catch(() => {
        tableForm.loading = false
      })
  }
  function resetList() {
    tableForm.loading = true
    tableForm.page = {
      index: 1,
      size: 10,
      total: 0
    }
    getList()
  }
  return {
    tableForm,
    getList,
    resetList
  }
}
