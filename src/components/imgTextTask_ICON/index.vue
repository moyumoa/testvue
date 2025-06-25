<template>
  <div class="imgText_ICON">
    <div class="icon_box" v-if="useClick" @click.stop="openFun">
      <div class="icon_icon">
        <img src="https://tagvv-1256030678.file.myqcloud.com/20230921uyzee.png" alt="" />
      </div>
    </div>
    <div class="icon_box" v-else>
      <div class="icon_icon">
        <img src="https://tagvv-1256030678.file.myqcloud.com/20230921uyzee.png" alt="" />
      </div>
    </div>
    <preview_imgText v-if="previewDialog.show" :previewDialog="previewDialog" />
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools'
const props = defineProps({
  info: {
    type: Object,
    default() {
      return {}
    }
  },
  useClick: {
    type: Boolean,
    default: true
  }
})
const useClick = toRef(props, 'useClick')
const previewDialog = ref({
  show: false,
  info: {}
})
const openFun = throttle(() => {
  // 抖音平台就跳转到播放页，否则就打开图集 2024/08/05 修改 小红书打开播放页
  if (props.info.platform === 1 || props.info.platform === 3) {
    props.info.shareUrl ? window.open(props.info.shareUrl) : window.open(props.info.videoUrl)
  } else {
    previewDialog.value.info = props.info
    previewDialog.value.show = true
  }
}, 500)
</script>
<style lang="scss" scoped>
.imgText_ICON {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
}
.icon_box {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  cursor: pointer;
  .icon_icon {
    position: absolute;
    right: 4px;
    top: 4px;
    cursor: pointer;
    padding: 2px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 2px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    img {
      display: flex;
      width: 12px;
      height: 12px;
      object-fit: contain;
    }
  }
}
</style>
