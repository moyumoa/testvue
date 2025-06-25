<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    :title="name || ''"
    width="820px"
    custom-class="rule_setting_dialog hide_footer_line "
    append-to-body
  >
    <div class="content" :style="fileType === 'txt' || fileType === 'pdf' ? 'padding:0' : ''">
      <!-- .pdf -->
      <preview_pdf v-if="fileType === 'pdf'" :url="url" />
      <!-- .txt -->
      <preview_txt v-if="fileType === 'txt'" :url="url" />
      <!-- .doc -->
      <preview_doc v-if="fileType === 'doc'" :url="url" />
      <!-- .xls -->
      <preview_xls v-if="fileType === 'xls'" :url="url" />
    </div>
  </el-dialog>
</template>
<script setup>
const props = defineProps({
  previewFileDialog: {
    type: Object,
    default: () => {
      return {
        name: '',
        fileType: '', // 预览类型
        url: '', // 预览的地址
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const { show, url, fileType, name } = toRefs(props.previewFileDialog)
</script>
<style lang="scss" scoped>
.content {
  max-height: 65vh;
  overflow-y: auto;
  padding: 16px;
}
div,
* {
  box-sizing: border-box;
}
</style>
