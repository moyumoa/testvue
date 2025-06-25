<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="保存到知识库"
    width="560px"
    custom-class="rule_setting_dialog hide_footer_line show_header_line"
    append-to-body
  >
    <div class="dialog_content">
      <el-checkbox-group v-model="chooseList" class="group_box">
        <div class="isTitle">标题：{{ list[0] }}</div>
        <div class="isContent" style="margin-top: 8px">正文：{{ list[1] }}</div>
        <!--        <el-checkbox :label="index" v-for="(item, index) in list" :key="index" >-->
        <!--          <div :class="index % 2 == 0 ? 'isTitle' : 'isContent'">-->
        <!--            {{ index % 2 == 0 ? '标题' : '正文' }}： {{ item }}-->
        <!--          </div>-->
        <!--        </el-checkbox>-->
      </el-checkbox-group>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button :disabled="btnLoading" @click="closeDialog">取消</el-button>
        <el-button
          type="primary"
          :disabled="btnLoading"
          :loading="btnLoading"
          @click="handleConfirm"
        >
          保存
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { throttle, isEmpty } from '@/utils/tools.js'
import { saveTitleStudy } from '@/api/sumvideo/intelligent_agent.js'
const props = defineProps({
  saveKonwledgeDialog: {
    type: Object,
    default: () => {
      return {
        list: [], // 解析出来的数据
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const { show, list, datasetId } = toRefs(props.saveKonwledgeDialog)

const btnLoading = ref(false) // 按钮Loaidng
const chooseList = ref([]) // 选中的列表信息

const message = inject('$message')
// 弹窗的确定事件
const handleConfirm = throttle(() => {
  if (isEmpty(list.value)) {
    message.warning('可保存的内容为空')
    return
  }
  btnLoading.value = true

  // const filePromise = new Promise(resolve => {
  //   resolve({
  //     code: 0
  //   })
  // })
  //
  // debugger
  const filePromise = saveTitleStudy({
    datasetId: datasetId.value,
    title: list.value[0],
    content: list.value[1]
  })

  filePromise
    .then(res => {
      if (res.code === 0) {
        message.success('保存成功')
        dialog.value.handleClose()
        btnLoading.value = false
      } else {
        btnLoading.value = false
      }
    })
    .catch(() => {
      btnLoading.value = false
    })
}, 700)
function closeDialog() {
  console.log(dialog.value)
  dialog.value.handleClose()
}
</script>
<style lang="scss" scoped>
.dialog_content {
  padding: 16px 16px 8px 16px;
  max-height: 60vh;
  overflow-y: auto;
}
:deep(.el-checkbox) {
  display: flex;
  height: max-content;
  align-items: flex-start;
  min-height: 20px;
  margin-right: 0;
  .el-checkbox__inner {
    margin-top: 3px;
  }
  .el-checkbox__label {
    word-break: break-all;
    white-space: pre-line;
    font-weight: 400;
    font-size: 14px;
    color: #606266;
    line-height: 20px;
  }
}
.el-checkbox + .el-checkbox {
  margin-top: 8px;
}
:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #303133;
}
.isTitle {
  font-weight: 400;
  font-size: 16px;
  color: #303133 !important;
  line-height: 22px;
}
.isContent {
  font-weight: 400;
  font-size: 14px;
  color: #606266 !important;
  line-height: 20px;
}
</style>
