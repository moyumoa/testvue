/**

 */
import { reactive, ref } from 'vue'
import { getQuery } from '@/utils/get_query'
import { useRouter } from 'vue-router'
import { throttle, getCreateTaskPath } from '@/utils/tools'

import { getAuditDetail, updateAuditInfo } from '@/api/market/task_audit.js'
import { ElMessage } from 'element-plus'
export function pageList() {
  const router = useRouter()

  // 筛选条件
  const searchComponents = ref([
    {
      type: 'input',
      label: '审核信息',
      val: '',
      placeholder: '请输入审核任务标题',
      filed: 'taskInfo'
    },
    {
      type: 'select',
      label: '审核类型',
      placeholder: '请选择审核类型',
      val: -1,
      filed: 'type',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '直播任务',
          value: 2
        },
        {
          label: '视频任务',
          value: 1
        },
        {
          label: '征集原料',
          value: 3
        }
      ]
    },
    {
      type: 'input',
      label: '任务创建人',
      val: '',
      placeholder: '请输入任务创建人',
      filed: 'createUserName'
    },

    {
      type: 'select',
      label: '审核状态',
      placeholder: '请选择审核状态',
      val: -1,
      filed: 'status',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '待审核',
          value: 0
        },
        {
          label: '审核通过',
          value: 1
        },
        {
          label: '审核不通过',
          value: 2
        }
      ]
    }
  ])
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
  // 跳转任务详情
  function taskDetails(row) {
    router.push({
      path: getCreateTaskPath(row.type),
      query: {
        read: 1,
        id: row.id
      }
    })
  }
  // 获取任务列表
  function getTaskList() {
    tableForm.loading = true
    const data = getQuery(searchComponents.value, ['startTime', 'endTime'])
    data.pageNo = tableForm.page.index
    data.pageSize = tableForm.page.size
    getAuditDetail(data)
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
    tableForm.loading = false
  }
  const query = reactive({
    taskId: '',
    status: null,
    remark: '',
    type: ''
  })
  const isShow = ref(false)
  function audit(row) {
    isShow.value = true
    query.taskId = row.id
    query.type = row.type
  }
  // 更新任务状态
  const updateTask = throttle(() => {
    if (query.status === null) {
      ElMessage.error('请选择审核结果')
    } else {
      if (query.remark.length === 0 && query.status === 2) {
        ElMessage.error('不通过理由不能为空')
      } else {
        updateAuditInfo(query).then(res => {
          isShow.value = false
          getTaskList()
        })
      }
    }
  }, 1000)

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
    searchComponents,
    tableForm,
    query,
    isShow,
    audit,
    getTaskList,
    updateTask,
    taskDetails,
    rules
  }
}
