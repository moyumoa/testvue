<template>
  <el-dialog ref="dialog" destroy-on-close title="查看视频" width="444px" v-model="show">
    <video
      class="video"
      style="width: 400px; height: auto; max-height: 70vh"
      :src="props.videoDialog.url"
      controls="controls"
      autoplay
    ></video>
  </el-dialog>
</template>
<script setup>
const props = defineProps({
  videoDialog: {
    type: Object,
    default: () => {
      return {
        show: false, // 是否显示弹窗
        url: ''
      }
    },
    required: true
  }
})
// const dialog = ref()
const show = toRef(props.videoDialog, 'show')
// function closeDialog() {
//   console.log(dialog.value)
//   dialog.value.handleClose()
// }
</script>
<style lang="scss" scoped></style>
