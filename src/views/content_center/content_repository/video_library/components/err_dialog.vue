<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="灵感载入失败"
    width="467px"
    custom-class="rule_setting_dialog rule_setting_form_dialog hide_footer_line hide_header_line"
  >
    <div class="content_box">
      <div class="title">请在点击下方灵感链接下载灵感后尝试本地上传</div>
      <a
        style="font-size: 14px; word-break: break-all; color: #364fcd"
        :href="downloadUrl"
        target="_blank"
      >
        {{ downloadUrl }}
      </a>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="closeDialog">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  addDialog: {
    type: Object,
    default: () => {
      return {
        show: true, // 是否显示弹窗
        downloadUrl: ''
      }
    },
    required: true
  }
})

const dialog = ref()
const show = toRef(props.addDialog, 'show')
const downloadUrl = toRef(props.addDialog, 'downloadUrl')

const closeDialog = throttle(() => {
  dialog.value.handleClose()
})
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.content_box {
  padding: 0 24px 16px;
  .title {
    width: 100%;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
    padding-bottom: 14px;
  }
}
</style>
