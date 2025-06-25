<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="模型编辑"
    width="560px"
    custom-class="rule_setting_dialog hide_footer_line"
  >
    <div class="edit_content">
      <el-form
        class="edit_form"
        :model="form"
        :rules="rules"
        ref="ruleForm"
        hide-required-asterisk
        label-width="106px"
      >
        <el-form-item label="模型状态：" prop="isBanned">
          <el-switch
            style="margin-right: 8px"
            v-model="form.isBanned"
            inline-prompt
            :width="45"
            :active-value="0"
            :inactive-value="1"
          ></el-switch>
          {{ form.isBanned ? '禁用' : '启用' }}
        </el-form-item>
        <el-form-item label="可用范围：" prop="everyoneCanUse">
          <el-radio-group v-model="form.everyoneCanUse">
            <el-radio style="margin-right: 24px" :disabled="form.isBanned === 1" :label="1">
              全员可用
            </el-radio>
            <el-radio :disabled="form.isBanned === 1" :label="0">个人可用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="选择使用用户："
          prop="userId"
          v-if="form.everyoneCanUse === 0 && form.source === 2"
        >
          <el-select
            :disabled="form.isBanned === 1"
            v-model="form.userId"
            filterable
            clearable
            placeholder="请选择或输入搜索"
            remote
            reserve-keyword
            remote-show-suffix
            @focus="remoteMethod(undefined)"
            :remote-method="remoteMethod"
            :loading="selectLoading"
            width="230px"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择使用用户：" v-if="form.everyoneCanUse === 0 && form.source === 1">
          {{ form.userName || ' ' }}
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button :disabled="loading" @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="loading" @click="saveFun">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
// 编辑信息的弹窗
import { updateModel } from '@/api/sumvideo/digital_model.js'

import { listUserForPc } from '@/api/system_setting/account'
import { isEmpty, throttle } from '@/utils/tools.js'
const props = defineProps({
  editDialog: {
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
const show = toRef(props.editDialog, 'show')
const loading = ref(false)
const form = ref({
  modelId: null,
  isBanned: null,
  userId: null,
  everyoneCanUse: ''
})
const rules = reactive({
  isBanned: [
    {
      required: true,
      message: '请选择模型状态',
      trigger: 'change'
    }
  ],
  userId: [{ required: true, message: '请选择使用用户', trigger: 'change' }],
  everyoneCanUse: [{ required: true, message: '请选择可用范围', trigger: 'change' }]
})
const params = reactive({
  pageSize: 100,
  status: 1,
  pageNumber: 1,
  userId: null
})
function init() {
  if (!isEmpty(props.editDialog.info)) {
    const info = JSON.parse(JSON.stringify(props.editDialog.info))
    form.value.modelId = info.modelId
    form.value.isBanned = info.userIsValid === 0 ? 1 : info.isBanned
    form.value.source = info.source
    form.value.everyoneCanUse = info.everyoneCanUse
    // 后台上传的、个人可用的、但这个人被禁用了 userId就要清空 或者 后台上传的可用范围是全员可用的 也要清空
    if (
      (info.everyoneCanUse === 0 && info.source === 2 && info.userIsValid !== 1) ||
      (info.everyoneCanUse === 1 && info.source === 2)
    ) {
      form.value.userId = ''
      form.value.userName = ''
      params.userId = null
    } else {
      form.value.userId = info.userId || ''
      form.value.userName = info.userName || ''
      params.userId = info.userId || null
    }

    getUserList()
  } else {
    getUserList()
  }
}
init()

const options = ref([])
const selectLoading = ref(false)
function getUserList() {
  listUserForPc(params).then(res => {
    if (res.code === 0) {
      const arr = ref([])
      res.data.records.forEach(item => {
        const oneBoj = reactive({})
        if (item.depList && item.depList.length > 0) {
          oneBoj.label = item.userBrandName + ' / ' + item.depList.join(' / ')
        } else {
          oneBoj.label = item.userBrandName
        }
        oneBoj.value = item.userId
        arr.value.push(oneBoj)
      })
      options.value = arr.value
    }
    selectLoading.value = false
  })
}
const remoteMethod = query => {
  params.userName = query
  params.userId = null
  selectLoading.value = true
  getUserList()
}
function closeDialog() {
  console.log(dialog.value)
  dialog.value.handleClose()
}
const message = inject('$message')
const ruleForm = ref(null)
const emits = defineEmits(['updateInfo'])
const saveFun = throttle(() => {
  ruleForm.value.validate(valid => {
    if (valid) {
      loading.value = true
      const param = {
        modelId: form.value.modelId,
        isBanned: form.value.isBanned,
        everyoneCanUse: form.value.everyoneCanUse
      }
      if (form.value.source === 2) {
        param.userId = form.value.everyoneCanUse ? null : form.value.userId
      }
      updateModel(param)
        .then(res => {
          if (res.code === 0) {
            message.success('编辑成功')
            emits('updateInfo')
            dialog.value.handleClose()
          }
          loading.value = false
        })
        .catch(() => {
          loading.value = false
        })
    }
  })
}, 500)
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.edit_content {
  padding: 20px 16px 8px;
  min-height: 139px;
  .edit_form {
    :deep(.el-form-item__label) {
      padding-right: 8px;
      color: #303133;
    }
    :deep(.el-form-item__content) {
      color: #303133;
    }
    :deep(.el-radio, .el-form-item__content) {
      color: #303133;
    }
    :deep(.el-radio__input.is-checked + .el-radio__label, .el-radio) {
      color: #303133;
    }
  }
}
</style>
