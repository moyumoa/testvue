/**
 * 直播详情-电商分析-订单详情
 */
import {
  listRetentionVideoOrder, // 线索明细列表
  listDoudianVideoOrder // 抖店订单
} from '@/api/content_center/content_manage.js'

import { throttle } from '@/utils/tools.js'

import { reactive } from 'vue'

export function pageList({ brandId, itemId, platform }) {
  const chooseRule = ref('store')
  const ruleList = ref([
    // {
    //   name: 'store',
    //   label: '抖店订单'
    // }
    // ,
    // {
    //   name: 'retention',
    //   label: '线索明细'
    // }
  ])
  //  表格的查询条件
  const tableForm = reactive({
    loading: false,
    listData: [],
    page: {
      index: 1,
      size: 10,
      total: 0
    }
  })
  const changeRule = throttle(e => {
    if (chooseRule.value !== e) {
      chooseRule.value = e
      resetList()
    }
  }, 300)
  function getList(obj) {
    if (chooseRule.value === 'store') {
      getOrderList()
    } else {
      getRetainedList()
    }
  }
  const statusList = reactive(
    new Map([
      [0, { label: '--', class: '' }],
      [1, { label: '待支付', class: 'red_circle' }],
      [105, { label: '备货中', class: '' }],
      [2, { label: '备货中', class: '' }],
      [3, { label: '已发货', class: '' }],
      [5, { label: '已完成', class: 'green_circle' }],
      [4, { label: '已取消', class: '' }]
    ])
  )
  function getOrderList() {
    listDoudianVideoOrder({
      brandId: brandId,
      itemId: itemId,
      orderSetting: '',
      pageNo: tableForm.page.index,
      pageSize: tableForm.page.size,
      platform: platform,
      searchCount: true
    })
      .then(res => {
        if (res.code === 0 && res.data) {
          const list = res.data.records || []
          list.forEach(x => {
            x.showPhone = false
          })
          tableForm.listData = list
          tableForm.page.total = res.data.total || 0
        } else {
          tableForm.listData = []
          tableForm.page.total = 0
        }

        tableForm.loading = false
      })
      .catch(() => {
        tableForm.listData = []
        tableForm.page.total = 0
        tableForm.loading = false
      })
  }
  function getRetainedList() {
    listRetentionVideoOrder({
      brandId: brandId,
      itemId: itemId,
      orderSetting: '',
      pageNo: tableForm.page.index,
      pageSize: tableForm.page.size,
      platform: platform,
      searchCount: true
    })
      .then(res => {
        if (res.code === 0 && res.data) {
          const list = res.data.records || []
          list.forEach(x => {
            x.showPhone = false
          })
          tableForm.listData = list
          tableForm.page.total = res.data.total || 0
        } else {
          tableForm.listData = []
          tableForm.page.total = 0
        }

        tableForm.loading = false
      })
      .catch(() => {
        tableForm.listData = []
        tableForm.page.total = 0
        tableForm.loading = false
      })
  }
  function resetList() {
    tableForm.loading = true
    // tableForm.listData = []
    tableForm.page = {
      index: 1,
      size: 10,
      total: 10
    }
    getList()
  }

  return { chooseRule, ruleList, tableForm, changeRule, getList, resetList, statusList }
}
