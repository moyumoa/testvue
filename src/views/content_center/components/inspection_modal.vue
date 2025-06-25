<template>
  <div>
    <el-dialog
      ref="dialog"
      v-model="show"
      :title="inspectionModal.title"
      width="802px"
      :custom-class="form.isPass != 0 ? 'hide_footer_line' : ''"
    >
      <el-form :model="form" :rules="rules" ref="ruleForm" label-width="94px">
        <el-form-item label="质检标记" prop="isPass">
          <div>
            <el-radio-group v-model="form.isPass">
              <el-radio v-for="item in passData" :key="item.value" :label="item.value">
                {{ item.label }}
              </el-radio>
            </el-radio-group>
            <!-- <div class="mark">
              不合格{{
                type == 'live' ? '直播' : '作品'
              }}会导致任务无效，员工无法获取金币，已发放金币将会收回
            </div> -->
          </div>
        </el-form-item>
        <el-form-item
          label="下架视频"
          prop="isTakeOffVideo"
          v-if="type == 'video' && form.isPass == 0"
        >
          <el-radio-group v-model="form.isTakeOffVideo">
            <el-radio v-for="item in downData" :key="item.value" :label="item.value">
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="质检附件" prop="fileList" v-if="form.isPass == 0">
          <div>
            <div class="mark" style="line-height: 32px">
              单个录屏视频请控制在30秒内，MP4、MOV格式；图片大小500K以内，png、jpg格式，最多5个附件
            </div>
            <div class="file_box">
              <div class="one_file" v-for="(item, index) in form.fileList" :key="index">
                <img class="file_cover" :src="item.img" alt />
                <div class="file_action">
                  <div class="check_icon" @click="showFile(item)">预览</div>
                  <div class="del_icon" @click="delFile(item, index)">
                    <img src="@/assets/images/content_center/inspection_del.png" alt />
                  </div>
                </div>
              </div>
              <el-upload
                v-loading="fileLoading"
                v-if="form.fileList.length < 5"
                :show-file-list="false"
                accept="image/jpeg, image/jpg, image/png, video/mp4, video/quicktime"
                :action="action"
                :headers="requestHeaders"
                list-type="picture"
                :on-success="handleSuccess"
                :on-error="handleError"
                :before-upload="beforeUploadFile"
              >
                <div class="upload_text">
                  <img src="@/assets/images/content_center/inspection_add.png" alt />
                  点击上传
                </div>
              </el-upload>
            </div>
            <div class="mark">
              请截取质检时不符合要求的的{{ type == 'live' ? '直播' : '作品' }}画面或录屏
            </div>
          </div>
        </el-form-item>
        <el-form-item label="质检备注" prop="remark" v-if="form.isPass == 0">
          <el-input
            style="width: 518px"
            :rows="4"
            type="textarea"
            maxlength="100"
            v-model="form.remark"
            show-word-limit
            resize="none"
            placeholder="请输入质检备注"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" :loading="loading" @click="handleConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog title="查看附件" v-model="checkDialog" destroy-on-close>
      <div class="check_modal">
        <img v-if="dialogFile.type === 'image'" :src="dialogFile.url" alt />
        <video v-else :src="dialogFile.url" controls="controls" autoplay />
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import { createCheck } from '@/api/content_center/inspection.js'
const props = defineProps({
  inspectionModal: {
    type: Object,
    default: () => {
      return {
        show: true, // 是否显示弹窗
        title: '', // 弹窗标题
        xcontentId: '',
        type: '' // 弹窗类型 video live
      }
    },
    required: true
  }
})
const action = '/api/cgp/web/oss/uploadFile'
const message = inject('$message')
const show = toRef(props.inspectionModal, 'show')
const type = toRef(props.inspectionModal, 'type')
const dialog = ref(null) // ==$refs.dialog
const ruleForm = ref(null)
const loading = ref(false) // 弹窗的Loading
const fileLoading = ref(false) // 附件的loading
// 质检标记
const passData = ref([
  {
    label: '合格',
    value: 1
  },
  {
    label: '不合格',
    value: 0
  }
])
// 下架视频
const downData = ref([
  {
    label: '是',
    value: 1
  },
  {
    label: '否',
    value: 0
  }
])
// 表单相关数据
const form = reactive({
  brandId: localStorage.getItem('brandInfo')
    ? JSON.parse(localStorage.getItem('brandInfo')).brandId
    : '', // 品牌Id
  contentType: null, // 1 视频 2直播
  xcontentId: null, // 直播/视频ID
  isPass: null, // 质检标记
  isTakeOffVideo: null, // 下架视频
  fileList: [], // 附件
  remark: '' // 备注
})
// 是否下架的验证
const validateDown = (rule, value, callback) => {
  if (form.isPass === 1) {
    callback()
  } else {
    if (type.value === 'video') {
      if (form.isTakeOffVideo != null) {
        callback()
      } else {
        callback(new Error('请选择是否为下架视频'))
      }
    } else {
      callback()
    }
  }
}
// 附件的验证
const validateFile = (rule, value, callback) => {
  if (form.isPass === 1) {
    callback()
  } else {
    if (form.fileList.length > 0) {
      callback()
    } else {
      callback(new Error('请上传质检附件'))
    }
  }
}
// 备注的验证
const validateMark = (rule, value, callback) => {
  if (form.isPass === 1) {
    callback()
  } else {
    if (form.remark) {
      callback()
    } else {
      callback(new Error('请输入质检备注'))
    }
  }
}

// 表单规则
const rules = {
  isPass: [{ required: true, message: '请选择质检标记', trigger: 'change' }],

  isTakeOffVideo: [{ required: true, validator: validateDown, trigger: 'change' }],
  fileList: [{ required: true, validator: validateFile, trigger: 'change' }],
  remark: [{ required: true, validator: validateMark, trigger: 'blur' }]
}

// 打开弹窗并将数据填写
function init() {
  if (props.inspectionModal.xcontentId) {
    form.contentType = type.value === 'live' ? 2 : 1
    form.xcontentId = props.inspectionModal.xcontentId
  }
}
init()

// 文件上传之前
function beforeUploadFile(file) {
  console.log(file)
  const type = file.type.split('/')[0]
  const size = file.size
  if (type === 'image') {
    if (size > 500000) {
      message({
        type: 'warning',
        message: '图片大小不能超过500K'
      })
      return false
    }
  } else if (type === 'video') {
    if (size > 200000000) {
      message({
        type: 'warning',
        message: '视频大小不能超过200M'
      })
      return false
    }
  }
  fileLoading.value = true
}
const requestHeaders = ref({
  'X-Requested-With': 'XMLHttpRequest',
  token: localStorage.getItem('token'),
  brandId: localStorage.getItem('brandInfo')
    ? JSON.parse(localStorage.getItem('brandInfo')).brandId
    : '',
  userId: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo')).userId
    : ''
})
// 文件上传成功
function handleSuccess(res, file) {
  console.log('成功')
  console.log(res)
  console.log(file)
  if (res.code === 0) {
    if (form.fileList.length >= 5) {
      return message.warning('最多上传5个质检附件')
    }
    if (res.data.attachmentType === 2) {
      // 添加到文件上传列表中
      form.fileList.push({
        type: 'video',
        attachmentCoverId: res.data.attachmentCoverId || '',
        attachmentType: res.data.attachmentType,
        attachmentId: res.data.attachmentId,
        img: res.data.attachmentCoverUrl,
        url: res.data.attachmentUrl
      })
    } else {
      // 添加到文件上传列表中
      form.fileList.push({
        type: 'image',
        attachmentCoverId: res.data.attachmentCoverId || '',
        attachmentType: res.data.attachmentType,
        attachmentId: res.data.attachmentId,
        img: res.data.attachmentUrl,
        url: res.data.attachmentUrl
      })
    }
    console.log(form.fileList)
  } else {
    message.warning('质检附件上传失败')
  }
  console.log(res, file)

  fileLoading.value = false
}
// 文件上传失败
function handleError() {
  fileLoading.value = false
}

const emits = defineEmits(['updateList'])
// 表单提交
function handleConfirm() {
  ruleForm.value.validate(valid => {
    if (valid) {
      loading.value = true
      if (form.isPass === 1) {
        form.isTakeOffVideo = null
        form.fileList = []
        form.remark = ''
      }
      if (form.fileList && form.fileList.length > 0) {
        form.attachments = form.fileList.map(x => {
          return {
            attachmentCoverId: x.attachmentCoverId,
            attachmentId: x.attachmentId,
            attachmentType: x.attachmentType
          }
        })
      } else {
        form.attachments = []
      }
      createCheck(form)
        .then(res => {
          if (res.code === 0) {
            loading.value = false
            message.success('质检成功')
            emits('updateList')
            dialog.value.handleClose()
          } else {
            loading.value = false
          }
        })
        .catch(() => {
          loading.value = false
        })
    }
  })
}

const checkDialog = ref(false) // 是否显示查看附件的弹窗
// 查看附件相关数据
const dialogFile = ref({
  type: '', // 附件属性 video/image
  img: '', // 附件的封面图
  url: '' // 附件地址
}) // 查看附件的data

// 查看附件
function showFile(e) {
  checkDialog.value = true
  dialogFile.value = e
}
// 删除附件
function delFile(e, index) {
  form.fileList.splice(index, 1)
}
// 关闭整个弹窗
function closeDialog() {
  dialog.value.handleClose()
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
:deep(.el-dialog__body) {
  padding: 22px 24px 28px 0;
}
:deep(.el-form-item__content) {
  min-height: 32px;
  height: auto;
  &:first-child {
    margin-bottom: 14px !important;
  }
}
:deep(.el-form-item:first-child) {
  margin-bottom: 14px !important;
}
.mark {
  font-size: 14px;
  font-weight: 400;
  color: #909399;
  line-height: 20px;
}
:deep(.el-textarea .el-input__count) {
  --el-color-info: #c0c4cc;
}
.file_box {
  margin-top: 8px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  .one_file {
    width: 120px;
    height: 160px;
    margin-right: 14px;
    margin-bottom: 14px;
    position: relative;

    border-radius: 4px;
    overflow: hidden;
    .file_cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
    }
    .file_action {
      opacity: 0;
      width: 120px;
      height: 160px;
      position: absolute;
      left: 0;
      top: 0;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      // padding: 0 8px 8px 0;

      background: rgba(0, 0, 0, 0.4);
      font-size: 14px;
      font-weight: 400;
      color: #ffffff;
      line-height: 20px;
      .check_icon {
        width: 120px;
        height: 40px;
        padding: 8px;
        cursor: pointer;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
      }
      .del_icon {
        position: absolute;
        bottom: 0px;
        right: 0px;
        width: 120px;
        height: 40px;
        padding: 0 8px 8px 0;
        cursor: pointer;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: flex-end;
        img {
          width: 16px;
          height: 16px;
          display: flex;
        }
      }
      &:hover {
        opacity: 1;
      }
    }
  }
  :deep(.el-upload--picture) {
    margin-bottom: 14px;
    width: 118px;
    height: 158px;
    border-radius: 0;
    border: 1px dashed #dbdfe7;
    background: #fff;
    &:hover {
      border-color: $theme_color;
    }
  }
  .upload_text {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-weight: 400;
    color: #303133;
    line-height: 20px;
    img {
      width: 20px;
      height: 20px;
      margin-bottom: 16px;
    }
  }
}
.check_modal {
  width: 100%;
  height: 400px;
  padding-left: 24px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  video {
    width: 100%;
    height: 100%;
  }
}
</style>
