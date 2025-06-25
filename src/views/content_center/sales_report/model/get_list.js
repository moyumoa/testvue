import { getRoomList, exportClues } from '@/api/content_center/sales_report.js'
import { getQuery } from '@/utils/get_query.js'
import { throttle } from '@/utils/tools.js'
import { exportFile } from '@/utils/exportFile'

export function pageList(vm) {
  // 筛选条件
  const searchComponents = ref([
    {
      type: 'input',
      label: '矩阵号昵称',
      val: '',
      placeholder: '请输入矩阵号昵称',
      filed: 'nickname'
    },
    {
      type: 'date', // 组件类型
      label: '统计时间', // label展示
      val: null, // 响应式绑定
      defaultVal: null,
      clearable: false,
      disabledDate(time) {
        return time.getTime() > Date.now()
      }, // 禁用日期
      isDisEdit: true, // 是否禁用文本框输入
      placeholder: '请选择统计时间',
      filed: 'date' // 查询字段名
    }
  ])
  const nowTime = new Date()
  nowTime.setTime(nowTime - 24 * 60 * 60 * 1000)
  console.log(new Date(nowTime))
  searchComponents.value[1].val = new Date(nowTime)
  searchComponents.value[1].defaultVal = new Date(nowTime)
  // 表格的查询条件
  const tableForm = reactive({
    loading: false,
    listData: [],
    page: {
      index: 1,
      size: 10,
      total: 0
    },
    orderSetting: 'DESC:roomSalesMoneyMonth'
  })
  // 查询
  function getList() {
    const data = getQuery(searchComponents.value)
    data.date = data.date.split(' ')[0]
    data.searchCount = true
    data.orderSetting = tableForm.orderSetting
    data.pageNo = tableForm.page.index
    data.pageSize = tableForm.page.size
    getRoomList(data)
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

  // 查询
  function searchList() {
    tableForm.loading = true
    tableForm.page.index = 1
    getList()
  }
  // 排序

  function sortChange(column, prop, order) {
    if (column.prop === 'roomSalesMoney') {
      if (column.order === 'ascending') {
        tableForm.orderSetting = 'ASC:roomSalesMoney'
      } else if (column.order === 'descending') {
        tableForm.orderSetting = 'DESC:roomSalesMoney'
      } else {
        tableForm.orderSetting = ''
      }
    } else if (column.prop === 'roomSalesMoneyMonth') {
      if (column.order === 'ascending') {
        tableForm.orderSetting = 'ASC:roomSalesMoneyMonth'
      } else if (column.order === 'descending') {
        tableForm.orderSetting = 'DESC:roomSalesMoneyMonth'
      } else {
        tableForm.orderSetting = ''
      }
    } else {
      tableForm.orderSetting = ''
    }
    searchList()
  }
  // const message = inject('$message')
  // 导出
  const exportFun = throttle(() => {
    const data = getQuery(searchComponents.value)
    data.date = data.date.split(' ')[0]
    data.orderSetting = tableForm.orderSetting
    exportFile(exportClues, data, '销售报表', 'xlsx')
    if (vm) {
      vm.appContext.config.globalProperties.$tracking.clickBtn(108)
    }
  }, 700)
  return { searchComponents, tableForm, getList, exportFun, sortChange, searchList }
}
