import { getQuery } from '@/utils/get_query.js'
import {
  accountListQuery,
  dailyOperationReport,
  dailyOperationReportExportExcel,
  dailyOperationReportSummary
} from '@/api/content_center/operate_report.js'
import { setBusinessChooseParam } from '@/utils/search.js'

import { exportFileV2 } from '@/utils/exportFile.js'
import api from '@/api/content_center/content_matrix'
import Track from '@/utils/tracking/index.js'

export function handleGetList() {
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

  const time = initTime()
  const defaultTime = ref([time.startTime, time.endTime])
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
    // {
    //   type: 'select',
    //   label: '矩阵号',
    //   val: [],
    //   filed: 'xuserIds',
    //   multiple: true,
    //   filterable: true,
    //   placeholder: '请选择矩阵号',
    //   'collapse-tags': true,
    //   selects: selects.value
    // }
    {
      type: 'chooseDept',
      label: '矩阵号部门',
      val: [],
      filed: 'areaIds',
      multiple: true,
      isUsePermission: true
    },
    // {
    //   type: 'select',
    //   label: '矩阵号',
    //   val: [],
    //   filed: 'xuserIds',
    //   multiple: true,
    //   filterable: true,
    //   placeholder: '请选择矩阵号',
    //   'collapse-tags': true,
    //   selects: selects.value
    // {
    //   type: 'input',
    //   label: '矩阵号昵称',
    //   val: '',
    //   filed: 'dyName'
    // },
    {
      type: 'select',
      label: '矩阵号分组',
      placeholder: '请选择矩阵号分组',
      filed: 'groupIds',
      multiple: true,
      filterable: true,
      'collapse-tags': true,
      val: null,
      selects: [],
      selectDefultName: ['id', 'groupName']
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
    summaryData: {}
  })
  const chooseRule = ref('1')
  // const message = inject('$message')

  function initTime() {
    const nowTime = new Date()
    const oldTime = new Date()
    nowTime.setTime(nowTime - 24 * 60 * 60 * 1000)
    oldTime.setTime(nowTime - 6 * 24 * 60 * 60 * 1000)
    return { startTime: oldTime, endTime: nowTime }
  }

  // function rangeTimeChange(e) {
  //   const time = toRaw(e)
  //   const range = time[1].getTime() - time[0].getTime()
  //   if (range > 6 * 24 * 60 * 60 * 1000) {
  //     message.warning('时间跨度超过7天，请导出报表查看')
  //   }
  // }

  function getList() {
    tableForm.loading = true
    const info = getQuery(searchComponents.value, ['startTime', 'endTime'], false)
    // info.brandId = JSON.parse(localStorage.getItem('brandInfo')).brandId
    info.reportType = chooseRule.value
    info.useOperation = 0
    info.pageNo = tableForm.page.index
    info.pageSize = tableForm.page.size
    info.isValid = 1
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
    info.useOperation = 0
    info.pageNo = tableForm.page.index
    info.pageSize = tableForm.page.size
    info.isValid = 1

    dailyOperationReportSummary(info).then(res => {
      if (res.code === 0) {
        tableForm.summaryData = res.data
      }
    })
  }

  function resetSearch() {
    tableForm.page.index = 1
    tableForm.page.size = 10
    const range = initTime()
    defaultTime.value = [range.startTime, range.endTime]
    getList()
    getSummary()
  }

  // const fullscreenLoading = ref(false)
  const dialogVisible = ref(false)
  const exportMessage = ref('')
  const url = ref('')

  // const isWeChat = ref(true)
  // isWeChat.value = localStorage.getItem('isWeChat') === '1'
  function exportReport() {
    // fullscreenLoading.value = true
    // $tracking
    Track.clickBtn(111)
    const info = getQuery(searchComponents.value, ['startTime', 'endTime'], false)
    info.reportType = chooseRule.value
    info.useOperation = 0
    info.isValid = 1
    return exportFileV2(dailyOperationReportExportExcel, info, '汇总报表', 'xlsx')
    // if (!isWeChat.value) {
    //   dailyOperationReportExport(info)
    //     .then(res => {
    //       fullscreenLoading.value = false
    //       if (res.code === 0) {
    //         dialogVisible.value = true
    //         url.value = res.data
    //         exportMessage.value = '导出成功，点击查看按钮'
    //       }
    //     })
    //     .catch(res => {
    //       fullscreenLoading.value = false
    //     })
    // } else {
    //
    // exportFile(dailyOperationReportExportExcel, info, '汇总报表', 'xlsx')
    //   .then(() => {
    //     fullscreenLoading.value = false
    //   })
    //   .catch(() => {
    //     fullscreenLoading.value = false
    //   })
    // }
    // if (vm) {
    //   vm.appContext.config.globalProperties.$tracking.clickBtn(110)
    // }
  }

  function confirmClick() {
    window.open(url.value, '_blank')
  }

  return {
    searchComponents,
    tableForm,
    chooseRule,
    // fullscreenLoading,
    dialogVisible,
    exportMessage,
    resetSearch,
    // rangeTimeChange,
    initTime,
    exportReport,
    confirmClick,
    getList,
    getSummary,
    getAccountList
  }
}
