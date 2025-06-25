<template>
  <el-dialog
    ref="dialog"
    destroy-on-close
    v-model="show"
    title="添加文本"
    width="500px"
    custom-class="rule_setting_dialog hide_footer_line"
  >
    <div class="dialog_content">
      <el-input
        v-model="textarea"
        maxlength="300"
        :rows="10"
        type="textarea"
        placeholder="请输入文本"
        @blur="retEmit($event)"
        show-word-limit
        resize="none"
      />
      <div class="error_text" v-if="showErr">请输入文本</div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { addContent } from '@/api/content_center/material_library.js'
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  addDialog: {
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
const show = toRef(props.addDialog, 'show')
const loading = ref(false)
const showErr = ref(false)
const textarea = ref('')
const message = inject('$message')
const emits = defineEmits(['updateList'])
const handleConfirm = throttle(() => {
  const text = textarea.value.replace(/&nbsp;/g, '').replace(/ /g, '')
  if (text) {
    loading.value = true
    showErr.value = false
    addContent({
      content: textarea.value,
      source: 3
    })
      .then(res => {
        if (res.code === 0) {
          message({
            type: 'success',
            message: '添加成功'
          })
          dialog.value.handleClose()

          emits('updateList')
        } else {
          loading.value = false
        }
      })
      .catch(() => {
        loading.value = false
      })
  } else {
    showErr.value = true
  }
}, 700)
function closeDialog() {
  dialog.value.handleClose()
}
// 检查是否有表情包
function retEmit(e) {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  textarea.value = e.target.value.replace(reg, '')
}
</script>
<style lang="scss" scoped>
.error_text {
  color: #ff0000;
  margin-top: 8px;
}
div {
  box-sizing: border-box;
}
.dialog_content {
  width: 100%;
  padding: 16px 16px 12px;
}
</style>
