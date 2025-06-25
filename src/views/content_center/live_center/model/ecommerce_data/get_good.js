/**
 * 直播详情[百应]-电商分析-商品信息
 */
import { getBoardLiveRoomGoods } from '@/api/content_center/live_center.js'

import { reactive } from 'vue'

export function pageList(roomId) {
  //  表格的查询条件
  const tableForm = reactive({
    loading: false,
    listData: [],
    orderSetting: 'DESC:pay_in_live_order_product_gmv',
    page: {
      index: 1,
      size: 10,
      total: 0
    }
  })
  function getList() {
    getBoardLiveRoomGoods({
      orderSetting: tableForm.orderSetting,
      platform: 1,
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
    console.log(column, 'sortChange column')
    if (column.prop === 'pay_in_live_order_product_gmv') {
      if (column.order === 'ascending') {
        tableForm.orderSetting = 'ASC:pay_in_live_order_product_gmv'
      } else if (column.order === 'descending') {
        tableForm.orderSetting = 'DESC:pay_in_live_order_product_gmv'
      } else {
        tableForm.orderSetting = ''
      }
    } else if (column.prop === 'pay_in_live_order_product_cnt') {
      if (column.order === 'ascending') {
        tableForm.orderSetting = 'ASC:pay_in_live_order_product_cnt'
      } else if (column.order === 'descending') {
        tableForm.orderSetting = 'DESC:pay_in_live_order_product_cnt'
      } else {
        tableForm.orderSetting = ''
      }
    } else if (column.prop === 'product_click_ucnt') {
      if (column.order === 'ascending') {
        tableForm.orderSetting = 'ASC:product_click_ucnt'
      } else if (column.order === 'descending') {
        tableForm.orderSetting = 'DESC:product_click_ucnt'
      } else {
        tableForm.orderSetting = ''
      }
    } else if (column.prop === 'product_click_in_live_rate') {
      if (column.order === 'ascending') {
        tableForm.orderSetting = 'ASC:product_click_in_live_rate'
      } else if (column.order === 'descending') {
        tableForm.orderSetting = 'DESC:product_click_in_live_rate'
      } else {
        tableForm.orderSetting = ''
      }
    } else if (column.prop === 'product_click_to_pay_rate') {
      if (column.order === 'ascending') {
        tableForm.orderSetting = 'ASC:product_click_to_pay_rate'
      } else if (column.order === 'descending') {
        tableForm.orderSetting = 'DESC:product_click_to_pay_rate'
      } else {
        tableForm.orderSetting = ''
      }
    } else if (column.prop === 'prod_show_to_pay_ucnt_rate_in_live') {
      if (column.order === 'ascending') {
        tableForm.orderSetting = 'ASC:prod_show_to_pay_ucnt_rate_in_live'
      } else if (column.order === 'descending') {
        tableForm.orderSetting = 'DESC:prod_show_to_pay_ucnt_rate_in_live'
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
