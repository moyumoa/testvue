<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    :title="infoDialog.title"
    width="420px"
    custom-class="info_dialog"
  >
    <div class="del_content">{{ infoDialog.content || '' }}</div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeFun">{{ infoDialog.cancelBtnText || '取消' }}</el-button>
        <el-button type="primary" :loading="loading" @click="saveFun">
          {{ infoDialog.confirmBtnText || '确定' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  infoDialog: {
    type: Object,
    default: () => {
      return {
        show: true, // 是否显示弹窗
        title: '提醒', // 弹窗的标题
        content: '', // 弹窗的内容
        cancelBtnText: '取消', // 取消按钮的显示文字
        confirmBtnText: '确定' // 确定按钮的显示文字
      }
    },
    required: true
  },
  asyncFunc: Function
})
const dialog = ref()
const show = toRef(props.infoDialog, 'show')
const loading = ref(false)
function closeFun() {
  dialog.value.handleClose()
  loading.value = false
}
const saveFun = throttle(() => {
  loading.value = true
  props
    .asyncFunc()
    .then(() => {
      closeFun()
    })
    .catch(() => {
      closeFun()
    })
}, 500)
</script>
<style lang="scss" scoped>
.del_content {
  padding: 16px;
  font-size: 14px;
  font-weight: 400;
  color: #323233;
  line-height: 20px;
  min-height: 60px;
}
</style>
