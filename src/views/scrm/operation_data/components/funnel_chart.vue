<template>
  <div class="funnel-chart" v-loading="loading">
    <div class="top-bar">
      <div class="title">潜客转化漏斗</div>
      <div class="tips-text">
        有效留资数
        <el-tooltip
          class="item"
          effect="dark"
          content="转化为留资后处于跟进中状态的+结束跟进状态中已成交的客户"
          placement="top"
        >
          <img class="tooltip-img" src="@/assets/images/operate/tip_line.png" alt />
        </el-tooltip>
      </div>
    </div>
    <div class="chart-container" id="funnel-chart">
      <div class="wrapper-item">
        <div class="funnel-item0 item">
          <div class="number-item">
            <div class="info-text">潜客数</div>
            <div class="info-value">{{ info.clientUserUcnt || '0' }}</div>
          </div>
        </div>
        <div class="arrow-box frist-top">
          <div class="transform-rate">
            <div class="info-text">转化率</div>
            <div class="info-value">{{ info.clientClueUcntRate || '0.00%' }}</div>
          </div>
        </div>
      </div>
      <div class="wrapper-item">
        <div class="funnel-item1 item">
          <div class="number-item">
            <div class="info-text">留资转化数</div>
            <div class="info-value">{{ info.clientClueUcnt || '0' }}</div>
          </div>
        </div>
        <div class="arrow-box">
          <div class="transform-rate">
            <div class="info-text">转化率</div>
            <div class="info-value">{{ info.clientCluePhoneValidUcntRate || '0.00%' }}</div>
          </div>
        </div>
      </div>
      <div class="wrapper-item">
        <div class="funnel-item2 item">
          <div class="number-item">
            <div class="info-text">有效留资数</div>
            <div class="info-value">{{ info.clientCluePhoneValidUcnt || '0' }}</div>
          </div>
        </div>
        <div class="arrow-box">
          <div class="transform-rate">
            <div class="info-text">转化率</div>
            <div class="info-value">{{ info.consultStageArrivedStoreUcntRate || '0.00%' }}</div>
          </div>
        </div>
      </div>
      <div class="wrapper-item">
        <div class="funnel-item3 item">
          <div class="number-item">
            <div class="info-text">到店数</div>
            <div class="info-value">{{ info.consultStageArrivedStoreUcnt || '0' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getclientUserTransfer } from '@/api/scrm/operation.js'

const props = defineProps({
  params: {
    type: Object,
    default: () => {
      return {
        deptIds: '',
        endTime: '',
        startTime: ''
      }
    }
  }
})
const { params } = toRefs(props)
const info = ref({
  clientUcnt: 0,
  clientIntentProbabilityUcnt: 0,
  clientClueUcnt: 0,
  clientCluePhoneValidUcnt: 0,
  consultStageArrivedStoreUcnt: 0,
  clientIntentProbabilityUcntRate: '0.00%',
  clientClueUcntRate: '0.00%',
  clientCluePhoneValidUcntRate: '0.00%',
  consultStageArrivedStoreUcntRate: '0.00%'
})
const data = ref({})
const loading = ref(true)

function getList() {
  loading.value = true
  getclientUserTransfer(data.value).then(res => {
    loading.value = false
    if (res.code === 0) {
      info.value = res.data
    }
  })
}

watch(
  () => params.value,
  value => {
    data.value = value
    getList()
  },
  { deep: true, immediate: true }
)
</script>

<style lang="scss" scoped>
@media screen and(max-width: 1800px) {
  .chart-container {
    transform: scale(0.85);
  }
}

.funnel-chart {
  background: #ffffff;
  border-radius: 4px;

  .top-bar {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 42px;
    line-height: 25px;
    display: flex;

    .title {
      flex: 1;
    }

    .tips-text {
      font-size: 14px;
      font-weight: 400;
      color: #8f939a;
      line-height: 20px;
      display: flex;
      align-items: center;

      .tooltip-img {
        width: 14px;
        height: 14px;
        margin-left: 4px;
      }
    }
  }

  .chart-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 80%;
    font-size: 14px;
    font-weight: 400;
    text-align: center;
    color: #ffffff;
    --item0: #5c78ff;
    --item1: #5c78ff;
    --item2: #5c78ff;
    --item3: #5c78ff;
    --item4: #5c78ff;
    // --item1: #6981ff;
    // --item2: #7e93ff;
    // --item3: #9daeff;
    // --item4: #bec9ff;

    .wrapper-item {
      width: 448px;
      position: relative;

      .info-text {
        font-size: 14px;
        color: #606266;
        line-height: 20px;
      }

      .info-value {
        font-size: 16px;
        font-weight: bold;
        color: #303133;
        line-height: 22px;
      }
    }

    .arrow-box {
      width: 246px;
      height: 94px;
      border: 1px solid #5c78ff;
      border-left: 0;
      position: absolute;
      right: -40px;
      top: 50px;
      .transform-rate {
        position: absolute;
        right: -80px;
        top: 50%;
        transform: translateY(-50%);
      }
    }

    .arrow-box::after {
      content: '';
      display: inline-block;
      box-sizing: border-box;
      border-top: 14px solid var(--item1);
      border-right: 4px solid transparent;
      border-left: 4px solid transparent;
      width: 0;
      height: 0;
      position: absolute;
      right: -4px;
      top: 50%;
      transform: translateY(-50%);
    }

    .frist-top {
      top: 55px;
    }

    .other-item {
      position: absolute;
      top: 90px;
      left: -50px;
    }

    .item {
      box-sizing: border-box;
      position: relative;
      height: 0;
      z-index: 10;
      margin: 0 auto;
    }

    .number-item {
      height: 50px;
      width: 180px;
      border-bottom: 1px solid currentColor;
      position: absolute;
      top: -50px;
      left: -180px;
      text-align: left;
      padding-left: 10px;
    }

    .number-item::before {
      content: '';
      display: inline-block;
      width: 10px;
      height: 1px;
      background-color: currentColor;
      transform: rotate(45deg);
      position: absolute;
      bottom: 3px;
      left: -9px;
    }
    .funnel-item0 {
      width: 424px;
      color: var(--item0);
      border-top: 106px solid var(--item0);
      border-right: 53px solid transparent;
      border-left: 53px solid transparent;
    }

    .funnel-item0::after {
      content: '潜客数';
      position: absolute;
      top: -50px;
      //left: 191px;
      color: #ffffff;
      transform: translate(-50%, -50%);
    }

    .funnel-item1 {
      width: 311px;
      color: var(--item1);
      border-top: 99px solid var(--item1);
      border-right: 50px solid transparent;
      border-left: 50px solid transparent;
    }

    .funnel-item1::after {
      // content: '高意向潜客数';
      content: '留资转化数';
      position: absolute;
      top: -50px;
      //left: 132px;
      color: #ffffff;
      transform: translate(-50%, -50%);
    }

    .funnel-item2 {
      width: 205px;
      color: var(--item2);
      border-top: 99px solid var(--item2);
      border-right: 50px solid transparent;
      border-left: 50px solid transparent;
    }

    .funnel-item2::after {
      content: '有效留资数';
      position: absolute;
      top: -50px;
      width: 100px;
      //left: 82px;
      color: #ffffff;
      transform: translate(-50%, -50%);
    }

    .funnel-item3 {
      width: 99px;
      color: var(--item3);
      border-top: 69px solid var(--item3);
      border-right: 30px solid transparent;
      border-left: 30px solid transparent;
    }

    .funnel-item3::after {
      content: '到店数';
      position: absolute;
      width: 50px;
      top: -33px;
      //left: 46px;
      color: #ffffff;
      transform: translate(-50%, -50%);
    }

    //.funnel-item4 {
    //  width: 85px;
    //  color: var(--item4);
    //  border-top: 59px solid var(--item4);
    //  border-right: 25px solid transparent;
    //  border-left: 25px solid transparent;
    //}
    //
    //.funnel-item4::after {
    //  content: '到店数';
    //  position: absolute;
    //  top: -30px;
    //  left: 17px;
    //  width: 100px;
    //  color: #ffffff;
    //  transform: translate(-50%, -50%);
    //}

    > :not(:first-child) {
      margin-top: 5px;
    }
  }
}
</style>
