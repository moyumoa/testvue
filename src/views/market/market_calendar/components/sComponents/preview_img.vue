<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    :title="'查看'"
    custom-class="hide_footer_line choose_part_dialog"
  >
    <div class="preview_img_div">
      <img v-if="imgUrl" :src="imgUrl" alt="" class="preview_img" />
    </div>
  </el-dialog>
</template>
<script setup>
const props = defineProps({
  dateDialog: {
    type: Object,
    default: () => {
      return {
        show: false, // 是否显示弹窗
        imgUrlList: [], // 如果可以的话
        imgUrl: '' // 预览单张图片
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.dateDialog, 'show')
const imgUrl = toRef(props.dateDialog, 'imgUrl')
</script>
<style lang="scss" scoped>
.preview_img_div {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 32px;
  .preview_img {
    max-width: 500px;
    object-fit: contain;
  }
}
</style>
