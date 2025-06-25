import { ref } from 'vue'
import { getTopDataAnalysis } from '@/api/market/task.js'
import { useRoute } from 'vue-router'

export default function () {
  const route = useRoute()

  // 顶部数据
  const topData = ref({})
  // 获取顶部数据
  function getTopData(platform) {
    const params = {
      taskType: route.query.type,
      taskId: route.query.itemId,
      platform: platform || null
    }
    getTopDataAnalysis(params).then(res => {
      console.log(res)
      if (res.code === 0) {
        topData.value = res.data
        console.log(topData)
      }
    })
  }
  // function updatedAnalysis() {
  //   getTopData()
  // }
  return {
    topData,
    getTopData
    // updatedAnalysis
  }
}
