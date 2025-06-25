/**
 * 新增&编辑列表数据
 */
import { ref, reactive } from 'vue'
export function editData() {
  const editModal = ref(false)

  const editInfo = reactive({
    num: '',
    name: '22'
  })
  function addData() {
    editModal.value = true
    return Promise.resolve()
  }
  // setTimeout(() => {
  //   editInfo.name = 222
  // }, 2000)
  return {
    editModal,
    editInfo,
    addData
  }
}
