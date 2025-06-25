/**
 * 获取数据总览
 */
import { allDataView } from '@/api/content_center/content_overview'
import { comparisonTime } from '../../components/js/getDateDiff.js'
export function getTabData(brandViewMode) {
  // 作品数据
  console.log('brandViewMode', brandViewMode)
  const tabForm = reactive({
    time: '',
    loading: false,
    chooseData: [
      {
        title: '销售总金额',
        num1: null,
        num2: null,
        isJE: true,
        show: brandViewMode.value === 1
      },
      {
        title: '销售总量',
        num1: null,
        num2: null,
        show: brandViewMode.value === 1
      },
      {
        title: '退款金额',
        num1: null,
        num2: null,
        isJE: true,
        show: brandViewMode.value === 1
      },
      {
        title: '退款件数',
        num1: null,
        num2: null,
        show: brandViewMode.value === 1
      },
      {
        title: '直播销售金额',
        num1: null,
        num2: null,
        isJE: true,
        show: brandViewMode.value === 1
      },
      {
        title: '直播观看人次',
        num1: null,
        num2: null,
        show: true
      },
      {
        title: '直播场次',
        num1: null,
        num2: null,
        show: true
      },
      // {
      //   title: '涨粉数',
      //   num1: null,
      //   num2: null,
      //   show: true
      // },
      {
        title: '视频销售金额',
        num1: null,
        num2: null,
        isJE: true,
        show: brandViewMode.value === 1
      },
      {
        title: '发布视频数',
        num1: null,
        num2: null,
        show: true
      },
      {
        title: '视频播放数',
        num1: null,
        num2: null,
        show: true
      },
      {
        title: '线索数',
        num1: null,
        num2: null,
        show: true
      }
    ]
  })
  // 第一次加载时--获取数据总览数据
  tabForm.time = comparisonTime('02:00:00')

  // 获取数据
  function getDataFun(platform) {
    tabForm.loading = true
    allDataView({ platform })
      .then(res => {
        if (res.code === 0) {
          if (res.data) {
            const videoLen = res.data
            tabForm.chooseData.forEach(item => {
              switch (item.title) {
                case '销售总金额':
                  item.num1 = videoLen.realTotalSalesMoney
                  item.num2 = videoLen.realTotalSalesMoneyChangeNum
                  break
                case '销售总量':
                  item.num1 = videoLen.totalSalesMoney
                  item.num2 = videoLen.totalSalesMoneyChangeNum
                  break
                case '退款金额':
                  item.num1 = videoLen.totalRefundMoney
                  item.num2 = videoLen.totalRefundMoneyChangeNum
                  break
                case '退款件数':
                  item.num1 = videoLen.totalRefundGoods
                  item.num2 = videoLen.totalRefundGoodsChangeNum
                  break
                case '直播销售金额':
                  item.num1 = videoLen.roomSalesMoney
                  item.num2 = videoLen.roomSalesMoneyChangeNum
                  break
                case '直播观看人次':
                  item.num1 = videoLen.liveWatchTimes
                  item.num2 = videoLen.liveWatchTimesChangeNum
                  break
                case '直播场次':
                  item.num1 = videoLen.liveTimes
                  item.num2 = videoLen.liveTimesChangeNum
                  break
                case '涨粉数':
                  item.num1 = videoLen.fansAddNum
                  item.num2 = videoLen.fansAddNumChangeNum
                  break
                case '视频销售金额':
                  item.num1 = videoLen.videoSalesMoney
                  item.num2 = videoLen.videoSalesMoneyChangeNum
                  break
                case '发布视频数':
                  item.num1 = videoLen.videosNumCount
                  item.num2 = videoLen.videosNumCountChangeNum
                  break
                case '视频播放数':
                  item.num1 = videoLen.videosPlayNumCount
                  item.num2 = videoLen.videosPlayNumCountChangNum
                  break
                case '线索数':
                  item.num1 = videoLen.relatedInfos
                  item.num2 = videoLen.relatedInfosChangeNum
                  break
              }
            })
          }
        }

        tabForm.loading = false
      })
      .catch(() => {
        tabForm.loading = false
      })
  }
  return {
    tabForm,
    getDataFun
  }
}
