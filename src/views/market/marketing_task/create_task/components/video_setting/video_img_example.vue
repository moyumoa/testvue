<template>
  <div>
    <el-form-item label="视频示例：" prop="video_demo">
      <div class="tip" style="margin-bottom: 12px">
        视频大小200M以内，MP4、MOV格式，最多上传5个视频
      </div>
      <div class="upload_list">
        <div class="upload_item_wrapper" v-for="(video, index) in data.videoList" :key="index">
          <img class="upload_item" :src="video.img" @click="previewVideo(video.url)" />

          <img
            class="close"
            @click="deleteVideoDemo(index)"
            v-if="!disabled"
            src="https://tagvv-1256030678.file.myqcloud.com/20230610mq634.png"
            alt=""
          />
        </div>
        <div class="upload_item_wrapper" v-if="data.videoList.length < 5 && !disabled">
          <el-upload
            :disabled="data.videoUploadLoading"
            class="uploader"
            :action="data.uploadVideoUrl"
            accept="video/mp4"
            :show-file-list="false"
            :on-success="
              res => {
                return handleVideoSuccess(res)
              }
            "
            :before-upload="beforeVideoUpload"
          >
            <div class="upload_btn" v-loading="data.videoUploadLoading">
              <el-icon size="24" color="#999">
                <i-plus />
              </el-icon>
              <div class="upload_btn_text">样例视频</div>
            </div>
          </el-upload>
        </div>
      </div>
    </el-form-item>

    <el-form-item label="图片指引：" prop="image_guide">
      <div class="tip" style="margin-bottom: 12px">
        图片大小{{
          taskType == 6 ? '5M' : '500K'
        }}以内，png、jpg格式，建议图片尺寸为630*280，最多上传{{ taskType == 6 ? '9' : '5' }}个图片
      </div>
      <div class="upload_list">
        <div class="upload_item_wrapper" v-for="(url, index) in data.imgList" :key="index">
          <!-- <img class="upload_item" :src="url" /> -->
          <el-image
            style="width: 100%; height: 100%; border-radius: 2px"
            :src="url"
            fit="cover"
            :preview-src-list="data.imgList"
            :initial-index="index"
          ></el-image>

          <img
            class="close"
            @click="deleteImageDemo(index)"
            v-if="!disabled"
            src="https://tagvv-1256030678.file.myqcloud.com/20230610mq634.png"
            alt=""
          />
        </div>
        <div
          class="upload_item_wrapper"
          v-if="
            ((taskType == 6 && data.imgList.length < 9) ||
              (taskType != 6 && data.imgList.length < 5)) &&
            !disabled
          "
        >
          <el-upload
            class="uploader"
            :disabled="data.imgUploadLoading"
            :action="data.uploadImgUrl"
            accept="image/jpeg, image/jpg, image/png"
            :show-file-list="false"
            :on-success="
              res => {
                return handleImageSuccess(res)
              }
            "
            :before-upload="beforeImageUpload"
          >
            <div class="upload_btn" v-loading="data.imgUploadLoading">
              <el-icon size="24" color="#999">
                <i-plus />
              </el-icon>
              <div class="upload_btn_text">样例图片</div>
            </div>
          </el-upload>
        </div>
      </div>
    </el-form-item>
  </div>
</template>
<script setup>
const props = defineProps({
  taskInfo: Object,
  disabled: Boolean,
  taskType: Number
})
const { disabled, taskType } = toRefs(props)
// 任务要求
const requireConfig = props.taskInfo?.infoConfigs.find(item => item.ckey === 'task_require')

const message = inject('$message')
const data = reactive({
  uploadVideoUrl: '/api/mission/file/videoUploadReturnImg',
  uploadImgUrl: '/api/mission/file/upload',

  imgList: [],
  videoList: [],
  videoUploadLoading: false,
  imgUploadLoading: false
})

// 视频上传限制
function beforeVideoUpload(file) {
  const isLimit = file.size / 1024 / 1024 < 200
  if (!isLimit) {
    message.error('视频大小不能超过200M')
  }
  data.videoUploadLoading = isLimit
  return isLimit
}
// 上传视频
function handleVideoSuccess(res) {
  data.videoUploadLoading = false
  data.videoList.push(res.data)
  updateTask('video_demo', JSON.stringify(data.videoList))
}
// 删除视频
function deleteVideoDemo(index) {
  data.imgUploadLoading = false
  data.videoList.splice(index, 1)
  updateTask('video_demo', JSON.stringify(data.videoList))
}
// 图片上传限制
function beforeImageUpload(file) {
  const typeList = ['image/jpeg', 'image/jpg', 'image/png']
  if (typeList.indexOf(file.type) === -1) {
    message.error('仅支持png、jpg格式的图片')
    return false
  }
  const isLimit =
    taskType.value === 6 ? file.size / 1024 / 1024 <= 5 : file.size / 1024 / 1024 <= 0.5
  if (!isLimit) {
    message.error(`图片大小不能超过${taskType.value === 6 ? '5M' : '500K'}`)
  }
  data.imgUploadLoading = isLimit
  return isLimit
}
// 上传图片
function handleImageSuccess(res) {
  data.imgUploadLoading = false
  data.imgList.push(res.data)
  updateTask('image_guide', data.imgList.join(','))
}
// 删除图片
function deleteImageDemo(index) {
  data.imgList.splice(index, 1)
  updateTask('image_guide', data.imgList.join(','))
}

function previewVideo(url) {
  window.open(url)
}

onMounted(() => {
  // 转换图片和视频数据格式 'url,url' => [url, url]

  requireConfig.children.forEach(config => {
    if (config.cvalue) {
      if (config.ckey === 'video_demo') {
        data.videoList = JSON.parse(config.cvalue)
      }
      if (config.ckey === 'image_guide') {
        data.imgList = config.cvalue.split(',')
      }
    }
  })
})
function updateTask(ckey, cvalue) {
  requireConfig.children.forEach(config => {
    if (config.ckey === ckey) {
      console.log('修改内容', cvalue)
      config.cvalue = cvalue
    }
  })
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
      border-radius: 2px;
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
