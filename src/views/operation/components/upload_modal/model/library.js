/**
 * 选择图片--素材库--获取图片
 */
import { pageAttachment } from '@/api/operation/library.js'
export function pageImg(chooseNum) {
  // 表格的查询条件
  const imgForm = reactive({
    loading: false,
    listData: [],
    chooseList: [],
    page: {
      index: 1,
      size: 10,
      total: 0
    }
  })
  const chooseId = ref()
  const pageIndex = toRef(imgForm.page, 'index')
  function getList() {
    // const list = []
    // for (let i = 0; i < 10; i++) {
    //   list.push({
    //     id: i + imgForm.page.index * imgForm.page.size,
    //     thumb:
    //       'https://tagvv-1256030678.cos.ap-shanghai.myqcloud.com/img/20210621222804f658e888e3.jpg?imageMogr2/rquality/70/thumbnail/750x1334',
    //     title: '目上23432222222222222',
    //     checked: false
    //   })
    // }
    // imgForm.listData = list
    // imgForm.page.total = 45
    // console.log(imgForm)
    // imgForm.chooseList.forEach(x => {
    //   imgForm.listData.forEach(y => {
    //     if (x.id === y.id) {
    //       y.checked = true
    //     }
    //   })
    // })
    pageAttachment({
      categoryId: chooseId.value,
      pageNumber: imgForm.page.index,
      pageSize: imgForm.page.size,
      searchCount: true
    })
      .then(res => {
        if (res.code === 0) {
          const list = res.data.records || []
          if (list.length > 0) {
            list.forEach(x => {
              let isChecked = false
              if (imgForm.chooseList.length > 0) {
                imgForm.chooseList.forEach(y => {
                  if (x.id === y.id) {
                    isChecked = true
                  }
                })
              }
              x.checked = isChecked
            })
          }
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
    imgForm.page.size = 10
    getList()
  }

  return {
    resetSearch,
    imgForm,
    getList,
    pageIndex,
    handleCurrentChange,
    handleSizeChange
  }
}
