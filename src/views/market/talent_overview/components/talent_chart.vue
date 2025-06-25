<template>
  <div class="talent_chart">
    <div class="talent_title">
      <div class="title_left">参与任务人数</div>
    </div>
    <div class="one_chart_box" v-loading="$data.chartLoding">
      <div class="rule_box">
        <div class="left_rule">
          <div
            @click="changeRule(item.name)"
            :class="{ one_rule: true, choose_rule: item.name == $data.chooseLeftTab }"
            v-for="(item, index) in $data.leftTabList"
            :key="index"
          >
            {{ item.label }}
          </div>
        </div>
      </div>
      <div class="echart_box">
        <lineChart
          :showLine="true"
          ref="lineChartDom"
          :type="$data.chooseLeftTab == 'allNum' ? '总人数' : '参与任务人数'"
          :data="$data.chartList"
        ></lineChart>
      </div>
    </div>
  </div>
</template>
<script setup>
import { userJoinChart } from '@/api/market/growth_system.js'
import { throttle } from '@/utils/tools.js'
import lineChart from '@/views/content_center/components/line_chart.vue'
const props = defineProps({
  currentDepartment: {
    type: Number
  }
})
const message = inject('$message')
const lineChartDom = ref(null)
const $data = reactive({
  chartLoding: false,
  chooseLeftTab: 'allNum',
  leftTabList: [
    {
      name: 'allNum',
      label: '总人数'
    },
    {
      name: 'joinNum',
      label: '参与任务人数'
    }
  ],
  allNumList: [], // 总人数的图标
  joinNumList: [], // 参与任务人数的图标
  chartList: [] // 显示的图标
})
const changeRule = throttle(e => {
  if ($data.chartLoding) {
    message({ type: 'warning', message: '接口请求中，请稍后再点' })
    return
  }
  console.log(e)
  $data.chooseLeftTab = e
  $data.chartList = $data.chooseLeftTab === 'allNum' ? $data.allNumList : $data.joinNumList
}, 500)
// 部门修改
watch(
  () => props.currentDepartment,
  val => {
    console.log('参与人数图标--部门变化')
    // getTalentLevel()
    getData()
  },
  { immediate: true }
)
// 获取数据
function getData() {
  $data.chartLoding = true
  lineChartDom.value && lineChartDom.value.chartLoading()
  userJoinChart({
    deptIds: props.currentDepartment == null ? [] : [props.currentDepartment],
    lastFewDays: 7
  })
    .then(res => {
      if (res.code === 0 && res.data && res.data.length > 0) {
        const list = JSON.parse(JSON.stringify(res.data || [])).reverse()
        const list1 = []
        const list2 = []
        list.forEach(x => {
          const dataString = x.date.substring(5)
          list1.push({
            xData: dataString,
            yData: x.userCnt
          })
          list2.push({
            xData: dataString,
            yData: x.joinCnt
          })
        })
        $data.allNumList = list1
        $data.joinNumList = list2
        $data.chartList = $data.chooseLeftTab === 'allNum' ? list1 : list2
      } else {
        $data.allNumList = []
        $data.joinNumList = []
        $data.chartList = JSON.parse(JSON.stringify([]))
      }
      $data.chartLoding = false
    })
    .catch(() => {
      $data.allNumList = []
      $data.joinNumList = []
      $data.chartList = JSON.parse(JSON.stringify([]))
      $data.chartLoding = false
    })
}
</script>
<style lang="scss" scoped>
@import './title.scss';
.talent_chart {
  min-width: 380px;
  width: 100%;
  min-height: 280px;
  background: #ffffff;
  border-radius: 4px;
  padding: 22px 24px;
  margin-bottom: 16px;
}
.rule_box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  .one_rule {
    cursor: pointer;
    font-size: 14px;

    font-weight: 500;
    color: #909399;
    line-height: 20px;
  }
  .one_rule + .one_rule {
    border-left: 1px solid #e8e8e8;
  }
  .choose_rule {
    color: $theme_color;
  }
  .left_rule {
    flex: 1;

    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .one_rule {
      padding-right: 8px;
    }
    .one_rule + .one_rule {
      padding-left: 8px;
    }
  }
  .right_rule {
    flex: 1;

    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    .one_rule {
      padding-left: 8px;
    }
    .one_rule:first-child {
      padding-right: 8px;
    }
  }
}
.echart_box {
  margin: 20px 0 0;
  width: 100%;
  height: 300px;
}
</style>
