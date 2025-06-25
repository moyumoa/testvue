/**
 * 获取直播中心列表数据
 */
import dayjs from 'dayjs'
import { reactive } from 'vue'
import { isEmpty, wanSliceFormat } from '@/utils/tools.js'

import {
  getsalesRanking,
  getSalesRankingStatisticsData,
  getGroupList
} from '@/api/content_center/rank.js'
import { getUserGroup } from '@/api/market/operate_analysis.js'
export function pageList() {
  // search部分

  const timePicker = ref(1)
  const research = reactive({
    time: [],
    brandId: null,
    contentType: null,
    accountType: null,
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

  function GroupList() {
    getGroupList({}).then(res => {
      if (res.code === 0) {
        for (const key in res.data) {
          switch (key) {
            // case 'brandType':
            //   res.data[key].forEach(item => {
            //     item.value = item.id
            //     item.label = item.groupName
            //     brandMark.push(item)
            //   })
            //   break
            case 'contentType':
              res.data[key].forEach(item => {
                item.value = item.id
                item.label = item.groupName
                contentType.push(item)
              })
              break
            case 'xuserType':
              res.data[key].forEach(item => {
                item.value = item.id
                item.label = item.groupName
                accountType.push(item)
              })
              break
            default:
              break
          }
        }
      }
    })
  }
  GroupList()
  // // 品牌标记
  // const brandMark = reactive([
  //   {
  //     label: '全部',
  //     value: null
  //   }
  // ])

  // 内容类型
  const contentType = reactive([
    {
      label: '全部',
      value: null
    }
  ])

  // 矩阵号类型
  const accountType = reactive([
    {
      label: '全部',
      value: null
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
    // 处理矩阵号分组
    const data = {}
    let groupId = []
    // if (research.brandId) {
    //   groupId.push(research.brandId)
    // }
    // if (research.contentType) {
    //   groupId.push(research.contentType)
    // }
    if (research.accountType) {
      groupId.push(research.accountType)
    }
    groupId = groupId.concat(isEmpty(research.groupId) ? [] : research.groupId)
    // 矩阵号类型 与 分组可能重复需要去重复
    groupId = [...new Set(groupId.map(item => +item))]
    // 处理组织结构
    // const deptId = []
    // if (research.department) {
    //   console.log(research.department)
    //   research.department.forEach(ele => {
    //     console.log(ele)
    //     deptId.push(ele[ele.length - 1])
    //   })
    // }
    sureTime()
    data.startDate = research.startDate
    data.endDate = research.endDate
    data.groupIds = groupId
    data.areaIds = research.department
    data.salesRankingType = chooseTab.value
    data.pageNo = tableForm.page.index
    data.pageSize = tableForm.page.size
    data.xuserNickname = research.xuserNickname
    getSalesRankingStatisticsData({ ...data, salesRankingType: undefined }).then(res => {
      if (res.code === 0 && res.data) {
        if (chooseHeaderTab.value === 'all') {
          alllist.forEach(item => {
            switch (item.name) {
              case '销售额':
                item.count = '￥' + res.data.totalSalesMoney / 100
                break
              case '销售量':
                item.count = wanSliceFormat(res.data.totalSaleGoods)
                break
              case '涨粉数':
                item.count = wanSliceFormat(res.data.fansAddNum)
                break
              case '发布视频':
                item.count = wanSliceFormat(res.data.videoNum)
                break
              case '直播场次':
                item.count = wanSliceFormat(res.data.liveTimes)
                break
              default:
                break
            }
          })
        } else if (chooseHeaderTab.value === 'live') {
          Goodslist.forEach(item => {
            switch (item.name) {
              case '直播销售额':
                item.count = '￥' + res.data.liveSalesMoney / 100
                break
              case '直播销售量':
                item.count = wanSliceFormat(res.data.liveSalesGoods)
                break
              case '直播场次':
                item.count = wanSliceFormat(res.data.liveTimes)
                break
              default:
                break
            }
          })
        } else {
          Popularitylist.forEach(item => {
            switch (item.name) {
              case '视频销售额':
                item.count = '￥' + res.data.videoSalesMoney / 100
                break
              case '视频销售量':
                item.count = wanSliceFormat(res.data.videoSalesGoods)
                break
              default:
                break
            }
          })
        }
      }
    })
    getsalesRanking(data)
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
  // 重置
  function reset() {
    tableForm.loading = true
    tableForm.page.index = 1
    tableForm.page.size = 10
    for (const key in research) {
      research[key] = null
    }
    chooseDeptSearchRef.value?.clearFun()
    changeTimeType()
    nextTick(() => {
      queryList()
    })
  }
  const alllist = reactive([
    {
      name: '销售额',
      count: 0
    },
    {
      name: '销售量',
      count: 0
    },
    {
      name: '涨粉数',
      count: 0
    },
    {
      name: '发布视频',
      count: 0
    },
    {
      name: '直播场次',
      count: 0
    }
  ])
  const Goodslist = reactive([
    {
      name: '直播销售额',
      count: 0
    },
    {
      name: '直播销售量',
      count: 0
    },
    {
      name: '直播场次',
      count: 0
    }
  ])

  const Popularitylist = reactive([
    {
      name: '视频销售额',
      count: 0
    },
    {
      name: '视频销售量',
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
  const chooseTab = ref(3)
  const chooseHeaderTab = ref('all')
  const videoList = ref([
    {
      name: 1,
      label: '销售额排序'
    },
    {
      name: 4,
      label: '销售量排序'
    }
  ])
  const liveList = ref([
    {
      name: 2,
      label: '销售额排序'
    },
    {
      name: 5,
      label: '销售量排序'
    }
  ])
  const allList = ref([
    {
      name: 3,
      label: '销售额排序'
    },
    {
      name: 6,
      label: '销售量排序'
    },
    {
      name: 13,
      label: '涨粉数排序'
    }
  ])

  // 选中的矩阵号部门数据
  function onChangeDepartment(e) {
    research.department = e || null
  }
  return {
    chooseDeptSearchRef,
    onChangeDepartment,
    chooseHeaderTab,
    alllist,
    Goodslist,
    Popularitylist,
    timeselect,
    timePicker,
    research,
    chooseTab,
    // brandMark,
    contentType,
    accountType,
    videoList,

    tableForm,
    userGroupOptions,
    getUserGroupInfo,
    allList,
    liveList,
    changeTimeType,
    sureTime,
    queryList,
    reset
  }
}
