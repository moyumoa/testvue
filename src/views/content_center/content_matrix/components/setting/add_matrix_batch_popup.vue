<template>
  <el-dialog v-model="show" title="导入模板弹窗" :width="580" @closed="close">
    <template #title>
      <div class="dialog_title">
        <div class="title">{{ title }}</div>
        <div class="sub_title">{{ subTitle }}</div>
      </div>
    </template>
    <div class="dialog_content" v-loading="data.loading" element-loading-text="正在导入...">
      <div class="timeline_item">
        <div class="line"></div>
        <div class="step">1</div>
        <div class="step_text_1">下载模板</div>
        <div class="step_text_2" @click="exportFile">下载导入模板</div>
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
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  title: String, // 弹窗标题
  subTitle: String, // 副标题
  uploadUrl: String, // 上传地址
  exportFile: Function, // 下载模板方法（导出Excel
  tips: String
})
const { title, subTitle, uploadUrl, exportFile, tips } = toRefs(props)
const show = true
const emits = defineEmits(['uploadSuccess', 'batchAddClose'])
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
  // console.log('导入成功res', res)
  data.loading = false
  if (res.code === 0 || res.code === 200) {
    // if (res.msg) {
    //   message.success(res.msg)
    // } else {
    //   message.success('导入成功')
    // }
    if (res.data.notExistDataList && res.data.notExistDataList.length === 0) {
      message.success('导入完成，成功导入' + res.data.existDyCount + '条记录')
    }

    // 将成功和失败的列表返回
    emits('uploadSuccess', res.data.existUserList, res.data.notExistDataList)
    close()
  } else {
    message.warning(res.msg)
  }
}
function close() {
  emits('batchAddClose', false)
}
</script>

<style lang="scss" scoped>
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
      margin-top: 24px;
      font-size: 12px;
      color: #909399;
      width: 160px;
    }
  }
}
</style>
