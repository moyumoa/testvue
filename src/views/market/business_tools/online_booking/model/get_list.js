import { getListAppointmentByPage } from '@/api/market/business_tools.js'
import { getQuery } from '@/utils/get_query.js'

export function pageList() {
  // 筛选条件
  const searchComponents = ref([
    {
      type: 'input',
      label: '活动标题',
      val: '',
      placeholder: '请输入活动标题',
      filed: 'activityTitle'
    },

    {
      type: 'select',
      label: '活动状态',
      placeholder: '',
      val: -1,
      filed: 'status',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '未开启',
          value: 0
        },
        {
          label: '进行中',
          value: 1
        }
      ]
    },
    {
      type: 'dateRange',
      label: '创建时间', // label展示
      val: '', // 响应式绑定
      disabledDate(time) {
        return time.getTime() > Date.now()
      }, // 禁用日期
      isDisEdit: true, // 是否禁用文本框输入
      placeholder: ['开始时间', '结束时间'],
      filed: 'dateRange' // 查询字段名
    }
  ])
  // 表格的查询条件
  const tableForm = reactive({
    loading: false,
    listData: [],
    pageIndex: 1,
    page: {
      index: 1,
      size: 10,
      sizes: [10, 20, 50],
      total: 0
    }
  })
  // 获取品牌id
  let brandInfo = localStorage.getItem('brandInfo')
  brandInfo = brandInfo ? JSON.parse(brandInfo) : {}
  // 获取任务列表
  function getActivityList() {
    tableForm.loading = true
    const data = getQuery(searchComponents.value)
    const params = {
      brandId: brandInfo.brandId || null,
      status: data.status,
      createTimeBegin: data.liveStartTimeFrom,
      createTimeEnd: data.liveStartTimeTo,
      activityTitle: data.activityTitle,
      pageNo: tableForm.page.index,
      pageSize: tableForm.page.size
    }
    console.log(params)
    getListAppointmentByPage(params)
      .then(res => {
        if (res.code === 0) {
          tableForm.listData = transformStatus(res.data.records) || []
          console.log(tableForm.listData)
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
  // 确定对应活动的活动状态
  function transformStatus(res) {
    const listData = res.map(function (item) {
      switch (item.status) {
        case 0:
          item.statusName = '未开启'
          break
        case 1:
          item.statusName = '进行中'
          break
        default:
          item.statusName = '已结束'
      }
      return item
    }, this)
    return listData
  }
  const dialog = ref(false)
  return {
    searchComponents,
    tableForm,
    dialog,
    getActivityList
  }
}
