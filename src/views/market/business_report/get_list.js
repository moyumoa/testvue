import { reactive } from 'vue'
import { getMemberList, exportMemberData, getUserGroup } from '@/api/market/operate_analysis.js'
import { getQuery } from '@/utils/get_query.js'
import { exportFileV2 } from '@/utils/exportFile'
import Track from '@/utils/tracking/index.js'
import { useStore } from 'vuex'
export function handleGetList() {
  const store = useStore()
  // 基础版只显示矩阵号等级规则，其余版本显示完整
  const systemVersion = computed(() => store.state.user.systemVersion)

  const searchComponents = ref([
    {
      type: 'chooseDept',
      label: '最近参与任务部门',
      val: [],
      filed: 'taskJoinOrgIds',
      multiple: true,
      isUsePermission: true
    },
    {
      type: 'input',
      label: '成员姓名',
      val: '',
      filed: 'employeeName',
      placeholder: '请输入成员姓名'
    },
    {
      type: 'input',
      label: '手机号码',
      val: '',
      filed: 'employeePhoneNum',
      placeholder: '请输入手机号码'
    },
    {
      type: 'dateRange', // 组件类型
      label: '任务开始时间', // label展示
      defaultVal: [new Date(new Date().setDate(new Date().getDate() - 6)), new Date()],
      val: [new Date(new Date().setDate(new Date().getDate() - 6)), new Date()], // 默认是近七天的数据
      disabledDate(time) {
        return time.getTime() > Date.now()
      }, // 禁用日期
      clearable: 'false',
      isDisEdit: true,
      placeholder: ['开始时间', '结束时间'],
      filed: 'dateRange' // 查询字段名
    },
    {
      type: 'select',
      label: '矩阵号分组',
      val: null,
      placeholder: '请选择矩阵号分组',
      filed: 'groupIds',
      multiple: true,
      filterable: true,
      remote: true,
      remoteMethod: getUserGroupList(),
      'collapse-tags': true,
      'collapse-tags-tooltip': true,
      selects: []
    },
    {
      type: 'select',
      label: '成员范围',
      val: null,
      defaultVal: null,
      placeholder: '请选择任务状态',
      filed: 'joinMissionUserType',
      selects: [
        {
          label: '参与过任务',
          value: 0
        },
        {
          label: '未参与过任务',
          value: 2
        }
      ]
    },
    {
      type: 'select',
      label: '任务类型',
      val: [],
      defaultVal: [],
      placeholder: '请选择任务类型',
      filed: 'taskTypes',
      multiple: true,
      'value-key': 'taskType',
      'collapse-tags': true,
      'collapse-tags-tooltip': true,
      selects:
        systemVersion.value === 4
          ? [
              {
                label: '视频任务-相册上传发布',
                value: JSON.stringify({
                  taskType: 1,
                  subTaskTypeKey: 'video_push_mode',
                  subTaskType: 1
                })
              },
              {
                label: '视频任务-一键转发',
                value: JSON.stringify({
                  taskType: 1,
                  subTaskTypeKey: 'video_push_mode',
                  subTaskType: 4
                })
              },
              {
                label: '视频任务-创意模板发布',
                value: JSON.stringify({
                  taskType: 1,
                  subTaskTypeKey: 'video_push_mode',
                  subTaskType: 3
                })
              }
            ]
          : [
              {
                label: '视频任务-相册上传发布',
                value: JSON.stringify({
                  taskType: 1,
                  subTaskTypeKey: 'video_push_mode',
                  subTaskType: 1
                })
              },
              {
                label: '视频任务-一键转发',
                value: JSON.stringify({
                  taskType: 1,
                  subTaskTypeKey: 'video_push_mode',
                  subTaskType: 4
                })
              },
              {
                label: '视频任务-创意模板发布',
                value: JSON.stringify({
                  taskType: 1,
                  subTaskTypeKey: 'video_push_mode',
                  subTaskType: 3
                })
              },
              {
                label: '图文任务',
                value: JSON.stringify({ taskType: 6 })
              },
              {
                label: '直播任务',
                value: JSON.stringify({ taskType: 2 })
              },
              {
                label: '征集任务',
                value: JSON.stringify({ taskType: 3 })
              },
              {
                label: '学习任务',
                value: JSON.stringify({ taskType: 5 })
              }
            ]
    },
    {
      type: 'select',
      label: '成员状态',
      val: 1,
      defaultVal: 1,
      filed: 'isValid',
      selects: [
        // {
        //   label: '全部',
        //   value: -1
        // },
        {
          label: '已启用',
          value: 1
        },
        {
          label: '已禁用',
          value: 0
        }
      ]
    },
    {
      type: 'select',
      label: '成员类型',
      val: null,
      // defaultVal: -1,
      filed: 'staffType',
      selects: [
        // {
        //   label: '全部',
        //   value: -1
        // },
        {
          label: 'KOS成员',
          value: 1
        },
        {
          label: 'KOC成员',
          value: 2
        }
      ]
    }
  ])

  const tableForm = reactive({
    loading: false,
    listData: [],
    page: {
      index: 1,
      size: 10,
      total: 10
    }
  })
  const sortInfo = reactive({
    target: '',
    orderBy: 0
  })
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
  function getList() {
    tableForm.loading = true
    const searchForm = getQuery(searchComponents.value, ['startTime', 'endTime'])
    searchForm.taskTypes = searchForm.taskTypes?.map(item => JSON.parse(item)) || []
    searchForm.kukaCustom = true
    // searchForm.orgId = searchForm.orgId.length ? searchForm.orgId[searchForm.orgId.length - 1] : ''
    Object.assign(searchForm, sortInfo, {
      pageNum: tableForm.page.index,
      pageSize: tableForm.page.size
    })
    getMemberList(searchForm)
      .then(res => {
        if (res.code === 0) {
          const arr = JSON.parse(JSON.stringify(res.data.records))
          arr.forEach((item, index) => {
            item.phone = item.mobile
            if (item.orgName) {
              const depList = item.orgName.split('|')
              item.allDepList = depList
              item.depList = depList.length > 2 ? depList.slice(0, 2) : depList
            }
          })
          tableForm.listData = arr
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

  function handleSortChange(val) {
    sortInfo.target = val.prop || ''
    if (val.order === 'ascending') {
      sortInfo.orderBy = 1
    } else if (val.order === 'descending') {
      sortInfo.orderBy = 0
    } else {
      sortInfo.orderBy = 0
    }
    getList()
  }

  function resetSearch() {
    tableForm.page.index = 1
    tableForm.page.size = 10
    getList()
  }

  function exportData() {
    Track.clickBtn(114)
    const searchForm = getQuery(searchComponents.value, ['startTime', 'endTime'])
    searchForm.taskTypes = searchForm.taskTypes?.map(item => JSON.parse(item)) || []
    searchForm.kukaCustom = true
    // searchForm.orgId = searchForm.orgId.length ? searchForm.orgId[searchForm.orgId.length - 1] : ''
    Object.assign(searchForm, sortInfo)
    return exportFileV2(exportMemberData, searchForm, '业务报表', 'xlsx')
  }

  getList()
  return {
    tableForm,
    searchComponents,
    sortInfo,
    getList,
    resetSearch,
    handleSortChange,
    exportData
  }
}
