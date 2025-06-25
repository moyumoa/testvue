/**
 * 获取直播中心列表数据
 */
import { reactive } from 'vue'
import { liveList } from '@/api/content_center/inspection.js'
import { getQuery } from '@/utils/get_query.js'
export function pageList() {
  // 筛选条件
  const searchComponents = ref([
    {
      type: 'input',
      label: '直播标题',
      val: '',
      placeholder: '请输入直播标题',
      filed: 'roomTitle'
    },
    {
      type: 'input',
      label: '矩阵号昵称',
      val: '',
      placeholder: '请输入矩阵号昵称',
      filed: 'nickname'
    },
    // {
    //   type: 'input',
    //   label: '任务名称',
    //   val: '',
    //   placeholder: '请输入任务名称',
    //   filed: 'taskName'
    // },
    {
      type: 'select',
      label: '直播状态',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择直播状态',
      filed: 'roomStatus',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '直播中',
          value: 1
        },
        {
          label: '已下播',
          value: 2
        }
      ]
    },
    {
      type: 'select',
      label: '质检状态',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择质检状态',
      filed: 'checkStatus',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '未质检',
          value: 0
        },
        {
          label: '质检合格',
          value: 1
        },
        {
          label: '质检不合格',
          value: 2
        }
      ]
    },
    {
      type: 'dateRange', // 组件类型
      label: '开播时间', // label展示
      val: '', // 响应式绑定
      disabledDate(time) {
        return time.getTime() > Date.now()
      }, // 禁用日期
      isDisEdit: true, // 是否禁用文本框输入
      placeholder: ['开始时间', '结束时间'],
      filed: 'dateRange' // 查询字段名
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
  const statusList = reactive(
    new Map([
      [0, { label: '未质检', class: '' }],
      [1, { label: '质检合格', class: 'green_circle' }],
      [2, { label: '质检不合格', class: 'red_circle' }]
    ])
  )
  function getList() {
    const data = getQuery(searchComponents.value, ['liveStartTime', 'liveEndTime'])
    data.searchCount = true
    data.pageNo = tableForm.page.index
    data.pageSize = tableForm.page.size

    data.platform = 1
    tableForm.loading = false
    liveList(data)
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
  return { searchComponents, tableForm, statusList, getList }
}
