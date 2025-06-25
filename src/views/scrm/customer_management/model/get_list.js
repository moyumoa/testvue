import { getQuery } from '@/utils/get_query.js'
import { dateFormat, isEmpty } from '@/utils/tools.js'
import { exportFile, exportFileV2 } from '@/utils/exportFile'
import {
  customExportExcel,
  getCustomList,
  customExportExcelV2,
  userDispatch
} from '@/api/scrm/customer.js'
import { ElMessage } from 'element-plus'
import { getUserGroup } from '@/api/market/operate_analysis'

export function pageList(vm) {
  // 筛选条件
  const searchComponents = ref([
    // {
    //   type: 'select',
    //   label: '留资来源',
    //   val: -1,
    //   defaultVal: -1,
    //   placeholder: '请选择',
    //   filed: 'clientSource',
    //   selects: [
    //     {
    //       label: '全部',
    //       value: -1
    //     },
    //     {
    //       label: '直播间',
    //       value: 312
    //     },
    //     {
    //       label: '视频',
    //       value: 311
    //     },
    //     {
    //       label: '主页',
    //       value: 310
    //     },
    //     {
    //       label: '私信',
    //       value: 313
    //     }
    //   ]
    // },
    {
      type: 'input',
      label: '来源矩阵号',
      val: '',
      placeholder: '请输入矩阵号昵称',
      filed: 'xuserName'
    },
    // {
    //   type: 'select',
    //   label: '客户关系',
    //   val: -1,
    //   defaultVal: -1,
    //   placeholder: '请选择',
    //   filed: 'clientRelate',
    //   selects: [
    //     {
    //       label: '全部',
    //       value: -1
    //     },
    //     {
    //       label: '粉丝',
    //       value: 1
    //     },
    //     {
    //       label: '非粉丝',
    //       value: 0
    //     }
    //   ]
    // },
    {
      type: 'select',
      label: '矩阵号分组',
      val: null,
      filed: 'groupIds',
      multiple: true,
      filterable: true,
      'collapse-tags': true,
      'collapse-tags-tooltip': true,
      selects: []
    },
    {
      type: 'chooseDept',
      label: '矩阵号部门',
      val: [],
      filed: 'orgIds',
      multiple: true,
      isUsePermission: true
    },
    {
      type: 'select',
      label: '分配状态',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择分配状态',
      filed: 'clientBelongedValid',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '已分配',
          value: 1
        },
        {
          label: '待分配',
          value: 0
        }
      ]
    },
    {
      type: 'select',
      label: '跟进状态',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择跟进状态',
      filed: 'clientConsultStatus',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '待跟进',
          value: 1
        },
        {
          label: '跟进中',
          value: 2
        },
        {
          label: '结束跟进',
          value: 3
        }
      ]
    },
    {
      type: 'input',
      label: '客户查询',
      val: '',
      placeholder: '请输入客户昵称、手机号',
      filed: 'clientNameOrPhone'
    },
    {
      type: 'input',
      label: '归属人',
      val: '',
      placeholder: '请输入归属人',
      filed: 'clientBelongedName'
    },
    {
      type: 'dateRange', // 组件类型
      label: '留资时间', // label展示
      disabledDate(time) {
        return time.getTime() > Date.now()
      }, // 禁用日期
      defaultVal: [new Date(Date.now() - 3600 * 1000 * 24 * 30), new Date()],
      val: [new Date(Date.now() - 3600 * 1000 * 24 * 30), new Date()], // 默认 近三十天的数据
      placeholder: ['开始时间', '结束时间'],
      isDisEdit: true,
      shortcuts: [
        {
          text: '最近一周',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 6)
            return [start, end]
          }
        },
        {
          text: '最近一个月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            return [start, end]
          }
        },
        {
          text: '最近三个月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            return [start, end]
          }
        }
      ],
      filed: 'dateRange' // 查询字段名
    }
  ])

  // 获取矩阵号分组
  function getUserGroupList(value) {
    getUserGroup({
      groupName: value
    }).then(res => {
      searchComponents.value.forEach(item => {
        if (item.label === '矩阵号分组') {
          item.selects = res.data.map(e => {
            return {
              label: e.groupName,
              value: e.id
            }
          })
        }
      })
    })
  }

  // 表格的查询条件
  const tableForm = reactive({
    loading: false,
    listData: [],
    page: {
      index: 1,
      size: 10,
      total: 0
    }
  })

  // 查询
  function getList() {
    const data = getQuery(searchComponents.value, ['clueStartTime', 'clueEndTime'])
    if (!isEmpty(data.timeRange)) {
      const timeRange = getSeconds(data.timeRange)
      // 开始结尾时间段
      data.lastInteractionTimeMin = timeRange[1]
      data.lastInteractionTimeMax = timeRange[0]
    }
    data.pageNo = tableForm.page.index
    data.pageSize = tableForm.page.size
    // clientUserType类型 潜客管理填1  留资客户填2
    data.clientUserType = 2
    getCustomList(data)
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

  // 查询
  function searchList() {
    tableForm.loading = true
    tableForm.page.index = 1
    getList()
  }

  // 导出
  const exportFunV2 = () => {
    const data = getQuery(searchComponents.value, ['clueStartTime', 'clueEndTime'])
    if (!isEmpty(data.timeRange)) {
      const timeRange = getSeconds(data.timeRange)
      // 开始结尾时间段
      data.lastInteractionTimeMin = timeRange[1]
      data.lastInteractionTimeMax = timeRange[0]
    }
    // clientUserType类型 潜客管理填1  留资客户填2
    data.clientUserType = 2
    if (vm) {
      vm.appContext.config.globalProperties.$tracking.clickBtn(118)
    }
    return exportFileV2(customExportExcelV2, data, '客户信息', 'xlsx')
  }
  const exportFun = () => {
    const data = getQuery(searchComponents.value)
    if (vm) {
      vm.appContext.config.globalProperties.$tracking.clickBtn(118)
    }
    return exportFile(customExportExcel, data, '客户信息', 'xlsx')
  }
  // 分配入参
  const cusDispatchQuery = reactive({})
  const showAll = ref(false)
  // 用户分配
  function cusDispatch() {
    userDispatch(cusDispatchQuery).then(res => {
      console.log('分配res', res)
      if (res.code === 0) {
        ElMessage.success('操作成功')
        showAll.value = false
        getList()
      }
    })
  }

  return {
    searchComponents,
    tableForm,
    getList,
    exportFun,
    exportFunV2,
    searchList,
    showAll,
    cusDispatchQuery,
    cusDispatch,
    getUserGroupList
  }
}

/**
 * 获取距离当前时间分钟间隔时间段
 * @param jam 间隔分钟
 * @return {string[]} [开始时间，结束时间]
 */
function getSeconds(jam) {
  const start = new Date()
  const end = new Date(start.getTime() - jam * 60 * 1000)
  return [dateFormat(start, 'YYYY-MM-DD hh:mm:ss'), dateFormat(end, 'YYYY-MM-DD hh:mm:ss')]
}
