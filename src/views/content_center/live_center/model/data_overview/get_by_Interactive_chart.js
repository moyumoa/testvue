/**
 * 直播详情-数据概览-互动分析
 */
import { getRoomDetailsChart } from '@/api/content_center/live_center.js'

import { throttle } from '@/utils/tools.js'
export function pageInteractiveChart(roomId) {
  // 流量趋势
  const salesData = ref(['销售额', '销售量'])
  const salesList = ref([])
  const leftTabList = ref([
    {
      name: 'digg',
      label: '点赞数'
    },
    {
      name: 'fans',
      label: '涨粉数'
    }
  ])
  const rightTabList = ref([
    {
      name: 'all',
      label: '总量'
    },
    {
      name: 'add',
      label: '增量'
    }
  ])
  const message = inject('$message')
  const interactiveLoading = ref(true)
  const chooseLeftTab = ref('digg')
  const chooseRightTab = ref('add')
  const addFansChart = ref([]) // 涨粉趋势
  const likeChart = ref([]) // 点赞趋势
  const userChart = ref([]) // 累计观看趋势
  const onLineList = ref([]) // 在线人数 未授权百应
  const lineChartDom = ref(null)
  const lineChartA = ref(null)
  const echartList = ref([])
  // 获取所有图标的数据
  function getChartInfo() {
    getRoomDetailsChart({ roomId: roomId })
      .then(res => {
        if (res.code === 0) {
          addFansChart.value = JSON.parse(JSON.stringify(res.data.addFansChart || []))
          likeChart.value = JSON.parse(JSON.stringify(res.data.likeChart || []))
          userChart.value = JSON.parse(JSON.stringify(res.data.userChart || []))
          const onlineNewList = []
          const onLineOldList = JSON.parse(JSON.stringify(res.data.onlineChart || []))
          onLineOldList.forEach(x => {
            onlineNewList.push({
              xData: x.time ? x.time.substring(5, 16) : '',
              yData: x.allNum || 0
              // chooseRightTab.value === 'add' ? x.addNum || 0 :
            })
          })
          onLineList.value = onlineNewList
          // res.data.sellAmountChart 销售额
          // res.data.sellNumChart 销售量
          const list = []
          res.data.sellAmountChart.forEach((ele, index) => {
            list.push({
              xData: ele.time ? ele.time.substring(5, 16) : '',
              yData0: ele.addNum,
              yData1: res.data.sellNumChart[index].addNum
            })
          })
          salesList.value = list
        } else {
          addFansChart.value = JSON.parse(JSON.stringify([]))
          likeChart.value = JSON.parse(JSON.stringify([]))
          userChart.value = JSON.parse(JSON.stringify([]))
          onLineList.value = JSON.parse(JSON.stringify([]))
        }
        interactiveLoading.value = false
        changeRule('digg', 'left', true)
      })
      .catch(() => {
        addFansChart.value = JSON.parse(JSON.stringify([]))
        likeChart.value = JSON.parse(JSON.stringify([]))
        userChart.value = JSON.parse(JSON.stringify([]))
        onLineList.value = JSON.parse(JSON.stringify([]))
        interactiveLoading.value = false
        changeRule('digg', 'left', true)
      })
  }
  // 切换规则
  const changeRule = throttle((e, type, init = false) => {
    if (interactiveLoading.value) {
      message({ type: 'warning', message: '接口请求中，请稍后再点' })
      return
    }
    if (
      !init &&
      ((type === 'left' && chooseLeftTab.value === e) ||
        (type === 'right' && chooseRightTab.value === e))
    ) {
      return
    }
    lineChartDom.value && lineChartDom.value.chartLoading()
    if (type === 'left') {
      chooseLeftTab.value = e
    } else {
      chooseRightTab.value = e
    }
    getOneList()
  }, 300)

  function getOneList() {
    const list =
      chooseLeftTab.value === 'play'
        ? userChart.value
        : chooseLeftTab.value === 'digg'
        ? likeChart.value
        : addFansChart.value
    const newList = []
    list.forEach(x => {
      newList.push({
        xData: x.time ? x.time.substring(5, 16) : '',
        yData: chooseRightTab.value === 'add' ? x.addNum || 0 : x.allNum || 0
      })
    })
    echartList.value = newList
  }
  getChartInfo()

  return {
    lineChartA,
    onLineList,
    interactiveLoading,
    lineChartDom,
    leftTabList,
    rightTabList,
    chooseLeftTab,
    chooseRightTab,
    echartList,
    changeRule,
    salesData,
    salesList
  }
}
