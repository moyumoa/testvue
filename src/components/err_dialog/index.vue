<template>
  <div>
    <el-dialog v-model="show" width="400px" center ref="dialog">
      <template #title>
        <div class="warning_title">{{ warningInfo.title || '操作失败' }}</div>
      </template>
      <div class="warning_text">{{ warningInfo.msg }}</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="dialog.handleClose()">我知道了</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
const props = defineProps({
  actionDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.actionDialog, 'show')
const warningInfo = ref({})
function init() {
  if (props.actionDialog.info) {
    const info = JSON.parse(JSON.stringify(props.actionDialog.info))
    warningInfo.value = info
  } else {
    warningInfo.value = {}
  }
}
init()
</script>
<style lang="scss" scoped>
.warning_title {
  color: #f56c6c;
  font-size: 16px;
}
.warning_text {
  line-height: 24px;
  max-height: 50vh;
  overflow-y: auto;
}
</style>
