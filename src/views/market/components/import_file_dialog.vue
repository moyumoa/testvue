<template>
  <el-dialog
    custom-class="xm_element_dialog"
    v-model="show"
    title="导入模板弹窗"
    :width="560"
    @closed="close"
  >
    <template #title>
      <div class="dialog_title">
        <div class="title">{{ title }}</div>
        <div class="sub_title" v-if="subTitle">{{ subTitle }}</div>
      </div>
    </template>
    <div class="dialog_content" v-loading="data.loading" element-loading-text="正在导入...">
      <div class="timeline_item">
        <div class="line"></div>
        <div class="step">1</div>
        <div class="step_text_1">下载模板</div>
        <div class="step_text_2" @click="exportFile" v-if="canBatchAddExportFiles">
          下载导入模板
        </div>
        <div class="step_text_2" v-else>下载中...</div>
      </div>
      <div class="timeline_item">
        <div class="line"></div>
        <div class="step">2</div>
        <div class="step_text_1">填写后导入上传</div>
        <div class="step_text_2">
          <el-upload
            :action="uploadUrl"
            :show-file-list="false"
            accept=".xlsx,.xls"
            :data="otherData"
            :on-progress="uploadingFile"
            :on-success="uploadSuccess"
            :headers="headers"
          >
            批量导入
          </el-upload>
        </div>
        <div class="upload-tips" v-if="tips">{{ tips }}</div>
      </div>
      <div class="timeline_item">
        <div class="step">3</div>
        <div class="step_text_1">添加成功</div>
      </div>
    </div>
    <div v-if="redTips" class="red_tips">{{redTips}}</div>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  title: String, // 弹窗标题
  subTitle: String, // 副标题
  uploadUrl: String, // 上传地址
  exportFile: Function, // 下载模板方法
  tips: String,
  redTips: String,
  successTips: { // 成功是否提示
    type: Boolean,
    default: true
  },
  canBatchAddExportFiles: Boolean, // 下载模板是否可点击
  otherData: Object, // 上传时附带的额外参数
})
const { show, title, subTitle, uploadUrl, exportFile, tips,redTips, canBatchAddExportFiles } = toRefs(props)

const emits = defineEmits(['update:show', 'uploadSuccess'])
const message = inject('$message')

const data = reactive({
  loading: false
})

const headers = ref({
  token: localStorage.getItem('token')
})
function uploadingFile() {
  data.loading = true
}

function uploadSuccess(res) {
  data.loading = false
  if (res.code === 0 || res.code === 200) {
    if (props.successTips) {
      message.success(res.msg || '导入成功')
    }
    emits('uploadSuccess',res)
    close()
  } else {
    message.warning(res.msg)
  }
}

function close() {
  emits('update:show', false)
}
</script>

<style lang="scss" scoped>
.red_tips{
  font-size: 12px;
  color: red;
}
.dialog_title {
  .title {
    color: #303133;
    font-size: 16px;
    font-weight: bold;
    line-height: 22px;
  }
  .sub_title {
    margin-top: 6px;
    color: #909399;
    line-height: 20px;
    font-size: 14px;
    font-weight: normal;
  }
}
.dialog_content {
  display: flex;
  justify-content: space-between;
  padding: 6px 0 14px 0;
  .timeline_item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100px;
    .line {
      position: absolute;
      top: 10px;
      left: 76px;
      width: 165px;
      height: 2px;
      background: #f2f3f5;
    }
    .step {
      display: flex;
      align-items: center;
      justify-content: space-around;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: #364fcd;
      color: #fff;
      line-height: 24px;
    }
    .step_text_1 {
      font-size: 14px;
      line-height: 20px;
      font-weight: bold;
      margin-top: 8px;
    }
    .step_text_2 {
      cursor: pointer;
      color: #364fcd;
      line-height: 18px;
      font-size: 12px;
      margin-top: 4px;
    }
    .upload-tips {
      margin-top: 8px;
      font-size: 12px;
      color: #909399;
      width: 160px;
      text-align: center;
    }
  }
}
</style>
