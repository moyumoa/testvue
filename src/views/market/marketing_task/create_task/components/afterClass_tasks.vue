<template>
  <div class="setting_block">
    <div class="setting_title">课后任务</div>
    <div class="setting_main">
      <template v-for="(config, index) in classConfig.children" :key="index">
        <el-form-item
          v-if="$data.showKeys.includes(config.ckey)"
          :label="`${config.name}：`"
          :prop="config.ckey"
        >
          <!-- 课后作业开关 -->
          <div class="form_item_content" v-if="config.ckey == 'course_homework_open'">
            <el-switch
              :disabled="disabled || '2' === studyTypeMode"
              v-model="config.cvalue"
              inline-prompt
              active-value="1"
              inactive-value="0"
              :width="45"
              active-text="开"
              inactive-text="关"
              @change="courseOpenChange"
            ></el-switch>
          </div>
          <template v-if="switchMode === '1'">
            <!-- 作业类型 -->
            <div class="form_item_content" v-if="config.ckey == 'course_homework_type'">
              <el-radio-group v-model="config.cvalue" :disabled="disabled">
                <el-radio
                  :label="item.value"
                  v-for="(item, index) in $data.jobTypeList"
                  :key="index"
                >
                  {{ item.label }}
                </el-radio>
              </el-radio-group>
            </div>
            <!-- 作业要求 -->
            <div class="form_item_content" v-if="config.ckey == 'course_homework_requirement'">
              <el-input
                v-model.trim="config.cvalue"
                :disabled="disabled"
                placeholder="请输入作业要求"
                type="textarea"
                resize="none"
                maxlength="150"
                :autosize="{ minRows: 4, maxRows: 6 }"
                show-word-limit
              ></el-input>
            </div>
            <!-- 是否必做 -->
            <div class="form_item_content" v-if="config.ckey == 'course_homework_requirement_do'">
              <el-radio-group v-model="config.cvalue" :disabled="disabled">
                <el-radio label="1">必做</el-radio>
                <el-radio label="0" v-if="'2' !== studyTypeMode">选做</el-radio>
              </el-radio-group>
            </div>
            <!-- 示例 -->
            <div
              class="form_item_content"
              v-if="config.ckey == 'course_homework_sample' && jobTypeMode === '1'"
            >
              <div class="tip" style="margin-bottom: 12px">视频大小200M以内，MP4、MOV格式</div>
              <div class="upload_list">
                <div
                  class="upload_item_wrapper"
                  v-for="(video, index) in $data.videoList"
                  :key="index"
                >
                  <img class="upload_item" :src="video.img" @click="previewVideo(video.url)" />
                  <!-- <div class="close" @click="deleteVideoDemo(index, config)" v-if="!disabled">
                    <el-icon>
                      <i-circle-close-filled />
                    </el-icon>
                  </div> -->
                  <img
                    class="close"
                    @click="deleteVideoDemo(index, config)"
                    v-if="!disabled"
                    src="https://tagvv-1256030678.file.myqcloud.com/20230610mq634.png"
                    alt=""
                  />
                </div>
                <div class="upload_item_wrapper" v-if="$data.videoList.length < 1 && !disabled">
                  <el-upload
                    :disabled="$data.videoUploadLoading"
                    class="uploader"
                    :action="$data.uploadVideoUrl"
                    accept="video/mp4, video/quicktime"
                    :show-file-list="false"
                    :on-success="
                      res => {
                        return handleVideoSuccess(res, config)
                      }
                    "
                    :before-upload="beforeVideoUpload"
                  >
                    <div class="upload_btn" v-loading="$data.videoUploadLoading">
                      <el-icon size="24" color="#999">
                        <i-plus />
                      </el-icon>
                      <div class="upload_btn_text">样例视频</div>
                    </div>
                  </el-upload>
                </div>
              </div>
            </div>
            <!-- 图文作业示例 -->
            <div
              class="form_item_content"
              v-if="config.ckey === 'course_homework_sample' && jobTypeMode === '2'"
            >
              <div class="tip" style="margin-bottom: 12px">
                图片大小500K以内，png、jpg格式，最多上传3张图片
              </div>
              <div class="upload_list">
                <div class="upload_item_wrapper" v-for="(item, index) in imgList" :key="index">
                  <el-image
                    style="width: 100%; height: 100%"
                    :src="item.url"
                    :preview-src-list="previewImgList"
                    :initial-index="0"
                  />
                  <!-- <div class="close" @click="deleteImg(index, config)" v-if="!disabled">
                    <el-icon>
                      <i-circle-close-filled />
                    </el-icon>
                  </div> -->
                  <img
                    class="close"
                    @click="deleteImg(index, config)"
                    v-if="!disabled"
                    src="https://tagvv-1256030678.file.myqcloud.com/20230610mq634.png"
                    alt=""
                  />
                </div>
                <div class="upload_item_wrapper" v-if="imgList.length < 3 && !disabled">
                  <el-upload
                    :disabled="imgUploadLoading"
                    class="uploader"
                    :action="imgUploadURL"
                    accept=".jpg,.png"
                    :show-file-list="false"
                    :on-success="res => handleImgUploadSuccess(res, config)"
                    :on-error="handleImgUploadError"
                    :before-upload="beforeImgUpload"
                  >
                    <div class="upload_btn" v-loading="imgUploadLoading">
                      <el-icon size="24" color="#999">
                        <i-plus />
                      </el-icon>
                      <div class="upload_btn_text">样例图片</div>
                    </div>
                  </el-upload>
                </div>
              </div>
            </div>
          </template>
        </el-form-item>
      </template>
    </div>
  </div>
</template>
<script setup>
import { STUDY_JOB_TYPE } from '@/utils/dictionary/task'
import { ElMessage } from 'element-plus'
const props = defineProps({
  classConfig: Object,
  disabled: Boolean,
  taskInfo: Object
})
const { classConfig, disabled, taskInfo } = toRefs(props)
const $data = reactive({
  jobTypeList: [],
  uploadVideoUrl: '/api/mission/file/videoUploadReturnImg',
  uploadImgUrl: '/api/mission/file/upload',
  videoList: [],
  videoUploadLoading: false,
  closeKeys: ['course_homework_open'],
  openKeys: [
    'course_homework_open',
    'course_homework_type',
    'course_homework_requirement',
    'course_homework_requirement_do',
    'course_homework_sample'
  ],
  showKeys: []
})
$data.jobTypeList = STUDY_JOB_TYPE.dictionaries.map(e => {
  return {
    label: e.cn,
    value: e.value
  }
})
// const emits = defineEmits(['updateValidate'])
onMounted(() => {
  let courseOpen = ''
  classConfig.value.children.forEach(config => {
    if (config.ckey === 'course_homework_open') {
      if (!config.cvalue) {
        config.cvalue = '0'
      }
      courseOpen = config.cvalue
    } else if (config.ckey === 'course_homework_sample' && config.cvalue) {
      $data.videoList = JSON.parse(config.cvalue)
      imgList.value = JSON.parse(config.cvalue)
    }
    $data.showKeys = courseOpen === '0' ? $data.closeKeys : $data.openKeys
  })
})
// 课后作业开关的值变化
function courseOpenChange(e) {
  clearValue()
}
// 清空对应的值
function clearValue(type) {
  for (const i in classConfig.value.children) {
    const config = classConfig.value.children[i]
    if (config.ckey !== 'course_homework_open') {
      config.cvalue = ''
      // emits('updateValidate', config.ckey)
    }
  }
}
// 设置课后作业 force强制修改，如果有值了也要修改
function setValue(type, force) {
  for (const i in classConfig.value.children) {
    const config = classConfig.value.children[i]
    if (config.ckey === type) {
      if (config.cvalue) {
        if (force) {
          config.cvalue = '1'
        }
      } else {
        config.cvalue = '1'
      }
    }
  }
}
// 获取学习形式的值 在线课程 线下课程
const studyTypeMode = computed(() => {
  for (const i in taskInfo.value.infoConfigs) {
    const infoConfigs = taskInfo.value.infoConfigs[i]
    for (const x in infoConfigs.children) {
      const config = infoConfigs.children[x]
      if (config.ckey === 'course_form') {
        if (config.cvalue === '2') {
          setValue('course_homework_open', true)
        }
        return config.cvalue
      }
    }
  }
})
// 获取课后作业开关的值
const switchMode = computed(() => {
  for (const i in classConfig.value.children) {
    const config = classConfig.value.children[i]
    if (config.ckey === 'course_homework_open') {
      if (config.cvalue === '1') {
        setValue('course_homework_type')
      }
      if (config.cvalue === '1') {
        setValue('course_homework_requirement_do')
      }
      $data.showKeys = config.cvalue === '0' ? $data.closeKeys : $data.openKeys
      return config.cvalue
    }
  }
})
// 获取作业类型的值
const jobTypeMode = computed(() => {
  for (const i in classConfig.value.children) {
    const config = classConfig.value.children[i]
    if (config.ckey === 'course_homework_type') {
      return config.cvalue
    }
  }
})

const message = inject('$message')
function previewVideo(url) {
  window.open(url)
} // 视频上传限制
function beforeVideoUpload(file) {
  const isLimit = file.size / 1024 / 1024 < 200
  if (!isLimit) {
    message.error('视频大小不能超过200M')
  }
  $data.videoUploadLoading = isLimit
  return isLimit
}
// 上传视频
function handleVideoSuccess(res, item) {
  $data.videoUploadLoading = false
  $data.videoList.push(res.data)
  item.cvalue = JSON.stringify($data.videoList)
}
// 删除视频
function deleteVideoDemo(index, item) {
  $data.imgUploadLoading = false
  $data.videoList.splice(index, 1)
  item.cvalue = $data.videoList.length > 0 ? JSON.stringify($data.videoList) : ''
}
// 示例图片上传
const imgList = ref([])
const imgUploadLoading = ref(false)
const imgUploadURL = '/api/mission/file/upload'
const previewImgList = computed(() => {
  const list = []
  imgList.value.forEach(item => {
    list.push(item.url)
  })
  return list
})
function handleImgUploadSuccess(res, config) {
  imgUploadLoading.value = false
  imgList.value.push({ url: res.data })
  config.cvalue = JSON.stringify(imgList.value)
}
function deleteImg(index, item) {
  imgUploadLoading.value = false
  imgList.value.splice(index, 1)
  item.cvalue = imgList.value.length > 0 ? JSON.stringify(imgList.value) : ''
}
function handleImgUploadError(res) {
  ElMessage({
    message: '图片上传失败',
    type: 'error'
  })
}
function beforeImgUpload(file) {
  const isLimit = file.size / 1024 < 500
  if (!isLimit) {
    message.error('图片大小不能超过500K')
  }
  imgUploadLoading.value = isLimit
  return isLimit
}
</script>
<style lang="scss" scoped>
.upload_list {
  display: flex;
  flex-wrap: wrap;
  .upload_item_wrapper {
    position: relative;
    flex-shrink: 0;
    width: 120px;
    height: 120px;
    margin-right: 12px;
    margin-bottom: 12px;
    .upload_item {
      cursor: pointer;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .close {
      cursor: pointer;
      position: absolute;
      top: -8px;
      right: -8px;
      width: 20px;
      height: 20px;
      object-fit: contain;
    }
  }
}
:deep .uploader {
  .upload_btn {
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    box-sizing: border-box;
    border: 1px dashed #d8d8d8;
    .upload_btn_text {
      font-size: 14px;
      margin-top: 5px;
      color: #333;
    }
  }
}
</style>
