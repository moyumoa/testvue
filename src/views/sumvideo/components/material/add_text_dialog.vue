<template>
  <el-dialog
    :close-on-click-modal="false"
    ref="dialog"
    custom-class="rule_setting_dialog hide_footer_line"
    destroy-on-close
    v-model="show"
    title="添加文本"
    width="560px"
  >
    <div class="select_material_content">
      <el-form :model="form" :rules="rules" ref="ruleForm" style="width: 100%">
        <el-form-item label="文本" prop="inputText">
          <el-input
            type="textarea"
            :autosize="false"
            resize="none"
            :maxlength="maxlength"
            v-model="form.inputText"
            @blur="retEmit"
            placeholder="请输入文本内容"
            style="width: 100%; height: 176px"
            show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="btnLoading" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
const props = defineProps({
  minlength: {
    type: Number,
    default: 1
  },
  maxlength: {
    type: Number,
    default: 300
  },
  isSaveCloseDialog: {
    type: Boolean,
    default: true
  }, // 是否保存直接关闭弹窗
  info: {
    show: false
  } // 回显信息可以放在info里
})
const { minlength, maxlength, isSaveCloseDialog } = toRefs(props)
const show = toRef(props.info, 'show')
const emits = defineEmits(['close', 'submit'])
const form = reactive({
  inputText: '' // 文本分镜
})
const rules = {
  inputText: [
    {
      required: true,
      message: '请输入文本',
      trigger: 'blur'
    },
    {
      min: minlength.value || 1,
      max: maxlength.value || 300,
      message: minlength.value
        ? `请输入文本，建议字数为${minlength.value}~${maxlength.value}`
        : `请输入文本，最多${maxlength.value || 300}个字`,
      trigger: 'blur'
    }
  ]
}
// 文本内容校验
function retEmit(e) {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  form.inputText = e.target.value.trim().replace(reg, '')
}
const dialog = ref(null)
const btnLoading = ref(false)
function closeDialog() {
  console.log('点击取消')
  emits('close')
  dialog.value.handleClose()
}
const ruleForm = ref()
function handleConfirm() {
  console.log('点击确定按钮')
  ruleForm.value.validate(valid => {
    if (valid) {
      btnLoading.value = true
      emits('submit', form.inputText, dialog.value, btnLoading.loading)
      // 保存直接关闭弹窗
      if (isSaveCloseDialog.value) {
        dialog.value.handleClose()
      }
    }
  })
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.select_material_content {
  display: flex;
  padding: 16px 16px 8px 16px;
  :deep(.el-form-item__label) {
    min-width: unset;
  }
  :deep(.el-textarea__inner) {
    height: 176px;
  }
}
</style>
