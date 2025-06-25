<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="图片组合"
    width="540px"
    custom-class="xm_element_dialog"
    :before-close="handleClose"
  >
    <div class="content_title">将选中的图片组合为组图</div>
    <el-form :model="form" :rules="rules" ref="ruleForm" label-width="100px" @submit.enter.prevent>
      <el-form-item label="组图名称：" prop="name">
        <el-input
          style="width: 360px"
          class="input_box"
          placeholder="请输入组图名称"
          type="text"
          v-model.trim="form.name"
          @blur="inputBlur"
          maxlength="20"
          clearable
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="保存文件夹：">
        <searchFileDOM
          style="width: 360px"
          :fileID="form.fileID"
          failType="productSceneFolder"
          :fileType="5"
          :selectRoot="selectRoot"
          @select="changeFileFun"
          @fileChange="fileChange"
        />
      </el-form-item>
      <el-form-item label="设置标签：">
        <batchMarking
          placeholder="请选择标签"
          style="width: 360px"
          origin="productScene"
          :tagType="11"
          :useTagType="true"
          @choseOptions="choseOptions"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog_footer">
        <el-button :disabled="btnDis" @click="closeDialog">取消</el-button>
        <el-button type="primary" :disabled="btnDis" :loading="loading" @click="handleConfirm">
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import { combination } from '@/api/sumvideo/product_scene_library'
import searchFileDOM from '@/views/sumvideo/components/files/search_file.vue'
import batchMarking from '@/views/content_center/content_repository/components/batch_marking.vue'
import { throttle, isNotEmpty } from '@/utils/tools.js'

const props = defineProps({
  composeDialog: {
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
const show = toRef(props.composeDialog, 'show')

const loading = ref(false)
const form = ref({
  name: '', // 组图名称
  fileID: null, // 文件夹ID
  tags: []
})
const rules = {
  name: [{ required: true, message: '请输入组图名称', trigger: 'blur' }]
}
// 输入框内容校验
function inputBlur() {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi

  form.value.name = form.value.name.replace(reg, '')
}

// -- 文件夹操作
const uploadAddFile = ref(false) // 是否新增了文件夹，是的话弹窗关闭时要刷新整个树

// 更新树
function fileChange() {
  uploadAddFile.value = true
}
// 获取到的文件夹信息
function changeFileFun(e) {
  console.log('获取到的文件夹信息', e)
  form.value.fileID = e
}
// -- 文件夹操作 end

// -- 标签操作

// 选择的标签回调
function choseOptions(val) {
  console.log('标签信息', val)
  form.value.tags = val
}
// -- 标签操作 end

const btnDis = ref(false)

const ruleForm = ref(null)
const emits = defineEmits(['updateFun'])
const message = inject('$message')
// 弹窗的确定事件
const handleConfirm = throttle(() => {
  ruleForm.value.validate(valid => {
    if (valid) {
      loading.value = true

      combination({
        combinationName: form.value.name,
        materialIds: props.composeDialog.ids,
        tags: form.value.tags.concat([isNotEmpty(form.value.fileID) ? form.value.fileID.id : '0'])
      })
        .then(res => {
          if (res.code === 0) {
            emits('updateFun', uploadAddFile.value)
            message.success('图片组合成功')
            dialog.value.handleClose()
          }
          loading.value = false
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
function handleClose(done) {
  // if (  uploadAddFile.value) {
  //   emits("")
  // }
  done()
}
const selectRoot = ref(false) // 文件夹是否选中根文件夹
onMounted(() => {
  if (props.composeDialog.chooseFileId) {
    if (props.composeDialog.chooseFileInfo) {
      form.value.fileID = JSON.parse(JSON.stringify(props.composeDialog.chooseFileInfo))
      selectRoot.value = false
    } else {
      if (props.composeDialog.chooseFileId === '0') {
        selectRoot.value = true
      }
    }
  }
})
</script>
<style lang="scss" scoped>
.dialog_footer {
  padding: 12px 0px 0 16px;
}
.content_title {
  color: #303133;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 20px;
}
</style>
