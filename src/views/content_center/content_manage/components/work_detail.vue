<template>
  <div class="work_detail">
    <div class="basics_analysis m_b">
      <div class="title">基础分析</div>
      <div class="rule_box">
        <div class="left_rule">
          <div
            @click="changeRule(item, 'left')"
            :class="{ one_rule: true, choose_rule: item.name == chooseLeftTab }"
            v-for="(item, index) in leftTabList"
            :key="index"
          >
            {{ item.label }}
          </div>
        </div>
        <!-- <div class="right_rule">
          <div
            @click="changeRule(item, 'right')"
            :class="{ one_rule: true, choose_rule: item.name == chooseRightTab }"
            v-for="(item, index) in rightTabList"
            :key="index"
          >
            {{ item.label }}
          </div>
        </div> -->
      </div>
      <div class="basics_analysis_content">
        <lineChart
          ref="data.lineChart"
          :data="data.echartList"
          :type="data.text"
          :abscissaBase="true"
        ></lineChart>
      </div>
      <!-- <div class="date_choice">
        <div :class="['time_one', , timeType == 7 ? 'active_time' : '']" @click="changeTime(7)">
          7天
        </div>
        <div :class="['time_two', , timeType == 15 ? 'active_time' : '']" @click="changeTime(15)">
          15天
        </div>
        <div :class="['time_three', , timeType == 30 ? 'active_time' : '']" @click="changeTime(30)">
          30天
        </div>
      </div> -->
    </div>
    <div class="m_b2 comment_analysis">
      <div class="title">评论分析</div>
      <div class="comment_analysis_content">
        <barEacharts class="bar"></barEacharts>
        <commentList class="list"></commentList>
      </div>
    </div>
  </div>
</template>

<script setup>
import barEacharts from './bar_echarts.vue'
import commentList from './comment_list.vue'
import lineChart from '../../components/line_chart.vue'
import { videoBaseAnalysis } from '@/api/content_center/content_manage.js'
import { useRoute } from 'vue-router'
const route = useRoute()
const leftTabList = ref([
  {
    name: 'play',
    label: '播放数'
  },
  {
    name: 'digg',
    label: '点赞数'
  },
  {
    name: 'comment',
    label: '评论数'
  },
  {
    name: 'share',
    label: '分享数'
  }
])
// const rightTabList = ref([
//   {
//     name: true,
//     label: '总量'
//   },
//   {
//     name: false,
//     label: '增量'
//   }
// ])
const chooseLeftTab = ref('play')
const chooseRightTab = ref(false)
// const timeType = ref(14)
const data = reactive({
  loading: false,
  lineChart: null,
  playCountList: [], // 播放
  diggCountList: [], // 点赞
  commentCountList: [], // 评论
  shareCountList: [], // 分享
  echartList: [], // 默认数
  text: '' // 提示信息
})
function changeRule(item, val) {
  if (val === 'left') {
    chooseLeftTab.value = item.name
  } else {
    chooseRightTab.value = item.name
  }
  getVideoAnalysis()
}
// function changeTime(val) {
//   timeType.value = val
//   getVideoAnalysis()
// }
// 时间转化
const setTime = item => {
  if (item) {
    return (
      String(item).slice(0, 4) + '-' + String(item).slice(4, 6) + '-' + String(item).slice(6, 8)
    )
  }
}
onMounted(() => {
  getVideoAnalysis()
})
async function getVideoAnalysis() {
  const res = await videoBaseAnalysis({
    brandId: localStorage.getItem('brandInfo')
      ? JSON.parse(localStorage.getItem('brandInfo')).brandId
      : '',
    // isIncrement: !chooseRightTab.value,
    itemId: route.query.itemId || ''
    // platform: 1,
    // recentDays: timeType.value
  })
  data.playCountList = []
  data.diggCountList = []
  data.commentCountList = []
  data.shareCountList = []
  res.data.reverse().forEach(item => {
    data.playCountList.push({
      yData: item.playCount,
      xData: setTime(item.date).slice(5)
    })
    data.diggCountList.push({
      yData: item.diggCount,
      xData: setTime(item.date).slice(5)
    })
    data.commentCountList.push({
      yData: item.commentCount,
      xData: setTime(item.date).slice(5)
    })
    data.shareCountList.push({
      yData: item.shareCount,
      xData: setTime(item.date).slice(5)
    })
  })
  if (chooseLeftTab.value === 'play') {
    data.echartList = data.playCountList.reverse()
    data.text = '播放数'
  } else if (chooseLeftTab.value === 'digg') {
    data.echartList = data.diggCountList.reverse()
    data.text = '点赞数'
  } else if (chooseLeftTab.value === 'comment') {
    data.echartList = data.commentCountList.reverse()
    data.text = '评论数'
  } else if (chooseLeftTab.value === 'share') {
    data.echartList = data.shareCountList.reverse()
    data.text = '分享数'
  } else {
    data.echartList = data.playCountList.reverse()
    data.text = '播放数'
  }
}
</script>

<style lang="scss" scoped>
@import url(./comment.css);
.work_detail {
  .basics_analysis {
    position: relative;
    .rule_box {
      margin-top: 24px;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      .one_rule {
        cursor: pointer;
        font-size: 14px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 600;
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
    .date_choice {
      cursor: pointer;
      position: absolute;
      top: 22px;
      right: 24px;
      display: flex;
      border-radius: 4px;
      // overflow: hidden;
      > div {
        width: 66px;
        height: 32px;
        border: 1px solid #d9d9d9;
        text-align: center;
        line-height: 32px;
      }
      .active_time {
        height: 32px;
        background: rgba(54, 79, 205, 0.1);
        border: 1px solid #364fcd;
        color: #364fcd;
      }
      .time_one {
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
        border-top-right-radius: 0px;
        border-bottom-right-radius: 0px;
        // margin-left: -1px;
      }
      .time_two {
        // margin-left: -1px;
      }
      .time_three {
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
        // margin-left: -1px;
      }
    }
    .basics_analysis_content {
      width: 100%;
    }
  }
  .comment_analysis {
    padding-bottom: 20px;
    padding-right: 12px;
    .comment_analysis_content {
      display: flex;
      .bar {
        flex: 1;
      }
      .list {
        flex: 1;
      }
    }
  }
}
</style>
