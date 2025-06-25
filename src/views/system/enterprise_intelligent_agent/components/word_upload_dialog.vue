<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    :title="title"
    width="563px"
    custom-class="rule_setting_dialog hide_footer_line show_header_line"
    append-to-body
  >
    <div class="dialog_content">
      <div class="content_upload">
        <div class="over_upload_box" v-for="(item, index) in uploadList" :key="index">
          <div class="file_icon" :class="getFileICON(item.fileUrl)"></div>
          <div class="file_name">{{ item.fileName }}</div>
          <img
            @click="delFun(index)"
            class="file_del"
            src="https://tagvv-1256030678.file.myqcloud.com/20250107i4nrm.png"
            alt=""
          />
        </div>
        <upload_other
          v-if="isEmpty(uploadList)"
          :multiple="false"
          :showLoading="false"
          :maxSize="1048576"
          v-model:uploadLoading="uploadLoading"
          @success="uploadVideoSuccess"
          :acceptTypeList="fileUploadDownInfo[tabValue].acceptList"
        >
          <div class="add_upload_box" v-loading="uploadLoading">
            <img src="https://tagvv-1256030678.file.myqcloud.com/20250107v9wo3.png" alt="" />
          </div>
        </upload_other>
      </div>
      <div class="content_tip" v-if="fileUploadDownInfo[tabValue]">
        {{ fileUploadDownInfo[tabValue].tip }}
        <span @click.stop="downloadFun">{{ fileUploadDownInfo[tabValue].downName }}</span>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button :disabled="btnDis || loading" @click="closeDialog">取消</el-button>
        <el-button
          type="primary"
          :disabled="btnDis || loading"
          :loading="btnLoading"
          @click="handleConfirm"
        >
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { throttle, getFileICON, isEmpty, isNotEmpty } from '@/utils/tools.js'
import { saveKnowledgeDocument } from '@/api/sumvideo/intelligent_agent.js'
const props = defineProps({
  uploadDialog: {
    type: Object,
    default: () => {
      return {
        datasetId: null, //  知识库id
        module: '', // 模块， 代表具体是哪种智能体类别

        tabValue: '', // 类型  companyCulture 公司文化  prohibitedWords 禁用词  productInformation 产品信息

        title: '', // 弹窗标题

        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()

const { datasetId, show, title, tabValue } = toRefs(props.uploadDialog)
const loading = ref(false) // 整个的loading
const btnDis = ref(false) // 按钮禁用
const btnLoading = ref(false) // 按钮Loaidng
const uploadList = ref([]) // 上传的列表
const uploadLoading = ref(false) // 上传loading
const fileUploadDownInfo = reactive({
  companyCulture: {
    tip: '支持上传 PDF、TXT、DOC、DOCX、Excel格式的文件，可参考模板',
    acceptList: ['.pdf', '.txt', '.doc', '.docx', '.xlsx', '.xls'],
    downName: '品牌公司文化',
    downUrl:
      'https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/%E5%85%AC%E5%8F%B8%E6%96%87%E5%8C%96%E6%A8%A1%E6%9D%BF.docx'
  }, // 公司文化支持的上传类型
  prohibitedWords: {
    tip: '支持上传 PDF、TXT、DOC、DOCX、Excel格式的文件，可参考模板',
    acceptList: ['.doc', '.docx', '.pdf', '.txt', '.xlsx', '.xls'],
    downName: '品牌禁用词',
    downUrl:
      'https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/%E5%93%81%E7%89%8C%E7%A6%81%E7%94%A8%E8%AF%8D%E6%A8%A1%E6%9D%BF.docx'
  }, // 禁用词支持的上传类型
  productInformation: {
    tip: '支持上传Excel格式的文件，可参考模板',
    acceptList: ['.xlsx', '.xls'],
    downName: '品牌产品信息表',
    downUrl:
      'https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/%E4%BA%A7%E5%93%81%E4%BF%A1%E6%81%AF%E6%A8%A1%E6%9D%BF.xlsx'
  } // 产品信息支持的上传类型
})
function uploadVideoSuccess(e, file) {
  console.log('e1', e)
  console.log('e2', file)
  if (isNotEmpty(e)) {
    uploadList.value.push({
      fileUrl: e.url,
      fileName: file.name
    })
  }
}
const delFun = throttle(i => {
  uploadList.value.splice(i, 1)
}, 500)
const message = inject('$message')

const emits = defineEmits(['uploadSuccess'])
// 弹窗的确定事件
const handleConfirm = throttle(() => {
  if (isEmpty(uploadList.value)) {
    message.warning('请先上传文件')
    return
  }

  /*
   * 在这里调用知识库上传API
   * */
  // 类型 1公司文化 2禁用词 3产品信息
  if (datasetId == null) {
    message.warning('知识ID缺失')
    return
  }
  let datasetType = null
  if (tabValue.value === 'companyCulture') {
    datasetType = 1
  } else if (tabValue.value === 'prohibitedWords') {
    datasetType = 2
  } else if (tabValue.value === 'productInformation') {
    datasetType = 3
  } else {
    message.warning('未知的知识库类型')
    return
  }
  btnLoading.value = true

  /**
   * 在这里开始更新知识库
   * @type {Promise<unknown>}
   */
  // const filePromise = new Promise(resolve => {
  //   resolve({
  //     code: 0
  //   })
  // })
  const fileName = uploadList.value[0].fileName
  const fileNameArr = fileName.split('.')
  if (fileNameArr.length !== 2) {
    message.warning('无文件后缀无法处理')
    return
  }
  const filePromise = saveKnowledgeDocument({
    datasetId: datasetId.value,
    datasetType: datasetType,
    fileName: fileNameArr[0],
    fileExtension: fileNameArr[1],
    url: uploadList.value[0].fileUrl
  })

  filePromise
    .then(res => {
      if (res.code === 0) {
        emits('uploadSuccess', uploadList.value)
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

const judgeOEA = inject('$judgeOEA')
// 下载文件
function downloadFun() {
  window.open(fileUploadDownInfo[tabValue.value].downUrl, '_blank', judgeOEA() ? 'download' : '')
}
</script>
<style lang="scss" scoped>
.dialog_title {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
.dialog_content {
  padding: 4px 0 3px 16px;
  .content_upload {
    max-height: 200px;
    overflow-y: auto;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;

    .over_upload_box {
      margin: 12px 12px 0px 0;
      padding-left: 12px;
      position: relative;
      width: 168px;
      height: 64px;
      background: #fafafa;
      border-radius: 4px;
      border: 1px solid #fafafa;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .file_icon {
        width: 36px;
        height: 36px;
      }
      .file_name {
        width: 100px;
        font-weight: 400;
        font-size: 14px;
        color: #606266;
        line-height: 20px;
        margin-left: 8px;
        @include mult_line(2);
      }
      .file_del {
        opacity: 0;
        cursor: pointer;
        width: 20px;
        height: 20px;
        display: flex;
        position: absolute;
        right: -8px;
        top: -8px;
      }
    }
    .over_upload_box:hover {
      .file_del {
        opacity: 1;
      }
    }
    .add_upload_box {
      margin: 12px 12px 0px 0;
      width: 64px;
      height: 64px;
      background: #fafafa;
      border-radius: 2px;
      border: 1px dashed #dcdee0;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      img {
        width: 20px;
        height: 20px;
        display: flex;
      }
    }
  }
  .content_tip {
    padding-right: 16px;
    margin-top: 16px;
    font-weight: 400;
    font-size: 14px;
    color: #909399;
    line-height: 20px;
    span {
      color: #364fcd !important;
      cursor: pointer;
    }
  }
}
:deep(.add_upload_box .el-loading-spinner .circular) {
  width: 24px;
}
</style>
