<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      :title="type === 'merge' ? '批量合并' : '原料拆分'"
      width="560px"
      custom-class="rule_setting_dialog show_header_line hide_footer_line"
      :before-close="handleClose"
    >
      <div class="dialog_content">
        <div class="record_warp">
          <span @click="openRecord">{{ type === 'merge' ? '合并' : '拆分' }}记录</span>
        </div>
        <div class="content_tip">{{ tipsContent(type) }}</div>

        <el-form
          ref="fromRef"
          :label-width="type === 'merge' ? '100px' : '140px'"
          :model="formData"
          :rules="formRules"
          style="margin-top: 20px"
        >
          <el-form-item label="原料名称：" prop="name" v-if="type === 'merge'">
            <el-input
              show-word-limit
              @blur="retEmitEmj($event)"
              v-model="formData.name"
              placeholder="请输入名称"
              :maxlength="15"
            />
          </el-form-item>
          <el-form-item label="拆分单镜头时长：" prop="times" v-else>
            <el-input-number
              v-model="formData.times"
              :min="1"
              :max="inputNumberMax"
              :step="1"
              :precision="1"
              style="width: 100px"
              controls-position="right"
            />
            <span style="margin-left: 8px">s</span>
          </el-form-item>

          <el-form-item label="打标：" prop="tagIds">
            <batchMarking
              placeholder="请选择标签"
              v-if="showElement"
              :origin="origin"
              @choseOptions="choseOptions"
            />
          </el-form-item>
          <el-form-item label="文件夹选择：" prop="filed">
            <searchFileDOM
              v-if="showElement"
              @select="changeFileFun"
              @fileChange="addFileFun"
              failType="listTagFolder"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialogFun">取消</el-button>
          <el-button type="primary" @click="beforeSubmit" :loading="loading">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <recordDialog v-if="recordInfo.show" :info="recordInfo" @cancel="cancelRecord" />
  </div>
</template>
<script setup>
import { throttle, isNotEmpty } from '@/utils/tools'
import batchMarking from '@/views/content_center/content_repository/components/batch_marking.vue'
import searchFileDOM from '@/views/sumvideo/components/files/search_file.vue'
import recordDialog from './merge_disassemble_scord_dialog.vue'
import { operateMaterials } from '@/api/content_center/material_library'
const props = defineProps({
  info: {
    type: Object,
    default: () => {
      return {
        show: true, // 是否显示弹窗
        type: 'merge',
        origin: ''
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.info, 'show')

const { type, origin } = toRefs(props.info)
const loading = ref(false)
const fromRef = ref(null)
const emits = defineEmits(['submit', 'updateFile'])

const validateName = (rule, value, callback) => {
  if (!value || (value && !value.trim())) {
    callback(new Error('原料名称不能为空'))
  } else {
    callback()
  }
}
const validateTimes = (rule, value, callback) => {
  if (!value || (value && !(value + '').trim())) {
    callback(new Error('拆分时长不能为空'))
  } else {
    callback()
  }
}
const formRules = {
  name: [{ required: true, validator: validateName, trigger: 'blur' }],
  times: [{ required: true, validator: validateTimes, trigger: 'blur' }]
}

const recordInfo = reactive({
  show: false,
  type: 'merge'
})

const formData = reactive({
  name: '',
  times: 3.0,
  tagIds: [], // 标签
  fileID: {} // 文件夹
})
function retEmitEmj(e) {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi

  formData.name = e.target.value.replace(reg, '')
}

function tipsContent(type) {
  const tipsSet = {
    merge: '合并后会按照勾选顺序生成一条新的视频原料，并且原视频原料依然保留。',
    disassemble:
      '按照下方设置的拆分时长对原料进行拆条，拆条出的每一条视频为一条新的视频原料，并且原视频原料依然保留。'
  }
  return tipsSet[type] || ''
}

// 选择的标签
function choseOptions(val) {
  formData.tagIds = val
}
// 选择的文件夹
function changeFileFun(e) {
  formData.fileID = e
}
const isAddFile = ref(false) // 选择文件夹过程中是否新增了文件夹
// 新增文件夹
function addFileFun() {
  console.log('新增了文件夹')

  isAddFile.value = true
}

function closeDialogFun() {
  dialog.value.handleClose()
}
const showElement = ref(true) // 是否显示打标和文件夹
const message = inject('$message')
const isSubmit = ref(false) // 是否提交了任务
const beforeSubmit = throttle(function () {
  if (loading.value) return
  fromRef.value.validate(valid => {
    if (valid) {
      loading.value = true
      const tags = JSON.parse(JSON.stringify(formData.tagIds || []))
      tags.push(isNotEmpty(formData.fileID) ? formData.fileID.id : '0')
      const params = {
        tagIds: tags,
        resourceIds: props.info.resourceIds || [],
        operationType: type.value === 'merge' ? 1 : 2
      }
      if (type.value === 'merge') {
        params.name = formData.name
      } else {
        params.splitDuration = formData.times * 1000
        params.name = props.info.resourceName || ''
      }
      operateMaterials(params)
        .then(res => {
          if (res.code === 0) {
            message.success(type.value === 'merge' ? '提交合并任务成功' : '提交拆分任务成功')
            isSubmit.value = true
            formData.name = ''
            formData.times = 3.0
            formData.tagIds = []
            formData.fileID = {}
            showElement.value = false
            setTimeout(() => {
              showElement.value = true
            }, 0)
          }
          loading.value = false
        })
        .catch(() => {
          loading.value = false
        })
    }
  })
}, 500)

// 打开记录
const openRecord = throttle(function () {
  recordInfo.type = type.value
  recordInfo.show = true
}, 500)
function cancelRecord() {
  recordInfo.show = false
}
// 弹窗关闭 如果创建了文件夹，关闭的时候刷新一下文件夹
function handleClose(done) {
  if (isAddFile.value) {
    emits('updateFile', type.value)
  }
  if (isSubmit.value) {
    emits('submit', type.value)
  }
  done()
}
const inputNumberMax = ref(0)
onMounted(() => {
  if (type.value === 'disassemble' && isNotEmpty(props.info.duration)) {
    inputNumberMax.value = parseInt(props.info.duration) - 1
  }
})
</script>
<style lang="scss" scoped>
.dialog_content {
  padding: 16px 16px; //0 16px;
  .record_warp {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    > span {
      padding: 2px 6px;
      color: #364fcd;
      cursor: pointer;
      user-select: none;
    }
  }
  .content_tip {
    font-size: 14px;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
    margin-top: 16px;
  }
  :deep(.batch_marking) {
    width: 100%;
  }
  :deep(.search_file) {
    width: 100%;
  }
}
</style>
