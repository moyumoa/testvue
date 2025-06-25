<template>
  <div>
    <el-dialog
      :close-on-click-modal="false"
      ref="dialog"
      custom-class="xm_preview_dialog"
      destroy-on-close
      v-model="show"
      width="672px"
    >
      <!-- 关闭按钮 -->
      <img
        src="https://tagvv-1256030678.file.myqcloud.com/20250427j1lzt.png"
        class="dialog_close"
        @click.stop="closeFun"
      />
      <div class="dialog_container">
        <video class="video_dom" :src="props.videoDialog.url" controls="controls" autoplay></video>
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools'
const props = defineProps({
  videoDialog: {
    type: Object,
    default: () => {
      return {
        url: '',
        show: true // 是否显示弹窗
      }
    }
  }
})
const show = toRef(props.videoDialog, 'show')

const dialog = ref()
const closeFun = throttle(() => {
  dialog.value.handleClose()
}, 300)
</script>
<style lang="scss" scoped>
.dialog_container {
  height: 672px;
  width: 100%;
  background: #f7f8fa;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  border-radius: 8px;
  align-items: flex-start;
  .video_dom {
    width: 360px;
    height: 640px;
    border-radius: 4px;
    margin: 16px auto;
  }
}
.dialog_close {
  cursor: pointer;
  position: absolute;
  top: -20px;
  right: -52px;
  width: 32px;
  height: 32px;
  display: flex;
}
</style>
