/*
 * @Author: Dong wen hao
 * @Date: 2022-03-23 19:44:22
 * @LastEditors: dong wenhao
 * @LastEditTime: 2022-05-27 10:04:07
 * @Description: 任务列表查询相关
 */
import { setBusinessChooseParam } from '@/utils/search.js'
import { getQuery } from '@/utils/get_query'
import { getVTaskList, exportTaskList } from '@/api/market/task.js'
import { TASK_STATUS } from '@/utils/dictionary/task'
import { exportFileV2 } from '@/utils/exportFile'
import { isNotEmpty } from '@/utils/tools'
import { useStore } from 'vuex'
export default function queryTaskList(taskBaseInfo) {
  const store = useStore()
  const systemVersion = computed(() => store.state.user.systemVersion)

  console.log('queryTaskList', taskBaseInfo)
  // 筛选条件
  const searchComponents1 = ref([
    {
      type: 'input',
      label: '任务标题',
      val: '',
      filed: 'taskName'
    },
    {
      type: 'select',
      label: '任务状态',
      placeholder: '请选择任务状态',
      val: -1,
      defaultVal: -1,
      filed: 'taskStatus',
      selects: []
    },
    {
      type: 'input',
      label: '创建人',
      val: '',
      filed: 'taskCreateUserName'
    },
    {
      type: 'dateRange',
      label: '任务时间', // label展示
      val: '', // 响应式绑定
      isDisEdit: true, // 是否禁用文本框输入
      placeholder: ['开始时间', '开始时间'],
      filed: 'dateRange' // 查询字段名
    },
    {
      type: 'select',
      label: `${taskBaseInfo.type === 6 ? '图文' : '视频'}发布方式`,
      placeholder: `请选择${taskBaseInfo.type === 6 ? '图文' : '视频'}发布方式`,
      val: -1,
      defaultVal: -1,
      filed: 'videoPushMode',
      hiddenItem: ![1, 6].includes(taskBaseInfo.type),
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: taskBaseInfo.type === 6 ? '相册上传发布' : '相册上传直接发布',
          value: 1
        },
        {
          label: '一键转发',
          value: 4
        },
        {
          label: '创意模板发布',
          value: 3
        }
      ]
    },
    {
      type: 'select',
      label: `图文发布平台`,
      placeholder: `全部`,
      val: [],
      defaultVal: [],
      multiple: true,
      filterable: true,
      'collapse-tags': true,
      filed: 'videoPlatforms',
      hiddenItem: taskBaseInfo.type !== 6,
      selects: [
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
      type: 'select',
      label: `视频发布平台`,
      placeholder: `全部`,
      val: [],
      defaultVal: [],
      multiple: true,
      filterable: true,
      'collapse-tags': true,
      filed: 'videoPlatforms',
      hiddenItem: taskBaseInfo.type !== 1,
      selects: [
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
      label: ' 是否关联活动',
      placeholder: '请选择是否关联活动',
      val: -1,
      defaultVal: -1,
      hiddenItem: taskBaseInfo.type !== 1 && taskBaseInfo.type !== 2 && taskBaseInfo.type !== 6,
      filed: 'isActivity',
      selects: [
        {
          label: '全部',
          value: -1
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
      type: 'chooseDept',
      label: '部门',
      val: [],
      filed: 'areaIds',
      multiple: true,
      isUsePermission: true
    }
  ])
  searchComponents1.value.forEach(item => {
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
  // 企业版 视频和图文任务增加一个任务类型筛选项
  if (systemVersion.value === 3 && [1, 6].includes(taskBaseInfo.type)) {
    searchComponents1.value.splice(2, 0, {
      type: 'select',
      label: `任务类型`,
      placeholder: `请选择任务类型`,
      val: -1,
      defaultVal: -1,
      filed: 'taskGroup',
      hiddenItem: !([1, 6].includes(taskBaseInfo.type) && systemVersion.value === 3),
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: 'KOS',
          value: 1
        },
        {
          label: 'KOC',
          value: 3
        }
      ]
    })
  }
  // 因为有涉及到KeepAlive，所以就先复制一份，后续可用
  const searchComponents = ref(searchComponents1.value)
  // 因为有涉及到KeepAlive，所以就先复制一份，后续可用
  // 更新业务主体筛选项
  const initSearch = function () {
    const list = setBusinessChooseParam()
    searchComponents.value = searchComponents.value.concat(list)
  }
  initSearch()
  // 表格的查询条件
  const tableForm = reactive({
    loading: false,
    listData: [],
    page: {
      index: 1,
      size: 5,
      total: 0
    }
  })

  // 获取任务列表
  function getTaskList() {
    tableForm.loading = true
    const data = getQuery(searchComponents.value, ['startTime', 'endTime'])
    if (isNotEmpty(data.videoPlatforms)) {
      data.videoPlatform = data.videoPlatforms.join(',')
    }
    data.pageNo = tableForm.page.index
    data.pageSize = tableForm.page.size
    data.taskType = taskBaseInfo.type
    getVTaskList(data)
      .then(res => {
        tableForm.listData = res.data.records.map(e => {
          e.statusName = TASK_STATUS.getCN(e.status)
          return e
        })
        tableForm.page.total = res.data.total || 0
        tableForm.loading = false
      })
      .catch(() => {
        tableForm.loading = false
      })
  }
  // 清空查询参数
  function clearSearchQuery() {
    tableForm.loading = true
    tableForm.page.index = 1
    tableForm.page.size = 10
  }
  // 重置
  function resetSearch() {
    clearSearchQuery()
    getTaskList()
  }

  clearSearchQuery()
  const xmSearchRef = ref(null)
  const menuOfKeepAlive = inject('$menuOfKeepAlive')
  onActivated(() => {
    if (menuOfKeepAlive('judge')) {
      if (xmSearchRef.value) {
        xmSearchRef.value?.reset()
      } else {
        resetSearch()
      }
      menuOfKeepAlive('reset')
    } else {
      getTaskList()
    }
  })
  // 查询
  function searchList() {
    tableForm.loading = true
    tableForm.page.index = 1
    getTaskList()
  }

  // 导出
  function exportTask() {
    console.log(taskBaseInfo)
    const data = getQuery(searchComponents.value, ['startTime', 'endTime'])
    if (isNotEmpty(data.videoPlatforms)) {
      data.videoPlatform = data.videoPlatforms.join(',')
    }
    data.pageNo = tableForm.page.index
    data.pageSize = tableForm.page.size
    data.taskType = taskBaseInfo.type
    return exportFileV2(
      exportTaskList,
      data,
      (taskBaseInfo.type === 1 ? '视频' : '') + taskBaseInfo.name,
      'xlsx'
    )
  }

  return {
    searchComponents,
    searchComponents1,
    tableForm,
    getTaskList,
    resetSearch,
    searchList,
    exportTask,
    xmSearchRef
  }
}
