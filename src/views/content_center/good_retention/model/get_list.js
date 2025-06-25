/**
 * 获取抖店商品列表数据
 */
import { reactive } from 'vue'
import { selectList } from '@/api/content_center/good_retention.js'
import { getQuery } from '@/utils/get_query.js'
export function pageList() {
  // 筛选条件
  const searchComponents = ref([
    {
      type: 'input',
      label: '商品名称',
      val: '',
      placeholder: '请输入商品名称',
      filed: 'roomTitle'
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
      type: 'select',
      label: '商品状态',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择商品状态',
      filed: 'status2',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '抖音',
          value: 1
        },
        {
          label: '快手',
          value: 2
        },
        {
          label: '视频号',
          value: 3
        }
      ]
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
  return { chooseTab, tabList, searchComponents, tableForm, getList }
}
