import { getQuery } from '@/utils/get_query.js'
import {
  accountListQuery,
  dailyOperationReport,
  // dailyOperationReportExport,
  dailyOperationReportExportExcel,
  dailyOperationReportSummary
} from '@/api/content_center/operate_report.js'
import { exportFileV2 } from '@/utils/exportFile.js'
import api from '@/api/content_center/content_matrix'
import Track from '@/utils/tracking/index.js'
import { setBusinessChooseParam } from '@/utils/search.js'

export function handleGetList(groupId, showEmployeeId) {
  const selects = ref([])
  function getAccountList() {
    accountListQuery({}).then(res => {
      if (res.code === 0) {
        if (res.data && res.data.length) {
          res.data.forEach(item => {
            selects.value.push({
              label: item.dyNickname,
              value: item.xuserId
            })
          })
        }
      }
    })
  }
  // const time = initTime()
  // const defaultTime = ref([time.startTime, time.endTime])
  const defaultTime = ref([])
  const xuserIds = ref([])
  const jiagou = ref([])
  const jiagouFullIds = ref([])
  const searchComponents = ref([
    {
      type: 'dateRange',
      label: '时间范围',
      val: defaultTime,
      disabledDate: time => {
        return time.getTime() > Date.now() - 24 * 60 * 60 * 1000
      },
      filed: 'employeeName',
      placeholder: ['开始时间', '结束时间'],
      clearable: 'false'
    },
    {
      type: 'chooseDept',
      label: '矩阵号部门',
      val: jiagou,
      defaultValue: jiagouFullIds,
      filed: 'areaIds',
      multiple: true,
      isUsePermission: true
    },
    // {
    //   type: 'select',
    //   label: '矩阵号',
    //   val: xuserIds,
    //   filed: 'xuserIds',
    //   multiple: true,
    //   filterable: true,
    //   placeholder: '请选择矩阵号',
    //   'collapse-tags': true,
    //   selects: selects
    // }
    {
      type: 'input',
      label: '矩阵号昵称',
      val: '',
      filed: 'dyName'
    },
    {
      type: 'select',
      label: '矩阵号分组',
      placeholder: '请选择矩阵号分组',
      filed: 'groupIds',
      multiple: true,
      filterable: true,
      'collapse-tags': true,
      defaultVal: groupId ? [groupId] : undefined,
      val: groupId ? [groupId] : null,
      selects: [],
      selectDefultName: ['id', 'groupName']
    },
    {
      hiddenItem: !showEmployeeId,
      type: 'input',
      label: '员工ID',
      val: '',
      placeholder: '请输入员工ID',
      filed: 'thirdPartyStaffId'
    },
    {
      type: 'select',
      label: '所属平台',
      placeholder: '请选择所属平台',
      val: -1,
      defaultVal: -1,
      filed: 'platform',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '抖音',
          value: 1
        },
        {
          label: '视频号',
          value: 2
        },
        {
          label: '小红书',
          value: 3
        },
        {
          label: '快手',
          value: 4
        }
      ]
    },
    {
      type: 'select',
      label: '授权状态',
      val: -1,
      defaultVal: -1,
      filed: 'auth',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '授权有效',
          value: 1
        },
        {
          label: '授权失效',
          value: 0
        }
      ]
    },
    {
      // todo 活跃信息
      type: 'select',
      label: '活跃状态',
      placeholder: '请选择活跃状态',
      val: null,
      filed: 'activeStatus',
      selects: [
        {
          label: '活跃账号',
          value: 1
        },
        {
          label: '沉默账号',
          value: 2
        },
        {
          label: '潜客活跃',
          value: 3
        }
      ]
    }
  ])
  // 更新业务主体筛选项
  const initSearch = function () {
    const list = setBusinessChooseParam()
    searchComponents.value = searchComponents.value.concat(list)
  }
  initSearch()

  // 分组
  function getNewGroupList() {
    api.getNewGroupList({}).then(res => {
      if (res.code === 0) {
        searchComponents.value.find(item => item.filed === 'groupIds').selects = res.data || []
        // searchComponents.value[3].selects = res.data || []
      }
    })
  }
  getNewGroupList()
  const tableForm = reactive({
    loading: false,
    listData: [],
    page: {
      index: 1,
      size: 10,
      total: 10
    },
    summaryData: {},
    orderSetting: 'DESC:fansIncrement'
  })
  const chooseRule = ref('1')
  const pageType = ref('1')
  // const message = inject('$message')
  function initTime() {
    const nowTime = new Date()
    const oldTime = new Date()
    nowTime.setTime(nowTime - 24 * 60 * 60 * 1000)
    oldTime.setTime(nowTime - 6 * 24 * 60 * 60 * 1000)
    return { startTime: oldTime, endTime: nowTime }
  }

  function getList() {
    tableForm.loading = true
    const info = getQuery(searchComponents.value, ['startTime', 'endTime'], false)
    // info.brandId = JSON.parse(localStorage.getItem('brandInfo')).brandId

    info.reportType = chooseRule.value
    info.useOperation = 1
    info.pageNo = tableForm.page.index
    info.pageSize = tableForm.page.size
    info.isValid = 1
    info.orderSetting = tableForm.orderSetting
    dailyOperationReport(info)
      .then(res => {
        if (res.code === 0) {
          tableForm.listData = res.data.records || []
          tableForm.page.total = res.data.total
        }
      })
      .finally(() => {
        tableForm.loading = false
      })
  }
  function getSummary() {
    const info = getQuery(searchComponents.value, ['startTime', 'endTime'], false)
    info.reportType = chooseRule.value
    info.useOperation = 1
    info.pageNo = tableForm.page.index
    info.pageSize = tableForm.page.size
    info.isValid = 1
    info.orderSetting = tableForm.orderSetting
    dailyOperationReportSummary(info).then(res => {
      if (res.code === 0) {
        tableForm.summaryData = res.data
      }
    })
  }
  function querySearch() {
    tableForm.page.index = 1
    getList()
    getSummary()
  }
  function resetSearch() {
    tableForm.page.index = 1
    tableForm.page.size = 10
    const range = initTime()
    defaultTime.value = [range.startTime, range.endTime]
    getList()
    getSummary()
  }
  function changeTab() {
    tableForm.page.index = 1
    tableForm.page.size = 10
    getList()
    getSummary()
  }
  function handleChange(params) {
    defaultTime.value = ['2022-01-01', '2022-01-15']
    xuserIds.value = params.xuserIds
  }
  const fullscreenLoading = ref(false)
  const dialogVisible = ref(false)
  const exportMessage = ref('')
  const confirm = ref('')
  const url = ref('')
  function exportReport() {
    Track.clickBtn(111)
    const info = getQuery(searchComponents.value, ['startTime', 'endTime'], false)
    info.reportType = chooseRule.value
    info.useOperation = 1
    info.isValid = 1
    info.orderSetting = tableForm.orderSetting
    return exportFileV2(dailyOperationReportExportExcel, info, '矩阵号报表', 'xlsx')
  }
  function confirmClick(confirm) {
    if (confirm === '关闭') {
      dialogVisible.value = false
    }
    if (confirm === '查看') {
      window.open(url.value, '_blank')
    }
  }
  function init(info) {
    defaultTime.value = [info.startTime, info.endTime]
    getList()
  }
  // 列表排序
  function sortMoney(e) {
    console.log('排序', e.column?.columnKey, e.order)
    if (e.order === 'ascending') {
      tableForm.orderSetting = 'ASC:' + e.column.columnKey
      tableForm.orderBy = 1
    } else if (e.order === 'descending') {
      tableForm.orderSetting = 'DESC:' + e.column.columnKey
    } else {
      tableForm.orderSetting = 'DESC:fansIncrement'
    }
    getList()
  }
  return {
    defaultTime,
    xuserIds,
    jiagou,
    jiagouFullIds,
    searchComponents,
    tableForm,
    chooseRule,
    pageType,
    fullscreenLoading,
    dialogVisible,
    exportMessage,
    confirm,
    querySearch,
    resetSearch,
    initTime,
    changeTab,
    handleChange,
    getList,
    getSummary,
    getAccountList,
    exportReport,
    confirmClick,
    init,
    sortMoney
  }
}
