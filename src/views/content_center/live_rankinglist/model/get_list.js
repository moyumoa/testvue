/**
 * 获取直播中心列表数据
 */
import dayjs from 'dayjs'
import { reactive } from 'vue'
import { isEmpty, wanSliceFormat } from '@/utils/tools.js'

import { useStore } from 'vuex'
import {
  getroomRanking,
  getRoomRankingStatisticsData
  // getGroupList
} from '@/api/content_center/rank.js'
import { getUserGroup } from '@/api/market/operate_analysis.js'
export function pageList() {
  const store = useStore()
  const brandViewMode = computed(() => store.state.user.brandViewMode)
  // search部分
  // 获取组织结构

  const timePicker = ref(1)
  const research = reactive({
    time: [], // 直播带货榜的时间选择器
    department: null,
    groupId: [], // 分组
    xuserNickname: '' // 矩阵号昵称
  })
  const timeselect = reactive({
    type: 'daterange',
    valueformat: 'YYYY-MM-DD HH:mm:ss',
    format: 'YYYY-MM-DD'
  })
  // 周月日选择
  function changeTimeType() {
    if (timePicker.value === 1) {
      timeselect.type = 'daterange'
      timeselect.format = 'YYYY-MM-DD'
      nextTick(() => {
        research.time = [
          dayjs(new Date()).subtract(1, 'day').format('YYYY-MM-DD 00:00:00'),
          dayjs(new Date()).subtract(1, 'day').format('YYYY-MM-DD 23:59:59')
        ]
      })
    } else if (timePicker.value === 2) {
      research.time = dayjs(new Date()).startOf('week').format('YYYY-MM-DD 00:00:00')
      timeselect.type = 'week'
      timeselect.format = 'YYYY[年][第]w[周]'
    } else {
      research.time = dayjs(new Date()).startOf('month').format('YYYY-MM-DD 00:00:00')

      timeselect.type = 'month'
      timeselect.format = 'YYYY[年]MM[月]'
    }
  }
  // 时间选择
  function sureTime() {
    if (timePicker.value === 1) {
      research.startDate = research.time[0]
      research.endDate = dayjs(research.time[1]).format('YYYY-MM-DD 23:59:59')
    } else if (timePicker.value === 2) {
      research.startDate = dayjs(research.time).startOf('week').format('YYYY-MM-DD HH:mm:ss')
      research.endDate = dayjs(research.time).endOf('week').format('YYYY-MM-DD 23:59:59')
    } else {
      research.startDate = research.time
      research.endDate = dayjs(research.time).endOf('month').format('YYYY-MM-DD 23:59:59')
    }
  }
  // 矩阵号分组
  const userGroupOptions = ref([])
  const getUserGroupInfo = () => {
    getUserGroup({}).then(res => {
      if (res.code === 0) {
        userGroupOptions.value = res.data
      }
    })
  }
  // 查询
  function queryList() {
    tableForm.loading = true
    const data = {}
    // 处理矩阵号分组
    let groupId = []
    groupId = groupId.concat(isEmpty(research.groupId) ? [] : research.groupId)
    // 矩阵号类型 与 分组可能重复需要去重复
    groupId = [...new Set(groupId.map(item => +item))]
    sureTime()
    data.startDate = research.startDate
    data.endDate = research.endDate
    data.groupIds = groupId
    data.areaIds = research.department || []
    data.liveRankingType = chooseTab.value
    data.pageNo = tableForm.page.index
    data.pageSize = tableForm.page.size
    // data.platform = research.platform
    data.xuserNickname = research.xuserNickname
    getRoomRankingStatisticsData(data).then(res => {
      if (res.code === 0) {
        if (chooseHeaderTab.value === 'LiveTapeList') {
          Goodslist.forEach(item => {
            switch (item.name) {
              case '直播场次':
                item.count = wanSliceFormat(res.data.liveTimes)
                break
              case '直播销售额':
                item.count = '￥' + res.data.salesMoney / 100
                break
              case '直播销售量':
                item.count = wanSliceFormat(res.data.salesGoods)
                break
              default:
                break
            }
          })
        } else {
          Popularitylist.forEach(item => {
            switch (item.name) {
              case '直播场次':
                item.count = wanSliceFormat(res.data.liveTimes)
                break
              case '观看人次':
                item.count = wanSliceFormat(res.data.watchTimes)
                break
              case '涨粉数':
                item.count = wanSliceFormat(res.data.fansAddNum)
                break
              case '点赞数':
                item.count = wanSliceFormat(res.data.diggNum)
                break
              case '线索数':
                item.count = wanSliceFormat(res.data.clueCnt)
                break
              default:
                break
            }
          })
        }
      }
    })
    getroomRanking(data)
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

  const chooseDeptSearchRef = ref()
  // 清空查询参数
  function clearSearchQuery() {
    tableForm.loading = true
    tableForm.page.index = 1
    tableForm.page.size = 10
    for (const key in research) {
      research[key] = null
    }
    chooseDeptSearchRef.value?.clearFun()
    changeTimeType()
  }
  // 查询
  function resetTab() {
    if (chooseHeaderTab.value === 'LivePopularityList') {
      chooseTab.value = 4
    } else {
      chooseTab.value = 5
    }
    reset()
  }
  // 重置
  function reset() {
    clearSearchQuery()
    nextTick(() => {
      queryList()
    })
  }
  function searchList() {
    tableForm.loading = true
    tableForm.page.index = 1
    tableForm.page.size = 10

    nextTick(() => {
      queryList()
    })
  }
  const Goodslist = reactive([
    {
      name: '直播场次',
      count: 0
    },
    {
      name: '直播销售额',
      count: 0
    },
    {
      name: '直播销售量',
      count: 0
    }
  ])

  const Popularitylist = reactive([
    {
      name: '直播场次',
      count: 0
    },
    {
      name: '观看人次',
      count: 0
    },
    {
      name: '涨粉数',
      count: 0
    },
    {
      name: '点赞数',
      count: 0
    },
    {
      name: '线索数',
      count: 0
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
  const chooseTab = ref(5)
  const chooseHeaderTab = ref('LiveTapeList')

  const tabList = ref([
    {
      name: 5,
      label: '销售额排序'
    },
    {
      name: 6,
      label: '销量排序'
    }
  ])
  const populartabList = ref([
    {
      name: 4,
      label: '人气峰值'
    },
    {
      name: 1,
      label: '观看人次'
    },
    {
      name: 2,
      label: '涨粉数'
    },
    {
      name: 3,
      label: '点赞数'
    },
    {
      name: 7,
      label: '线索数'
    }
  ])
  function initTab() {
    if (brandViewMode.value === 1) {
      chooseHeaderTab.value = 'LiveTapeList'
      chooseTab.value = 5
    } else {
      chooseHeaderTab.value = 'LivePopularityList'
      chooseTab.value = 4
    }
    timePicker.value = 1
  }
  onMounted(() => {
    initTab()
    clearSearchQuery()
  })
  //
  const menuOfKeepAlive = inject('$menuOfKeepAlive')
  onActivated(() => {
    // GroupList()
    getUserGroupInfo()
    if (menuOfKeepAlive('judge')) {
      initTab()

      reset()
    } else {
      nextTick(() => {
        queryList()
      })
    }
  })
  // 选中的矩阵号部门数据
  function onChangeDepartment(e) {
    research.department = e || null
  }
  return {
    chooseDeptSearchRef,
    onChangeDepartment,
    resetTab,
    chooseHeaderTab,
    Goodslist,
    Popularitylist,
    timeselect,
    timePicker,
    research,
    chooseTab,
    tabList,
    tableForm,
    userGroupOptions,
    getUserGroupInfo,
    populartabList,
    changeTimeType,
    sureTime,
    queryList,
    searchList,
    reset
  }
}
