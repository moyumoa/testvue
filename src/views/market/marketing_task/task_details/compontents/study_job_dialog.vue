<template>
  <el-dialog
    ref="dialog"
    custom-class="studyJobDialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="作业点评"
    width="820px"
    top="5vh"
    :before-close="handleClose"
  >
    <div>
      <videoJob
        v-if="$data.videoUrl"
        :disabled="$data.disabled"
        :videoUrl="$data.videoUrl"
        :homeworkInfo="$data.homeworkInfo"
        :videoTag="$data.videoTag"
        @updateTag="updateTag"
      ></videoJob>
      <textJob
        v-if="$data.textInfo"
        :homeworkInfo="$data.homeworkInfo"
        :textInfo="$data.textInfo"
      ></textJob>
      <div class="content_bottom" :style="$data.disabled ? 'padding-bottom:20px' : ''">
        <!--分数 -->
        <el-form :model="$data.form" :rules="$data.rules" ref="ruleForm" label-width="100px">
          <el-form-item label="获得分数" prop="commentGrade">
            <el-input
              :disabled="$data.disabled"
              style="width: 120px"
              oninput="value=value.replace(/[^\d]/g,'')"
              @blur="retEmit($event)"
              v-model.trim="$data.form.commentGrade"
              placeholder=""
            ></el-input>
          </el-form-item>
          <el-form-item label="意见">
            <!-- @blur="retEmitEmj($event)" -->

            <el-input
              :disabled="$data.disabled"
              v-model.trim="$data.form.commentText"
              placeholder="请输入意见"
              type="textarea"
              resize="none"
              maxlength="150"
              :autosize="{ minRows: 4, maxRows: 6 }"
              show-word-limit
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <template #footer v-if="!$data.disabled">
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="$data.btnLoading" @click="handleConfirm">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import videoJob from './study_job_components/video_job.vue'
import textJob from './study_job_components/text_job.vue'
import { commentCourseTask } from '@/api/market/task.js'
import { throttle } from '@/utils/tools.js'

const props = defineProps({
  jobDialog: {
    type: Object,
    default: () => {
      return {
        show: true, // 是否显示弹窗
        deliverId: null,
        taskId: null
      }
    },
    required: true
  },
  taskInfo: {
    type: Object
  }
})
const dialog = ref()
const { show, deliverId, taskId, origin } = toRefs(props.jobDialog)

const $data = reactive({
  disabled: false,
  homeworkId: null,
  videoUrl: '',
  videoTag: [],
  textInfo: '',
  homeworkRequirement: '',// 作业要求
  form: {
    commentText: '',
    commentGrade: null
  },
  rules: {
    commentGrade: [{ required: true, message: '请输入分数', trigger: 'blur' }]
  },
  btnLoading: false
})

function init() {
  if (props.jobDialog.deliverId) {
    const data = JSON.parse(JSON.stringify(props.jobDialog))
    $data.homeworkInfo = {
      requirement: data.homeworkRequirement, // 作业要求
      sample: data.homeworkSample // 作业示例
    }
    if (data.courseHomeworkType === '1') {
      $data.videoUrl = JSON.parse(data.homeworkText).url
    } else {
      $data.textInfo = data.homeworkText
    }
    $data.homeworkId = data.homeworkId
    if (data.commentStatus) {
      $data.disabled = true
      $data.videoTag = JSON.parse(data.commentVideoPart)
      $data.form.commentGrade = data.commentGrade
      $data.form.commentText = data.commentText
    }
  }
}

init()

// 视频的点评
function updateTag(e) {
  $data.videoTag = e
}

// 表单的操作区

// 检查是否超出500
function retEmit(e) {
  const data = e.target.value
  if (data) {
    if (parseInt(data) > 100) {
      $data.form.commentGrade = 100
    } else if (parseInt(data) <= 0) {
      $data.form.commentGrade = ''
    } else {
      $data.form.commentGrade = parseInt(data)
    }
  }
}

// // 检查是否有表情包
// function retEmitEmj(e) {
//   const reg = /[^\u4e00-\u9fa5a-zA-Z0-9/,]/gi
//   $data.form.tag = e.target.value.replace(reg, '')
// }

const message = inject('$message')
const ruleForm = ref(null)
const emits = defineEmits(['updateList', 'closeJobDialog'])
// 弹窗的确定事件
const handleConfirm = throttle(() => {
  ruleForm.value.validate(valid => {
    if (valid) {
      $data.btnLoading = true
      if ($data.videoTag.length > 0) {
        const list = $data.videoTag.filter(x => x.content === '')
        if (list.length > 0) {
          message.warning('请将点评填写完整哦')
          $data.btnLoading = false
          return
        }
      }
      try {
        console.log({
          commentGrade: $data.form.commentGrade,
          commentText: $data.form.commentText,
          commentVideoPart: JSON.stringify($data.videoTag),
          deliverId: deliverId.value,
          taskId: taskId.value,
          homeworkId: $data.homeworkId
        })
      }catch (e){
        console.error(e)
      }

      commentCourseTask({
        commentGrade: $data.form.commentGrade,
        commentText: $data.form.commentText,
        commentVideoPart: JSON.stringify($data.videoTag),
        deliverId: deliverId.value,
        taskId: taskId.value,
        homeworkId: $data.homeworkId
      })
        .then(res => {
          if (res.code === 0) {
            emits('updateList')
            message.success('点评成功')
            dialog.value.handleClose()
            $data.btnLoading = false
          } else {
            $data.btnLoading = false
          }
        })
        .catch(() => {
          $data.btnLoading = false
        })
    }
  })
}, 700)

function closeDialog() {
  dialog.value.handleClose()
}

function handleClose(done) {
  emits('closeJobDialog', origin.value)
  done()
}
</script>
<style lang="scss" scoped>
.error_text {
  color: #ff0000;
  margin-top: 8px;
}

.content_bottom {
  width: calc(100% - 16px);
  border-top: 1px solid #dcdee0;
  padding-top: 20px;
}
</style>
