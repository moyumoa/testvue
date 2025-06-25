/**
 * 素材库-获取图片
 */
import { pageAttachment } from '@/api/operation/library.js'

export function pageImg() {
  // 表格的查询条件
  const imgForm = reactive({
    loading: true,
    listData: [],
    page: {
      index: 1,
      size: 20,
      total: 0
    }
  })
  const chooseId = ref()
  const pageIndex = toRef(imgForm.page, 'index')
  function getList() {
    pageAttachment({
      categoryId: chooseId.value,
      pageNumber: imgForm.page.index,
      pageSize: imgForm.page.size,
      searchCount: true
    })
      .then(res => {
        if (res.code === 0) {
          imgForm.listData = res.data.records || []
          imgForm.page.total = res.data.total || 0
        } else {
          if (imgForm.page.index === 1) {
            imgForm.listData = []
          }
        }
        imgForm.loading = false
      })
      .catch(() => {
        imgForm.loading = false
      })
  }

  // 分页相关：监听页码切换事件
  const handleCurrentChange = val => {
    imgForm.page.index = val
    getList()
  }
  // 分页相关：监听单页显示数量切换事件
  const handleSizeChange = val => {
    imgForm.page.size = val
    imgForm.page.index = 1
    pageIndex.value = 1
    getList()
  }
  function resetSearch(id, stu) {
    chooseId.value = id === -1 ? null : id
    imgForm.loading = stu
    imgForm.page.index = 1
    imgForm.page.size = 20
    getList()
  }
  return { resetSearch, imgForm, getList, pageIndex, handleCurrentChange, handleSizeChange }
}
