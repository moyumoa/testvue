<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="重新授权"
      width="420px"
      custom-class="xm_element_dialog"
    >
      <div class="content_box">
        <div class="content1">
          启用账号后，获取数据将消耗1星力值/天，重新启用后会自动恢复原有账号状态
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="doReAuth">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'
const emit = defineEmits(['auth'])
const props = defineProps({
  reAuthDialog: {
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
const show = toRef(props.reAuthDialog, 'show')
const row = toRef(props.reAuthDialog, 'row')
const doReAuth = throttle(() => {
  console.log('doReAuth', row.value)
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
