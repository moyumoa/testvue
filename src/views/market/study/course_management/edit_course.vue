<template>
  <div class="create_course">
    <div class="course_form">
      <el-form
        ref="courseFormRef"
        :model="$data.form"
        :rules="$data.rules"
        label-width="330px"
        @submit.prevent
      >
        <div class="block">
          <div class="block_title">基本信息</div>
          <div class="form_main">
            <el-form-item label="课程名称：" prop="name">
              <el-input
                v-model.trim="$data.form.name"
                placeholder="请输入课程名称"
                maxlength="20"
                show-word-limit
              ></el-input>
            </el-form-item>
            <el-form-item label="课程简介：" prop="description">
              <el-input
                v-model.trim="$data.form.description"
                placeholder="请输入课程简介"
                type="textarea"
                resize="none"
                maxlength="44"
                :autosize="{ minRows: 4, maxRows: 6 }"
                show-word-limit
              ></el-input>
            </el-form-item>
            <el-form-item label="课程封面：" prop="cover">
              <form-upload
                v-model:uploadFiles="$data.form.cover"
                @success="updateValidate('cover')"
                uploadType="image"
                :count="1"
                :maxSize="500"
                tips="建议图片大小500K以内，尺寸比例1:1"
                btnText="上传图片"
              ></form-upload>
            </el-form-item>
          </div>
        </div>
        <div class="block">
          <div class="block_title">课程内容</div>
          <div class="form_main course_content">
            <div class="class_item" v-for="(item, index) in $data.form.classList" :key="index">
              <div class="class_header">
                <span>第{{ index + 1 }}节</span>
                <span class="del_btn" @click="deleteClass(index)" v-if="index > 0">删除</span>
              </div>
              <div class="class_form">
                <el-form-item
                  label="标题："
                  :prop="`classList[${index}].title`"
                  :rules="[
                    {
                      required: true,
                      message: '请输入标题',
                      trigger: 'blur'
                    }
                  ]"
                  label-width="120px"
                >
                  <el-input
                    v-model.trim="item.title"
                    placeholder="请输入标题"
                    maxlength="20"
                    show-word-limit
                  ></el-input>
                </el-form-item>
                <el-form-item
                  label="封面："
                  :prop="`classList[${index}].cover`"
                  :rules="[
                    {
                      required: true,
                      validator: () => validatorCover(item)
                    }
                  ]"
                  label-width="120px"
                >
                  <form-upload
                    v-model:uploadFiles="item.cover"
                    uploadType="image"
                    @success="updateValidate(`classList[${index}].cover`)"
                    :count="1"
                    :maxSize="500"
                    tips="建议图片大小500K以内，尺寸比例1:1"
                    btnText="上传图片"
                  ></form-upload>
                </el-form-item>
                <el-form-item
                  label="内容："
                  :prop="`classList[${index}].content`"
                  :rules="[
                    {
                      required: true,
                      validator: () => validatorClassContent(item)
                    }
                  ]"
                  label-width="120px"
                >
                  <div class="content_action" v-if="item.content || item.videoUrl">
                    <span style="margin-right: 16px" @click="onPreviewClass(item)">预览</span>
                    <span @click="editClass(item, index)">编辑</span>
                  </div>
                  <el-button v-else type="primary" @click="toSetClass(index)">设置</el-button>
                </el-form-item>
              </div>
            </div>
            <div class="add_class" @click="addClass">
              <el-icon size="24" color="#364fcd"><i-plus /></el-icon>
              <span>添加课节</span>
            </div>
          </div>
        </div>
      </el-form>
    </div>
    <div class="footer_btns">
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" @click="saveCourse" :loading="$data.saving">保存</el-button>
    </div>
    <preview-class-dialog
      v-model:dialogVisible="$data.dialogVisible"
      :classInfo="$data.previewClass"
    ></preview-class-dialog>
  </div>
</template>

<script setup>
import formUpload from './components/form_upload.vue'
import previewClassDialog from './components/preview_class_dialog.vue'
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'
import { useStore } from 'vuex'
import { createCourse, updateCourse, getCourseDetail } from '@/api/market/course'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const store = useStore()
const $data = reactive({
  scrollTop: 0,
  rules: {
    name: [
      {
        required: true,
        message: '请输入课程名称',
        trigger: 'blur'
      }
    ],
    description: [
      {
        required: true,
        message: '请输入课程简介',
        trigger: 'blur'
      }
    ],
    cover: [
      {
        required: true,
        validator: () => validatorCover($data.form, '课程')
      }
    ]
  }
})
const courseFormRef = ref(null)

// 初始化数据
function initData() {
  $data.form = {
    name: '',
    description: '',
    cover: [],
    classList: [
      {
        title: '',
        cover: [],
        content: '',
        videoUrl: '',
        videoCoverUrl: ''
      }
    ]
  }
  $data.scrollTop = 0
  $data.courseId = null
  $data.saving = false
  $data.previewClass = {}
  $data.dialogVisible = false
  $data.brforeClassIds = [] // 编辑前的classIds
}

// 校验封面规则
function validatorCover(item, text = '') {
  return new Promise((resolve, reject) => {
    if (!item.cover || !item.cover.length) {
      reject(new Error(`请上传${text}封面`))
    } else {
      resolve()
    }
  })
}
function validatorClassContent(item) {
  return new Promise((resolve, reject) => {
    if (!item.content && !item.videoUrl) {
      reject(new Error('请设置内容'))
    } else {
      resolve()
    }
  })
}
function updateValidate(formKey) {
  courseFormRef.value.validateField(formKey)
}

// 课程详情
function _getCourseDetail() {
  getCourseDetail({ id: route.query.id }).then(res => {
    const _info = res.data
    _info.cover = [{ url: _info.cover }]
    _info.classList = _info.courseContentVOList.map(e => {
      e.cover = [{ url: e.cover }]
      return e
    })
    delete _info.courseContentVOList
    $data.brforeClassIds = _info.classList.map(e => e.id)
    $data.form = _info
  })
}

// 添加课程
function addClass() {
  $data.form.classList.push({
    title: '',
    cover: [],
    content: ''
  })
}
// 预览课节
function onPreviewClass(item) {
  $data.previewClass = item
  $data.dialogVisible = true
}
// 设置课程内容
function toSetClass(index) {
  const el = document.querySelector('.el-main')
  $data.scrollTop = el.scrollTop
  store.commit('course/setClassIndex', index)
  router.push('/content_market/course_management/edit_class')
}
// 编辑课节
function editClass(item, index) {
  store.commit('course/setClassInfo', {
    videoInfo: {
      url: item.videoUrl,
      img: item.videoCoverUrl
    },
    richHtml: item.content
  })
  toSetClass(index)
}
// 删除课节
function deleteClass(index) {
  ElMessageBox.confirm(`确认删除该课节？`, '系统提醒', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    $data.form.classList.splice(index, 1)
  })
}

function cancel() {
  router.go(-1)
}

function saveCourse() {
  console.log($data.form)
  courseFormRef.value.validate(vaild => {
    if (vaild) {
      $data.saving = true
      const param = JSON.parse(JSON.stringify($data.form))
      param.cover = param.cover[0].url
      param.courseContentSaveParamList = param.classList.map((e, i) => {
        e.cover = e.cover[0].url
        e.contentNum = i + 1
        return e
      })
      delete param.classList
      if (param.id) {
        const delContentIds = []
        const _afterClassIds = param.courseContentSaveParamList.map(e => e.id || '')
        $data.brforeClassIds.forEach(id => {
          if (!_afterClassIds.includes(id)) {
            delContentIds.push(id)
          }
        })
        param.delContentIds = delContentIds
      }
      const requestPromise = param.id ? updateCourse : createCourse
      requestPromise(param)
        .then(res => {
          ElMessage.success('创建成功')
          router.push('/content_market/course_management')
        })
        .finally(() => {
          $data.saving = false
        })
    }
  })
}

onBeforeRouteLeave((to, from) => {
  if (to.path !== '/content_market/course_management/edit_class') {
    initData()
  }
})

onActivated(() => {
  courseFormRef.value.clearValidate()
  const el = document.querySelector('.el-main')
  el.scrollTop = $data.scrollTop
  const queryId = route.query.id
  if (queryId !== $data.courseId) {
    $data.courseId = queryId
    if (queryId) {
      _getCourseDetail()
    }
  }
  // 回显课程内容
  if (store.state.course.classInfo) {
    const classIndex = store.state.course.classIndex
    const classInfo = store.state.course.classInfo
    $data.form.classList[classIndex].content = classInfo.richHtml
    $data.form.classList[classIndex].videoUrl = classInfo.videoInfo.url
    $data.form.classList[classIndex].videoCover = classInfo.videoInfo.img
    store.commit('course/setClassInfo', null)
    store.commit('course/setClassIndex', -1)
  }
})

onBeforeMount(() => {
  initData()
})
</script>
<script>
export default {
  name: 'editCourse'
}
</script>

<style lang="scss" scoped>
.create_course {
  color: #303133;
  .course_form {
    min-width: 1000px;
    .block {
      background: #ffffff;
      border-radius: 4px;
      margin-bottom: 16px;
      .block_title {
        padding-left: 24px;
        line-height: 50px;
        border-bottom: 1px solid #e8e8e8;
        font-size: 18px;
        color: #323233;
      }
    }
    .form_main {
      padding: 32px 0;
    }
    .course_content {
      width: 800px;
      padding-left: 224px;
      .class_item {
        margin-bottom: 20px;
        .class_header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 56px;
          padding: 0 24px;
          background: #f6f8fa;
          font-size: 16px;
          .del_btn {
            cursor: pointer;
            color: #364fcd;
            font-size: 14px;
          }
        }
        .class_form {
          padding: 20px 0;
          .content_action {
            > span {
              cursor: pointer;
              color: #364fcd;
              font-size: 14px;
            }
          }
        }
      }
      .add_class {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 36px;
        background: #f6f8fa;
        > span {
          margin-left: 4px;
          font-size: 14px;
          color: #364fcd;
        }
      }
    }
  }
  .footer_btns {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 58px;
    box-sizing: border-box;
    background: #fff;
    > button {
      margin: 0 16px;
    }
  }
}
:deep .el-form-item__content {
  display: block;
  flex: 0 0 345px;
}
</style>
