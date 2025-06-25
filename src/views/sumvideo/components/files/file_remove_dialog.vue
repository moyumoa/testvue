<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="移动到"
    width="560px"
    custom-class="rule_setting_dialog"
    :before-close="handleClose"
  >
    <div class="dialog_content" v-loading="loading">
      <chooseFileTree
        class="dialog_file"
        v-if="!loading"
        :chooseId="chooseId"
        :origin="origin"
        :showRadio="true"
        :fileType="fileType"
        :expandIds="expandIds"
        @updateId="updateId"
      />
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button :disabled="saveLoading" @click="closeDialog">取消</el-button>
        <el-button
          type="primary"
          :disabled="saveLoading"
          :loading="saveLoading"
          @click="handleConfirm"
        >
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { moveTagFolder, moveCreationTagFolder, operatorV2 } from '@/api/sumvideo/files.js'
import { batchAddTagOrDel, getWorkDetail } from '@/api/content_center/content_repository.js'
import { detail } from '@/api/content_center/material_library.js'

import chooseFileTree from './choose_file_tree.vue'
import { throttle, isNotEmpty } from '@/utils/tools.js'

const props = defineProps({
  removeDialog: {
    type: Object,
    default: () => {
      return {
        onlyRemoveFile: true, // 是否只移动文件夹(将一个文件夹移动到另一个文件夹)  否则就是将素材或作品移动到另一个文件夹
        show: true, // 是否显示弹窗
        isBatchRemove: false, // 是否批量移动素材或作品
        materialIds: [], // 素材或作品ID 移动素材或作品只需传该参
        deleteFileIds: [], // 批量移动素材或作品时 需要获取该素材或作品对应的文件夹IDS
        fileId: null, // 文件夹ID 移动文件夹需要这两个
        parentId: null, // 文件夹原父级ID 移动文件夹需要这两个
        expandIds: [] // 移动时，需要展开的文件夹
      }
    },
    required: true
  },
  origin: {
    type: String,
    default: ''
  }, // material 原料库 finishProduct 素材库 productScene 场景库
  fileType: Number // 文件夹类型 3原料库 4实拍库 5场景库
})
const dialog = ref()
const { origin, fileType } = toRefs(props)
const show = toRef(props.removeDialog, 'show')
const onlyRemoveFile = toRef(props.removeDialog, 'onlyRemoveFile')
const expandIds = toRef(props.removeDialog, 'expandIds')

const loading = ref(true) // 获取信息的loading
const saveLoading = ref(false) // 按钮的确定Loading
const chooseId = ref() // 要移动到的文件夹id
const chooseInfo = ref() // 要移动到的文件夹完整信息 主要是文件夹名称 可以及时修改素材或作品上的文件夹名称
function init() {
  console.log('init', onlyRemoveFile.value, props.removeDialog)

  // 如果是移动素材或作品，要先获取该素材或作品的原始文件夹ID
  if (!onlyRemoveFile.value) {
    if (!props.removeDialog.isBatchRemove) {
      getOriginInfo()
    } else {
      loading.value = false
    }
  } else {
    if (props.removeDialog && isNotEmpty(props.removeDialog.parentId)) {
      chooseId.value = JSON.parse(JSON.stringify(props.removeDialog)).parentId
    }
    loading.value = false
  }
}
init()
// 素材或作品的原始信息
function getOriginInfo() {
  loading.value = true
  const param = { id: props.removeDialog.materialIds[0] }
  if (isNotEmpty(fileType.value) && fileType.value === 5) {
    param.tagType = 11
  }
  const detailPromise = isNotEmpty(fileType.value)
    ? detail(param)
    : origin.value === 'material'
    ? detail(param)
    : getWorkDetail(param)

  detailPromise
    .then(res => {
      if (res.code === 0) {
        const folderList = res.data?.folderList || []
        if (folderList && folderList.length > 0) {
          chooseId.value = folderList[0].id
        }
      }
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}
function updateId(id, info) {
  console.log('updateId', id, info)
  chooseId.value = id
  chooseInfo.value = info
}

const $message = inject('$message')
const emits = defineEmits(['removeSuccessFun', 'closeDialog'])
// 弹窗的确定事件
const handleConfirm = throttle(() => {
  console.log('handleConfirm', chooseId.value)
  if (isNotEmpty(chooseId.value)) {
    saveLoading.value = true
    if (onlyRemoveFile.value) {
      //       if (chooseId.value === props.removeDialog.fileId) {
      //   $message.warning('不能移动到文件夹本身')
      //   return
      // }
      const param = {
        id: props.removeDialog.fileId,
        targetId: chooseId.value
      }
      if (isNotEmpty(fileType.value)) {
        param.tagType = fileType.value
      }
      const filePromise = isNotEmpty(fileType.value)
        ? moveTagFolder(param)
        : origin.value === 'material'
        ? moveTagFolder(param)
        : moveCreationTagFolder(param)
      filePromise
        .then(res => {
          saveLoading.value = false
          if (res.code === 0) {
            nextTick(() => {
              $message.success('移动成功')
              emits(
                'removeSuccessFun',
                chooseId.value,
                chooseInfo.value,
                props.removeDialog.parentId
              )
              dialog.value.handleClose()
            })
          }
        })
        .catch(() => {
          saveLoading.value = false
        })
    } else {
      const actionPromise = isNotEmpty(fileType.value)
        ? operatorV2({
            tagType: fileType.value,
            targetFolderId: chooseId.value,
            ids: props.removeDialog.materialIds
          })
        : origin.value === 'material'
        ? operatorV2({
            targetFolderId: chooseId.value,
            ids: props.removeDialog.materialIds
          })
        : batchAddTagOrDel({
            tagType: 3,
            isAll: props.removeDialog.isBatchSearch || false,
            isDel: 0,
            tagOpType: 3,
            ids: props.removeDialog.isBatchSearch ? [] : props.removeDialog.materialIds,
            condition: props.removeDialog.isBatchSearch ? props.removeDialog.condition : null,
            tags: [chooseId.value]
          })

      actionPromise
        .then(res => {
          saveLoading.value = false
          if (res.code === 0) {
            nextTick(() => {
              $message.success(props.removeDialog.isBatchRemove ? '批量移动成功' : '移动成功')
              emits(
                'removeSuccessFun',
                chooseId.value,
                chooseId.value === '0' ? null : chooseInfo.value
              )
              dialog.value.handleClose()
            })
          }
        })
        .catch(() => {
          saveLoading.value = false
        })
    }
  } else {
    $message.warning('请先选择要移动到的文件夹')
  }
}, 700)
function closeDialog() {
  dialog.value.handleClose()
}
function handleClose(done) {
  console.log('handleClose')
  if (saveLoading.value) {
    $message.warning('正在移动中，请稍后操作')
  } else {
    emits('closeDialog')
    done()
  }
}
</script>
<style lang="scss" scoped>
.dialog_content {
  padding: 16px 0 0 16px;
  width: 100%;
  min-height: 100px;
}
:deep(.dialog_file .content_box .content_content_box) {
  max-height: 440px !important;
}
</style>
