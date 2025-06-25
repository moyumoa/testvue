import { getRoomListDiscountReport } from '@/api/content_center/discount_report.js'
import { getQuery } from '@/utils/get_query.js'
import { getLastMonthDate } from '@/utils/tools.js'
import api from '@/api/content_center/content_matrix.js'

export function pageList(props) {
  // 筛选条件
  const searchComponents = ref([
    {
      type: 'dateRange', // 组件类型
      label: '开播时间', // label展示
      val: props.type === 'dialog' ? null : getLastMonthDate(), // 响应式绑定
      isDisEdit: true, // 是否禁用文本框输入
      placeholder: ['开始时间', '结束时间'],
      filed: 'dateRange' // 查询字段名
    }
  ])
  if (props.type !== 'dialog') {
    searchComponents.value.unshift({
      type: 'select',
      label: '矩阵号',
      val: null,
      placeholder: '请选择矩阵号',
      multiple: true,
      filterable: true,
      remote: true,
      remoteMethod: getMatrixList(),
      selects: [],
      filed: 'xuserIds'
    })
  }
  const chooseTab = ref('live_start_time')

  // 表格的查询条件
  const tableForm = reactive({
    loading: false,
    total: null,
    totalAvgDiscount: null,
    listData: [],
    page: {
      index: 1,
      size: 10,
      total: 0
    }
  })
  // 获取信息
  function getList() {
    const data = getQuery(searchComponents.value, ['minLiveStartTime', 'maxLiveStartTime'])
    data.pageNo = tableForm.page.index
    data.pageSize = tableForm.page.size
    data.orderSetting = 'DESC:' + chooseTab.value
    if (props.accountId) {
      data.xuserIds = [props.accountId]
    }
    tableForm.loading = true
    getRoomListDiscountReport(data)
      .then(res => {
        if (res.code === 0) {
          tableForm.listData = res.data.records || []
          if (res.data.records.length) {
            tableForm.totalAvgDiscount = res.data.records[0].totalAvgDiscount
          }
          tableForm.total = res.data.total
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

  // 获取矩阵号列表
  function getMatrixList(value) {
    api
      .getMatrixList({
        dyNickName: value || '',
        orderBy: 2,
        orderItem: 'amount',
        pageNo: 1,
        pageSize: 10
      })
      .then(res => {
        searchComponents.value.forEach(item => {
          if (item.label === '矩阵号') {
            item.selects = res.data.records.map(e => {
              return {
                label: e.dyNickname,
                value: e.xuserId
              }
            })
          }
        })
      })
  }

  // 查询
  function searchList() {
    tableForm.loading = true
    tableForm.page.index = 1
    getList()
  }
  // 重置
  function resetSearch() {
    tableForm.loading = true
    tableForm.page.index = 1
    tableForm.page.size = 10
    getList()
  }

  // 跳转详情页
  const toDetail = roomId => {
    return `/content_center/live_center/detail?roomId=${roomId}`
  }
  const toUserDetail = openId => {
    return `/content_center/content_matrix/details?openId=${openId}`
  }
  return {
    searchComponents,
    tableForm,
    getList,
    // exportFun,
    searchList,
    resetSearch,
    toDetail,
    toUserDetail,
    getMatrixList
  }
}
