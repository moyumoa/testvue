<template>
  <div class="data_box">
    <div class="one_data" v-if="showList.includes('play')">
      <div class="data_top">
        <img src="https://tagvv-1256030678.file.myqcloud.com/20240411x4uwi.png" alt="" />
        播放
      </div>
      <div class="data_bottom">{{ wanSliceFormat(info.playCount || 0) }}</div>
    </div>
    <div class="one_data" v-if="showList.includes('digg')">
      <div class="data_top">
        <img src="https://tagvv-1256030678.file.myqcloud.com/20240411gydba.png" alt="" />
        点赞
      </div>
      <div class="data_bottom">{{ wanSliceFormat(info.diggCount || 0) }}</div>
    </div>
    <div class="one_data" v-if="showList.includes('comment')">
      <div class="data_top">
        <img src="https://tagvv-1256030678.file.myqcloud.com/20240411me952.png" alt="" />
        评论
      </div>
      <div class="data_bottom">{{ wanSliceFormat(info.commentCount || 0) }}</div>
    </div>
    <div class="one_data" v-if="showList.includes('collect')">
      <div class="data_top">
        <img src="https://tagvv-1256030678.file.myqcloud.com/20240627e5ifn.png" alt="" />
        收藏
      </div>
      <div class="data_bottom">{{ wanSliceFormat(info.collectCount || 0) }}</div>
    </div>
    <div class="one_data" v-if="showList.includes('share')">
      <div class="data_top">
        <img src="https://tagvv-1256030678.file.myqcloud.com/20240411wvy97.png" alt="" />
        分享
      </div>
      <div class="data_bottom">{{ wanSliceFormat(info.shareCount || 0) }}</div>
    </div>
  </div>
</template>
<script setup>
import { wanSliceFormat } from '@/utils/tools.js'

const props = defineProps({
  showList: {
    type: Array,
    default: () => {
      return ['play', 'digg', 'comment', 'share']
    }
  },
  info: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
const { info, showList } = toRefs(props)
</script>
<style lang="scss" scoped>
.data_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  .one_data {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    .data_top {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      font-weight: 400;
      font-size: 12px;
      color: #909399;
      line-height: 18px;
      white-space: nowrap;
      img {
        width: 16px;
        height: 16px;
        margin-right: 1px;
      }
    }
    .data_bottom {
      margin-top: 2px;
      font-weight: 400;
      font-size: 14px;
      color: #303133;
      line-height: 20px;
    }
  }
  .one_data + .one_data {
    margin-left: 20px;
  }
}
</style>
