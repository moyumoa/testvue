import { getQuery } from '@/utils/get_query.js'
import { exportFile, exportFileV2 } from '@/utils/exportFile'
import {
  customExportExcel,
  getCustomList,
  customExportExcelV2,
  userDispatch,
  userBatchDispatch
} from '@/api/scrm/customer.js'
import { ElMessage } from 'element-plus'
import { getUserGroup } from '@/api/market/operate_analysis'
import { throttle } from '@/utils/tools.js'
import { setBusinessChooseParam } from '@/utils/search.js'
export function pageList(vm) {
  // 筛选条件
  const searchComponents1 = ref([
    {
      type: 'select',
      label: '潜客来源',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择潜客来源',
      filed: 'source',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '直播间',
          value: 210
        },
        {
          label: '视频',
          value: 110
        },
        {
          label: '私信',
          value: 112
        }
      ]
    },
    {
      type: 'select',
      label: '来源平台',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择来源平台',
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
          label: '小红书',
          value: 3
        }
      ]
    },
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
      type: 'input',
      label: '客户查询',
      val: '',
      placeholder: '请输入客户昵称、手机号',
      filed: 'clientNameOrPhone'
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
      val: null,
      defaultVal: null,
      placeholder: '请选择跟进状态',
      filed: 'clientConsultStage',
      multiple: true,
      filterable: true,
      'collapse-tags': true,
      selects: [
        {
          label: '待跟进-新客户',
          value: 1
        },
        {
          label: '跟进中-初步接触',
          value: 2
        },
        {
          label: '跟进中-有意向',
          value: 3
        },
        {
          label: '跟进中-已到店',
          value: 4
        },
        {
          label: '结束跟进-已成交',
          value: 5
        },
        {
          label: '结束跟进-无效',
          value: 7
        }
      ]
    },
    {
      type: 'input',
      label: '归属人',
      val: '',
      placeholder: '请输入归属人',
      filed: 'clientBelongedName'
    },
    {
      startTimeVal: 'startTime',
      endTimeVal: 'endTime',
      type: 'dateRange', // 组件类型
      label: '互动时间', // label展示
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
    },
    {
      type: 'select',
      label: '留资情况',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择留资情况',
      filed: 'clientUserType',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '已留资',
          value: 2
        },
        {
          label: '未留资',
          value: 1
        }
      ]
    },
    {
      showLabelTip: true,
      type: 'select',
      label: '手动录入',
      placeholder: '请选择是否为手动录入',
      val: -1,
      defaultVal: -1,
      filed: 'phoneSource',
      selects: [
        {
          value: -1,
          label: '全部'
        },
        {
          label: '是',
          value: 2
        },
        {
          label: '否',
          value: 1
        }
      ]
    },
    {
      startTimeVal: 'clueStartTime',
      endTimeVal: 'clueEndTime',
      type: 'dateRange', // 组件类型
      label: '留资时间', // label展示
      disabledDate(time) {
        return time.getTime() > Date.now()
      }, // 禁用日期
      defaultVal: [],
      val: [], // 默认 近三十天的数据
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
      filed: 'dateRange1' // 查询字段名
    }
  ])
  // 因为有涉及到KeepAlive，所以就先复制一份，后续可用
  const searchComponents = ref(searchComponents1.value)
  const initSearch = function () {
    const list = setBusinessChooseParam()
    searchComponents.value = searchComponents.value.concat(list)
  }
  initSearch()
  // 获取矩阵号分组
  function getUserGroupList() {
    getUserGroup({
      groupName: ''
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
    const data = getQuery(searchComponents.value)
    console.log('data', data)

    data.pageNo = tableForm.page.index
    data.pageSize = tableForm.page.size

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
        nextTick(() => {
          if (isAllBatch.value) {
            setCheck(true)
          }
        })
        tableForm.loading = false
      })
      .catch(() => {
        tableForm.loading = false
      })
  }
  function exportErrfun() {
    return new Promise((resolve, reject) => {
      ElMessage.warning('仅支持导出互动时间为31天范围内数据，请调整时间后再提交导出')
      reject(new Error('仅支持导出互动时间为31天范围内数据，请调整时间后再提交导出'))
    })
  }
  // 导出
  const exportFunV2 = () => {
    // 导出限制互动时间的范围是31天。
    const time = toRaw(searchComponents.value.find(item => item.filed === 'dateRange').val)
    console.log('导出', time)
    if (!time) {
      return exportErrfun()
    }

    const range = time[1].getTime() - time[0].getTime()
    if (range > 30 * 24 * 60 * 60 * 1000) {
      return exportErrfun()
    }
    const data = getQuery(searchComponents.value)

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
  const dispatchLoading = ref(false)
  const cusDispatchQuery = reactive({})
  const showAll = ref(false)
  // 用户分配
  function cusDispatch() {
    userDispatch(cusDispatchQuery)
      .then(res => {
        console.log('分配res', res)
        if (res.code === 0) {
          ElMessage.success('操作成功')
          showAll.value = false
          getList()
        }
        dispatchLoading.value = false
      })
      .catch(() => {
        dispatchLoading.value = false
      })
  }

  // 批量操作相关
  const tableRef = ref()
  const isAllBatch = ref(false) // 是否全选
  const chooseList = ref([]) // 选中的用户
  const batchAllocationInfo = reactive({
    loading: false,
    isBatch: false,
    batchCount: null
  })
  // 设置选中状态--
  // 用于多选表格，切换某一行的选中状态， 如果使用了第二个参数，则可直接设置这一行选中与否--
  function setCheck(check) {
    tableForm.listData.forEach(y => {
      if (y.isValid === 0) {
        tableRef.value?.$refs.table.toggleRowSelection(y, check)
      }
    })
  }
  // 查询和重置的时候，都把选中项清空掉
  function clearTableChoose() {
    isAllBatch.value = false
    chooseList.value = []
    batchAllocationInfo.batchCount = null
    batchAllocationInfo.loading = false
    // 清除表格所有的选中项
    tableRef.value?.$refs.table.clearSelection()
  }
  // 显示批量分配
  const showAllocationFun = throttle(() => {
    batchAllocationInfo.loading = true
    // 全选的话，就去请求接口获取可分配数量
    if (isAllBatch.value) {
      const query = getQuery(searchComponents.value)
      if (!query.clientBelongedValid) {
        query.clientBelongedValid = 0
        query.pageNo = 1
        query.pageSize = 10
        getCustomList(query)
          .then(res => {
            if (res.code === 0) {
              if (res.data.total) {
                batchAllocationInfo.batchCount = res.data.total
                batchAllocationInfo.isBatch = true
                showAll.value = true
              } else {
                ElMessage.warning('请选择需要分配的客户')
              }
            }
            batchAllocationInfo.loading = false
          })
          .catch(() => {
            batchAllocationInfo.loading = false
          })
      } else {
        batchAllocationInfo.loading = false
        ElMessage.warning('请选择需要分配的客户')
      }
      return
    }
    // 非全选，就看是否手动选中了几个
    if (chooseList.value && chooseList.value.length > 0) {
      // 获取可分配的数量
      batchAllocationInfo.batchCount = chooseList.value.length
      batchAllocationInfo.isBatch = true
      showAll.value = true
      batchAllocationInfo.loading = false
    } else {
      batchAllocationInfo.loading = false
      ElMessage.warning('请选择需要分配的客户')
    }
  }, 500)

  // 批量分配
  function cusBatchDispatch(val) {
    const param = { targetUserId: val }
    if (isAllBatch.value) {
      const query = getQuery(searchComponents.value)

      param.clients = []
      param.condition = query
      param.isAll = true
    } else {
      const clients = []
      chooseList.value.forEach(x => {
        clients.push({
          clientId: x.clientId,
          clientUserBindId: x.clientUserBindId,
          targetUserId: val
        })
      })
      param.clients = clients
      param.condition = {}
      param.isAll = false
    }
    userBatchDispatch(param)
      .then(res => {
        if (res.code === 0) {
          ElMessage.success(res.data === 0 ? '批量分配成功' : '部分客户分配失败')
          showAll.value = false
          clearTableChoose()
          getList()
        }
        dispatchLoading.value = false
      })
      .catch(() => {
        dispatchLoading.value = false
      })
  }

  return {
    searchComponents,
    searchComponents1,
    tableForm,
    getList,
    exportFun,
    exportFunV2,
    showAll,
    dispatchLoading,
    cusDispatchQuery,
    cusDispatch,
    tableRef,
    setCheck,
    clearTableChoose,
    isAllBatch,
    chooseList,
    batchAllocationInfo,
    showAllocationFun,
    cusBatchDispatch,
    getUserGroupList
  }
}
