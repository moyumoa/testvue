/**
 * 获取抖店商品列表数据
 */
import { reactive } from 'vue'
import { selectList } from '@/api/content_center/good_group.js'
import { getQuery } from '@/utils/get_query.js'
export function pageList() {
  // 筛选条件
  const searchComponents = ref([
    {
      type: 'input',
      label: '分组名',
      val: '',
      placeholder: '请输入分组名',
      filed: 'name'
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
  function getList() {
    const data = getQuery(searchComponents.value)
    data.searchCount = true
    data.pageNo = tableForm.page.index
    data.pageSize = tableForm.page.size
    selectList(data)
      .then(res => {
        if (res.code === 0) {
          tableForm.listData = res.data.records || []
          tableForm.page.total = res.data.total || 0
          tableForm.listData.forEach(x => {
            x.goodsSort1 = x.goodsSort
          })
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
  const statusList = reactive(
    new Map([
      [0, { label: '正常', class: 'green_circle' }],
      [1, { label: '已隐藏', class: 'red_circle' }]
    ])
  )
  return { statusList, searchComponents, tableForm, getList }
}
