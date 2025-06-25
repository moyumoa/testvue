import { reactive } from 'vue'
import { getVideoTaskJoinList, exportTaskJoinList } from '@/api/market/task.js'
import { useRoute, useRouter } from 'vue-router'
import { getQuery } from '@/utils/get_query'
import { exportFileV2 } from '@/utils/exportFile'
import api from '@/api/content_center/content_matrix.js'
export default function (taskType, taskName) {
  console.log('taskType', taskType)
  const route = useRoute()
  const router = useRouter()
  // 手机号显示隐藏
  function showTel(index, bool) {
    tableForm.listData[index].showPhone = bool
  }

  // 筛选条件
  const searchComponents = ref([
    {
      type: 'chooseDept',
      label: '组织架构',
      val: [],
      filed: 'orgIds',
      multiple: true,
      isUsePermission: true,
      hiddenItem: !(
        route.query.pageSource !== 'growth' &&
        (route.query.type === '1' || route.query.type === '6')
      )
    },
    {
      type: 'select',
      label: '参与任务矩阵号分组',
      placeholder: '请选择矩阵号分组',
      filed: 'groupIds',
      multiple: true,
      filterable: true,
      'collapse-tags': true,
      val: null,
      selects: [],
      selectDefultName: ['id', 'groupName']
    },
    {
      type: 'input',
      label: '成员姓名',
      val: '',
      placeholder: '请输入成员姓名',
      filed: 'employeeName'
    },
    {
      type: 'input',
      label: '手机号',
      val: '',
      placeholder: '请输入手机号',
      filed: 'employeePhoneNum'
    },
    // {
    //   type: 'input',
    //   label: '矩阵号',
    //   val: '',
    //   placeholder: '请输入抖音号',
    //   filed: 'douYinAccount'
    // },
    {
      type: 'select',
      label: '完成所有指标',
      placeholder: '请选择完成情况',
      val: -1,
      defaultVal: -1,
      filed: 'isFinish',
      selects: [
        {
          value: -1,
          label: '全部'
        },
        {
          label: '是',
          value: 1
        },
        {
          label: '否',
          value: 0
        }
      ]
    },
    {
      showLabelTip: true,
      type: 'select',
      label: '参与状态',
      placeholder: '请选择参与状态',
      val: -1,
      defaultVal: -1,
      filed: 'deliveryStatus',
      selects: [
        {
          value: -1,
          label: '全部'
        },
        {
          label: '未参与',
          value: 0
        },
        {
          label: '已参与',
          value: 1
        },
        {
          label: '参与成功',
          value: 2
        },
        {
          label: '已完成',
          value: 3
        }
      ]
    }
  ])
  if (taskType === 'study') {
    searchComponents.value = searchComponents.value.filter(
      e => e.filed !== 'douYinAccount' && e.filed !== 'isFinish' && e.filed !== 'groupIds'
    )
  }

  if (taskType === 'collection' || route.query.pageSource === 'growth') {
    searchComponents.value = searchComponents.value.filter(e => e.filed !== 'groupIds')
  }
  if (route.query.pageSource === 'growth') {
    searchComponents.value.forEach(x => {
      if (x.filed === 'deliveryStatus') {
        x.selects = [
          {
            value: -1,
            label: '全部'
          },
          {
            label: '已参与',
            value: 1
          },
          {
            label: '参与成功',
            value: 2
          },
          {
            label: '已完成',
            value: 3
          }
        ]
      }
    })
  }
  // 跳转员工详情页
  function goUser() {
    router.push({
      path: '/content_market/member_data'
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
  const sortInfo = reactive({
    target: '',
    orderBy: 0
  })
  // 获取参与明细数据
  function getTaskInfo() {
    tableForm.loading = true
    const searchForm = {
      pageNum: tableForm.page.index,
      pageSize: tableForm.page.size
    }
    const condition = getQuery(searchComponents.value, ['startTime', 'endTime'])

    Object.assign(condition, sortInfo, {
      taskId: route.query.itemId,
      queryType: route.query.type
    })
    // debugger
    searchForm.condition = condition

    getVideoTaskJoinList(searchForm)
      .then(res => {
        const _list = res.data.records || []
        tableForm.listData = _list.map(e => {
          e.dyAvatar = e.avatar
          e.dyName = e.name
          e.dyNum = e.douYinAccount
          e.phone = e.phoneNum
          e.showPhone = false
          return e
        })
        tableForm.page.total = res.data.total || 0
        tableForm.loading = false
      })
      .catch(() => {
        tableForm.loading = false
      })
  }
  // 刷新
  function updated() {
    getTaskInfo()
  }

  function handleSortChange(val) {
    if (val.prop === 'orderAmountTarget') {
      sortInfo.target = 'order_amount_target'
    } else if (val.prop === 'leaveinfoNumTarget') {
      sortInfo.target = 'leaveinfo_num_target'
    } else {
      sortInfo.target = val.prop || ''
    }
    if (val.order === 'ascending') {
      sortInfo.orderBy = 1
    } else if (val.order === 'descending') {
      sortInfo.orderBy = 0
    } else {
      sortInfo.orderBy = 0
    }
    getTaskInfo()
  }
  function urlEncode(param, idx, key, encode) {
    if (param == null) return ''
    let paramStr = ''
    const t = typeof param
    if (t === 'string' || t === 'number' || t === 'boolean') {
      const oneIs = '&'
      // const oneIs = idx < 3 ? '?' : '&'
      paramStr += oneIs + key + '=' + (encode == null || encode ? encodeURIComponent(param) : param)
    } else {
      for (const i in param) {
        const k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i)
        idx++
        paramStr += urlEncode(param[i], idx, k, encode)
      }
    }
    return paramStr
  }
  // 导出
  const exportTask = () => {
    const condition = getQuery(searchComponents.value, ['startTime', 'endTime'])
    console.log(condition, '导出的数据')
    condition.orgIds = condition.orgIds ? condition.orgIds.join(',') : ''
    condition.groupIds = condition.groupIds ? condition.groupIds.join(',') : ''
    Object.assign(condition, sortInfo, {
      taskId: route.query.itemId,
      queryType: route.query.type
    })
    const param = urlEncode(condition, 1).replace('&', '?')
    return exportFileV2(exportTaskJoinList, param, '详情导出', 'xlsx')
  }
  // 分组
  function getNewGroupList() {
    api.getNewGroupList({}).then(res => {
      if (res.code === 0) {
        searchComponents.value.find(item => item.filed === 'groupIds').selects = res.data || []
      }
    })
  }
  function initSearch() {
    const hasGroupArr = ['video', 'imgText', 'live']
    if (hasGroupArr.includes(taskType) && route.query.pageSource !== 'growth') {
      getNewGroupList()
    }
  }
  initSearch()

  return {
    tableForm,
    sortInfo,
    getTaskInfo,
    showTel,
    updated,
    goUser,
    handleSortChange,
    searchComponents,
    exportTask
  }
}
