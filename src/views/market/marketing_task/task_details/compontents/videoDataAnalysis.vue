<template>
  <div class="analysis">
    <!-- 数据来源筛选 -->
    <div class="platform_box">
      数据来源：
      <el-select v-model="selectPlatformVal" class="m-2" placeholder=" " @change="platformChange">
        <el-option
          v-for="item in platform"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>

    <section class="top">
      <h3>
        数据总计
        <span>{{ topData.dataTime || '--' }}</span>
      </h3>
      <!--      <p class="tips">每日0点、12点、20点左右更新数据</p>-->
      <ul :class="{ list: true, list_line_4: brandViewMode === 2 }">
        <li class="item">
          <p class="number">{{ wanSliceFormat(topData.singleCount) || 0 }}</p>
          <p>{{ forwardTask ? '发布视频数' : '视频数' }}</p>
        </li>
        <li class="item">
          <p class="number">{{ wanSliceFormat(topData.cgpPlayCountTarget) || 0 }}</p>
          <p>播放数</p>
        </li>
        <li class="item">
          <p class="number">{{ wanSliceFormat(topData.cgpDiggCountTarget) || 0 }}</p>
          <p>点赞数</p>
        </li>
        <li class="item">
          <p class="number">{{ wanSliceFormat(topData.cgpShareCountTarget) || 0 }}</p>
          <p>分享数</p>
        </li>
        <li class="item">
          <p class="number">{{ wanSliceFormat(topData.cgpCommentCountTarget) || 0 }}</p>
          <p>评论数</p>
        </li>
        <template v-if="!forwardTask">
          <li class="item" v-if="brandViewMode === 1">
            <p class="number">{{ wanSliceFormat(topData.paymentOrderCountTarget) || 0 }}</p>
            <p>付款订单数</p>
          </li>
          <li class="item" v-if="brandViewMode === 1">
            <p class="number">{{ wanSliceFormat(topData.payersNumTarget) || 0 }}</p>
            <p>付款人数</p>
          </li>
          <li class="item" v-if="brandViewMode === 1">
            <p class="number">{{ wanSliceFormat(topData.orderAmountTarget / 100) || 0 }}</p>
            <p>付款金额</p>
          </li>
        </template>
        <!-- <li class="item">
          <p class="number">{{ wanSliceFormat(topData.leaveinfoNumTarget) || 0 }}</p>
          <p>活动线索数</p>
        </li>
        <li class="item">
          <p class="number">{{ wanSliceFormat(topData.leaveinfoPersonNumTarget) || 0 }}</p>
          <p>活动线索人数</p>
        </li> -->
        <template v-if="forwardTask">
          <li class="item" style="background-color: #fff"></li>
          <li class="item" style="background-color: #fff"></li>
          <li class="item" style="background-color: #fff"></li>
        </template>
      </ul>
    </section>
    <section class="echart">
      <dataEchart ref="dataEchartRef" />
    </section>
  </div>
</template>

<script setup>
import { dataAnalysis } from '../data'
import { wanSliceFormat } from '@/utils/tools.js'
import dataEchart from './data_echart.vue'
import { useStore } from 'vuex'
const dataEchartRef = ref() // 用来调用子组件方法

const platform = [
  {
    value: null,
    label: '全部平台'
  },
  {
    value: 1,
    label: '抖音'
  },
  {
    value: 2,
    label: '视频号'
  },
  {
    value: 3,
    label: '小红书'
  },
  {
    value: 4,
    label: '快手'
  }
]
const selectPlatformVal = ref(null)
function platformChange(val) {
  console.log('当前选中val', val)
  // 存在store
  store.commit('market/setPlatform', val)
  // 切换时获取数据
  getTopData(val)
  dataEchartRef.value.dataAnalysisInfo()
}

defineComponent(dataEchart)
const props = defineProps({
  taskInfo: Object
})
const store = useStore()
const brandViewMode = computed(() => store.state.user.brandViewMode)
const taskInfo = toRef(props, 'taskInfo')
const forwardTask = computed(() => {
  for (const ele of taskInfo.value.taskConfigs) {
    if (ele.ckey === 'video_push_mode') {
      if (ele.cvalue.includes('4')) {
        return true
      } else {
        return false
      }
    }
  }
})
const { topData, getTopData } = dataAnalysis()
getTopData(null)
onBeforeUnmount(() => {
  store.commit('market/setPlatform', null) // 离开视频详情的时候初始化一下store，不然进入直播详情的时候有问题
})
</script>

<style lang="scss" scoped>
.analysis {
  width: 100%;
  margin-top: -3px;
  .platform_box {
    position: absolute;
    right: 24px;
    top: 14px;
    margin-bottom: 12px;
    text-align: end;
    color: #303133;
    :deep() .el-select {
      --el-select-border-color-hover: unset;
      --el-select-disabled-border: unset;
      --el-select-font-size: unset;
      --el-select-close-hover-color: unset;
      --el-select-input-color: unset;
      --el-select-multiple-input-color: unset;
      --el-select-input-focus-border-color: unset;
      width: 100px;
      color: #303133;
    }
    :deep() .el-input__inner {
      border: unset;
      outline: unset;
      // background-color: #f6f8fa;
      // border: 1px solid rgb(220, 223, 230);
      color: #303133;
    }
    :deep().el-icon {
      color: #303133;
    }
  }
}
.top {
  background-color: #fff;
  padding: 22px 24px;
  // width: 100%;
  h3 {
    height: 22px;
    font-size: 16px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #333333;
    line-height: 22px;
    letter-spacing: 1px;
    span {
      font-size: 14px;
    }
  }
  .tips {
    margin-top: 4px;
    margin-bottom: 24px;
    height: 17px;
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #909399;
    line-height: 17px;
  }
  .list {
    margin-top: 16px;
    display: flex;
    flex-wrap: wrap;
    // grid-column-gap: 12px;
    grid-row-gap: 12px;
    // grid-template-columns: 19.3% 19.3% 19.3% 19.3% 19.3%;
    // justify-items: stretch;
    // grid-template-rows: 89px 89px;
    justify-content: space-between;
    .item {
      background-color: rgba(246, 247, 248, 1);
      // width: 18.6%;
      height: 89px;
      width: 24%;
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
      p {
        height: 17px;
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #909399;
        line-height: 17px;
      }
      .number {
        height: 28px;
        font-size: 20px;
        font-family: PingFangSC-Semibold, PingFang SC;
        font-weight: 600;
        color: #333333;
        line-height: 28px;
        letter-spacing: 1px;
        margin-bottom: 2px;
      }
      .name {
        height: 17px;
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #909399;
        line-height: 17px;
      }
    }
  }
  .list_line_4 {
    .item {
      width: 24%;
    }
  }
}
</style>
