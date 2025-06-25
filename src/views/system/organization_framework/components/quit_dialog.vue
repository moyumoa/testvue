<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    title="操作离职"
    width="420px"
    v-model="show"
    custom-class="xm_element_dialog delPart_dialog"
  >
    <div class="delpart_content">成员离职后账号将自动禁用且无法再次启用，确认操作离职？</div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="danger" :loading="loading" @click="saveFun">确定离职</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { userResign } from '@/api/system_setting/framework.js'

import { throttle } from '@/utils/tools.js'
const props = defineProps({
  quitDialog: {
    type: Object,
    default: () => {
      return {
        userId: null,
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const loading = ref(false)
const dialog = ref()
const show = toRef(props.quitDialog, 'show')
function closeDialog() {
  dialog.value.handleClose()
}
const $message = inject('$message')
const emits = defineEmits(['getStaffList'])
const saveFun = throttle(() => {
  userResign({ userId: props.quitDialog.userId })
    .then(res => {
      if (res.code === 0) {
        $message.success('离职成功')
        emits('getStaffList')
      }
      closeDialog()
    })
    .catch(() => {
      closeDialog()
    })
}, 700)
</script>
<style lang="scss" scoped>
.delpart_content {
  font-size: 14px;
  padding-bottom: 37px;
  font-weight: 400;
  color: #323233;
  line-height: 20px;
}
</style>
