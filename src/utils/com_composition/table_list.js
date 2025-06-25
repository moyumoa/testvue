/*
 * @Date: 2022-06-07 11:07:10
 * @LastEditors: dong wenhao
 * @LastEditTime: 2022-06-15 16:54:55
 * @Description: table list的一些公共方法
 */

/**
 * @param {Function} getList 获取列表
 */
export default function tableList(getList) {
  const page = reactive({
    index: 1,
    size: 10,
    total: 0
  })
  const list = ref([])
  const listLoading = ref(false)

  function getTableList() {
    listLoading.value = true
    getList(page)
      .then(listData => {
        list.value = listData
      })
      .finally(() => {
        listLoading.value = false
      })
  }

  // 搜索
  function searchList() {
    page.index = 1
    getTableList()
  }

  // 重置
  function resetSearch() {
    listLoading.value = true
    page.index = 1
    page.size = 10
    getTableList()
  }

  // 只在不使用xm_table组件时需要
  function handleCurrentChange(val) {
    page.index = val
    getTableList()
  }
  function handleSizeChange(val) {
    page.index = 1
    page.size = val
    getTableList()
  }

  return {
    page,
    list,
    listLoading,
    getTableList,
    searchList,
    resetSearch,
    handleCurrentChange,
    handleSizeChange
  }
}
