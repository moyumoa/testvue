/**
 * 获取抖店商品列表数据
 */
import { isNotEmpty } from '@/utils/tools'
import { reactive } from 'vue'
import { queryClues, exportClues } from '@/api/content_center/clue_manage.js'
import { getQuery } from '@/utils/get_query.js'
import { exportFileV2 } from '@/utils/exportFile'
import api from '@/api/content_center/content_matrix.js'
import { setBusinessChooseParam } from '@/utils/search.js'

export function pageList() {
  // 筛选条件
  const searchComponents1 = ref([
    {
      type: 'input',
      label: '线索手机',
      val: '',
      placeholder: '请输入线索手机',
      filed: 'cluePhone'
    },
    {
      type: 'input',
      label: '线索地区',
      val: '',
      placeholder: '请输入线索地区',
      filed: 'clueAdress'
    },
    // {
    //   type: 'select',
    //   label: '来源载体',
    //   placeholder: '请选择线索来源',
    //   filed: 'clueOrigin',
    //   val: -1,
    //   defaultVal: -1,
    //   selects: [
    //     {
    //       label: '全部',
    //       value: -1
    //     },
    //     {
    //       label: '小程序',
    //       value: 2
    //     },
    //     {
    //       label: '经营工具',
    //       value: 1
    //     }
    //   ]
    // },
    {
      type: 'select',
      label: '线索来源',
      placeholder: '请选择线索来源',
      filed: 'originType',
      val: -1,
      defaultVal: -1,
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '视频',
          value: 0
        },
        {
          label: '直播',
          value: 1
        },
        {
          label: '私信',
          value: 2
        },
        {
          label: '私信（矩阵获客）',
          value: 4
        },
        {
          label: '其他',
          value: 3
        }
      ]
    },
    {
      type: 'select',
      label: '分组',
      placeholder: '请选择分组',
      filed: 'groupIds',
      multiple: true,
      filterable: true,
      'collapse-tags': true,
      val: null,
      selects: [],
      selectDefultName: ['id', 'groupName']
    },
    {
      type: 'input',
      label: '来源矩阵号',
      val: '',
      placeholder: '请输入来源矩阵号',
      filed: 'containPeople'
    },
    {
      type: 'chooseDept',
      label: '矩阵号部门',
      val: [],
      filed: 'areaIds',
      multiple: true,
      isUsePermission: true
    },
    {
      type: 'dateRange', // 组件类型
      label: '留资时间', // label展示
      defaultVal: [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()],
      val: [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()], // 默认是近七天的数据
      placeholder: ['开始时间', '结束时间'],
      isDisEdit: true, // 是否禁用文本框输入
      disabledDate(time) {
        return time.getTime() > Date.now()
      }, // 禁用日期
      filed: 'dateRange' // 查询字段名
    },
    {
      type: 'newLabelFilter',
      behavior: '过滤',
      choseName: '关键词',
      label: '智能过滤',
      val: [],
      placeholder: '请输入标签关键词',
      filed: 'filterTags'
    }
  ])
  const searchComponents = ref(searchComponents1.value)
  // 因为有涉及到KeepAlive，所以就先复制一份，后续可用
  const initSearch = function () {
    const list = setBusinessChooseParam()
    searchComponents.value = searchComponents.value.concat(list)
  }
  initSearch()
  // if (!hasDyPro()) {
  //   searchComponents.value.splice(2, 1)
  // }
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
  const isExport = ref(false)
  const message = inject('$message')
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
  // 列表数据
  function getList(origin) {
    const data = getQuery(searchComponents.value)
    if (origin !== 'export') {
      tableForm.loading = true
    }
    const params = {
      addr: data.clueAdress,
      nikename: data.containPeople,
      startTime: +new Date(data.liveStartTimeFrom) / 1000,
      endTime: +new Date(data.liveStartTimeTo) / 1000,
      orderSetting: '',
      pageNo: tableForm.page.index,
      pageSize: tableForm.page.size,
      searchCount: true,
      soruceCarrierType: data.originType,
      sourceType: data.clueOrigin,
      tell: data.cluePhone,
      groupIds: data.groupIds,
      filterTags: data.filterTags,
      areaIds: data.areaIds
    }
    if (isNotEmpty(data.businessQueryParams)) {
      params.businessQueryParams = data.businessQueryParams
    }
    queryClues(params)
      .then(res => {
        if (res.code === 0) {
          isExport.value = !!res.data.records.length
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
  const exportFiles = () => {
    getList('export')
    const data = getQuery(searchComponents.value)
    const params = {
      addr: data.clueAdress,
      sourceType: data.clueOrigin || '',
      endTime: +new Date(data.liveStartTimeTo) / 1000 || '',
      startTime: +new Date(data.liveStartTimeFrom) / 1000 || '',
      tell: data.cluePhone,
      nikename: data.containPeople,
      soruceCarrierType: data.originType || '',
      groupIds: data.groupIds,
      filterTags: data.filterTags,
      areaIds: data.areaIds
    }
    if (isNotEmpty(data.businessQueryParams)) {
      params.businessQueryParams = data.businessQueryParams
    }
    if (isExport.value) {
      return exportFileV2(exportClues, params, '线索信息', 'xlsx')
    } else {
      message.warning('当前无订单数据，不可导出')
    }
    // return new Promise((resolve, reject) => {})
  }
  // 分组
  function getNewGroupList() {
    api.getNewGroupList({}).then(res => {
      if (res.code === 0) {
        searchComponents.value.find(item => item.filed === 'groupIds').selects = res.data || []
      }
    })
  }
  return {
    chooseTab,
    tabList,
    searchComponents,
    searchComponents1,
    tableForm,
    getList,
    exportFiles,
    isExport,
    getNewGroupList
  }
}
