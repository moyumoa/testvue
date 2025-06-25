import { reactive } from 'vue'
import { homeworkTaskUserList } from '@/api/market/task.js'
import { getQuery } from '@/utils/get_query'
import { useRoute } from 'vue-router'
// import { exportFile } from '@/utils/exportFile'

export default function (taskType, taskName) {
  const route = useRoute()
  const statusList = reactive(
    new Map([
      [-1, { label: '全部', class: '' }],
      [1, { label: '已点评', class: 'green_circle' }],
      [0, { label: '待点评', class: '' }]
      // red_circle
    ])
  )
  const statusArr = []
  Array.from(statusList).forEach(x => {
    statusArr.push({
      label: x[1].label,
      value: x[0]
    })
  })
  // 筛选条件
  const searchComponents = ref([
    {
      type: 'input',
      label: '成员姓名',
      val: '',
      placeholder: '请输入成员姓名',
      filed: 'employeeName'
    },
    {
      type: 'input',
      label: '成员手机号',
      val: '',
      placeholder: '请输入成员手机号',
      filed: 'employeePhoneNum',
      isNumber: true
    },
    {
      type: 'select',
      label: '点评状态',
      placeholder: '请选择点评状态',
      val: -1,
      defaultVal: -1,
      filed: 'commentStatus',
      selects: statusArr
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
  const sortInfo = reactive({
    target: '',
    orderBy: 0
  })
  const commentHomeworkPermission = ref(false)
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

    homeworkTaskUserList(searchForm)
      .then(res => {
        const _list = res.data.records || []
        tableForm.listData = _list.map(e => {
          e.dyAvatar = e.avatar
          e.dyName = e.name
          e.dyNum = e.douYinAccount
          e.phone = e.phoneNum
          e.showPhone = false
          if (e.homeworks && e.homeworks.length > 0) {
            e.homeworkSubmitTime = e.homeworks[0].homeworkSubmitTime
            e.commentName = e.homeworks[0].commentName
            e.commentTime = e.homeworks[0].commentTime
            e.commentGrade = e.homeworks[0].commentGrade
            e.commentStatus = e.homeworks[0].commentStatus
            e.commentText = e.homeworks[0].commentText
          } else {
            e.homeworkSubmitTime = ''
            e.commentName = ''
            e.commentTime = ''
            e.commentGrade = 0
            e.commentStatus = 0
            e.commentText = ''
          }
          return e
        })
        tableForm.page.total = res.data.total || 0
        // 当前用户是否有点评权限
        if (tableForm.listData.length > 0) {
          commentHomeworkPermission.value = tableForm.listData[0]?.commentHomeworkPermission
        }
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
    if (val.prop === 'commentGrade') {
      sortInfo.target = 'mtuch.comment_grade'
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

  // // 导出
  // function exportTask() {
  //   const searchForm = {
  //     pageNum: tableForm.page.index,
  //     pageSize: tableForm.page.size
  //   }
  //   const condition = getQuery(searchComponents.value, ['startTime', 'endTime'])

  //   Object.assign(condition, sortInfo, {
  //     taskId: route.query.itemId,
  //     queryType: route.query.type
  //   })
  //   searchForm.condition = condition
  //   const name = taskName.replace(/\.|\\|\/|:|\?|"|<|>|\||\*/g, '')
  //   return exportFile(exportTaskJoinList, searchForm, `${name}参与明细`, 'xlsx')
  // }

  return {
    searchComponents,
    statusList,
    tableForm,
    sortInfo,
    getTaskInfo,
    updated,
    handleSortChange,
    commentHomeworkPermission
  }
}
