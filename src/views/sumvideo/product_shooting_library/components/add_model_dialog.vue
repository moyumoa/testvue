<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="创建实拍模特"
      width="560px"
      custom-class="xm_element_dialog"
    >
      <div class="dialog_content" style="min-height: 60px">
        <el-form @submit.prevent :model="form" :rules="rules" ref="ruleForm" label-width="120px">
          <el-form-item label="实拍模特姓名：" prop="name">
            <!-- <div class="name_box"> -->
            <!-- class="name_input" -->
            <el-input
              show-word-limit
              maxlength="20"
              @blur="retEmitEmj($event)"
              v-model.trim="form.name"
              placeholder="请输入实拍模特姓名"
            ></el-input>
            <!-- </div> -->
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog_footer">
          <div class="footer_right">
            <el-button @click="closeDialog">取消</el-button>
            <el-button type="primary" :loading="btnLoading" @click="handleConfirm">确定</el-button>
          </div>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools'
import { saveMannequin } from '@/api/sumvideo/product_shooting_library'
const message = inject('$message')
const emits = defineEmits(['updateFun'])

const props = defineProps({
  addDialog: {
    type: Object,
    default: () => {
      return {
        show: false
      }
    }
  }
})
const { show } = toRefs(props.addDialog)
const rules = {
  name: [
    { required: true, message: '请输入实拍模特姓名', trigger: 'blur' },
    {
      min: 1,
      max: 20,
      message: '请输入实拍模特姓名，最多20个字',
      trigger: 'blur'
    }
  ]
}
const form = ref({
  name: '' // 模特姓名
})
// --模特姓名
// 检查是否有表情包
function retEmitEmj(e) {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi

  form.value.name = e.target.value.replace(reg, '')
}
// --模特姓名 end

// --弹窗的取消和确定

const dialog = ref()
const btnLoading = ref(false)
const ruleForm = ref(null)
function closeDialog() {
  dialog.value.handleClose()
}
const handleConfirm = throttle(() => {
  ruleForm.value.validate(valid => {
    if (valid) {
      btnLoading.value = true
      saveMannequin(form.value)
        .then(res => {
          if (res.code === 0) {
            message.success(`实拍模特创建成功`)
            emits('updateFun')

            dialog.value.handleClose()
          }
          btnLoading.value = false
        })
        .catch(() => {
          btnLoading.value = false
        })
    }
  })
}, 700)
// --弹窗的取消和确定 end
</script>
<style lang="scss" scoped>
.name_box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .name_input {
    width: 320px;
    :deep(.el-input__inner) {
      padding-right: 58px;
    }
  }
}
:deep(.el-form-item__label) {
  padding-right: 8px;
}
</style>
