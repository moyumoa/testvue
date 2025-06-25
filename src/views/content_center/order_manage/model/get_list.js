/**
 * 获取抖店商品列表数据
 */
import { reactive } from 'vue'
import { getShopOrderParent } from '@/api/content_center/order_manage.js'
import { getQuery } from '@/utils/get_query.js'
import { queryAllShop } from '@/api/content_center/good_store.js'

const shopList = ref([]) // 店铺列表
const loading = ref(true) // 加载动画
// 获取是否授权抖店
function getHaveStore() {
  queryAllShop()
    .then(res => {
      if (res.code === 0) {
        const list = res.data || []
        list.unshift({
          shopName: '全部',
          shopId: -1
        })
        shopList.value = list
      }
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

export function pageList() {
  const chooseTab = ref('-1')

  // 筛选条件
  const searchComponents = ref([
    {
      type: 'input',
      label: '订单编号',
      val: '',
      placeholder: '请输入订单编号',
      filed: 'orderNumber'
    },
    {
      type: 'dateRange',
      label: '下单时间', // label展示
      val: '', // 响应式绑定
      disabledDate(time) {
        return time.getTime() > Date.now()
      }, // 禁用日期
      isDisEdit: true, // 是否禁用文本框输入
      placeholder: ['开始时间', '结束时间'],
      filed: 'orderTime' // 查询字段名
    },
    {
      type: 'select',
      label: '订单状态',
      placeholder: '请选择订单状态',
      val: chooseTab.value,
      defaultVal: '-1',
      filed: 'orderStatus',
      selects: [
        {
          label: '全部',
          value: '-1'
        },
        {
          label: '待支付',
          value: '1'
        },
        {
          label: '备货中',
          value: '2'
        },
        {
          label: '已发货',
          value: '3'
        },
        {
          label: '已取消',
          value: '4'
        },
        {
          label: '已完成',
          value: '5'
        }
      ]
    },
    {
      type: 'select',
      label: '店铺名称',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择店铺名称',
      filed: 'shopId',
      selectDefultName: ['shopId', 'shopName'],
      selects: shopList
    }
  ])
  // 表格的查询条件
  const tableForm = reactive({
    loading: false,
    listData: [],
    page: {
      index: 1,
      size: 5,
      total: 0
    }
  })

  const tabList = toRaw(searchComponents.value)[2].selects

  const page = reactive({ index: 1, size: 5 })

  const pageIndex = ref(1)
  async function getList() {
    tableForm.loading = true
    const data = getQuery(searchComponents.value)
    chooseTab.value = data.orderStatus === null ? '-1' : data.orderStatus
    const params = {
      biz: null,
      createTimeEnd: data.liveStartTimeTo || null,
      createTimeStart: data.liveStartTimeFrom || null,
      orderId: data.orderNumber || null,
      orderSetting: null,
      orderStatus:
        Number(data.orderStatus) === -1 || Number(data.orderStatus) === 0
          ? null
          : Number(data.orderStatus),
      pageNo: page.index,
      pageSize: page.size,
      searchCount: true,
      shopId: data.shopId ? Number(data.shopId) : null
    }
    const res = await getShopOrderParent(params)
    if (res.success) {
      tableForm.listData = res.data.records
      tableForm.page.total = res.data.total
      tableForm.loading = false
    }
  }
  return {
    chooseTab,
    tabList,
    searchComponents,
    tableForm,
    getList,
    page,
    pageIndex,
    getHaveStore,
    shopList
  }
}
