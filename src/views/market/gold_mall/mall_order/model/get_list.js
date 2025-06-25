/**
 * 获取抖店商品列表数据
 */
import { reactive } from 'vue'
import {
  getOrderList,
  getExportData,
  getExportDataBatchAdd,
  modifyTrackingInfo
} from '@/api/market/gold.js'
import { getQuery } from '@/utils/get_query'
import { exportFileV2, exportFile } from '@/utils/exportFile'

export function pageList() {
  const $message = inject('$message')
  const chooseTab = ref(-1)
  // 筛选条件
  const searchComponents = ref([
    {
      type: 'input',
      label: '订单编号',
      val: '',
      placeholder: '请输入订单编号',
      filed: 'orderNumber',
      isNumber: true
    },

    {
      type: 'input',
      label: '商品名称',
      val: '',
      placeholder: '请输入商品名称',
      filed: 'shopName'
    },
    {
      type: 'select',
      label: '订单状态',
      placeholder: '请选择订单状态',
      val: chooseTab.value,
      defaultVal: -1,
      filed: 'orderStatus',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '待发货',
          value: 1
        },
        {
          label: '待核销',
          value: 3
        },
        {
          label: '已完成',
          value: 2
        }
      ]
    },
    {
      type: 'input',
      label: '联系方式',
      val: '',
      placeholder: '请输入联系方式',
      filed: 'phoneNumber'
    },
    {
      type: 'input',
      label: '客户名称',
      val: '',
      placeholder: '请输入客户名称',
      filed: 'peopleName'
    },

    {
      type: 'dateRange',
      label: '创建时间', // label展示
      val: '', // 响应式绑定
      disabledDate(time) {
        return time.getTime() > Date.now()
      }, // 禁用日期
      isDisEdit: true, // 是否禁用文本框输入
      placeholder: ['开始时间', '结束时间'],
      filed: 'orderTime' // 查询字段名
    }
  ])
  // 表格的查询条件
  const tableForm = reactive({
    loading: false,
    listData: [],
    pageIndex: 1,
    page: {
      index: 1,
      size: 10,
      sizes: [10, 20, 50],
      total: 0
    }
  })
  const dialogDate = reactive({
    showDialog: false,
    title: '填写发货信息'
  })
  const myFormRef = ref(null)
  const formInline = reactive({
    code: '',
    codeName: ''
  })
  const shopId = ref(null)

  // dialog校验规则
  const rules = {
    code: [
      { required: true, message: '请输入快递单号', trigger: 'change' },
      { pattern: '^[0-9A-Za-z]*$', message: '请输入正确的快递单号' }
    ],
    codeName: [
      { required: true, message: '请输入快递公司', trigger: 'change' },
    ]
  }
  const tabList = toRaw(searchComponents.value)[2].selects
  // 修改、发货操作
  const handleEdit = (item, key) => {
    shopId.value = item.id
    dialogDate.showDialog = true
    if (key === 'edit'){
      formInline.codeName = item.trackingCompany +''
      formInline.code = item.trackingNo +''
    }else {
      formInline.codeName = ''
      formInline.code = ''
      // myFormRef.value && myFormRef.value.resetFields()
    }
    // if (item.trackingCompany) {
    //   formInline.codeName = String(item.trackingCompany)
    // } else {
    //   myFormRef.value.resetFields()
    // }
    // if (formInline.codeName) {
    //   formInline.code = String(item.trackingNo)
    // } else {
    //   myFormRef.value.resetFields()
    // }
  }
  // dialog保存
  const saveDialog = () => {
    myFormRef.value.validate(valid => {
      console.log(valid)
      if (valid) {
        getTrackingInfo()
        dialogDate.showDialog = false
      } else {
        dialogDate.showDialog = true
      }
    })
  }
  // dialog取消
  const cancelDialog = () => {
    dialogDate.showDialog = false
    myFormRef.value.resetFields()
  }
  async function getTrackingInfo() {
    const res = await modifyTrackingInfo({
      id: shopId.value,
      trackingNo: formInline.code,
      trackingCompany: formInline.codeName
    })
    if (res.success) {
      $message.success('发货成功')
      getList()
    }
  }
  // table分页接口
  async function getList() {
    tableForm.loading = true
    const data = getQuery(searchComponents.value)
    chooseTab.value = data.orderStatus === null ? -1 : data.orderStatus
    const params = {
      pageNo: tableForm.page.index,
      pageSize: tableForm.page.size,
      id: data.orderNumber,
      goodsName: data.shopName,
      name: data.peopleName,
      telephone: data.phoneNumber,
      deliverStatus: data.orderStatus,
      createBeginTime: data.liveStartTimeFrom,
      createEndTime: data.liveStartTimeTo
    }
    const res = await getOrderList(params)
    if (res.success) {
      tableForm.listData = res.data.records
      tableForm.page.total = res.data.total
      tableForm.loading = false
    }
  }
  // 导出文件
  function exportFiles() {
    const data = getQuery(searchComponents.value)
    chooseTab.value = data.orderStatus === null ? -1 : data.orderStatus
    const params = {
      id: data.orderNumber,
      goodsName: data.shopName,
      name: data.peopleName,
      telephone: data.phoneNumber,
      deliverStatus: data.orderStatus,
      createBeginTime: data.liveStartTimeFrom,
      createEndTime: data.liveStartTimeTo
    }
    return exportFileV2(getExportData, params, '商城订单', 'xlsx')
  }
  // 批量导入的模板下载是否是可点击
  const canBatchAddExportFiles = ref(true)
  // 批量导入模板时下载模板  // 1：发货 2：核销
  function batchAddExportFiles() {
    canBatchAddExportFiles.value = false
    const data = getQuery(searchComponents.value)
    chooseTab.value = data.orderStatus === null ? -1 : data.orderStatus
    // 1：发货 导出 待发货状态 deliverStatus 为 1， 2：核销导出待核销状态 deliverStatus = 3
    const key = importData.importType === 1 ? 1 : 3
    const params = {
      id: data.orderNumber,
      goodsName: data.shopName,
      name: data.peopleName,
      telephone: data.phoneNumber,
      deliverStatus: key,
      createBeginTime: data.liveStartTimeFrom,
      createEndTime: data.liveStartTimeTo
    }
    return exportFile(getExportDataBatchAdd, params, '商城订单', 'xlsx')
      .then(() => {
        canBatchAddExportFiles.value = true
      })
      .catch(() => {
        canBatchAddExportFiles.value = true
      })
  }
  // key = 1 批量发货 key = 2 批量核销
  const openImportDialog = (key) => {
    if (key === 1) {
      importData.title = '批量发货'
      importData.subTitle = '批量发货操作流程'
    } else {
      importData.title = '批量核销'
      importData.subTitle = '批量核销操作流程'
    }
    importData.importType = key
    importData.showImport = true
    canBatchAddExportFiles.value = true
  }

  const importData = reactive({
    showImport: false,
    title: '批量发货',
    subTitle: '批量发货操作流程',
    importType: 1 // 1：发货 2：核销
  })
  return {
    chooseTab,
    tabList,
    searchComponents,
    tableForm,
    getList,
    dialogDate,
    handleEdit,
    saveDialog,
    cancelDialog,
    rules,
    formInline,
    myFormRef,
    exportFiles,
    batchAddExportFiles,
    canBatchAddExportFiles,
    openImportDialog,
    importData
  }
}
