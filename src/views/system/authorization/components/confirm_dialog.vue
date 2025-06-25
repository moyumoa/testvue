<template>
  <el-dialog
    :model-value="props.visible"
    :show-close="false"
    width="500px"
    custom-class="hide_footer_line hide_header_line"
    :before-close="close"
  >
    <div class="tip">{{ props.tip }}</div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false },
  tip: { type: String, default: '提示语' }
})
const emits = defineEmits(['confirm', 'update:visible'])

const confirm = () => {
  emits('confirm')
  close()
}
const close = () => {
  emits('update:visible', false)
}
</script>

<style scoped>
.tip {
  font-size: 18px;
  padding-bottom: 22px;
}
</style>
