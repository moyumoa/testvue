<template>
  <div class="data_progress">
    <div class="one_progress" v-for="(item, index) in dataList" :key="index">
      <div class="one_top">
        <div class="top_left">
          <span class="left_label">{{ item.label || '-' }}</span>
          <span class="left_value">{{ item.current || 0 }}</span>
        </div>
        <div class="top_right">目标 {{ item.target }}</div>
      </div>
      <div class="one_bottom">
        <el-progress :stroke-width="6" :percentage="item.percent > 100 ? 100 : item.percent || 0" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { changeTwoDecimal } from '@/utils/tools.js'

const props = defineProps({
  dataList: {
    type: Array,
    default: () => {
      return []
    }
  }
})
const { dataList } = toRefs(props)

watch(
  () => dataList.value,
  value => {
    value.forEach(item => {
      console.log('百分比value', item)
      const currentValue = Number(item.current)
      const targetValue = Number(item.target)
      const midPercent = parseFloat((currentValue / targetValue) * 100).toFixed(2)
      if (isNaN(midPercent)) item.percent = 0
      else {
        item.percent = midPercent
      }
      if (item.key === 3) {
        item.current = changeTwoDecimal(item.current)
        item.target = targetValue / 100
      }
    })
  },
  {
    immediate: true
  }
)
console.log('dataList', dataList.value)
</script>

<style lang="scss" scoped>
.data_progress {
  width: 100%;
  .one_progress {
    display: flex;
    flex-direction: column;
    margin-top: 18px;
    &:first-of-type {
      margin-top: unset;
    }
    .one_top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .top_left {
        display: flex;
        align-items: center;
        justify-content: center;
        .left_label {
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #303133;
          line-height: 20px;
        }
        .left_value {
          font-size: 14px;
          font-family: PingFangSC-Medium, PingFang SC;
          font-weight: 500;
          color: #364fcd;
          line-height: 20px;
          margin-left: 4px;
        }
      }
      .top_right {
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #bfc4cd;
        line-height: 18px;
      }
    }
    .one_bottom {
      margin-top: 10px;
      :deep(.el-progress__text) {
        font-size: 14px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #323233;
        text-align: end;
        min-width: 40px;
      }
    }
  }
}
</style>
