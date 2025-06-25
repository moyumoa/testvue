<template>
  <div class="data_activity">
    <div class="data_title">
      <img
        src="@/assets/images/content_center/video.png"
        alt
        v-if="dataList.type == 1"
        class="icon_img"
      />
      <img
        src="@/assets/images/content_center/live.png"
        alt
        v-if="dataList.type == 2"
        class="icon_img"
      />
      <p class="title">{{ dataList.title || '-' }}</p>
    </div>
    <div class="data_con">
      <figure class="con_item" v-for="(item, index) in dataList.data" :key="index">
        <span class="data_value" v-if="item.key === 'liveDurationTarget'">
          {{ secondToDate(parseInt(item.value / 1000) || 0, '', false, false, true) || 0 }}
        </span>
        <span class="data_value" v-else>{{ item.value || 0 }}</span>
        <figcaption class="data_label">{{ item.label }}</figcaption>
      </figure>
    </div>
  </div>
</template>

<script setup>
import { secondToDate } from '@/utils/tools.js'
const props = defineProps({
  dataList: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
const { dataList } = toRefs(props)
// wanSliceFormat()
</script>

<style lang="scss" scoped>
.data_activity {
  width: 100%;
  margin-top: 20px;
  .data_title {
    display: flex;
    align-items: center;
    .icon_img {
      width: 20px;
      height: 20px;
      margin-right: 8px;
    }
    .title {
      font-size: 16px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #303133;
      line-height: 22px;
    }
  }
  .data_con {
    display: flex;
    flex-wrap: wrap;
    padding: 12px 0;
    background: #f6f7f8;
    border-radius: 4px;
    margin-top: 16px;
    .con_item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 25%;
      &:nth-of-type(5),
      &:nth-of-type(6),
      &:nth-of-type(7),
      &:nth-of-type(8) {
        margin-top: 20px;
      }
      .data_value {
        font-size: 18px;
        font-family: DIN-Bold, DIN;
        font-weight: bold;
        color: #333333;
        line-height: 22px;
        white-space: nowrap;
      }
      .data_label {
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #909399;
        line-height: 17px;
        margin-top: 6px;
      }
    }
  }
}
</style>
