import { reactive, ref } from 'vue'
import { getQuery } from '@/utils/get_query'
import { RELEASE_TYPE, TASK_TYPE } from '@/utils/dictionary/task'
import {
  listAuditRecord,
  getAuditDetail,
  updateAuditInfo,
  getAuditTaskDetail,
  getAuditVideoDetail,
  getMaterialInfo
} from '@/api/market/task_audit.js'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { isEmpty } from '@/utils/tools'

export function pageList(emits, props, isTask, multipleTableRef) {
  const store = useStore()
  const router = useRouter()
  const systemVersion = computed(() => store.state.user.systemVersion)
  const auditResultObj = {
    0: '智能审核中',
    1: '待审核',
    2: '审核通过',
    3: '审核不通过',
    4: '审核已过期'
  }
  // 筛选条件
  const searchComponents = ref([
    {
      type: 'input',
      label: '审核信息',
      val: null,
      placeholder: '请输入审核信息（任务标题）',
      filed: 'title'
    },
    {
      type: 'input',
      label: '提交人',
      val: null,
      placeholder: '请输入姓名或手机号',
      filed: 'nameOrMobile'
    },
    {
      type: 'select',
      label: '审核状态',
      placeholder: '请选择审核状态',
      val: -1,
      defaultVal: -1,
      filed: 'status',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '智能审核中',
          value: 5
        },
        {
          label: '待审核',
          value: 3
        },
        {
          label: '审核通过',
          value: 1
        },
        {
          label: '审核不通过',
          value: 2
        },
        {
          label: '审核已过期',
          value: 4
        }
      ]
    },
    {
      type: 'dateRange',
      label: '变更时间', // label展示
      val: '', // 响应式绑定
      disabledDate(time) {
        return time.getTime() > Date.now()
      }, // 禁用日期
      isDisEdit: true, // 是否禁用文本框输入
      placeholder: ['开始时间', '结束时间'],
      filed: 'dateRange' // 查询字段名
    },
    {
      type: 'input',
      label: '审核人',
      val: null,
      filed: 'auditUsername',
      placeholder: '请输入审核人姓名'
    }
  ])
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
  const chooseTab = ref('2')

  //  tabList
  const tabList = ref([
    {
      name: '2',
      label: 'KOS任务'
    },
    {
      name: '5',
      label: 'KOC任务'
    },
    {
      name: '3',
      label: '征集原料'
    },
    {
      name: '4',
      label: '征集视频'
    },
    {
      name: '1',
      label: '任务'
    }
  ])
  function initSearch() {
    if (systemVersion.value === 4) {
      tabList.value = [
        {
          name: '2',
          label: 'KOS任务'
        },
        {
          name: '1',
          label: '任务'
        }
      ]
    }
  }
  initSearch()
  // 手机号显示隐藏
  function showPhoneFun(e, i) {
    // props.tableForm.listData[i].showPhone = !props.tableForm.listData[i].showPhone
    e.showPhone = !e.showPhone
  }
  function changeTab(tab) {
    getTaskList()
  }
  const chooseList = ref([])
  function unique(arr) {
    const res = new Map()
    return arr.filter(arr => !res.has(arr.id) && res.set(arr.id, 1))
  }
  // 全选
  function handleSelectionChange(row) {
    chooseList.value = unique(row)
    console.log('174', row, chooseList.value)
    // allAudit.number = row.length
    // query.auditIds = []
    // row.forEach(item => {
    //   // console.log(item.id)
    //   query.auditIds.push(item.id)
    // })
  }
  const allAudit = reactive({
    show: false,
    number: 0
  })
  // 批量审核
  function batch(tab) {
    if (isEmpty(chooseList.value)) {
      const tabName = tabList.value.find(item => item.name === tab)?.label
      ElMessage.warning(`请至少选择一条${tabName}`)
    } else {
      allAudit.number = chooseList.value.length
      const list = chooseList.value.map(x => x.id)

      query.auditIds = list
      console.log('all', allAudit, query.auditIds)
      allAudit.show = true
    }
  }
  // 获取审核列表
  function getTaskList() {
    tableForm.loading = true
    const data = getQuery(searchComponents.value, ['startTime', 'endTime'])
    data.pageNo = tableForm.page.index
    data.pageSize = tableForm.page.size
    data.type = chooseTab.value
    const params = {
      ...data,
      pageNo: tableForm.page.index,
      pageSize: tableForm.page.size
    }
    if (chooseTab.value === '2' || chooseTab.value === '5') {
      params.status =
        params.status === 5
          ? 0
          : params.status === 3
          ? 1
          : params.status === 1
          ? 2
          : params.status === 2
          ? 3
          : params.status === 4
          ? 4
          : '' // 审核状态
      params.taskGroup = chooseTab.value === '5' ? 3 : 1
      // 记录视频下的查询条件，后续审核详情点击确定要用
      sessionStorage.setItem('KOSAuditPrams', JSON.stringify(params))
    } else {
      sessionStorage.removeItem('KOSAuditPrams')
    }
    const listPromise =
      chooseTab.value === '2' || chooseTab.value === '5'
        ? listAuditRecord(params)
        : getAuditDetail(data)
    console.log('是否显示批量审核', data.status, data.status === 3)
    listPromise
      .then(res => {
        if (res.code === 0) {
          tableForm.listData = transformStatus(res.data.records) || []
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
    // tableForm.loading = false
  }
  // 添加手机号显示标识
  function transformStatus(res) {
    const listData = res.map(function (item) {
      item.showPhone = false
      return item
    }, this)
    return listData
  }

  // 审核按钮
  const isShow = ref(false)
  const taskDetail = ref()
  // 审核结果需要发送的数据
  const query = reactive({
    auditIds: [],
    auditResult: null,
    remark: '',
    type: ''
  })
  // 审核点击事件
  function taskAudit(row, tab) {
    // tab是视频，并且是新的视频/图文审核，跳转到新页面
    if (tab === '2' || tab === '5') {
      sessionStorage.removeItem('KOSToRecord')
      router.push(`/content_market/audit_center/KOS_detail?id=${row.auditId}`)
      return
    }
    isShow.value = true
    query.auditIds = [row.id]
    query.type = row.type
    if (row.type === 2) {
      getAuditInfoView(row.id)
    } else if (row.type === 1) {
      _getTaskInfoView(row.id)
    } else {
      _getMaterialInfo(row.id)
    }
  }
  // 审核结果保存
  function updateTask() {
    return new Promise((resolve, reject) => {
      if (query.auditResult === null || query.auditResult === undefined) {
        ElMessage.warning('请选择审核状态')
        reject(new Error())
      } else if (query.auditResult === 2 && query.remark.length === 0) {
        ElMessage.warning('请输入不通过理由')
        reject(new Error())
      } else {
        updateAuditInfo(query)
          .then(res => {
            if (multipleTableRef && multipleTableRef.value) {
              multipleTableRef.value?.$refs?.table?.clearSelection()
            }
            console.log(res, 'res')
            ElMessage.success('审核提交成功')
            emits('upData')
            emits('resetTableData')
            allAudit.show = false
            emits('update:isShow', false)
          })
          .catch(() => {
            if (isTask) {
              emits('upData')
              emits('resetTableData')
              allAudit.show = false
              emits('update:isShow', false)
            }
          })
          .finally(() => {
            resolve()
          })
      }
    })
  }
  // 获取视频详情
  function getAuditInfoView(id) {
    taskDetail.value = null
    getAuditVideoDetail({ auditId: id }).then(res => {
      console.log(res.data, 'res.data')
      res.data.showPhone = false
      taskDetail.value = res.data || {}
    })
  }
  // 播放视频
  function playVideo(row) {
    row.videoPlayUrl ? window.open(row.videoPlayUrl) : window.open(row.videoPlayUrl)
  }
  const taskData = reactive({
    taskInfo: {},
    taskRequire: '',
    allTargetRewards: 0,
    releaseTypeStr: '',
    taskOtherInfo: ''
  })
  // 获取任务详情
  async function _getTaskInfoView(id) {
    const res = await getAuditTaskDetail({ auditId: id })
    taskData.taskInfo = res.data.detail
    taskData.taskOtherInfo = res.data
    taskData.taskRequire = ''
    taskData.allTargetRewards = 0
    taskData.multiJoinTargetReward = {}
    taskData.releaseTypeStr = ''

    taskData.taskInfo.taskConfigs.forEach(item => {
      if (item.ckey === 'task_require_info') {
        taskData.taskRequire = item.cvalue
      }
      if (res.data.detail.type !== TASK_TYPE.get('video')) {
        return
      }
      if (item.ckey === 'video_audit_set') {
        if (item.cvalue === '1') {
          taskData.releaseTypeStr = '上传审核发布'
        }
      } else {
        if (item.ckey === 'video_push_mode') {
          console.log('video_push_mode', item.cvalue)
          taskData.releaseTypeStr = RELEASE_TYPE.getCN(Number(item.cvalue))
          if (item.cvalue.length === 3) {
            taskData.releaseTypeStr = '上传直接发布 | 拍摄直接发布'
          }
        }
      }
    })
    taskData.taskInfo.targetConfigs.forEach(item => {
      if (item.targetKey === 'all_target') {
        taskData.allTargetRewards = item.targetRwwards[0].rewards[0].value
      } else if (item.targetKey === 'multi_join_target') {
        taskData.multiJoinTargetReward = {
          targetValue: item.targetRwwards[0].cvalue || null,
          targetReward: item.targetRwwards[0].rewards[0].value || null
        }
      }
      let validChildNum = 0
      if (item.children && item.children.length) {
        item.children.forEach(child => {
          child.targetRwwards.forEach(target => {
            if (target.cvalue) validChildNum++
          })
        })
      }
      item.valid = validChildNum !== 0
    })
  }

  // 素材详情
  function _getMaterialInfo(id) {
    taskDetail.value = null
    getMaterialInfo({
      auditId: id
    }).then(res => {
      taskDetail.value = res.data || {}
    })
  }

  // 验证规则
  const validateReason = (rule, value, callback) => {
    if (query.remark.length !== 0) {
      callback()
    } else {
      return callback(new Error('请输入不通过理由'))
    }
  }
  const rules = reactive({
    reason: [
      {
        required: true,
        validator: validateReason,
        trigger: 'blur'
      }
    ]
  })
  return {
    auditResultObj,
    tabList,
    searchComponents,
    tableForm,
    query,
    isShow,
    getTaskList,
    chooseList,
    handleSelectionChange,
    showPhoneFun,
    updateTask,
    taskAudit,
    batch,
    changeTab,
    playVideo,
    allAudit,
    chooseTab,
    rules,
    taskDetail,
    taskData
  }
}
