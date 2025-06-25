<template>
  <el-dialog
    v-model="dialogVisible"
    @closed="close"
    title="课程内容预览"
    width="420px"
    top="50px"
    center
    destroy-on-close
  >
    <div class="dialog_content">
      <div class="phone">
        <div class="phone_header"></div>
        <div class="phone_main">
          <div class="video_wrapper" v-if="classInfo.videoUrl">
            <video
              :src="classInfo.videoUrl"
              :poster="classInfo.videoCoverUrl"
              controls
              autoplay
            ></video>
          </div>
          <div class="content" v-html="classInfo.content"></div>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button type="primary" @click="close">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  classInfo: Object,
  dialogVisible: Boolean
})
const { classInfo, dialogVisible } = toRefs(props)
const emits = defineEmits(['update:dialogVisible'])

function close() {
  emits('update:dialogVisible', false)
}
</script>

<style lang="scss" scoped>
.dialog_content {
  .phone {
    width: 375px;
    height: 667px;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
    .phone_header {
      flex-shrink: 0;
      width: 100%;
      height: 80px;
      background-size: cover;
      background-image: url('/src/assets/images/diy/phone_header.png');
    }
    .phone_main {
      flex: 1;
      padding: 8px 12px 0 12px;
      overflow-y: auto;
      .video_wrapper {
        height: 193px;
        background: #181818;
        border-radius: 4px;
        overflow: hidden;
        video {
          width: 100%;
          height: 100%;
        }
      }
      .content {
        word-break: break-all;
        margin-top: 20px;
        word-break: break-all;
        word-wrap: break-word;
      }
    }
  }
}
:deep(img) {
  display: block;
}
</style>
