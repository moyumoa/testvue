/**
 * 获取直播中心列表数据
 */
import { reactive } from 'vue'
import { listDouDian } from '@/api/content_center/store_management.js'
import { getQuery } from '@/utils/get_query.js'
export function pageList() {
  // 筛选条件
  const searchComponents = ref([
    {
      type: 'input',
      label: '店铺名称',
      val: '',
      placeholder: '请输入店铺名称',
      filed: 'authName'
    },
    {
      type: 'select',
      label: '授权状态',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择授权状态',
      filed: 'authStatus',
      selects: [
        {
          label: '全部',
          value: -1
        },
        // {
        //   label: '未授权',
        //   value: 0
        // },
        {
          label: '已授权',
          value: 1
        },
        {
          label: '已过期',
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
      size: 10,
      total: 0
    }
  })
  const statusList = reactive(
    new Map([
      [2, { label: '已过期', class: 'red_circle' }],
      [1, { label: '已授权', class: 'green_circle ' }],
      [0, { label: '未授权', class: '' }]
    ])
  )
  function getList() {
    const data = getQuery(searchComponents.value)
    data.searchCount = true
    data.pageNumber = tableForm.page.index
    data.pageSize = tableForm.page.size
    tableForm.loading = false
    listDouDian(data)
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
