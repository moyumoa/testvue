import { reactive } from 'vue'
import { getQuery } from '@/utils/get_query.js'
import {
  guestOrderList,
  exportClues,
  getCouponsPage,
  exportCoupons
} from '@/api/content_center/content_guest_data.js'
import { exportFileV2 } from '@/utils/exportFile'
import Track from '@/utils/tracking'
import { ElMessage } from 'element-plus'
import { setBusinessChooseParam } from '@/utils/search.js'
import api from '@/api/content_center/content_matrix'

export function pageList(origin = 'order') {
  // 筛选条件
  const searchComponents = ref([
    {
      type: 'input',
      label: '订单编号',
      val: '',
      placeholder: '请输入团购订单编号',
      filed: 'orderId'
    },
    {
      type: 'dateRange',
      label: '订单创建时间',
      defaultVal: [new Date(new Date().setDate(new Date().getDate() - 6)), new Date()],
      val: [new Date(new Date().setDate(new Date().getDate() - 6)), new Date()], // 默认是近七天的数据
      disabledDate(time) {
        return time.getTime() > Date.now()
      }, // 禁用日期
      isDisEdit: true, // 是否禁用文本框输入
      placeholder: ['开始时间', '结束时间'],
      filed: 'dateRange'
    },
    {
      type: 'select',
      label: '订单状态',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择订单状态',
      filed: 'orderStatus',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '初始化',
          value: 0
        },
        {
          label: '待支付',
          value: 100
        },
        {
          label: '支付取消',
          value: 101
        },
        {
          label: '已支付',
          value: 200
        },
        {
          label: '待使用',
          value: 201
        },
        {
          label: '已完成',
          value: 1
        }
      ]
    },
    {
      type: 'select',
      label: '子订单状态',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择子订单状态',
      filed: 'itemStatus',
      selects: [
        {
          label: '全部',
          value: -1
        },
        // {
        //   label: '初始化',
        //   value: 0
        // },
        {
          label: '未核销',
          value: 100
        },
        {
          label: '申请退款中',
          value: 300
        },
        {
          label: '已退款',
          value: 301
        },
        {
          label: '已核销',
          value: 401
        }
      ]
    },
    {
      hiddenItem: origin === 'order',
      type: 'input',
      label: '商品信息',
      val: '',
      placeholder: '请输入商品名称',
      filed: 'certificateName'
    },
    {
      type: 'input',
      label: '来源商家',
      val: '',
      placeholder: '请输入来源商家名称',
      filed: 'name'
    },
    {
      type: 'select',
      label: '来源渠道',
      val: null,
      defaultVal: null,
      placeholder: '请选择来源渠道',
      filed: 'saleChannel',
      multiple: true,
      'collapse-tags': true,
      'collapse-tags-tooltip': true,
      selects: [
        {
          label: '短视频',
          value: '短视频'
        },
        {
          label: '直播',
          value: '直播'
        },
        {
          label: '线下扫码',
          value: '线下扫码'
        },
        {
          label: '职人主页',
          value: '职人主页'
        },
        {
          label: '站外推广',
          value: '站外推广'
        },
        {
          label: '私信',
          value: '私信'
        },
        {
          label: '其他',
          value: '其他'
        }
      ]
    },
    {
      type: 'input',
      label: '来源矩阵号',
      val: '',
      placeholder: '请输入矩阵号昵称',
      filed: 'dyNickname'
    },
    {
      hiddenItem: origin === 'order',
      type: 'select',
      label: '矩阵号分组',
      placeholder: '请选择矩阵号分组',
      filed: 'groupIds',
      multiple: true,
      filterable: true,
      'collapse-tags': true,
      val: null,
      selects: [],
      selectDefultName: ['id', 'groupName']
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
  // 分组
  function getNewGroupList() {
    api.getNewGroupList({}).then(res => {
      if (res.code === 0) {
        searchComponents.value.find(item => item.filed === 'groupIds').selects = res.data || []
      }
    })
  }
  const initSearch = function () {
    if (origin === 'coupons') {
      getNewGroupList()
    }
    const list = setBusinessChooseParam()
    searchComponents.value = searchComponents.value.concat(list)

    const itemStatusIndex = searchComponents.value.findIndex(x => x.filed === 'itemStatus')
    if (origin === 'order' && itemStatusIndex > -1) {
      searchComponents.value.splice(itemStatusIndex, 1)
    }
    // 订单没有来源渠道
    const sourceChannelIndex = searchComponents.value.findIndex(x => x.filed === 'saleChannel')
    if (origin === 'order' && sourceChannelIndex > -1) {
      searchComponents.value.splice(sourceChannelIndex, 1)
    }

    const orderStatusIndex = searchComponents.value.findIndex(x => x.filed === 'orderStatus')
    if (origin === 'coupons' && orderStatusIndex > -1) {
      searchComponents.value.splice(orderStatusIndex, 1)
    }
  }
  initSearch()

  // 获取列表
  function getList() {
    const data = getQuery(searchComponents.value, ['createOrderStartTime', 'createOrderEndTime'])
    data.pageNo = tableForm.page.index
    data.pageSize = tableForm.page.size
    data.orderSetting = 'DESC:create_order_time'

    const queryPromise = origin === 'order' ? guestOrderList(data) : getCouponsPage(data)

    queryPromise
      .then(res => {
        if (res.code === 0) {
          tableForm.listData = res.data.records || []
          tableForm.page.total = res.data.total || 0
        }
        tableForm.loading = false
      })
      .catch(() => {
        tableForm.loading = false
      })
  }
  // 导出
  const exportFiles = () => {
    // 只能导出最近31天数据
    const orderCreateTime = searchComponents.value.find(x => x.filed === 'dateRange')
    const { val: timeChoose } = orderCreateTime
    if (!timeChoose || (timeChoose && timeChoose.length < 2)) {
      return exportErrfun()
    } else if (timeChoose && timeChoose.length === 2) {
      const start = new Date(timeChoose[0])
      const end = new Date(timeChoose[1])
      const diffTime = Math.abs(end - start) // 时间差的毫秒数
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) // 转换为天数
      console.log('相差天数', diffDays)
      if (diffDays > 30) {
        return exportErrfun()
      }
    }

    const data = getQuery(searchComponents.value, ['createOrderStartTime', 'createOrderEndTime'])
    data.orderSetting = 'DESC:create_order_time'
    const eventId = origin === 'order' ? 207 : 208
    Track.clickBtn(eventId)

    return origin === 'order'
      ? exportFileV2(exportClues, data, '团购数据-订单', 'xlsx')
      : exportFileV2(exportCoupons, data, '团购数据-券', 'xlsx')
  }
  // 导出错误，组件内没写提示，所以就没改组件
  function exportErrfun() {
    return new Promise((resolve, reject) => {
      ElMessage.warning('仅支持导出31天范围内数据，请调整时间后再提交导出')
      reject(new Error('仅支持导出31天范围内数据，请调整时间后再提交导出'))
    })
  }

  return { searchComponents, tableForm, getList, exportFiles }
}
