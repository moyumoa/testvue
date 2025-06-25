<template>
  <div class="userPlay_box">
    <div style="padding: 0 16px; box-sizing: border-box">
      <div class="box_title">
        <div>成员曝光排行</div>
        <div class="mark">(近七天)</div>
        <el-tooltip
          placement="top"
          :content="systemVersion === 4 ? '视频播放数' : '视频播放数加上直播观看人数'"
          transfer
          max-width="500"
        >
          <img
            style="width: 14px; height: 14px; margin-left: 8px"
            src="\src\assets\images\operate\tip_line.png"
            alt
          />
        </el-tooltip>
      </div>
      <div class="box_head">
        <div class="head_1">排行</div>
        <div class="head_2">成员信息</div>
        <div class="head_3">曝光数</div>
      </div>
      <div class="box_all" v-if="list.length > 0">
        <div class="box_data" v-for="(item, index) in list" :key="index">
          <div class="head_1">
            <img v-if="index == 0" src="@/assets/images/sort_img/num_one.png" alt />
            <img v-else-if="index == 1" src="@/assets/images/sort_img/num_two.png" alt />
            <img v-else-if="index == 2" src="@/assets/images/sort_img/num_three.png" alt />
            <span v-if="index > 2">{{ index + 1 }}</span>
          </div>
          <div class="head_2">
            <img :src="item.avatar || avatarImg" alt />
            <div
              class="line-hidden1"
              :style="
                item.staffStatus && item.staffStatus == 2 ? 'max-width:calc(100% - 88px)' : ''
              "
            >
              {{ item.name || '--' }}
            </div>
            <div class="xm_depart" v-if="item.staffStatus && item.staffStatus == 2"></div>
          </div>
          <div class="head_3">{{ wanSliceFormat(item.num || 0) }}</div>
        </div>
      </div>
      <div class="noChartBox" v-else>
        <div style="text-align: center">暂无数据</div>
      </div>
    </div>
  </div>
</template>
<script setup>
// import util from '@/libs/util.js'
import { wanSliceFormat } from '@/utils/tools.js'
import avatarImg from '@/assets/images/operate/default_user.png'

import { getUserRank } from '@/api/market/overview.js'
import { useStore } from 'vuex'
const store = useStore()
const systemVersion = computed(() => store.state.user.systemVersion)

// export default {
// setup() {
const list = ref([])
function getlist() {
  getUserRank({}).then(res => {
    list.value = res.data
  })
}
getlist()
// return {
//   wanSliceFormat,
//   list
// }
// }
// }
</script>
<style lang="scss" scoped>
.userPlay_box {
  background: #fff;
  margin-bottom: 8px;
  border-radius: 4px;
  .box_title {
    width: 100%;
    height: 55px;
    font-size: 18px;
    font-weight: 400;
    color: #333333;
    line-height: 1;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .mark {
      margin: 0 4px;
      font-size: 14px;
      font-weight: 400;
      color: #666666;
      line-height: 22px;
    }
  }
  .box_head {
    height: 40px;
    background: #f7f7f7;
  }
  .box_all {
    width: 100%;
    padding: 2px 0 5px;
  }
  .box_head,
  .box_data {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-size: 14px;
    font-weight: 400;
    color: #333333;
    line-height: 22px;
  }
  .box_data {
    padding: 10px 0;
  }
  .head_1 {
    width: 60px;
    text-align: center;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    img {
      width: 20px;
      height: 20px;
    }
    span {
      display: inline-block;
      width: 20px;
      height: 22px;
      text-align: center;
      line-height: 22px;
      // border-radius: 100%;

      font-size: 16px;
      font-weight: bold;
      color: #333333;
    }
  }
  .head_2 {
    // @include mult_line(1);
    width: calc((100% - 60px) * 2 / 3);
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .rowOverflow {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow-wrap: break-word;
    }
    img {
      width: 28px;
      height: 28px;
      margin-right: 8px;
      border-radius: 100%;
      object-fit: cover;
    }
    div {
      width: calc(100% - 36px);
      word-break: break-all;
    }
  }
  .head_3 {
    width: 60px;
    text-align: right;
    // padding-right: 19px;
  }
}
.noChartBox {
  width: 100%;
  height: 350px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  color: #909399;
  line-height: 25px;
  background: #fff;
  img {
    margin-bottom: 12px;
  }
}
</style>
