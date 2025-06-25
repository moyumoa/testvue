<template>
  <el-dialog
    ref="dialog"
    destroy-on-close
    v-model="show"
    title="提示"
    width="500px"
    custom-class="rule_setting_dialog hide_footer_line"
  >
    <div class="dialog_content">
      <div>
        本次任务将消耗
        <span>{{ couponNum || 0 }}</span>
        智能合成星力值
      </div>
      <div>余额不足，请先充值！</div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleConfirm">去充值</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  tipDialog: {
    type: Object,
    default: () => {
      return {
        couponNum: null, // 生产券数
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
// const dialog = ref()
const show = toRef(props.tipDialog, 'show')

const { couponNum } = toRefs(props.tipDialog)

const handleConfirm = throttle(() => {
  window.open(`${location.origin}/system_manage/voucher_center?tab=sumvideo`, '_blank')
  // dialog.value.handleClose()
}, 700)
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.dialog_content {
  width: 100%;
  padding: 16px 16px 12px;
  span {
    color: #364fcd;
  }
  div + div {
    margin-top: 10px;
  }
}
</style>
