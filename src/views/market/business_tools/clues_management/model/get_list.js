/**
 * 获取抖店商品列表数据
 */
import { reactive, onMounted } from 'vue'
// import { throttle } from '@/utils/tools.js'
import {
  getAdministrativeZoning,
  getListAppointmentOrderByPage,
  exportAppointmentOrderListV2
} from '@/api/market/business_tools.js'
import { getQuery } from '@/utils/get_query'
import { exportFileV2 } from '@/utils/exportFile'

export function pageList() {
  const provinces = ref([]) // 省市区
  // 筛选条件
  const searchComponents = ref([
    {
      type: 'input',
      label: '线索手机',
      val: '',
      placeholder: '请输入线索手机',
      filed: 'cluePhone'
    },
    {
      type: 'cascader',
      label: '线索地区',
      val: [],
      placeholder: '请选择线索地区',
      filed: 'clueAdress',
      options: provinces,
      props: {
        expandTrigger: 'click',
        checkStrictly: false,
        value: 'name',
        label: 'name',
        children: 'childList'
      }
    },
    {
      type: 'select',
      label: '来源载体',
      placeholder: '请选择来源类型',
      filed: 'originType',
      val: null,
      defaultVal: null,
      selects: [
        {
          label: '全部',
          value: null
        },
        {
          label: '视频',
          value: 1
        },
        {
          label: '直播',
          value: 2
        }
      ]
    },
    {
      type: 'dateRange', // 组件类型
      label: '留资时间', // label展示
      disabledDate(time) {
        return time.getTime() > Date.now()
      }, // 禁用日期
      defaultVal: [new Date(new Date().setDate(new Date().getDate() - 6)), new Date()],
      val: [new Date(new Date().setDate(new Date().getDate() - 6)), new Date()], // 默认是近七天的数据
      placeholder: ['开始时间', '结束时间'],
      isDisEdit: true,
      filed: 'dateRange' // 查询字段名
    },
    {
      type: 'input',
      label: '关联任务',
      val: '',
      placeholder: '请输入任务标题',
      filed: 'taskName'
    },
    {
      type: 'input',
      label: '关联员工',
      val: '',
      placeholder: '请输入员工姓名、手机号',
      filed: 'userNameOrPhone'
    },
    {
      type: 'input',
      label: '关联矩阵号',
      val: '',
      placeholder: '请输入矩阵号',
      filed: 'dyName'
    }
  ])
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
  // tab
  const chooseTab = ref('whole')
  const tabList = ref([
    {
      name: 'whole',
      label: '全部'
    },
    {
      name: 'confirm',
      label: '待确认'
    },
    {
      name: 'stocking',
      label: '备货中'
    },
    {
      name: 'send',
      label: '已发送'
    },
    {
      name: 'complete',
      label: '已完成'
    },
    {
      name: 'cancel',
      label: '已取消'
    },
    {
      name: 'sale',
      label: '售后中'
    }
  ])
  // 获取线索列表数据
  function getList(origin) {
    // 处理请求参数
    const data = getQuery(searchComponents.value)
    if (origin !== 'export') {
      tableForm.loading = true
    }
    // startTime: +new Date(data.liveStartTimeFrom) / 1000,
    // endTime: +new Date(data.liveStartTimeTo) / 1000,
    const position = data.clueAdress.length ? data.clueAdress.join('-') : ''
    const params = {
      mobile: data.cluePhone,
      position: position,
      orderCreateBegin: data.liveStartTimeFrom,
      orderCreateEnd: data.liveStartTimeTo,
      pageNo: tableForm.page.index,
      pageSize: tableForm.page.size,
      source: data.originType,
      dyName: data.dyName,
      userNameOrPhone: data.userNameOrPhone,
      taskName: data.taskName
    }
    console.log('获取线索列表的参数', params)
    // 发送请求
    getListAppointmentOrderByPage(params)
      .then(res => {
        if (res.code === 0) {
          console.log(!!res.data.records.length)
          tableForm.listData = res.data.records || []
          tableForm.page.total = res.data.total || 0
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
  // 线索导出
  function exportFiles() {
    getList('export')
    const data = getQuery(searchComponents.value)
    const position = data.clueAdress.length ? data.clueAdress.join('-') : ''
    const params = {
      position: position,
      source: data.originType,
      orderCreateBegin: data.liveStartTimeFrom || '',
      orderCreateEnd: data.liveStartTimeTo || '',
      mobile: data.cluePhone,
      dyName: data.dyName,
      userNameOrPhone: data.userNameOrPhone,
      taskName: data.taskName
    }
    return exportFileV2(exportAppointmentOrderListV2, params, '线索信息', 'xlsx')
  }
  onMounted(() => {
    // 获取省市区
    getAdministrativeZoning().then(res => {
      provinces.value = res.data
    })
  })
  return { chooseTab, tabList, searchComponents, tableForm, getList, exportFiles }
}
