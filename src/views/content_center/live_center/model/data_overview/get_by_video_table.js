/**
 * 直播详情-电商分析-订单详情
 */
import { getVideoList } from '@/api/content_center/live_center.js'

import { reactive } from 'vue'

export function pageList(roomId) {
  //  表格的查询条件
  const tableForm = reactive({
    loading: false,
    listData: [],
    orderSetting: 'DESC:show_in_live_cnt',
    page: {
      index: 1,
      size: 10,
      total: 0
    }
  })
  function getList(obj) {
    getVideoList({
      orderSetting: tableForm.orderSetting,
      roomId: roomId,
      pageNo: tableForm.page.index,
      pageSize: tableForm.page.size,
      searchCount: true
    })
      .then(res => {
        if (res.code === 0) {
          const list = res.data.records || []

          tableForm.listData = list
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
  function searchList() {
    tableForm.page.index = 1
    getList()
  }
  function sortChange(column, prop, order) {
    if (column.prop === 'showInLiveCnt') {
      if (column.order === 'ascending') {
        tableForm.orderSetting = 'ASC:show_in_live_cnt'
      } else if (column.order === 'descending') {
        tableForm.orderSetting = 'DESC:show_in_live_cnt'
      } else {
        tableForm.orderSetting = ''
      }
    } else if (column.prop === 'drainageInLiveCnt') {
      if (column.order === 'ascending') {
        tableForm.orderSetting = 'ASC:drainage_in_live_cnt'
      } else if (column.order === 'descending') {
        tableForm.orderSetting = 'DESC:drainage_in_live_cnt'
      } else {
        tableForm.orderSetting = ''
      }
    } else if (column.prop === 'showToDrainageRate') {
      if (column.order === 'ascending') {
        tableForm.orderSetting = 'ASC:show_to_drainage_rate'
      } else if (column.order === 'descending') {
        tableForm.orderSetting = 'DESC:show_to_drainage_rate'
      } else {
        tableForm.orderSetting = ''
      }
    } else {
      tableForm.orderSetting = ''
    }
    searchList()
  }
  return { tableForm, getList, resetList, sortChange }
}
