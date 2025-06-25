<template>
  <div class="oneBox">
    <el-tabs class="tabs" v-model="chooseRule" @tab-click="changeTab">
      <el-tab-pane label="视频数据" name="video"></el-tab-pane>
      <el-tab-pane label="直播数据" name="live" v-if="systemVersion !== 4"></el-tab-pane>
    </el-tabs>
    <div>
      <div class="echart_detail" style="margin-top: 9px" v-loading="loading">
        <div class="rule_box">
          <div class="left_rule">
            <div
              @click="changeRule(item)"
              :class="{ one_rule: true, choose_rule: item.name == chooseLeftTab }"
              v-for="(item, index) in leftTabList[chooseRule]"
              :key="index"
            >
              {{ item.label }}
            </div>
          </div>
        </div>
        <div class="echart_box">
          <lineChart :data="echartList" id="lineChart" :type="lineType"></lineChart>
        </div>
      </div>
    </div>
    <div class="tab_slot">
      <el-date-picker
        style="width: 240px"
        type="daterange"
        v-model="datePicker"
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        unlink-panels
        :disabled-date="
          time => {
            return time.getTime() > Date.now() - 24 * 60 * 60 * 1000
          }
        "
        :clearable="false"
        :editable="false"
        @change="timeChange"
      ></el-date-picker>
    </div>
  </div>
</template>

<script setup>
import lineChart from './eacharts/line_chart.vue'
import { getBizDayData } from '@/api/market/overview.js'
import { dateFormat } from '@/utils/tools.js'
import { onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const systemVersion = computed(() => store.state.user.systemVersion)
const loading = ref(true)
const chooseRule = ref('video')

const echartList = ref([])
const leftTabList = reactive({
  video: [
    {
      name: 1,
      label: '播放数'
    },
    {
      name: 2,
      label: '点赞数'
    },
    {
      name: 3,
      label: '评论数'
    },
    {
      name: 4,
      label: '分享数'
    }
  ],
  live: [
    {
      name: 1,
      label: '观看人次'
    },
    {
      name: 2,
      label: '直播时长(分钟)'
    }
  ]
})
const dataList = reactive({
  startTime: '',
  endTime: ''
})
const datePicker = ref([
  new Date() - 7 * 24 * 60 * 60 * 1000,
  new Date(Date.now() - 24 * 60 * 60 * 1000)
])
const lineType = computed(() => {
  const leftTab = leftTabList[chooseRule.value] // 左边的tab
  const filterTab = leftTab.filter(item => item.name === chooseLeftTab.value)
  console.log('filterTab', filterTab)
  return filterTab.length > 0 ? filterTab[0].label : leftTab[0].label
})
const chooseLeftTab = ref(1)
// 直播和视频之间切换
const changeTab = stu => {
  console.log('chooseRule.value', chooseRule.value)

  chooseLeftTab.value = 1
  if (chooseRule.value === 'video') {
    myCkey.value = 'cgp_play_count_target'
  } else {
    myCkey.value = 'live_view_num_target'
  }
  getList()
}
const myCkey = ref('cgp_play_count_target')
// 直播（视频）的选项切换
const changeRule = item => {
  chooseLeftTab.value = item.name
  if (item.label === '播放数') {
    myCkey.value = 'cgp_play_count_target'
  } else if (item.label === '点赞数') {
    myCkey.value = 'cgp_digg_count_target'
  } else if (item.label === '评论数') {
    myCkey.value = 'cgp_comment_count_target'
  } else if (item.label === '分享数') {
    myCkey.value = 'cgp_share_count_target'
  } else if (item.label === '观看人次') {
    myCkey.value = 'live_view_num_target'
  } else if (item.label === '直播时长(分钟)') {
    myCkey.value = 'live_duration_target'
  } else {
    myCkey.value = 'cgp_play_count_target'
  }
  getList()
}
// 修改 datePicker
const timeChange = v => {
  dataList.startTime = dateFormat(v[0]) + ' 00:00:00'
  dataList.endTime = dateFormat(v[1]) + ' 23:59:59'
  getList()
}
onMounted(() => {
  getList()
})
const allList = ref([])
// ecarts中的数据
async function getList() {
  loading.value = true
  const params = {
    ckey: myCkey.value,
    startTime: dataList.startTime || dateFormat(new Date(datePicker.value[0])) + ' 00:00:00', // 开始时间
    endTime: dataList.endTime || dateFormat(datePicker.value[1]) + ' 23:59:59' // 结束时间}
  }
  const res = await getBizDayData(params)
  if (res.success) {
    loading.value = false

    // 把数据处理成这样的数据传给echarts
    allList.value = transform(res.data) || []
    const list = []
    allList.value.forEach(x => {
      list.push({
        xData: x.dataDate ? String(x.dataDate).slice(4, 6) + '-' + String(x.dataDate).slice(6) : '',
        yData: x.count
      })
    })
    echartList.value = list
    console.warn('处理结果', echartList.value)
  }
}
function transform(res) {
  if (myCkey.value === 'live_duration_target') {
    res.forEach(item => {
      item.count = item.count ? parseInt(item.count / 60000) : 0
    })
  }
  return res
}
</script>

<style lang="scss" scoped>
@import '../../components/css/page.scss';
.oneBox {
  border-radius: 4px;
  margin: 16px 0;
  padding: 0 24px;
  // margin-bottom: 10px;
  background: #fff;
  position: relative;

  .tabs {
    padding-top: 22px;
    width: 100%;
    .el-tab-pane {
      width: 100%;
    }
  }
  .tab_slot {
    width: 240px;
    position: absolute;
    top: 12px;
    right: 25px;
  }
}
</style>
