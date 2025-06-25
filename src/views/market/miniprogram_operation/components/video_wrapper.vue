<template>
  <div class="video-wrapper">
    <div class="video-info">
      <div class="video-cover" v-show="!videoInfo.videoImgUrl" @click="showDialog = true">
        <el-icon class="icon-plus">
          <i-plus />
        </el-icon>
        <div class="add-video">添加视频</div>
      </div>
      <div class="video_cover_box" v-show="videoInfo.videoImgUrl" @click="playVideo">
        <img
          class="video-cover"
          style="border: none; border-radius: 2px"
          :src="videoInfo.videoImgUrl"
          alt="视频封面"
        />
        <div class="play-icon"></div>
        <div class="del-icon" @click.stop="deleteVideo"></div>
      </div>
      <!-- v-loading="uploadLoading"/ -->
      <el-upload
        v-if="videoInfo.videoImgUrl"
        :show-file-list="false"
        accept="image/jpeg, image/jpg, image/png"
        :action="uploadFileURL"
        list-type="picture"
        :on-success="handleHeadSuccess"
        :on-error="handleHeadError"
        :before-upload="beforeHeadUploadFile"
      >
        <div class="video-text">修改封面</div>
      </el-upload>
    </div>
    <div class="info-wrapper">
      <el-form>
        <el-form-item label="视频标题：">
          <div class="video-title">
            {{ videoInfo.videoTitle || '--' }}
          </div>
        </el-form-item>
        <el-form-item label="显示数据：">
          <el-radio-group v-model="videoInfo.displayOptions">
            <el-radio label="none">不显示</el-radio>
            <el-radio label="play_cnt">播放数</el-radio>
            <el-radio label="digg_cnt">点赞数</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="推荐原因：">
          <el-input
            style="margin-top: 6px"
            :rows="3"
            v-model="videoInfo.recommendReason"
            maxlength="100"
            type="textarea"
            show-word-limit
            placeholder="请输入推荐原因"
          ></el-input>
        </el-form-item>
      </el-form>
    </div>
    <task-video-dialog
      v-if="showDialog"
      v-model:show="showDialog"
      @confirm="onConfirm"
    ></task-video-dialog>
    <video-play
      v-model:show="showPlayVideo"
      :info="{ videoUrl: videoInfo.videoPlayUrl }"
    ></video-play>
  </div>
</template>

<script setup>
import { uploadFileURL } from '@/api/upload.js'
import { ElMessage } from 'element-plus'
import TaskVideoDialog from './task_video_dialog.vue'
import VideoPlay from '@/views/market/miniprogram_operation/components/videoPlay.vue'

const props = defineProps({
  videoInfo: Object,
  index: Number
})
const { videoInfo } = toRefs(props)
const emit = defineEmits(['deleteItem'])

const showDialog = ref(false)
const deleteVideo = () => {
  emit('deleteItem', props.index)
}
const onConfirm = item => {
  console.log('onconfirm', item)
  videoInfo.value.videoDeliverId = item.deliverId
  videoInfo.value.userVideoId = item.id
  videoInfo.value.userId = item.userId
  videoInfo.value.orgId = item.orgId
  videoInfo.value.videoImgUrl = item.videoCoverUrl
  videoInfo.value.videoPlayUrl = item.videoUrl
  videoInfo.value.videoTitle = item.videoTitle
  // 下面是新增的
  videoInfo.value.avatar = item.avatar
  videoInfo.value.userName = item.name || ''
  videoInfo.value.orgName = item.taskOrgName || ''
  videoInfo.value.playCount = item.playCount || ''
  videoInfo.value.diggCount = item.diggCount || ''
}

const showPlayVideo = ref(false)
function playVideo(item) {
  showPlayVideo.value = true
}

// const uploadLoading = ref(false)
const handleHeadSuccess = res => {
  videoInfo.value.videoImgUrl = res.data
}
const handleHeadError = err => {
  console.error('handleHeadError', err)
}
const beforeHeadUploadFile = file => {
  console.log('file')
  const typeList = ['image/jpeg', 'image/jpg', 'image/png']
  if (typeList.indexOf(file.type) === -1) {
    ElMessage.warning('仅支持png、jpg、jpeg格式的图片')
    return false
  }
  console.log('上传文件的格式', file.type)
  if (file.size > 1024 * 500) {
    ElMessage.warning('上传图片大小不能超过750k')
    return false
  }
}
</script>

<style lang="scss" scoped>
.video-wrapper {
  width: 573px;
  //height: 140px;
  padding: 16px;
  box-sizing: border-box;
  background: #f6f7f8;
  border-radius: 4px;
  position: relative;
  margin-top: 16px;
  display: flex;

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

  .video-info {
    margin-right: 16px;
    text-align: center;
    position: relative;

    .video-cover {
      width: 102px;
      height: 136px;
      background: #ffffff;
      border: 1px dashed #dcdee0;
      object-fit: cover;
      cursor: pointer;
      .icon-plus {
        margin-top: 41px;
        font-size: 20px;
      }

      .add-video {
        cursor: default;
        margin-top: 14px;
        font-size: 14px;
        color: #333333;
      }
    }

    .play-icon {
      cursor: pointer;
      position: absolute;
      z-index: 10;
      top: 0;
      left: 0;
      width: 102px;
      height: 136px;
      background-repeat: no-repeat;
      background-size: 36px;
      background-position: center;
      background-image: url('https://tagvv-1256030678.file.myqcloud.com/20221019xwjl7.png');
    }
    .del-icon {
      opacity: 0;
      cursor: pointer;
      position: absolute;
      z-index: 10;
      top: 8px;
      right: 8px;
      width: 20px;
      height: 20px;
      background-repeat: no-repeat;
      background-size: 20px;
      background-position: center;
      background-image: url('https://tagvv-1256030678.file.myqcloud.com/20221119hj21g.png');
    }
    .video-text {
      cursor: pointer;
      margin-top: 10px;
      text-align: center;
      font-size: 14px;
      color: $theme_color;
      line-height: 20px;
    }
  }
  .video_cover_box:hover {
    .del-icon {
      opacity: 1;
    }
  }
  .info-wrapper {
    flex: 1;

    .video-title {
      max-width: 200px;
      @include mult_line(1);
    }
  }
}
</style>
