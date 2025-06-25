/**
 * 获取直播中心列表数据
 */
import dayjs from 'dayjs'
import { reactive } from 'vue'
import { wanSliceFormat } from '@/utils/tools.js'

import {
  getliveProductRanking,
  getliveProductRankingStatistics,
  getGroupList
} from '@/api/content_center/rank.js'
export function pageList() {
  // search部分
  // 获取组织结构

  const timePicker = ref(1)
  const research = reactive({
    time: [],
    brandId: null,
    contentType: null,
    accountType: null,
    department: null
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
          dayjs(new Date()).format('YYYY-MM-DD 00:00:00'),
          dayjs(new Date()).format('YYYY-MM-DD 23:59:59')
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
      research.minLiveStartTime = research.time[0]
      research.maxLiveStartTime = dayjs(research.time[1]).format('YYYY-MM-DD 23:59:59')
    } else if (timePicker.value === 2) {
      research.minLiveStartTime = dayjs(research.time).startOf('week').format('YYYY-MM-DD HH:mm:ss')
      research.maxLiveStartTime = dayjs(research.time).endOf('week').format('YYYY-MM-DD 23:59:59')
    } else {
      research.minLiveStartTime = research.time
      research.maxLiveStartTime = dayjs(research.time).endOf('month').format('YYYY-MM-DD 23:59:59')
    }
  }
  function GroupList() {
    getGroupList({}).then(res => {
      if (res.code === 0) {
        for (const key in res.data) {
          switch (key) {
            case 'brandType':
              res.data[key].forEach(item => {
                item.value = item.id
                item.label = item.groupName
                brandMark.push(item)
              })
              break
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
  // 品牌标记
  const brandMark = reactive([
    {
      label: '全部',
      value: null
    }
  ])

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
  // 查询
  function queryList() {
    tableForm.loading = true
    const data = {}
    // 处理矩阵号分组
    const groupId = []
    if (research.brandId) {
      groupId.push(research.brandId)
    }
    if (research.contentType) {
      groupId.push(research.contentType)
    }
    if (research.accountType) {
      groupId.push(research.accountType)
    }
    // 处理组织结构
    // const deptId = []
    // if (research.department) {
    //   research.department.forEach(ele => {
    //     console.log(ele)
    //     deptId.push(ele[ele.length - 1])
    //   })
    // }
    data.groupIds = groupId
    data.deptIds = research.department
    sureTime()
    data.minLiveStartTime = research.minLiveStartTime
    data.maxLiveStartTime = research.maxLiveStartTime
    data.orderSetting = 'DESC:' + chooseTab.value
    data.pageNo = tableForm.page.index
    data.pageSize = tableForm.page.size
    getliveProductRankingStatistics(data).then(res => {
      if (res.code === 0) {
        Goodslist.forEach(item => {
          switch (item.name) {
            case '商品数量':
              item.count = wanSliceFormat(res.data.sellCnt)
              break
            case '商品销售额':
              item.count = '￥' + res.data.sellAmount / 100
              break
            case '商品销售量':
              item.count = wanSliceFormat(res.data.sellNum)
              break
            default:
              break
          }
        })
      }
    })
    getliveProductRanking(data)
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
    console.log(data)
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
  const Goodslist = reactive([
    {
      name: '商品数量',
      count: 0
    },
    {
      name: '商品销售额',
      count: 0
    },
    {
      name: '商品销售量',
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
  const chooseTab = ref('pay_amount')
  const tabList = ref([
    {
      name: 'pay_amount',
      label: '销售额排序'
    },
    {
      name: 'item_num',
      label: '销售量排序'
    }
  ])
  // 选中的矩阵号部门数据
  function onChangeDepartment(e) {
    research.department = e || null
  }
  return {
    chooseDeptSearchRef,
    onChangeDepartment,
    Goodslist,
    timeselect,
    timePicker,
    research,
    chooseTab,
    brandMark,
    contentType,
    accountType,
    tabList,
    tableForm,
    changeTimeType,
    sureTime,
    queryList,
    reset
  }
}
