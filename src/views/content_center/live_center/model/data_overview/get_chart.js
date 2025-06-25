/**
 * 直播详情-数据概览-
 */
import { getRoomDetailsChart } from '@/api/content_center/live_center.js'

import { throttle } from '@/utils/tools.js'
export function pageChart(roomId) {
  const leftTabList = ref([
    {
      name: 'play',
      label: '观看人次'
    },
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
  const chooseLeftTab = ref('play')
  const chooseRightTab = ref('add')
  const addFansChart = ref([]) // 涨粉趋势
  const likeChart = ref([]) // 点赞趋势
  const userChart = ref([]) // 累计观看趋势

  const pageLoading = ref(true)
  const lineChart = ref(null)
  const echartList = ref([])
  // 获取所有图标的数据
  function getChartInfo() {
    pageLoading.value = true
    getRoomDetailsChart({ roomId: roomId })
      .then(res => {
        if (res.code === 0) {
          addFansChart.value = JSON.parse(JSON.stringify(res.data.addFansChart || []))
          likeChart.value = JSON.parse(JSON.stringify(res.data.likeChart || []))
          userChart.value = JSON.parse(JSON.stringify(res.data.userChart || []))
        } else {
          addFansChart.value = JSON.parse(JSON.stringify([]))
          likeChart.value = JSON.parse(JSON.stringify([]))
          userChart.value = JSON.parse(JSON.stringify([]))
        }
        pageLoading.value = false
        changeRule('play', 'left', true)
      })
      .catch(() => {
        addFansChart.value = JSON.parse(JSON.stringify([]))
        likeChart.value = JSON.parse(JSON.stringify([]))
        userChart.value = JSON.parse(JSON.stringify([]))
        pageLoading.value = false
        changeRule('play', 'left', true)
      })
  }
  // 切换规则
  const changeRule = throttle((e, type, init = false) => {
    if (
      !init &&
      ((type === 'left' && chooseLeftTab.value === e) ||
        (type === 'right' && chooseRightTab.value === e))
    ) {
      return
    }
    lineChart.value.chartLoading()
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
  return {
    pageLoading,
    lineChart,
    leftTabList,
    rightTabList,
    chooseLeftTab,
    chooseRightTab,
    getChartInfo,
    echartList,
    changeRule
  }
}
