<template>
  <div
    class="banner-dialog"
    :style="
      props.type === 'activity_square' || props.type === 'operation' ? 'min-height:160px' : ''
    "
  >
    <div class="has_img" v-if="info && info.coverUrl">
      <el-image
        style="width: 200px; height: 68px; border-radius: 2px"
        :src="info.coverUrl"
        fit="cover"
        :preview-src-list="[info.coverUrl]"
      ></el-image>
      <img
        @click="delImg"
        v-if="props.type === 'activity_square'"
        src="https://tagvv-1256030678.file.myqcloud.com/202211253s881.png"
        alt=""
        class="del_icon"
      />
    </div>
    <el-upload
      v-else
      :show-file-list="false"
      accept="image/jpeg, image/jpg, image/png"
      :action="uploadFileURL"
      list-type="picture"
      :on-success="handleHeadSuccess"
      :on-error="handleHeadError"
      :before-upload="beforeHeadUploadFile"
    >
      <div class="upload_text_box" v-if="addText" v-loading="uploadLoading">
        <el-icon class="upload-icon">
          <i-plus />
        </el-icon>
        <div class="uploader_text">{{ addText }}</div>
      </div>
      <el-icon class="uploader-icon" v-else v-loading="uploadLoading">
        <i-plus />
      </el-icon>
    </el-upload>
    <div class="tips" v-if="props.type === 'activity_square'">
      建议尺寸为750*256px，单个不超过2M，支持png、jpg、jpeg
    </div>
    <template v-if="!(systemVersion == 1 || systemVersion == 4)">
      <el-form class="type-radio">
        <el-form-item label="是否跳转页面：" required>
          <el-radio-group v-model="info.radio" @change="onRadioChange">
            <el-radio :label="1" v-if="routeType.includes(1)">不跳转</el-radio>
            <el-radio :label="2" v-if="routeType.includes(2)">任务详情页</el-radio>
            <el-radio :label="3" v-if="routeType.includes(3)">课程详情页</el-radio>
            <el-radio :label="5" v-if="routeType.includes(5)">成长等级页</el-radio>
            <el-radio :label="6" v-if="routeType.includes(6)">我的活动页</el-radio>
            <el-radio :label="7" v-if="routeType.includes(7)">金币商城页</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div
        class="detail-wrapper"
        v-if="info && info.radio === 2"
        :style="props.type === 'operation' ? 'margin-top: 30px' : ''"
      >
        <div class="detail-title">
          {{ info.jump.name ? '任务标题：' + info.jump.name : '请选择任务' }}
        </div>
        <div class="change-detail" @click="showTaskDialog = true">
          {{ info.jump.name ? '更换' : '选择' }}
        </div>
      </div>
      <div
        class="detail-wrapper"
        v-if="info && info.radio === 3"
        :style="props.type === 'operation' ? 'margin-top: 30px' : ''"
      >
        <div class="detail-title">
          {{ courseTitle() }}
        </div>
        <choose-class-dialog
          v-if="showCourseDialog"
          v-model:show="showCourseDialog"
          :showPreview="false"
          :can-choose-course="true"
          @confirm="onCourseConfirm"
        >
          <div style="display: none"></div>
        </choose-class-dialog>
        <div class="change-detail" @click="showCourseDialog = true">
          {{ info.jump.name || info.jump.title ? '更换' : '选择' }}
        </div>
      </div>
    </template>
  </div>
  <!-- 任务选择  -->
  <task-dialog
    v-model:show="showTaskDialog"
    v-if="showTaskDialog"
    :query-info="{ taskStatuses: [3, 4, 5] }"
    @confirm="onTaskConfirm"
  ></task-dialog>
</template>

<script setup>
import { uploadFileURL } from '@/api/upload.js'
import TaskDialog from './task_dialog.vue'
// 上传
import { ElMessage } from 'element-plus'
import ChooseClassDialog from '@/views/market/marketing_task/create_task/components/course_setting/choose_class_dialog.vue'
import { isEmpty, throttle } from '@/utils/tools.js'
import { useStore } from 'vuex'

const store = useStore()
const systemVersion = computed(() => store.state.user.systemVersion)

const props = defineProps({
  info: Object,
  addText: String, // 上传的文字
  routeType: {
    type: Array,
    default() {
      return [1, 2, 3, 5, 6, 7]
    } // 支持跳转页面的类型
  },
  type: String // 是哪个属性过来的
})
const { info } = toRefs(props)

const onRadioChange = value => {
  info.value.type = value
  info.value.jump = {}
  // 成长等级跟我的活动不需要带id，这里只用把id置位true // 2025.1 金币商城页也不需要带id
  if (value === 5 || value === 6 || value === 7) {
    info.value.jump.id = true
  }
}
const uploadLoading = ref(false)
const handleHeadSuccess = res => {
  info.value.coverUrl = res.data
  uploadLoading.value = false
}
const handleHeadError = err => {
  console.error('handleHeadError', err)
  uploadLoading.value = false
}
const beforeHeadUploadFile = file => {
  const typeList = ['image/jpeg', 'image/jpg', 'image/png']
  if (typeList.indexOf(file.type) === -1) {
    ElMessage.warning('仅支持png、jpg、jpeg格式的图片')
    return false
  }
  console.log('上传文件的格式', file.type)
  if (file.size / 1024 / 1024 > 2) {
    ElMessage.warning('上传图片大小不能超过2M')
    return false
  }
  uploadLoading.value = true
}
// 任务选择
const showTaskDialog = ref(false)
const onTaskConfirm = item => {
  info.value.jump = item
}
// 课程选择
const showCourseDialog = ref(false)
const onCourseConfirm = item => {
  info.value.jump = item
  if (Object.prototype.hasOwnProperty.call(item, 'courseContentVOList')) {
    // 大课程 type
    info.value.type = 3
  } else {
    info.value.type = 4
  }
}

function courseTitle() {
  if (info.value.type === 3) {
    return isEmpty(info.value.jump.name) ? '请选择课程' : `课程标题：${info.value.jump.name}`
  } else {
    return isEmpty(info.value.jump.title) ? '请选择课程' : '课程标题：' + info.value.jump.title
  }
}

const delImg = throttle(() => {
  info.value.coverUrl = ''
}, 700)
</script>

<style lang="scss" scoped>
.tips {
  margin-top: 12px;
  font-size: 14px;
  font-weight: 400;
  color: #909399;
  line-height: 20px;
}
.add-and-tips {
  line-height: 62px;
  display: flex;
  align-items: center;

  .add-icon {
    color: $theme-color;
    font-size: 20px;
  }

  .add {
    color: $theme-color;
    font-size: 16px;
    margin: 0 12px;
  }
}

.banner-dialog {
  margin-bottom: 16px;
  width: 468px;
  min-height: 130px;
  padding: 16px 16px 0;
  box-sizing: border-box;
  background: #f6f7f8;
  border-radius: 4px;
  position: relative;

  .upload_text {
    width: 200px;
    height: 68px;
    border-radius: 2px;
  }

  .uploader-icon {
    font-size: 24px;
  }

  .right-icon {
    position: absolute;
    top: 16px;
    right: 16px;
    font-size: 20px;

    .move-icon {
      margin-left: 4px;
    }

    .delete-icon {
      margin-left: 12px;
    }

    .hover:hover {
      color: $theme-color;
    }
  }
}

.type-radio {
  margin: 6px 0;
  :deep(.el-form-item__label) {
    color: #333333;
  }
  :deep(.el-radio) {
    color: #323233;
    &:nth-of-type(3) {
      margin-right: 0;
    }
  }
}

.detail-wrapper {
  padding-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .detail-title {
    flex: 1;
    @include mult_line(1);
    line-height: 32px;
    padding: 0 12px;
    color: #666666;
    background: #ffffff;
    border-radius: 2px;
  }

  .change-detail {
    margin-left: 12px;
    color: $theme-color;
    cursor: pointer;
  }
}

:deep(.el-upload--picture) {
  width: 200px;
  height: 68px;
  border-radius: 2px;
  border: 1px dashed #dbdfe7;
  background: #fff;

  &:hover {
    border-color: $theme_color;
  }

  .uploader-icon {
    font-size: 24px;
    width: 200px;
    height: 68px;
  }
}
.upload_text_box {
  width: 200px;
  height: 68px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .upload-icon {
    color: rgb(165, 165, 165);
    font-size: 20px;
  }
  .uploader_text {
    margin-top: 4px;
    font-size: 14px;
    font-weight: 400;
    color: #333333;
    line-height: 20px;
  }
}
.has_img {
  width: 200px;
  height: 68px;
  border-radius: 2px;
  position: relative;

  .del_icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
    cursor: pointer;
    position: absolute;
    right: 8px;
    top: 8px;
  }
}
</style>
