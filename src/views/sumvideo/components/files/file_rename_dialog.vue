<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="名称"
    width="540px"
    custom-class="rule_setting_dialog hide_footer_line"
    append-to-body
  >
    <div style="padding: 16px 32px 24px 0px">
      <el-form :model="form" :rules="rules" ref="ruleForm" label-width="100px" @submit.prevent>
        <el-form-item label="名称" prop="name">
          <el-input
            show-word-limit
            maxlength="10"
            @blur="retEmitEmj($event)"
            v-model.trim="form.name"
            placeholder="请输入文件夹名称"
          ></el-input>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button :disabled="btnDis" @click="closeDialog">取消</el-button>
        <el-button type="primary" :disabled="btnDis" :loading="loading" @click="handleConfirm">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { updateTagFolder, updateCreationTagFolder } from '@/api/sumvideo/files.js'
import { throttle, isNotEmpty } from '@/utils/tools.js'
const props = defineProps({
  renameDialog: {
    type: Object,
    default: () => {
      return {
        show: true, // 是否显示弹窗
        name: '', // 原文件名
        pid: null, // 文件夹父ID
        id: null // 文件夹ID
      }
    },
    required: true
  },
  origin: {
    type: String,
    default: '' // material 原料库 finishProduct 素材库
  },
  fileType: Number // 文件夹类型 3原料库 4实拍库 5场景库
})
const dialog = ref()
const { origin, fileType } = toRefs(props)
const show = toRef(props.renameDialog, 'show')
const id = toRef(props.renameDialog, 'id')

const loading = ref(false)
const form = ref({
  name: ''
})
const rules = {
  name: [
    { required: true, message: '请输入文件夹名称', trigger: 'blur' },
    {
      min: 1,
      max: 10,
      message: '请输入文件夹名称，最多10个字',
      trigger: 'blur'
    }
  ]
}
function init() {
  console.log('init', id.value)
  if (props.renameDialog?.name) {
    form.value.name = props.renameDialog.name
  }
}
init()
// 检查是否有表情包
function retEmitEmj(e) {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi

  form.value.name = e.target.value.replace(reg, '')
}
const btnDis = ref(false)

const ruleForm = ref(null)
const emits = defineEmits(['renameSuccessFun'])
const message = inject('$message')
// 弹窗的确定事件
const handleConfirm = throttle(() => {
  ruleForm.value.validate(valid => {
    console.log('valid', valid)
    if (valid) {
      loading.value = true
      const param = props.renameDialog.isAdd
        ? {
            id: props.renameDialog.pid || 0,
            name: form.value.name,
            operateWay: 0
          }
        : {
            id: id.value,
            name: form.value.name,
            operateWay: 2
          }
      if (isNotEmpty(fileType.value)) {
        param.tagType = fileType.value
      }
      const filePromise = isNotEmpty(fileType.value)
        ? updateTagFolder(param)
        : origin.value === 'productScene'
        ? updateTagFolder(param)
        : origin.value === 'material'
        ? updateTagFolder(param)
        : updateCreationTagFolder(param)
      filePromise
        .then(res => {
          if (res.code === 0) {
            message.success(props.renameDialog.isAdd ? '新建成功' : '重命名成功')
            if (props.renameDialog.isAdd) {
              // 剧本式/模板式第三步保存文件夹新建成功并且需要选中
              emits('renameSuccessFun', props.renameDialog.pid, res.data)
            } else {
              emits('renameSuccessFun', props.renameDialog.pid)
            }
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
  console.log(dialog.value)
  dialog.value.handleClose()
}
</script>
<style lang="scss" scoped></style>
