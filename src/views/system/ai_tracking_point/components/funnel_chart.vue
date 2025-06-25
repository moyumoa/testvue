<template>
  <div class="funnel-chart">
    <div class="chart-container" id="funnel-chart">
      <div class="wrapper-item" v-for="(item, index) in props.list" :key="item.key">
        <div :class="['funnel-item' + index, 'item']" :data-content="item.label">
          <div class="number-item">
            <div class="info-text">PV：{{ item.pvValue || '0' }}</div>
            <div class="info-text">UV：{{ item.uvValue || '0' }}</div>
          </div>
        </div>
      </div>
      <!--      <div class="wrapper-item">-->
      <!--        <div class="funnel-item1 item">-->
      <!--          <div class="number-item">-->
      <!--            <div class="info-text">潜客转化留资数</div>-->
      <!--            <div class="info-text">{{ info.clientClueUcnt || '0' }}</div>-->
      <!--          </div>-->
      <!--        </div>-->
      <!--      </div>-->
      <!--      <div class="wrapper-item">-->
      <!--        <div class="funnel-item2 item">-->
      <!--          <div class="number-item">-->
      <!--            <div class="info-text">转化有效留资数</div>-->
      <!--            <div class="info-text">{{ info.clientCluePhoneValidUcnt || '0' }}</div>-->
      <!--          </div>-->
      <!--        </div>-->
      <!--      </div>-->
      <!--      <div class="wrapper-item">-->
      <!--        <div class="funnel-item3 item">-->
      <!--          <div class="number-item">-->
      <!--            <div class="info-text">转化到店数</div>-->
      <!--            <div class="info-text">{{ info.consultStageArrivedStoreUcnt || '0' }}</div>-->
      <!--          </div>-->
      <!--        </div>-->
      <!--      </div>-->
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  list: {
    type: Array,
    default: () => {
      return []
    }
  }
})
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
    --item0: #9daeff;
    --item1: #7e93ff;
    --item2: #6981ff;
    --item3: #2648ee;

    .wrapper-item {
      width: 448px;
      position: relative;
      font-size: 12px;

      .info-text {
        font-size: 14px;
        color: #606266;
        line-height: 20px;
      }
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
      width: 170px;
      border-bottom: 1px solid currentColor;
      position: absolute;
      top: -50px;
      right: -170px;
      padding-left: 10px;
      text-align: right;
    }

    .number-item::before {
      content: '';
      display: inline-block;
      width: 10px;
      height: 1px;
      background-color: currentColor;
      transform: rotate(-45deg);
      position: absolute;
      bottom: 3px;
      right: -9px;
    }

    .funnel-item0 {
      width: 360px;
      color: var(--item0);
      border-top: 90.27px solid var(--item0);
      border-right: 47px solid transparent;
      border-left: 47px solid transparent;
    }

    .funnel-item0::after {
      content: attr(data-content);
      position: absolute;
      top: -50px;
      //left: 191px;
      color: #ffffff;
      transform: translate(-50%, -50%);
    }

    .funnel-item1 {
      width: 264.38px;
      color: var(--item1);
      border-top: 84.63px solid var(--item1);
      border-right: 44px solid transparent;
      border-left: 44px solid transparent;
    }

    .funnel-item1::after {
      content: attr(data-content);
      position: absolute;
      top: -50px;
      //left: 132px;
      color: #ffffff;
      transform: translate(-50%, -50%);
    }

    .funnel-item2 {
      width: 174.38px;
      color: var(--item2);
      border-top: 84.63px solid var(--item2);
      border-right: 44px solid transparent;
      border-left: 44px solid transparent;
    }

    .funnel-item2::after {
      content: attr(data-content);
      position: absolute;
      top: -50px;
      width: 100px;
      //left: 82px;
      color: #ffffff;
      transform: translate(-50%, -50%);
    }

    .funnel-item3 {
      width: 84.36px;
      color: var(--item3);
      border-top: 58.73px solid var(--item3);
      border-right: 28px solid transparent;
      border-left: 28px solid transparent;
    }

    .funnel-item3::after {
      content: attr(data-content);
      position: absolute;
      width: 50px;
      top: -33px;
      //left: 46px;
      color: #ffffff;
      transform: translate(-50%, -50%);
    }

    > :not(:first-child) {
      margin-top: 5px;
    }
  }
}
</style>
