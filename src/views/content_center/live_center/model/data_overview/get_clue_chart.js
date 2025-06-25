/**
 * 直播详情-线索数据
 */
import { getRoomDetailsChart } from '@/api/content_center/live_center.js'

// import { throttle } from '@/utils/tools.js'
export function getClueChart(roomId) {
  // 线索数据
  // const message = inject('$message')
  const clueList = ref([])
  const lineChartB = ref(null)
  const clueLoading = ref(true)
  //
  function getChartInfo() {
    getRoomDetailsChart({ roomId: roomId })
      .then(res => {
        if (res.code === 0) {
          const clueNewList = []
          const clueOldList = JSON.parse(JSON.stringify(res.data.cluesChart || []))
          clueOldList.forEach(x => {
            clueNewList.push({
              xData: x.time ? x.time.substring(11, 16) : '',
              yData: x.allNum || 0
            })
          })
          clueList.value = clueNewList
        } else {
          clueList.value = JSON.parse(JSON.stringify([]))
        }
        clueLoading.value = false
      })
      .catch(() => {
        clueList.value = JSON.parse(JSON.stringify([]))
        clueLoading.value = false
      })
  }

  getChartInfo()

  return {
    lineChartB,
    clueList,
    clueLoading
  }
}
