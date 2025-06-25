<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="解除授权"
      width="420px"
      custom-class="xm_element_dialog"
    >
      <div class="content_box">
        <div class="content1">解除授权后，将停止更新账号所有数据，同时停止扣除星力值，再次授权需重新扫码</div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="doCancel">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'
const emit = defineEmits(['auth'])
const props = defineProps({
  cancelAuthDialog: {
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
const show = toRef(props.cancelAuthDialog, 'show')

const doCancel = throttle(() => {
  emit('auth')
  dialog.value.handleClose()
}, 500)

function handleClose() {
  dialog.value.handleClose()
}

// onBeforeUnmount()
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.content_box {
  padding-bottom: 12px;
  .content1 {
    font-size: 14px;
    font-weight: 400;
    color: #323233;
    line-height: 20px;
  }
  .content2 {
    margin-top: 8px;
    font-size: 14px;
    font-weight: 400;
    color: #606266;
    line-height: 20px;
    p + p {
      margin-top: 6px;
    }
    span {
      font-weight: 600;
    }
  }
}
</style>
