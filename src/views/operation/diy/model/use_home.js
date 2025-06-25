import { getDiyPage, saveOrUpDiyPage, getIndex } from '@/api/operation/diy.js'
import { useDetail } from '../../page_decorate/model/use_detail.js'
import { ElMessage, ElMessageBox } from 'element-plus'
const { echoCom } = useDetail()

export const useHome = () => {
  // 组件列表
  const componentList = ref([])
  // 选择小程序页面数据
  const listInfo = reactive({
    visible: false,
    title: '',
    currentPage: {},
    loading: false,
    listData: [],
    page: {
      index: 1,
      size: 10,
      total: 0
    }
  })
  // 小程序页面弹框事件
  const getList = () => {
    listInfo.loading = true
    getDiyPage({
      pageNumber: listInfo.page.index,
      pageSize: listInfo.page.size,
      nickName: listInfo.title
    }).then(res => {
      listInfo.listData = res.data.records
      listInfo.page.total = res.data.total
      listInfo.loading = false
    })
  }
  // getList()
  const onQuery = () => {
    listInfo.page.index = 1
    getList()
  }
  const reset = () => {
    listInfo.title = ''
    listInfo.page = {
      index: 1,
      size: 10,
      total: 0
    }
    getList()
  }
  const close = () => {
    listInfo.visible = false
  }
  const onSelect = row => {
    listInfo.currentPage = row
    echoPage(row.data)
    pageInfo.value = JSON.parse(row.data).pageInfo
    close()
  }
  // 保存
  const onSave = () => {
    if (!listInfo.currentPage.title) {
      return ElMessage.warning('请先选择首页')
    }
    ElMessageBox.confirm(`确定设置页面【${listInfo.currentPage.title}】为首页？`, '确认修改', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      listInfo.currentPage.pageType = 1
      saveOrUpDiyPage(listInfo.currentPage).then(res => {
        if (res.data === true) {
          ElMessage.success('更换成功')
          getHome()
        }
      })
    })
  }
  // 回显页面
  const echoPage = json => {
    componentList.value = echoCom(json)
  }
  const pageInfo = ref({
    info: {},
    nav: {}
  })
  // 获取首页页面
  const getHome = () => {
    getIndex({ type: 1 }).then(res => {
      if (res.data) {
        listInfo.currentPage = res.data
        if (res.data.data) {
          pageInfo.value = JSON.parse(res.data.data).pageInfo
        }
        // echoCom(res.data.data.data)
        res.data.data && echoPage(res.data.data)
      }
    })
  }
  getHome()

  return {
    pageInfo,
    componentList,
    listInfo,
    getList,
    onQuery,
    reset,
    close,
    onSelect,
    onSave
  }
}
