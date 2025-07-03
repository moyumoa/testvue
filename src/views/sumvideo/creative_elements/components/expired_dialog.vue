<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="有效期设置"
    width="560px"
    position="center"
    custom-class="rule_setting_dialog hide_footer_line"
  >
    <div class="dialog_content" v-loading="loading">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="有效时间至" prop="time" >
          <el-date-picker
            v-model="form.time"
            type="datetime"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            date-format="MMM DD, YYYY"
            time-format="HH:mm"
            placeholder="请选择"
          />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="show = false">取消</el-button>
        <el-button :loading="loading" type="primary" @click="confirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { ElMessage } from 'element-plus'
import { materialSetExpire } from '@/api/content_center/material_library'
const props = defineProps({
  modelValue: Boolean,
  ids: {
    type: Array,
    default: () => []
  }
})
const emits = defineEmits(['success', 'update:modelValue'])
const dialog = ref()
const show = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emits('update:modelValue', value)
  }
})
const formRef = ref(null)
const form = ref({
  time: '' // 有效时间
})
const rules = {
  time: [{ required: true, message: '请选择时间', trigger: 'change' }]
}
const loading = ref(false)
// 确定
const confirm = () => {
  formRef.value.validate(valid => {
    console.log(props)

    if (valid) {
      loading.value = true
      materialSetExpire({
        expireTime: form.value.time,
        ids: props.ids
      })
        .then(result => {
          if (result.code === 0) {
            ElMessage.success('设置成功')
            show.value = false
            emits('success', form.value.time)
          }
        })
        .finally(() => {
          loading.value = false
        })
    }
  })
}
</script>
<style lang="scss" scoped>
:deep(.el-date-editor) {
  .el-icon {
    height: inherit;
  }
}
div {
  box-sizing: border-box;
}
.dialog_content {
  padding: 30px 16px 0 16px;
  width: 100%;
  min-height: 300px;
}
</style>
