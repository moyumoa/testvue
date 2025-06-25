<template>
  <div class="analysis">
    <section class="top">
      <h3>
        数据总计
        <span>{{ topData.dataTime || '--' }}</span>
      </h3>
      <!--      <p class="tips">若任务已结束数据仍或更新，数据更新到视频发布到线上的第7天</p>-->
      <ul class="list">
        <li class="item">
          <p class="number">{{ wanSliceFormat(topData.liveCountTarget) || 0 }}</p>
          <p>直播场次</p>
        </li>
        <li class="item">
          <p class="number">{{ parseInt(topData.liveDurationTarget / 60000) || 0 }}</p>
          <p>直播时长(分钟)</p>
        </li>
        <li class="item">
          <p class="number">{{ wanSliceFormat(topData.liveViewNumTarget) || 0 }}</p>
          <p>直播观看人次</p>
        </li>
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
        <!-- <li class="item">
          <p class="number">{{ wanSliceFormat(topData.leaveinfoNumTarget) || 0 }}</p>
          <p>活动线索数</p>
        </li>
        <li class="item">
          <p class="number">{{ wanSliceFormat(topData.leaveinfoPersonNumTarget) || 0 }}</p>
          <p>活动线索人数</p>
        </li> -->

        <!-- <li class="item" style="background-color: #fff" v-if="brandViewMode === 1"></li>
        <li class="item" style="background-color: #fff" v-if="brandViewMode === 1"></li> -->
        <!-- <li class="item" style="background-color: #fff" v-if="brandViewMode === 1"></li> -->
      </ul>
    </section>
    <section class="echart">
      <dataEchart />
    </section>
  </div>
</template>

<script setup>
import { dataAnalysis } from '../data'
import { wanSliceFormat } from '@/utils/tools.js'
import dataEchart from './data_echart.vue'
import { useStore } from 'vuex'

defineComponent(dataEchart)

const store = useStore()
const brandViewMode = computed(() => store.state.user.brandViewMode)
const { topData, getTopData } = dataAnalysis()
getTopData(null)
</script>

<style lang="scss" scoped>
.analysis {
  width: 100%;
}
.top {
  background-color: #fff;
  padding: 24px;
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
      width: 33%;
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
}
</style>
