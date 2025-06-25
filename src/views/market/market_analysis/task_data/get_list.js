import { reactive } from 'vue'
import { getTaskDataList, exportTaskData } from '@/api/market/operate_analysis.js'
import { getQuery } from '@/utils/get_query.js'
import { exportFileV2 } from '@/utils/exportFile'
import { TASK_STATUS } from '@/utils/dictionary/task'

export function handleGetList(vm) {
  // const organizations = ref([])
  // function organizationInfo() {
  //   getOrganization({}).then(res => {
  //     if (res.code === 0) {
  //       organizations.value = res.data
  //     }
  //   })
  // }
  const searchComponents = ref([
    {
      type: 'input',
      label: '任务标题',
      val: '',
      filed: 'taskName'
    },
    {
      type: 'select',
      label: '任务状态',
      val: '',
      placeholder: '请选择任务状态',
      filed: 'taskStatus',
      selects: []
    },
    {
      type: 'select',
      label: '任务类型',
      val: '',
      placeholder: '请选择任务类型',
      filed: 'taskType',
      selects: [
        {
          label: '视频任务',
          value: 1
        },
        {
          label: '直播任务',
          value: 2
        },
        {
          label: '征集任务',
          value: 3
        },
        {
          label: '学习任务',
          value: 5
        }
      ]
    },
    {
      type: 'dateRange', // 组件类型
      label: '创建时间', // label展示
      val: '', // 响应式绑定
      placeholder: ['开始时间', '结束时间'],
      startTimeVal: 'startTime',
      endTimeVal: 'endTime',
      filed: 'dateRange' // 查询字段名
    },
    {
      type: 'dateRange', // 组件类型
      label: '开始时间', // label展示
      val: '', // 响应式绑定
      placeholder: ['开始时间', '结束时间'],
      startTimeVal: 'taskStartTime',
      endTimeVal: 'taskEndTime',
      filed: 'dateRange' // 查询字段名
    },
    {
      type: 'input',
      label: '创建人',
      val: '',
      filed: 'taskCreateUserName'
    }
  ])
  searchComponents.value.forEach(item => {
    if (item.filed === 'taskStatus') {
      item.selects = TASK_STATUS.dictionaries.map(e => {
        return {
          label: e.cn,
          value: e.value
        }
      })
      item.selects.unshift({
        label: '全部',
        value: -1
      })
    }
  })
  const tableForm = reactive({
    loading: false,
    listData: [],
    page: {
      index: 1,
      size: 10,
      total: 10
    }
  })
  // const sortInfo = reactive({
  //   target: '',
  //   orderBy: 0
  // })
  function getList() {
    tableForm.loading = true
    const searchForm = {
      pageNum: tableForm.page.index,
      pageSize: tableForm.page.size
    }
    searchForm.condition = getQuery(searchComponents.value)
    getTaskDataList(searchForm)
      .then(res => {
        if (res.code === 0) {
          tableForm.listData = res.data.records
          tableForm.page.total = res.data.total
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
  // function handleSortChange(val) {
  //   sortInfo.target = val.prop || ''
  //   if (val.order === 'ascending') {
  //     sortInfo.orderBy = 1
  //   } else if (val.order === 'descending') {
  //     sortInfo.orderBy = 0
  //   } else {
  //     sortInfo.orderBy = 0
  //   }
  //   getList()
  // }
  function querySearch() {
    tableForm.page.index = 1
    getList()
  }
  function resetSearch() {
    tableForm.page.index = 1
    tableForm.page.size = 10
    getList()
  }
  function exportData() {
    const searchForm = getQuery(searchComponents.value, ['startTime', 'endTime'])
    exportFileV2(exportTaskData, searchForm, '任务数据', 'xlsx')
    if (vm) {
      vm.appContext.config.globalProperties.$tracking.clickBtn(115)
    }
  }
  getList()
  return {
    tableForm,
    searchComponents,
    // sortInfo,
    getList,
    querySearch,
    resetSearch,
    // handleSortChange,
    // organizationInfo,
    exportData
  }
}
