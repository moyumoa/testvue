/**
 * 获取直播中心列表数据
 */
import { reactive } from 'vue'
import { getViolationKeyWordList } from '@/api/content_center/live_violation.js'
import { getQuery } from '@/utils/get_query.js'
export function pageList() {
  // 筛选条件
  const searchComponents = ref([
    {
      type: 'input',
      label: '关键词',
      val: '',
      placeholder: '请输入关键词',
      filed: 'keyWords'
    },
    {
      type: 'dateRange', // 组件类型
      label: '违规时间', // label展示
      val: '', // 响应式绑定
      defaultVal: '',
      disabledDate(time) {
        return (
          time.getTime() > Date.now() ||
          time.getTime() <= new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        )
      }, // 禁用日期
      defaultTime: [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)],
      isDisEdit: true, // 是否禁用文本框输入
      clearable: true,
      placeholder: ['开始时间', '结束时间'],
      filed: 'dateRange' // 查询字段名
    }
  ])
  const nowTime = new Date()
  const oldTime = new Date()
  oldTime.setTime(nowTime - 29 * 24 * 60 * 60 * 1000)
  nowTime.setHours(23, 59, 59)
  oldTime.setHours(0, 0, 0)
  searchComponents.value[1].val = [oldTime, nowTime]
  searchComponents.value[1].defaultVal = [oldTime, nowTime]
  // 表格的查询条件
  const tableForm = reactive({
    loading: false,
    listData: [],
    orderBy: 2,
    page: {
      index: 1,
      size: 10,
      total: 0
    }
  })

  function getList() {
    const data = getQuery(searchComponents.value, ['startTime', 'endTime'])
    data.orderBy = tableForm.orderBy
    data.searchCount = true
    data.orderSetting = ''
    data.pageNo = tableForm.page.index
    data.pageSize = tableForm.page.size
    getViolationKeyWordList(data)
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

  return { searchComponents, tableForm, getList }
}
