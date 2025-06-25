/**
 * 获取抖店商品列表数据
 */
import { reactive } from 'vue'
import { selectSimpleList, selectList } from '@/api/content_center/good_store.js'
import { getQuery } from '@/utils/get_query.js'
export function pageList(shopList) {
  // 筛选条件
  const searchComponents = ref([
    {
      type: 'input',
      label: '商品名称',
      val: '',
      placeholder: '请输入商品名称',
      filed: 'name'
    },
    {
      type: 'select',
      label: '商品分组',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择商品分组',
      filed: 'groupsId',
      selectDefultName: ['id', 'name'],
      selects: [
        {
          id: -1,
          name: '全部'
        }
      ]
    },
    {
      type: 'select',
      label: '商品状态',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择商品状态',
      filed: 'status',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '售卖中',
          value: 0
        },
        {
          label: '未上架',
          value: 3
        },
        {
          label: '已下架',
          value: 1
        },
        {
          label: '已删除',
          value: 2
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
    },
    {
      type: 'dateRange', // 组件类型
      label: '创建时间', // label展示
      val: '', // 响应式绑定
      disabledDate(time) {
        return time.getTime() > Date.now()
      }, // 禁用日期
      isDisEdit: true, // 是否禁用文本框输入
      placeholder: ['开始时间', '结束时间'],
      filed: 'dateRange' // 查询字段名
    },
    {
      type: 'input',
      label: '货号',
      val: '',
      placeholder: '请输入货号',
      filed: 'outProductId'
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
  // 获取商品分组
  function getGroupList() {
    console.log(1212)
    selectSimpleList().then(res => {
      if (res.code === 0) {
        const list = res.data || []
        list.unshift({
          id: -1,
          name: '全部'
        })
        searchComponents.value[1].selects = list
      }
    })
  }
  getGroupList()
  // tab

  const chooseTab = ref(-1)
  const tabList = ref([
    {
      name: -1,
      label: '全部商品'
    },
    {
      name: 1,
      label: '精选商品'
    }
  ])
  function getList() {
    const data = getQuery(searchComponents.value, ['startTime', 'endTime'])
    data.searchCount = true
    data.pageNo = tableForm.page.index
    data.pageSize = tableForm.page.size
    data.featured = chooseTab.value === -1 ? null : chooseTab.value // 是否为精选榜单
    console.log(data)
    selectList(data)
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
  return { chooseTab, tabList, searchComponents, tableForm, getList, getGroupList }
}
