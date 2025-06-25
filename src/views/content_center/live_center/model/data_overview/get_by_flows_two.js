/**
 * 直播详情[百应]-数据概览-流量分析+流量转化
 */
import { getLiveFlowPercentage, getLiveFlowTrends } from '@/api/content_center/live_center.js'

export function getFlowsTwo(roomId, haveBy) {
  const byFlows = reactive({
    flowAnalysis: { payFlows: {}, naturalFlows: {} }, // 流量分析
    flowConversion: {} // 流量转化
  })

  // 投放数据
  const launchData = reactive({
    num1: null,
    num2: null
  })
  // 获取流量的占比
  function getFlowsRatio() {
    getLiveFlowPercentage({
      roomId: roomId
    }).then(res => {
      if (res.code === 0) {
        const data = res.data || {}
        if (data.groups && data.groups.length > 0) {
          data.groups.forEach(x => {
            if (x.display === '自然流量') {
              launchData.num2 = x.value
              byFlows.flowAnalysis.naturalFlows = x
            } else if (x.display === '付费流量') {
              launchData.num1 = x.value
              byFlows.flowAnalysis.payFlows = x
            }
          })
          byFlows.flowAnalysis.naturalFlows.flow_list.sort(function (a, b) {
            return b.value - a.value
          })

          byFlows.flowAnalysis.payFlows.flow_list.sort(function (a, b) {
            return b.value - a.value
          })
        }
      }
    })
  }
  // 获取直播间流量转化的数据
  function getFlowsTransform() {
    getLiveFlowTrends({
      roomId: roomId
    })
      .then(res => {
        if (res.code === 0) {
          byFlows.flowConversion = res.data
        }
      })
      .catch(() => {})
  }
  if (haveBy) {
    getFlowsRatio()
    getFlowsTransform()
  }
  return { launchData, byFlows }
}
