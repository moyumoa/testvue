/**
 * 获取直播中心列表数据
 */
import api from '@/api/content_center/content_matrix.js'
import { reactive } from 'vue'
import { getRoomList } from '@/api/content_center/live_center.js'
import { getQuery } from '@/utils/get_query.js'
import { useStore } from 'vuex'
import { setBusinessChooseParam } from '@/utils/search.js'
export function pageList() {
  const store = useStore()
  const brandViewMode = computed(() => store.state.user.brandViewMode)
  // 筛选条件
  const searchComponents1 = ref([
    {
      type: 'input',
      label: '直播标题',
      val: '',
      placeholder: '请输入直播标题',
      filed: 'roomTitle'
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
      type: 'input',
      label: '矩阵号昵称',
      val: '',
      placeholder: '请输入矩阵号昵称',
      filed: 'nickName'
    },
    // {
    //   type: 'select',
    //   label: '选择平台',
    //   val: -1,
    //   defaultVal: -1,
    //   placeholder: '请选择平台',
    //   filed: 'platform2',
    //   selects: [
    //     {
    //       label: '全部',
    //       value: -1
    //     },
    //     {
    //       label: '抖音',
    //       value: 1
    //     },
    //     {
    //       label: '快手',
    //       value: 2
    //     },
    //     {
    //       label: '视频号',
    //       value: 3
    //     }
    //   ]
    // },
    // {
    //   type: 'select',
    //   label: '矩阵号类型',
    //   val: -1,
    //   defaultVal: -1,
    //   placeholder: '请选择矩阵号类型',
    //   filed: 'xUserType',
    //   selects: [
    //     {
    //       label: '全部',
    //       value: -1
    //     },
    //     {
    //       label: '个人号',
    //       value: 1
    //     },
    //     {
    //       label: '普通企业号',
    //       value: 2
    //     },
    //     {
    //       label: '认证企业号',
    //       value: 3
    //     },
    //     {
    //       label: '品牌企业号',
    //       value: 4
    //     }
    //   ]
    // },

    {
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
    },
    {
      type: 'select',
      label: '直播状态',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择直播状态',
      filed: 'roomStatus',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '直播中',
          value: 1
        },
        {
          label: '已下播',
          value: 2
        }
      ]
    },
    {
      type: 'select',
      label: '录屏状态',
      val: -1,
      defaultVal: -1,
      placeholder: '请选择录屏状态',
      filed: 'userRecordStatus',
      selects: [
        {
          label: '全部',
          value: -1
        },
        {
          label: '开启录屏',
          value: 1
        },
        {
          label: '未开启录屏',
          value: 0
        }
      ]
    },
    {
      type: 'dateRange', // 组件类型
      label: '开播时间', // label展示
      val: '', // 响应式绑定
      disabledDate(time) {
        return time.getTime() > Date.now()
      }, // 禁用日期
      isDisEdit: true, // 是否禁用文本框输入
      placeholder: ['开始时间', '结束时间'],
      filed: 'dateRange' // 查询字段名
    }
  ])
  // 因为有涉及到KeepAlive，所以就先复制一份，后续可用
  const searchComponents = ref(searchComponents1.value)
  // 因为有涉及到KeepAlive，所以就先复制一份，后续可用
  const initSearch = function () {
    const list = setBusinessChooseParam()
    searchComponents.value = searchComponents.value.concat(list)
  }
  initSearch()
  // 分组
  function getNewGroupList() {
    api.getNewGroupList({}).then(res => {
      if (res.code === 0) {
        searchComponents.value[3].selects = res.data || []
      }
    })
  }

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

  const chooseTab = ref('live_start_time')
  const tabList = ref([
    {
      name: 'live_start_time',
      label: '默认排序',
      show: true
    },
    {
      name: 'sell_amount',
      label: '销售额排序',
      show: brandViewMode.value === 1
    },
    {
      name: 'sell_num',
      label: '销量排序',
      show: brandViewMode.value === 1
    },
    {
      name: 'watch_times',
      label: '人气数排序',
      show: true
    },
    {
      name: 'like_num',
      label: '点赞数排序',
      show: true
    },
    {
      name: 'add_fans_num',
      label: '涨粉数排序',
      show: true
    },
    {
      name: 'clue_cnt',
      label: '线索数排序',
      show: true
    }
  ])
  function getList() {
    const data = getQuery(searchComponents.value, ['liveStartTimeFrom', 'liveStartTimeTo'])
    console.log(data, 'data')
    data.liveStartTimeFrom = data.liveStartTimeFrom.split(' ')[0]
    data.liveStartTimeTo = data.liveStartTimeTo.split(' ')[0]
    data.searchCount = true
    // 线上环境是ASC开头
    data.orderSetting = 'DESC:' + chooseTab.value
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
  return {
    chooseTab,
    tabList,
    searchComponents,
    searchComponents1,
    tableForm,
    getList,
    getNewGroupList
  }
}
