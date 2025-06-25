<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      width="560px"
      custom-class="rule_setting_dialog rule_setting_form_dialog hide_footer_line"
    >
      <template #title>
        <div class="dialog_title">
          上传{{ props.uploadDialog.type === 1 ? '面部' : '人物' }}模型
          <span>后台上传的模型默认可供所有用户使用</span>
        </div>
      </template>
      <div class="dialog_content">
        <el-form
          class="upload_form"
          :model="form"
          :rules="rules"
          ref="ruleForm"
          label-width="106px"
        >
          <el-form-item label="模型名称：" prop="name">
            <el-input
              style="width: 349px"
              v-model="form.name"
              maxlength="15"
              placeholder="请输入模型名称"
              @blur="retEmit($event)"
            />
          </el-form-item>
          <el-form-item label="本地上传：" prop="videoUrl">
            <div>
              <div class="video_box" v-if="form.videoUrl">
                <img class="video_cover" :src="form.coverUrl" alt="" />
                <img
                  @click="previewFun()"
                  class="video_play"
                  src="https://tagvv-1256030678.file.myqcloud.com/20230308mdq3m.png"
                  alt=""
                />
                <img
                  @click="delFun()"
                  class="video_del"
                  src="https://tagvv-1256030678.file.myqcloud.com/20221119hj21g.png"
                  alt=""
                />
              </div>
              <uploadVideo
                :showLoading="false"
                v-else
                :maxSize="1048576"
                :index="0"
                v-model:uploadLoading="uploadLoading"
                @success="uploadVideoSuccess"
                :acceptTypeList="['video/mp4', 'video/quicktime']"
              >
                <div class="video_upload_box" v-loading="uploadLoading">
                  <el-icon size="20" color="#909399">
                    <i-plus />
                  </el-icon>
                </div>
              </uploadVideo>
              <div class="upload_mark">仅支持上传1GB以内的视频文件</div>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog_footer">
          <div class="footer_left">
            <el-checkbox v-model="agreementInfo.agree" label="已阅读并同意" />
            <el-link @click="showAgree" style="line-height: 32px; margin-left: 4px" type="primary">
              用户协议
            </el-link>
          </div>
          <div class="footer_right">
            <el-button :disabled="loading" @click="cancelFun">取消</el-button>

            <el-button
              type="primary"
              :disabled="!agreementInfo.agree"
              :loading="loading"
              @click="saveFun"
            >
              确定
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
    <!-- 预览弹窗 -->
    <previewDialog v-if="previewInfo.show" :previewDialog="previewInfo"></previewDialog>
    <!-- 用户协议的弹窗 -->
    <agreeDOM v-if="agreementInfo.show" :agreeDialog="agreementInfo" />
  </div>
</template>
<script setup>
import agreeDOM from '@/views/sumvideo/digital_model/components/agree_dialog.vue'
import uploadVideo from '@/views/market/miniprogram_operation/components/upload_video.vue'

import previewDialog from '@/components/preview_dialog/preview_dialog.vue'
import { throttle } from '@/utils/tools.js'
import { uploadModelVideo, grabParam } from '@/api/sumvideo/digital_model.js'

const props = defineProps({
  uploadDialog: {
    type: Object,
    default: () => {
      return {
        id: null,
        info: null,
        type: 1, // 1面部模型 2 人物模型
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.uploadDialog, 'show')
const agreementInfo = reactive({
  agree: false, // 是否勾选了用户协议
  show: false // 是否显示用户协议的弹窗
})
const showAgree = throttle(() => {
  agreementInfo.show = true
}, 500)
const form = ref({
  name: null,
  videoUrl: null,
  coverUrl: null,
  uploadSource: 2,
  modelType: props.uploadDialog.type
})
const rules = reactive({
  name: [
    {
      required: true,
      message: '请输入模型名称',
      trigger: 'blur'
    }
  ],
  videoUrl: [{ required: true, message: '请上传视频', trigger: 'change' }]
})
// 检查是否有表情包
function retEmit(e) {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  form.value.name = e.target.value.replace(reg, '')
}
// form表单的操作
const message = inject('$message')
const ruleForm = ref(null)
const loading = ref(false)
const saveFun = throttle(() => {
  ruleForm.value.validate(valid => {
    if (valid) {
      if (!agreementInfo.agree) {
        message.warning('请勾选协议')
        return
      }
      loading.value = true

      uploadModelVideo(form.value)
        .then(res => {
          if (res.code === 0) {
            message.success('上传成功')
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
function cancelFun() {
  dialog.value.handleClose()
}
// 上传视频
const uploadLoading = ref(false)
// 视频上传成功
function uploadVideoSuccess(data) {
  console.log(data)
  uploadLoading.value = true
  grabParam({ materialUrl: data.url })
    .then(res => {
      if (res.code === 0) {
        form.value.coverUrl = res.data.url
        form.value.videoUrl = data.url
        ruleForm.value.validateField('videoUrl')
      }
      uploadLoading.value = false
    })
    .catch(() => {
      form.value.coverUrl = data.url + '?x-oss-process=video/snapshot,t_1000,m_fast'
      form.value.videoUrl = data.url
      ruleForm.value.validateField('videoUrl')
      uploadLoading.value = false
    })
}
// 播放视频
const previewInfo = ref({
  show: false
})
const previewFun = throttle(() => {
  previewInfo.value = {
    show: true,
    title: '查看视频',
    url: form.value.videoUrl,
    type: 'video',
    cover: form.value.coverUrl || ''
  }
})
const delFun = throttle(() => {
  form.value.coverUrl = ''
  form.value.videoUrl = ''
})
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.dialog_content {
  padding: 16px 16px 16px 0;
  .edit_form {
    :deep(.el-form-item__label) {
      padding-right: 8px;
      color: #303133;
    }
    :deep(.el-form-item__content) {
      color: #303133;
    }
  }
  .video_box {
    width: 122px;
    height: 122px;
    position: relative;
    .video_cover {
      border-radius: 4px;
      width: 122px;
      height: 122px;
      object-fit: cover;
    }
    .video_play {
      width: 32px;
      height: 32px;
      object-fit: contain;
      position: absolute;
      left: 45px;
      top: 45px;
      cursor: pointer;
    }
    .video_del {
      opacity: 0;
      width: 20px;
      height: 20px;
      position: absolute;
      top: 8px;
      right: 8px;
      object-fit: contain;
      cursor: pointer;
    }
  }
  .video_box:hover {
    .video_del {
      opacity: 1;
    }
  }
  .upload_mark {
    margin-top: 10px;
    font-size: 14px;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
  }
  .video_upload_box {
    width: 120px;
    height: 120px;
    border: 1px dashed #d8d8d8;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-size: 20px !important;
  }
}
.dialog_footer {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  .footer_left {
    font-size: 14px;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
      color: #909399;
    }
  }
}
</style>
