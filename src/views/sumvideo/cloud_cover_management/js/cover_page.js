import { getQuery } from '@/utils/get_query'
import { coverPage } from '@/api/sumvideo/cloud_cover_management.js'
import { throttle } from '@/utils/tools'
import { useRouter } from 'vue-router'
export default function queryCoverList(origin) {
  const router = useRouter()
  // 筛选条件
  const searchComponents = ref([
    {
      type: 'input',
      label: '封面名称',
      val: '',
      placeholder: '请输入封面名称',
      filed: 'name'
    },
    {
      type: 'dateRange', // 组件类型
      label: '创建时间', // label展示
      val: '', // 响应式绑定
      isDisEdit: true, // 是否禁用文本框输入
      placeholder: ['开始时间', '结束时间'],
      disabledDate(time) {
        return time.getTime() > Date.now()
      }, // 禁用时间
      filed: 'dataTime' // 查询字段名
    },
    {
      hiddenItem: origin !== 'cover_management',
      type: 'select',
      label: '封面来源',
      placeholder: '请选择封面来源',
      filed: 'coverType',
      val: null,
      defaultVal: null,
      selects: [
        {
          label: '云封面',
          value: 1
        },
        {
          label: '企业封面',
          value: 2
        }
      ]
    }
  ])
  // 表格筛选
  const tableForm = reactive({
    tabIndex: 0,
    loading: false,
    listData: [],
    page: {
      index: 1,
      size: 32,
      total: 0
    }
  })
  // 查询
  function searchList() {
    tableForm.loading = true
    tableForm.page.index = 1
    getList()
  }
  // 重置
  function resetSearch() {
    tableForm.loading = true
    tableForm.page.index = 1
    tableForm.page.size = 32
    getList()
  }
  // 图片列表的滚动事件
  function loadSwiperFun() {
    tableForm.loading = true
    tableForm.page.index++
    getList()
  }
  function getList() {
    const param = getQuery(searchComponents.value, ['createTimeStart', 'createTimeEnd'])
    // 如果是云封面管理，默认covertype=1
    if (origin === 'cloud_cover_management') {
      param.coverType = 1
      param.backgroundSizes = [1, 2, 3, 4]
    }
    param.pageNo = tableForm.page.index
    param.pageSize = tableForm.page.size
    console.log(param, 'param')
    coverPage(param)
      .then(res => {
        if (res.code === 0) {
          if (tableForm.page.index === 1) {
            tableForm.listData = res.data.records || []
            tableForm.page.total = res.data.total || 0
          } else {
            const newListData = res.data.records || []
            tableForm.listData = tableForm.listData.concat(newListData)
          }
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

  // 模板保存之后需要更新单条数据
  function updateOneInfo(i, id, updateType) {
    coverPage({
      pageNo: 1,
      pageSize: tableForm.page.size,
      id: id
    })
      .then(res => {
        if (res.code === 0) {
          const data =
            res.data && res.data.records && res.data.records.length > 0 ? res.data.records : []
          if (data && data.length > 0) {
            tableForm.listData[i] = data[0]
          }
        }
      })
      .catch(() => {})
  }
  // 新建封面
  const createCoverFun = throttle(() => {
    router.push({
      path: `/sumwhy_video/${origin}/detail`,
      query: {
        origin: origin
      }
    })
  }, 500)
  return {
    searchComponents,
    tableForm,
    searchList,
    resetSearch,
    loadSwiperFun,
    getList,
    updateOneInfo,
    createCoverFun
  }
}
