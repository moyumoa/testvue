import { useStore } from 'vuex'
import { getHomePageData } from '@/api/main/home'
import { allDataView } from '@/api/content_center/content_overview'
import { wanSliceFormat } from '@/utils/tools.js'

export function model() {
  setSize()
  const store = useStore()
  const loading = ref(false)
  // 选择的品牌
  const choiceBrand = ref('')
  // 是否显示实时大屏数据
  const showRealScreen = ref(false)
  // 是否显示直播大屏按钮
  const showLiveScreen = ref(false)
  // 品牌list
  const brandList = computed(() => {
    // 登录改版之后，账号密码登录未选择品牌时，userInfo是空的，所以要从本地缓存中读取
    if (store.getters.userInfo.loginBrandVos && store.getters.userInfo.loginBrandVos.length > 0) {
      return store.getters.userInfo.loginBrandVos
    } else {
      return localStorage.getItem('loginBrands')
        ? JSON.parse(localStorage.getItem('loginBrands'))
        : []
    }
  })
  // 大屏数据
  const screenData = ref({})

  const brandViewMode = computed(() => store.state.user.brandViewMode)
  const brandInfo =
    localStorage.getItem('brandInfo') && localStorage.getItem('brandInfo') !== 'undefined'
      ? JSON.parse(localStorage.getItem('brandInfo'))
      : {}
  if (brandInfo.brandName) {
    choiceBrand.value = brandInfo.brandName
    loading.value = true
  } else {
    if (brandList.value.length === 1) {
      choiceBrand.value = brandList.value[0].brandName
      loading.value = true
    }
  }

  function loginOut() {
    store.dispatch('user/loginOut')
  }
  // 获取数据概况 - 实时数据
  const realTimeData = ref({})
  function getRealTimeData() {
    getHomePageData().then(res => {
      realTimeData.value = res.data
    })
  }
  // 获取数据概况 - 昨日数据
  const yesterdayData = ref([
    {
      label: '涨粉数',
      valeu: '-',
      show: true
    },
    {
      label: '线索数',
      valeu: '-',
      show: true
    },
    {
      label: '销售额',
      valeu: '-',
      show: brandViewMode.value === 1
    },
    {
      label: '销售量',
      valeu: '-',
      show: brandViewMode.value === 1
    },
    {
      label: '直播场次',
      valeu: '-',
      show: true
    },
    {
      label: '直播观看人次',
      valeu: '-',
      show: true
    },
    {
      label: '视频数',
      valeu: '-',
      show: true
    },
    {
      label: '播放数',
      valeu: '-',
      show: true
    }
  ])
  function getYesterdayData() {
    allDataView({ platform: null }).then(res => {
      yesterdayData.value = [
        {
          label: '涨粉数',
          valeu: wanSliceFormat(res.data.fansAddNum),
          show: true
        },
        {
          label: '线索数',
          valeu: wanSliceFormat(res.data.relatedInfos),
          show: true
        },
        {
          label: '销售额',
          valeu: `￥${wanSliceFormat(res.data.realTotalSalesMoney / 100)}`,
          show: brandViewMode.value === 1
        },
        {
          label: '销售量',
          valeu: wanSliceFormat(res.data.totalSalesMoney),
          show: brandViewMode.value === 1
        },
        {
          label: '直播场次',
          valeu: wanSliceFormat(res.data.liveTimes),
          show: true
        },
        {
          label: '直播观看人次',
          valeu: wanSliceFormat(res.data.liveWatchTimes),
          show: true
        },
        {
          label: '视频数',
          valeu: wanSliceFormat(res.data.videosNumCount),
          show: true
        },
        {
          label: '播放数',
          valeu: wanSliceFormat(res.data.videosPlayNumCount),
          show: true
        }
      ]
    })
  }

  onBeforeUnmount(() => {
    document.querySelector('html').style = 'font-size:12px'
  })
  return {
    loading,
    choiceBrand,
    showRealScreen,
    showLiveScreen,
    brandList,
    screenData,
    loginOut,
    getRealTimeData,
    realTimeData,
    getYesterdayData,
    yesterdayData
  }
}

function setSize() {
  let size = 100
  if (window.outerWidth <= 1800 && window.outerWidth > 1680) {
    size = 87
  } else if (window.outerWidth <= 1680) {
    size = 78
  }
  document.querySelector('html').style = `font-size:${size}px`
}
