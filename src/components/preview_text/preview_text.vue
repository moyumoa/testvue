<template>
  <el-dialog
    ref="dialog"
    destroy-on-close
    title="查看文本"
    width="347px"
    v-model="show"
    custom-class="rule_setting_dialog"
  >
    <div class="dialog_content">
      <div class="content_box">
        <div class="content" v-html="text"></div>
      </div>
    </div>
  </el-dialog>
</template>
<script setup>
const props = defineProps({
  previewDialog: {
    type: Object,
    default: () => {
      return {
        show: false, // 是否显示弹窗
        text: ''
      }
    },
    required: true
  }
})
const show = toRef(props.previewDialog, 'show')
const text = toRef(props.previewDialog, 'text')
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.dialog_content {
  padding: 16px;
  .content_box {
    width: 100%;
    max-height: 400px;
    min-height: 80px;
    font-size: 14px;
    font-weight: 400;
    color: #606266;
    line-height: 20px;
    background: #f6f8fa;
    border-radius: 4px;
    padding: 12px 16px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }
}
</style>
