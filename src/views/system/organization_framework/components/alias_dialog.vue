<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="层级别名设置"
    width="540px"
  >
    <el-form :model="form" :rules="rules" ref="ruleForm" label-width="100px">
      <el-form-item label="一级部门：" prop="alias1">
        <el-input
          style="width: 380px"
          @blur="retEmit($event, 'alias1')"
          v-model.trim="form.alias1"
          maxlength="6"
          placeholder="请输入一级部门的别名，最多6个字符"
        ></el-input>
      </el-form-item>
      <el-form-item label="二级部门：" prop="alias2">
        <el-input
          style="width: 380px"
          @blur="retEmit($event, 'alias2')"
          v-model.trim="form.alias2"
          maxlength="6"
          placeholder="请输入二级部门的别名，最多6个字符"
        ></el-input>
      </el-form-item>
      <el-form-item label="三级部门：" prop="alias3">
        <el-input
          style="width: 380px"
          @blur="retEmit($event, 'alias3')"
          v-model.trim="form.alias3"
          maxlength="6"
          placeholder="请输入三级部门的别名，最多6个字符"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button :disabled="loading" @click="closeDialog">取消</el-button>
        <el-button type="primary" :disabled="loading" :loading="loading" @click="handleConfirm">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { aliasAdd } from '@/api/system_setting/section'
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  aliasDialog: {
    type: Object,
    default: () => {
      return {
        show: false // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.aliasDialog, 'show')
const loading = ref(false)
const form = reactive({
  alias1: '',
  alias2: '',
  alias3: ''
})
const rules = {
  alias1: [
    { required: true, message: '请输入一级部门的别名', trigger: 'blur' },
    {
      min: 1,
      max: 6,
      message: '请输入一级部门的别名,最多6个字符',
      trigger: 'blur'
    }
  ],
  alias2: [
    { required: true, message: '请输入二级部门的别名', trigger: 'blur' },
    {
      min: 1,
      max: 6,
      message: '请输入二级部门的别名,最多6个字符',
      trigger: 'blur'
    }
  ],
  alias3: [
    { required: true, message: '请输入三级部门的别名', trigger: 'blur' },
    {
      min: 1,
      max: 6,
      message: '请输入三级部门的别名,最多6个字符',
      trigger: 'blur'
    }
  ]
}
// 检查文案
function retEmit(e, label) {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  form[label] = e.target.value.replace(reg, '')
}
const ruleForm = ref(null)
const emits = defineEmits(['updateList'])
// 弹窗的确定事件
const handleConfirm = throttle(() => {
  ruleForm.value.validate(valid => {
    if (valid) {
      loading.value = true
      const data = []
      for (let i = 1; i < 4; i++) {
        data.push({
          level: i,
          alias: form[`alias${i}`]
        })
      }
      aliasAdd({ deptAliasDTOS: data })
        .then(res => {
          if (res.code === 0) {
            emits('updateList')
            dialog.value.handleClose()
            loading.value = false
          } else {
            loading.value = false
          }
        })
        .catch(() => {
          loading.value = false
        })
    }
  })
}, 700)
function closeDialog() {
  dialog.value.handleClose()
}

// 初始化
function init() {
  if (props.aliasDialog.list && props.aliasDialog.list.length > 0) {
    form.alias1 = props.aliasDialog.list[0].alias
    form.alias2 = props.aliasDialog.list[1].alias
    form.alias3 = props.aliasDialog.list[2].alias
  }
}
init()
</script>
<style lang="scss" scoped>
.error_text {
  color: #ff0000;
  margin-top: 8px;
}
</style>
