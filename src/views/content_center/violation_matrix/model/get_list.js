/**
 * 获取直播中心列表数据
 */
import { reactive } from 'vue'
import { getViolationList, getViolationNickNameList } from '@/api/content_center/live_violation.js'
import { getQuery } from '@/utils/get_query.js'
import { setBusinessChooseParam } from '@/utils/search.js'

export function pageList() {
  // 筛选条件
  const searchComponents = ref([
    {
      type: 'select',
      label: '矩阵号名称',
      val: '',
      multiple: true,
      filterable: true,
      placeholder: '请输入矩阵号名称',
      filed: 'nicknameList',
      'collapse-tags': true,
      selectDefultName: ['xuserId', 'matrixNickname'],
      selects: []
    },
    {
      type: 'input',
      label: '抖音号',
      val: '',
      placeholder: '请输入抖音号',
      filed: 'dyDisplayId'
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
      filed: 'datetimerange' // 查询字段名
    },
    {
      shrink: true, // 是否支持将筛选项折叠
      type: 'chooseDept',
      label: '部门',
      val: [],
      filed: 'areaIds',
      multiple: true,
      isUsePermission: true
    }
  ])

  const nowTime = new Date()
  const oldTime = new Date()
  oldTime.setTime(nowTime - 29 * 24 * 60 * 60 * 1000)
  nowTime.setHours(23, 59, 59)
  oldTime.setHours(0, 0, 0)
  searchComponents.value[2].val = [oldTime, nowTime]
  searchComponents.value[2].defaultVal = [oldTime, nowTime]
  // 表格的查询条件
  const tableForm = reactive({
    loading: false,
    listData: [],
    orderItem: 'violationNum',
    orderBy: 2,
    page: {
      index: 1,
      size: 10,
      total: 0
    }
  })
  // 获取矩阵号名称列表
  function getUserList() {
    getViolationNickNameList().then(res => {
      if (res.code === 0) {
        searchComponents.value[0].selects = res.data || []
      }
    })
  }
  getUserList()
  function getList() {
    const data = getQuery(searchComponents.value, ['startTime', 'endTime'])
    data.searchCount = true
    data.orderSetting = ''
    data.orderItem = tableForm.orderItem || ''
    data.orderBy = tableForm.orderBy || null
    data.pageNo = tableForm.page.index
    data.pageSize = tableForm.page.size
    getViolationList(data)
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

  // 更新业务主体筛选项
  const initSearch = function () {
    const list = setBusinessChooseParam()
    searchComponents.value = searchComponents.value.concat(list)
  }
  initSearch()
  return { searchComponents, tableForm, getList }
}
