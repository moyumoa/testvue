import { getQuery } from '@/utils/get_query.js'
import { getListReport, exportReportExcelV2 } from '@/api/content_center/shop_report.js'
import { selectSimpleList, queryAllShop } from '@/api/content_center/good_store.js'

// import { exportFile } from '@/utils/exportFile.js'
import { exportFileV2 } from '@/utils/exportFile.js'

export function pageList(vm) {
  // 筛选条件
  const searchComponents = ref([
    {
      type: 'dateRange', // 组件类型
      label: '时间范围', // label展示
      val: '', // 响应式绑定
      defaultVal: '',
      disabledDate(time) {
        return time.getTime() > Date.now()
      }, // 禁用日期 // 禁用日期
      isDisEdit: true, // 是否禁用文本框输入
      placeholder: ['开始时间', '结束时间'],
      clearable: 'false',
      filed: 'dateRange' // 查询字段名
    },
    // disabledDate(time) {
    //   return (
    //     time.getTime() > Date.now() ||
    //     time.getTime() <= new Date(new Date().setMonth(new Date().getMonth() - 3))
    //   )
    // }, // 禁用日期 // 禁用日期
    {
      type: 'select',
      label: '店铺',
      val: null,
      multiple: true,
      filterable: true,
      'collapse-tags': true,
      placeholder: '请选择店铺',
      filed: 'shopIds',
      selectDefultName: ['shopId', 'shopName'],
      selects: []
    },
    {
      type: 'select',
      label: '商品分组',
      val: null,
      multiple: true,
      filterable: true,
      'collapse-tags': true,
      placeholder: '请选择商品分组',
      filed: 'productGroupIds',
      selectDefultName: ['id', 'name'],
      selects: []
    },
    {
      type: 'input',
      label: '商品名称',
      val: '',
      placeholder: '请输入商品名称',
      filed: 'productName'
    }
  ])
  const nowTime = new Date()
  const oldTime = new Date()
  oldTime.setTime(nowTime - 6 * 24 * 60 * 60 * 1000)

  searchComponents.value[0].val = [oldTime, nowTime]
  searchComponents.value[0].defaultVal = [oldTime, nowTime]

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
  // 获取商品分组
  function getGroupList() {
    selectSimpleList().then(res => {
      if (res.code === 0) {
        searchComponents.value[2].selects = res.data || []
      }
    })
  }
  getGroupList()

  // 获取是否授权抖店
  function getHaveStore() {
    queryAllShop()
      .then(res => {
        if (res.code === 0) {
          searchComponents.value[1].selects = res.data || []
        }
      })
      .catch(() => {})
  }
  getHaveStore()
  function getList() {
    const data = getQuery(searchComponents.value, ['startTime', 'endTime'])
    data.startTime = data.startTime.split(' ')[0]
    data.endTime = data.endTime.split(' ')[0]
    data.orderSetting = ''
    data.pageNo = tableForm.page.index
    data.pageSize = tableForm.page.size
    data.searchCount = true
    getListReport(data)
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

  const fullscreenLoading = ref(false)
  const dialogVisible = ref(false)
  const exportMessage = ref('')
  const url = ref('')
  const isWeChat = ref(true)
  isWeChat.value = localStorage.getItem('isWeChat') === '1'

  function exportReportFun() {
    // fullscreenLoading.value = true
    const data = getQuery(searchComponents.value, ['startTime', 'endTime'])
    data.startTime = data.startTime.split(' ')[0]
    data.endTime = data.endTime.split(' ')[0]
    data.orderSetting = ''
    data.pageNo = 1
    data.searchCount = true
    if (vm) {
      vm.appContext.config.globalProperties.$tracking.clickBtn(109)
    }
    // if (!isWeChat.value) {
    //   return exportFileV2(exportReportV2, data)
    //     .then(res => {
    //       fullscreenLoading.value = false
    //       // if (res.code === 0) {
    //       //   dialogVisible.value = true
    //       //   url.value = res.data
    //       //   exportMessage.value = '导出成功，点击查看按钮'
    //       // }
    //     })
    //     .catch(res => {
    //       fullscreenLoading.value = false
    //     })
    // } else {
    return exportFileV2(exportReportExcelV2, data, '商品销售报表', 'xlsx')
      .then(() => {
        fullscreenLoading.value = false
      })
      .catch(() => {
        fullscreenLoading.value = false
      })
    // }
  }
  function confirmClick() {
    window.open(url.value, '_blank')
  }
  return {
    searchComponents,
    tableForm,
    getList,
    exportReportFun,
    confirmClick,
    exportMessage,
    dialogVisible,
    fullscreenLoading
  }
}
