import { reactive } from 'vue'
import { userClueData, exportUserClueData } from '@/api/scrm/followUp_report.js'
import { getQuery } from '@/utils/get_query.js'
import { exportFileV2 } from '@/utils/exportFile'
import Track from '@/utils/tracking/index.js'
import { setBusinessChooseParam } from '@/utils/search.js'

export function handleGetList() {
  const searchComponents = ref([
    {
      type: 'chooseDept',
      label: '组织结构',
      val: [],
      filed: 'deptIds',
      multiple: true,
      isUsePermission: true
    },

    {
      type: 'dateRange', // 组件类型
      label: '时间范围', // label展示
      defaultVal: [new Date(new Date().setDate(new Date().getDate() - 6)), new Date()],
      val: [new Date(new Date().setDate(new Date().getDate() - 6)), new Date()], // 默认是近七天的数据
      disabledDate(time) {
        return time.getTime() > Date.now()
      }, // 禁用日期
      clearable: 'false',
      isDisEdit: true,
      placeholder: ['开始时间', '结束时间'],
      filed: 'dateRange' // 查询字段名
    },
    {
      type: 'input',
      label: '成员姓名',
      val: '',
      filed: 'userName',
      placeholder: '请输入成员姓名'
    },
    {
      type: 'input',
      label: '手机号码',
      val: '',
      filed: 'phone',
      placeholder: '请输入手机号码'
    },
    {
      type: 'select',
      label: '成员状态',
      val: null,
      filed: 'isValid',
      selects: [
        {
          label: '已开启',
          value: 1
        },
        {
          label: '已禁用',
          value: 0
        }
      ]
    },
    {
      type: 'select',
      label: '成员类型',
      val: null,
      filed: 'staffType',
      selects: [
        {
          label: 'KOS成员',
          value: 1
        },
        {
          label: 'KOC成员',
          value: 2
        }
      ]
    }
  ])

  const tableForm = reactive({
    loading: false,
    listData: [],
    page: {
      index: 1,
      size: 10,
      total: 10
    }
  })
  const sortInfo = reactive({
    target: '',
    orderBy: 0
  })
  // 更新业务主体筛选项
  const initSearch = function () {
    const list = setBusinessChooseParam()
    searchComponents.value = searchComponents.value.concat(list)
  }
  initSearch()
  function getList() {
    tableForm.loading = true
    const searchForm = getQuery(searchComponents.value, ['dispatchStartTime', 'dispatchEndTime'])
    searchForm.taskTypes = searchForm.taskTypes?.map(item => JSON.parse(item)) || []
    // sortInfo
    Object.assign(searchForm, {
      pageNo: tableForm.page.index,
      pageSize: tableForm.page.size
    })
    userClueData(searchForm)
      .then(res => {
        if (res.code === 0) {
          const arr = JSON.parse(JSON.stringify(res.data.records))
          arr.forEach((item, index) => {
            item.phone = item.mobile
            if (item.orgName) {
              const depList = item.orgName.split('|')
              item.allDepList = depList
              item.depList = depList.length > 2 ? depList.slice(0, 2) : depList
            }
          })
          tableForm.listData = arr
          tableForm.page.total = res.data.total
        } else {
          tableForm.listData = []
          tableForm.page.total = 0
        }
        tableForm.loading = false
      })
      .catch(() => {
        tableForm.listData = []
        tableForm.page.total = 0
        tableForm.loading = false
      })
  }

  function handleSortChange(val) {
    sortInfo.target = val.prop || ''
    if (val.order === 'ascending') {
      sortInfo.orderBy = 1
    } else if (val.order === 'descending') {
      sortInfo.orderBy = 0
    } else {
      sortInfo.orderBy = 0
    }
    getList()
  }

  function resetSearch() {
    tableForm.page.index = 1
    tableForm.page.size = 10
    getList()
  }

  function exportData() {
    Track.clickBtn(206)
    const searchForm = getQuery(searchComponents.value, ['dispatchStartTime', 'dispatchEndTime'])
    searchForm.taskTypes = searchForm.taskTypes?.map(item => JSON.parse(item)) || []
    Object.assign(searchForm)
    return exportFileV2(exportUserClueData, searchForm, '成员跟进报表导出', 'xlsx')
  }

  getList()
  return {
    tableForm,
    searchComponents,
    sortInfo,
    getList,
    resetSearch,
    handleSortChange,
    exportData
  }
}
