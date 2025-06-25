import { getDiyPage } from '@/api/operation/page_decorate.js'
export function pageList() {
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
    getDiyPage({
      pageNumber: tableForm.page.index,
      pageSize: tableForm.page.size,
      searchCount: true
    })
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
  function searchList() {
    tableForm.loading = true
    getList()
  }
  searchList()
  return {
    tableForm,
    getList
  }
}
