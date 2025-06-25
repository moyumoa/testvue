<template>
  <div>
    <el-dialog
      custom-class="info_dialog category_tag_dialog"
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      :title="props.managementDialog.origin == 'cloud_cover_management' ? '管理云封面' : '管理封面'"
      width="820px"
    >
      <div class="dialog_content" v-loading="loading">
        <div class="content_left">
          <img class="content_cover" :src="forms.cover || defaultCover" alt="" />
          <img
            v-if="props.origin == 'cover_management' && forms.coverType == 1"
            class="content_tag"
            src="https://tagvv-1256030678.file.myqcloud.com/202310194z5rq.png"
            alt=""
          />
        </div>
        <div class="content_right">
          <el-form
            :model="forms"
            hide-required-asterisk
            ref="ruleForm"
            label-width="98px"
            :rules="rules"
          >
            <el-form-item label="封面名称：" prop="name">
              <el-input
                maxlength="10"
                show-word-limit
                v-model="forms.name"
                clearable
                @blur="retEmit($event)"
                style="width: 438px"
                placeholder="请输入封面名称"
              />
            </el-form-item>
            <el-form-item
              label="封面状态："
              class="structure_from_item"
              prop="isCloudOpen"
              style="margin-bottom: 4px"
            >
              <el-switch
                v-model="forms.isCloudOpen"
                active-text="已公开"
                inactive-text="已隐藏"
                :active-value="1"
                :inactive-value="0"
                :width="66"
              ></el-switch>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <template #footer v-if="!loading">
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" :loading="saveLoading" @click="handleConfirm">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { coverDetail, saveCover } from '@/api/sumvideo/cloud_cover_management.js'
import { throttle } from '@/utils/tools'
import { ElMessage } from 'element-plus'
const props = defineProps({
  managementDialog: {
    type: Object,
    default: () => {
      return {
        origin: '', // cloud_cover_management 云封面管理过来的 cover_management 企业封面过来的
        show: false // 是否显示弹窗
      }
    },
    required: true
  }
})
const defaultCover = ref('https://tagvv-1256030678.file.myqcloud.com/202212066b4kq.png')
const dialog = ref()
const show = toRef(props.managementDialog, 'show')

const forms = ref({}) // 表单信息
const rules = reactive({
  name: [{ required: true, message: '请输入封面名称', trigger: 'blur' }]
})

function retEmit(e, index) {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi
  forms.value.name = e.target.value.replace(reg, '')
}
const loading = ref(true)
function getDetail() {
  loading.value = true
  coverDetail({ id: props.managementDialog.id })
    .then(res => {
      if (res.code === 0) {
        forms.value = res.data || {}
      }
      loading.value = false
    })
    .catch(() => {
      closeDialog()
      loading.value = false
    })
}
// 弹窗的取消事件
function closeDialog() {
  dialog.value.handleClose()
}
const saveLoading = ref(false)
const ruleForm = ref(null)

const emits = defineEmits(['updateOneInfo'])
// 弹窗的保存事件
const handleConfirm = throttle(() => {
  ruleForm.value.validate(valid => {
    if (valid) {
      saveLoading.value = true
      saveCover({
        id: forms.value.id,
        // coverType: forms.value.coverType,
        name: forms.value.name || '',
        isCloudOpen: forms.value.isCloudOpen
      })
        .then(res => {
          if (res.code === 0) {
            ElMessage({
              message: '保存成功',
              type: 'success'
            })
            dialog.value.handleClose()

            emits('updateOneInfo')
          } else {
            saveLoading.value = false
          }
        })
        .catch(() => {
          saveLoading.value = false
        })
    } else {
      nextTick(() => {
        const isError = document.getElementsByClassName('is-error')
        if (isError && isError.length > 0) {
          const errText = isError[0].innerText ? isError[0].innerText.split('\n') : []
          if (errText.length > 0) {
            ElMessage({
              message: errText[errText.length - 1],
              type: 'warning'
            })
          }
        }
      })
    }
  })
}, 500)
onMounted(() => {
  getDetail()
})
</script>

<style lang="scss" scoped>
.dialog_content {
  padding: 16px 0 16px 16px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  .content_left {
    width: 252px;
    height: 448px;
    position: relative;
    border-radius: 4px;
    background: url('https://tagvv-1256030678.file.myqcloud.com/20231025zbqvm.png') repeat;
    .content_cover {
      display: flex;
      width: 100%;
      height: 100%;
      border-radius: 4px;
    }
    .content_tag {
      position: absolute;
      left: 0;
      top: 0;
      width: 62px;
      height: 62px;
    }
  }
  .content_right {
    width: 552px;
    height: 448px;
    overflow-y: auto;
    padding-right: 16px;
  }
}
:deep(.content_right .el-form-item__label) {
  padding-right: 8px;
}
:deep(.el-select .el-select__tags .el-tag) {
  margin: 2px 0px 2px 6px;
}
:deep(.el-switch__label) {
  position: absolute;
  display: none;
  color: #fff;
  * {
    font-size: 12px !important;
  }
}
/*打开时文字位置设置*/
:deep(.el-switch__label--right) {
  z-index: 1;
  right: 20px;
}
/*关闭时文字位置设置*/
:deep(.el-switch__label--left) {
  z-index: 1;
  left: 20px;
}
/*显示文字*/
:deep(.el-switch__label.is-active) {
  display: block;
}
:deep(.el-switch .el-switch__core, .el-switch .el-switch__label) {
  width: 66px;
}
.structure_from_item {
  margin: -8px 0 4px;
}
</style>
