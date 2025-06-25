/**
 * 获取直播中心列表数据
 */
import dayjs from 'dayjs'
import { reactive } from 'vue'
import { isEmpty } from '@/utils/tools.js'

import {
  getvideoRanking,
  getListVideo
  // getGroupList
} from '@/api/content_center/rank.js'
import { useStore } from 'vuex'
import { getUserGroup } from '@/api/market/operate_analysis.js'
export function pageList() {
  // search部分
  // 获取组织结构
  const store = useStore()
  const brandViewMode = computed(() => store.state.user.brandViewMode)

  const timePicker = ref(1)
  const research = reactive({
    time: [],
    timeByLivePopularity: [], // 直播人气榜的时间
    timeType: 1, // 1 按照视频发布时间 2 按照数据产生时间
    brandId: null,
    // contentType: null,
    // accountType: null,
    department: null,
    platform: null,
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
  // 所属平台
  const platformOptions = reactive([
    {
      label: '全部',
      value: null
    },
    {
      label: '抖音',
      value: 1
    },
    {
      label: '视频号',
      value: 2
    },
    {
      label: '小红书',
      value: 3
    },
    {
      label: '快手',
      value: 4
    }
  ])
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
    data.videoRankingType = chooseTab.value
    data.pageNo = tableForm.page.index
    data.pageSize = tableForm.page.size
    data.platform = research.platform
    data.xuserNickname = research.xuserNickname
    // 视频人气排行榜用自己的时间
    if (chooseHeaderTab.value === 'VideoPopularityList') {
      console.log('meiyoudjdj')
      data.startDate = research.timeByLivePopularity[0]
      data.endDate = dayjs(research.timeByLivePopularity[1]).format('YYYY-MM-DD 23:59:59')
    }
    // 视频人气榜 timeType === 1 换一个接口
    if (chooseHeaderTab.value === 'VideoPopularityList' && research.timeType === 1) {
      data.maxCreateTime = new Date(data.endDate.replace(/-/g, '/')).getTime()
      data.minCreateTime = new Date(data.startDate.replace(/-/g, '/')).getTime()
      data.sortType =
        populartabList.value.find(item => chooseTab.value === item.name)?.sortType ||
        'DESC:create_time '
      data.nickname = data.xuserNickname
      delete data.startDate
      delete data.endDate
      getListVideo(data)
        .then(res => {
          if (res.code === 0) {
            tableForm.listData = res.data.records || []
            tableForm.page.total = res.data.total || 0

            tableForm.listData = tableForm.listData.map(item => {
              return {
                ...item,
                dyItemId: item.itemId,
                itemTitle: item.title,
                videoShareUrl: item.shareUrl
              }
            })
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
    } else {
      getvideoRanking(data)
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
    // 重置 直播人气榜单的参数
    research.timeByLivePopularity = [
      dayjs(new Date()).subtract(1, 'day').format('YYYY-MM-DD 00:00:00'),
      dayjs(new Date()).subtract(1, 'day').format('YYYY-MM-DD 23:59:59')
    ]
    research.timeType = 1
    chooseDeptSearchRef.value?.clearFun()
    changeTimeType()
  }
  // 切换
  function resetTab() {
    if (chooseHeaderTab.value === 'VideoPopularityList') {
      chooseTab.value = 1
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
  const chooseHeaderTab = ref('VideoTapeList')

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
      name: 1,
      label: '播放数排序',
      sortType: 'DESC:play_count'
    },
    {
      name: 2,
      label: '点赞数排序',
      sortType: 'DESC:digg_count '
    },
    {
      name: 3,
      label: '评论数排序',
      sortType: 'DESC:comment_count'
    },
    {
      name: 4,
      label: '分享数排序',
      sortType: 'DESC:share_count'
    },
    {
      name: 7,
      label: '线索数排序',
      sortType: 'DESC:clue_cnt'
    }
  ])

  function initTab() {
    if (brandViewMode.value === 1) {
      chooseTab.value = 5
      chooseHeaderTab.value = 'VideoTapeList'
    } else {
      chooseTab.value = 1
      chooseHeaderTab.value = 'VideoPopularityList'
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
    reset,
    platformOptions
  }
}
