/**
 * 获取列表数据
 */
import { reactive } from 'vue'

export function pageList() {
  const state = reactive({
    loading: false,
    listData: [],
    page: {
      index: 1,
      size: 10,
      total: 10
    }
  })
  function getList() {
    state.loading = true
    return Promise.resolve()
      .then(() => {
        const arr = []
        for (let i = 0; i < 5; i++) {
          arr.push({
            num: Math.random(),
            name: `测试${i}`
          })
        }
        state.listData = arr
      })
      .finally(() => {
        state.loading = false
      })
  }
  getList()
  return {
    state,
    getList
  }
}
