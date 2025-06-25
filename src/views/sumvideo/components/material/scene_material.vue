<template>
  <div class="scene_box">
    <div
      :class="{
        video_item: true,
        video_item_checked: item.checked,
        video_item_scene: true
      }"
      v-for="(item, index) in chooseList"
      :key="item.id || index"
    >
      <div class="item_top" @click.stop="choseItem(item)">
        <sceneCover
          class="cover_img"
          :isByXM="item.brandId === '0'"
          :list="item.pictures ? JSON.parse(item.pictures) : [{ url: item.url }]"
        />

        <div class="info_warp">
          <div></div>
          <div class="select_warp">
            <img
              src="https://tagvv-1256030678.file.myqcloud.com/20240328o5ms2.png"
              alt=""
              class="select_icon"
              v-if="checkList.includes(item.tagvvMediaId || item.id)"
            />
            <img
              src="https://tagvv-1256030678.file.myqcloud.com/20240328hqqm4.png"
              alt=""
              class="select_icon select_icon_active"
              v-else
            />
          </div>
        </div>
      </div>
      <div class="item_name">{{ item.name || '' }}</div>
    </div>
  </div>
</template>
<script setup>
import sceneCover from '@/views/sumvideo/components/scene_cover.vue'
const props = defineProps({
  chooseList: {
    type: Array,
    default: () => {
      return []
    }
  },
  checkList: {
    type: Array,
    default: () => {
      return []
    }
  }
})
const {
  chooseList,

  checkList
} = toRefs(props)

const emits = defineEmits(['updateSelect'])
// 选择/取消选择
function choseItem(item) {
  emits('updateSelect', item)
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.scene_box {
  padding-left: 12px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  .video_item {
    width: 120px !important;
    height: max-content;
    margin-right: 12px;
    margin-bottom: 12px;
    &:nth-of-type(6n) {
      margin-right: 0;
    }
    .item_top {
      box-sizing: border-box;
      display: flex;
      cursor: pointer;
      width: 100%;
      height: 120px !important;
      position: relative;
      background: #f2f3f5;
      border-radius: 4px;
      border: 2px solid #fff;
      overflow: hidden;
    }
    .item_name {
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: center;
      font-weight: 400;
      font-size: 12px;
      color: #606266;
      line-height: 17px;
      margin-top: 8px;
    }
    .cover_img {
      object-fit: cover;
      width: 100%;
      height: 100%;
      display: flex;
      overflow-clip-margin: border-box;
      -webkit-overflow-clip-margin: border-box;
    }
    .info_warp {
      position: absolute;
      bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px;
      width: 100%;
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 12px;
      color: #909399;
      .time_box {
        color: #fff;
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        font-size: 12px;
        color: #ffffff;
        line-height: 14px;
        padding: 0 4px;
        height: max-content;
        width: max-content;
        background: rgba(0, 0, 0, 0.4);
        border-radius: 2px;
      }
    }
    .select_warp {
      .select_icon {
        width: 16px;
        height: 16px;
        display: block;
      }
    }
    .video_mask {
      width: max-content;
      height: max-content;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      align-items: center;
      justify-content: center;
      display: none;
      border-radius: 4px;
      z-index: 8;
      .play_icon {
        width: 40px;
        height: 40px;
      }
    }
    &:hover {
      .video_mask {
        display: flex;
      }
    }
  }
  .video_item_checked {
    .item_top {
      border-color: #364fcd;
    }
  }
}

.video_item_scene:nth-of-type(6n) {
  margin-right: 12px !important;
}
</style>
