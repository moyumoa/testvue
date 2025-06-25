<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    :title="
      props.copyDialog.isCreate
        ? `新建${props.copyDialog.origin !== 'creative_mould' ? '云' : ''}模板`
        : `克隆${props.copyDialog.origin !== 'creative_mould' ? '云' : ''}模板`
    "
    width="540px"
    custom-class="rule_setting_dialog hide_footer_line hide_header_line"
  >
    <div class="content_box">
      <el-form
        :model="addCreateform"
        :rules="rules"
        ref="ruleForm"
        label-width="120px"
        @submit.enter.prevent
      >
        <!-- 云模板新建时增加模板类型的选择 -->
        <el-form-item
          label="模板类型："
          prop="type"
          v-if="props.copyDialog.origin !== 'creative_mould'"
        >
          <el-radio-group v-model="addCreateform.type">
            <el-radio :label="1">视频模板</el-radio>
            <el-radio :label="2">图集模板</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="名称：" prop="projectName">
          <el-input
            :placeholder="`请输入${
              props.copyDialog.origin !== 'creative_mould' ? '云' : ''
            }模板名称`"
            @blur="retEmitEmj($event)"
            v-model.trim="addCreateform.projectName"
            maxlength="20"
            show-word-limit
          ></el-input>
        </el-form-item>
        <!-- <el-form-item prop="coverUrl">
        <template #label>
          上传模板封面图
          <span style="color: #8f939a; font-size: 12px">
            （仅支持jpg、jpeg、png格式,建议尺寸：300*455px）
          </span>
        </template>
        <uploadImg
          origin="sumvideo"
          :showLoading="true"
          :index="0"
          @success="uploadImgSuccess"
          :maxSize="2048"
        >
          <div v-if="!addCreateform.coverURL" class="upload_tip">
            <img
              src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/sumvideo/image/20230304223939123cf1579b.png"
              alt=""
            />
            <span>上传图片</span>
          </div>
          <div class="has_box" v-else>
            <img @click.stop="" :src="addCreateform.coverURL" class="avatar" />
            <img
              src="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/sumvideo/image/202303042239008ab7da9421.png"
              class="del_img"
              @click.stop="delImg()"
            />
          </div>
        </uploadImg>
      </el-form-item>
      <el-form-item label="描述:" prop="description">
        <el-input
          placeholder="请输入模板描述"
          type="textarea"
          v-model="addCreateform.description"
          maxlength="100"
        ></el-input>
      </el-form-item> -->
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button :disabled="loading" @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleConfirm">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
// 复制创作的弹窗
import { ElMessage } from 'element-plus'
// import uploadImg from '@/views/market/miniprogram_operation/components/upload_image.vue'
import {
  templateToProject,
  addEditingProject
} from '@/api/sumvideo/creative_templateSpectroscope.js'
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  copyDialog: {
    type: Object,
    default: () => {
      return {
        origin: '',
        isCreate: false, // 是否是新建
        id: null,
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.copyDialog, 'show')
const loading = ref(false)
const rules = reactive({
  type: [{ required: true, message: '请选择模板类型', trigger: 'change' }],
  projectName: [
    {
      required: true,
      message: `请输入${props.copyDialog.origin !== 'creative_mould' ? '云' : ''}模板名称`,
      trigger: 'blur'
    }
  ]
})
const addCreateform = reactive({
  type: 1, // 模板类型
  projectName: '',
  coverURL: '',
  description: ''
})
// 检查是否有表情包
function retEmitEmj(e) {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi
  addCreateform.projectName = e.target.value.replace(reg, '')
}
// // 上传封面成功
// function uploadImgSuccess(e) {
//   console.log(e)
//   addCreateform.coverURL = e.imgUrl
// }
// const delImg = throttle(() => {
//   addCreateform.coverURL = ''
// }, 500)
const ruleForm = ref(null)

const emits = defineEmits('updateList')
// 弹窗的确定事件
const handleConfirm = throttle(() => {
  // console.log('新建：', selectForm.value)
  ruleForm.value.validate(valid => {
    if (valid) {
      loading.value = true
      // 新建模板
      if (props.copyDialog.isCreate) {
        addEditingProject({
          tag:
            props.copyDialog.origin !== 'creative_mould'
              ? addCreateform.type === 2
                ? 5
                : null
              : null, // 云模板入参新增模板类型
          projectName: addCreateform.projectName
        })
          .then(res => {
            if (res.code === 0) {
              window.open(
                `${location.origin}/sumvideo/editing_project_web/` +
                  res.data.aliyunProjectId +
                  '/' +
                  res.data.projectId +
                  `?origin=${
                    props.copyDialog.origin !== 'creative_mould'
                      ? props.copyDialog.origin
                      : 'template_space'
                  }&isFirst=1&creativeId=${res.data.creativeId}`,
                '_blank'
              )
              ElMessage({
                message: `新增${props.copyDialog.origin !== 'creative_mould' ? '云' : ''}模板成功`,
                type: 'success'
              })

              emits('updateList')
              dialog.value.handleClose()
              loading.value = false
            } else {
              loading.value = false
            }
          })
          .catch(() => {
            loading.value = false
          })
        return
      }
      // 复制模板
      const data = {
        creativeId: props.copyDialog.id,
        projectName: addCreateform.projectName,
        coverURL: addCreateform.coverURL,
        description: addCreateform.description
      }
      templateToProject(data)
        .then(res => {
          if (res.code === 0) {
            emits('updateList')
            ElMessage({
              message: `${props.copyDialog.origin !== 'creative_mould' ? '云' : ''}模板克隆成功！`,
              type: 'success'
            })
            dialog.value.handleClose()
            loading.value = false
          } else {
            loading.value = false
          }
          console.log(res)
        })
        .catch(() => {
          loading.value = false
        })
    }
  })
}, 700)
function closeDialog() {
  console.log(dialog.value)
  dialog.value.handleClose()
}
</script>
<style lang="scss" scoped>
.error_text {
  color: #ff0000;
  margin-top: 8px;
}
.has_box {
  width: 120px;
  border: 1px dashed #dbdfe7;
  height: 160px;
  border-radius: 4px;
  position: relative;
  .avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: default;
  }
  .del_img {
    position: absolute;
    width: 24px;
    height: 24px;
    bottom: 8px;
    right: 8px;
    cursor: pointer;
    display: none;
  }
}
.has_box:hover {
  .del_img {
    display: block;
  }
}
.upload_tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  width: 120px;
  border: 1px dashed #dbdfe7;
  height: 160px;
  border-radius: 4px;

  img {
    width: 20px;
    height: 20px;
    margin-bottom: 14px;
    position: relative;
  }

  span {
    height: 20px;
    line-height: 20px;
    font-size: 14px;
    font-weight: 400;
    color: #303133;
  }
}
.content_box {
  padding: 20px 24px 20px 0;
}
</style>
