/**
 * 直播详情[百应]-数据概览-流量趋势
 */
import { getLiveTrendByRoomIdAndTypes } from '@/api/content_center/live_center.js'
export function pageFlowTrendChart(roomId) {
  const flowData = ref(['进场人数', '在线人数', '付费流量', '自然流量'])
  const flowList = ref([])
  const flowSalesLoading = ref(false)
  function getFlowTrendList() {
    flowSalesLoading.value = true
    getLiveTrendByRoomIdAndTypes({
      roomId: roomId,
      trendType: '0,8,100,101,11,3'
    })
      .then(res => {
        if (res.code === 0) {
          const data = res.data || []
          if (data.length > 0) {
            const list = data[0].trends || []
            const newList = []

            // 拿出X轴
            list.forEach(x => {
              newList.push({
                xData: x.xaxis.substring(5, 16)
              })
            })
            // 获取流量趋势
            let y1 = []
            let y2 = []
            let y3 = []
            let y4 = []

            data.forEach(x => {
              if (x.trendType === 0) {
                y1 = x.trends || []
              } else if (x.trendType === 8) {
                y2 = x.trends || []
              } else if (x.trendType === 100) {
                y3 = x.trends || []
              } else if (x.trendType === 101) {
                y4 = x.trends || []
              }
            })
            y1.forEach((y, i) => {
              newList[i].yData0 = y.yaxis || 0
            })
            y2.forEach((y, i) => {
              newList[i].yData1 = y.yaxis || 0
            })
            y3.forEach((y, i) => {
              newList[i].yData2 = y.yaxis || 0
            })
            y4.forEach((y, i) => {
              newList[i].yData3 = y.yaxis || 0
            })

            flowList.value = newList
            flowSalesLoading.value = false
          } else {
            flowList.value = []
            flowSalesLoading.value = false
          }
        } else {
          flowList.value = []
          flowSalesLoading.value = false
        }
      })
      .catch(() => {
        flowList.value = []
        flowSalesLoading.value = false
      })
  }
  onMounted(() => {
    // getFlowTrendList()
  })
  return { flowSalesLoading, flowData, flowList, getFlowTrendList }
}
