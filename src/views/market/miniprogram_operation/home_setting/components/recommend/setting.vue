<template>
  <div class="recommend">
    <title-wrapper title="" :subtitle="subtitleObj[recommendInfo.switch]">
      <template #right>
        <el-switch v-model="recommendInfo.switch" active-value="1" inactive-value="0" />
      </template>
    </title-wrapper>
    <!-- v-if="switchValue" -->
    <div class="container" v-loading="uploadLoading">
      <navSetting
        :title="recommendInfo.title"
        :defaultTitle="recommendInfo.defaultTitle"
        @updateTitle="updateTitle"
      />
      <div class="container_title">内容设置</div>
      <div class="button-line">
        <el-button class="one_button" type="primary" @click="showDialog = true">
          选择任务发布视频
        </el-button>
        <el-button class="one_button" type="primary" @click="showTemplateDialog = true">
          选择创意模板视频
        </el-button>
        <div style="margin-right: 24px; display: inline-block">
          <el-upload
            :disabled="uploadLoading"
            :show-file-list="false"
            action=""
            accept="video/mp4, video/quicktime"
            :headers="headers"
            :http-request="handleRequest"
            list-type="picture"
            :before-upload="beforeHeadUploadFile"
          >
            <el-button style="margin-bottom: 5px" :loading="uploadLoading" type="primary">
              本地上传视频
            </el-button>
          </el-upload>
        </div>
        <div class="button-line-tips">
          支持自定义推荐视频，拖拽可排序；若有自定义视频，系统自动推荐机制将失效
        </div>
      </div>
      <draggable
        v-model="list"
        group="recommend_setting"
        @start="drag = true"
        @end="drag = false"
        item-key="id"
        handle=".icon-tuodongweizhi"
        :animation="300"
      >
        <template #item="{ element, index }">
          <div class="video-info">
            <sort-icon :list="list" :index="index" :hasTop="true" :hasMove="true"></sort-icon>
            <div class="video_left">
              <img
                v-if="element.source === 3"
                class="one_tag"
                src="https://tagvv-1256030678.file.myqcloud.com/20221128huxdb.png"
                alt=""
              />
              <img
                v-else-if="element.source === 2"
                src="https://tagvv-1256030678.file.myqcloud.com/20221128ama8e.png"
                alt=""
                class="one_tag"
              />
              <img
                v-else-if="element.source === 1"
                src="https://tagvv-1256030678.file.myqcloud.com/20221128nzgyn.png"
                alt=""
                class="one_tag"
              />

              <div class="video-wrapper" @click="playVideo(element)">
                <div class="video-cover" v-if="!element.url">
                  <el-icon class="icon-plus">
                    <i-plus />
                  </el-icon>
                  <div class="add-video">添加视频</div>
                </div>
                <div v-if="element.url">
                  <img class="video-cover" :src="element.coverUrl" alt="视频封面" />
                  <div class="play-icon"></div>
                </div>
              </div>
              <div class="video_text" @click="changeCover(element, index)">修改封面</div>
            </div>
            <div class="info-wrapper">
              <el-form>
                <el-form-item label="视频标题：">
                  <div class="line-title">
                    {{ element.title || '--' }}
                  </div>
                </el-form-item>
                <!-- 任务视频 显示数据-->
                <el-form-item label="显示数据：" v-if="element.source === 2">
                  <el-radio-group v-model="element.displayOptions">
                    <el-radio label="none">不显示</el-radio>
                    <el-radio label="play_cnt">播放数</el-radio>
                    <el-radio label="digg_cnt">点赞数</el-radio>
                  </el-radio-group>
                </el-form-item>
                <!-- 创意模板 关联任务-->
                <el-form-item label="关联任务：" style="margin: 6px 0">
                  <div class="right_task">
                    <div
                      class="name_box line-hidden1"
                      :style="element.taskId ? 'color: #606266' : 'color: #bfc4cd'"
                    >
                      {{ element.taskId ? element.taskName || '' : '请选择需要关联的任务' }}
                    </div>
                    <div class="task_btn">
                      <div
                        :class="{ default_btn: true }"
                        style="padding-right: 12px"
                        @click="openTaskDialog(element)"
                      >
                        {{ element.taskId ? '更换' : '选择' }}
                      </div>
                      <div
                        :class="{ default_btn: true, disabled_btn: !element.taskId }"
                        @click="delTask(element, index)"
                      >
                        删除
                      </div>
                    </div>
                  </div>
                </el-form-item>
                <el-form-item label="推荐标签：" class="tag_check_box">
                  <el-checkbox-group :min="0" :max="3" v-model="element.extra1" class="group_box">
                    <el-checkbox :label="val" v-for="(key, val, index) in tagList" :key="index">
                      {{ key }}
                    </el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
                <el-form-item label="推荐原因：">
                  <el-input
                    style="margin-right: 16px; margin-top: 6px"
                    :rows="3"
                    v-model="element.recommendReason"
                    maxlength="100"
                    type="textarea"
                    show-word-limit
                    placeholder="请输入推荐原因"
                  ></el-input>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </template>
      </draggable>
    </div>
    <!-- 选择任务发布视频    -->
    <task-video-dialog
      v-if="showDialog"
      v-model:show="showDialog"
      :selection="true"
      @confirm="selectTaskVideo"
    ></task-video-dialog>
    <!--    选择创意模板视频-->
    <sumvideo-template-dialog
      v-if="showTemplateDialog"
      ref="sumvideoTemplateDialogEle"
      @chooseTemplate="chooseTemplate"
      type="3"
      :templateType="'video'"
      v-model:showDialog="showTemplateDialog"
    ></sumvideo-template-dialog>
    <!--  关联任务  -->
    <task-dialog
      v-model:show="showTaskDialog"
      :query-info="taskQueryInfo"
      @confirm="onTaskConfirm"
      :has-search="false"
      v-if="showTaskDialog"
    ></task-dialog>
    <video-play v-model:show="showPlayVideo" :info="{ videoUrl: currentItem.url }"></video-play>
    <!-- 选择封面的弹窗 -->
    <chooseCoverDialog
      v-if="coverDialog.show"
      :coverDialog="coverDialog"
      @updateCover="updateCover"
    />
  </div>
</template>

<script setup>
import navSetting from '../../../components/nav_setting.vue'

import { throttle } from '@/utils/tools.js'
import chooseCoverDialog from '@/views/market/miniprogram_operation/components/choose_cover_dialog.vue'
import TitleWrapper from '../../../components/title_wrapper.vue'
import TaskVideoDialog from '../../../components/task_video_dialog.vue'
import SumvideoTemplateDialog from '@/views/market/marketing_task/create_task/components/video_setting/sumvideo_template_dialog.vue'
import TaskDialog from '../../../components/task_dialog.vue'
import SortIcon from '../../../components/sort_icon.vue'
import { recommendVideoUpload } from '@/api/market/miniprogram_operation.js'
import { ElMessage } from 'element-plus'
import draggable from 'vuedraggable'
import VideoPlay from '@/views/market/miniprogram_operation/components/videoPlay.vue'
import OSS from 'ali-oss'
import { getSts } from '@/api/content_center/material_library.js'
import { tagList } from './tag.js'
const props = defineProps({
  data: {
    type: Object,
    default() {
      return {
        recommendInfo: {
          switch: '1'
        }
      }
    }
  }
})
const { recommendInfo } = toRefs(props.data)

const subtitleObj = {
  1: '推荐近期任务视频中表现数据较好的精彩视频，为员工提供创作灵感',
  0: '开关关闭，全员营销小程序首页将隐藏“本期推荐”'
}

const list = ref([])
function init() {
  if (
    props.data.recommendInfo &&
    props.data.recommendInfo.list &&
    props.data.recommendInfo.list.length > 0
  ) {
    list.value = JSON.parse(JSON.stringify(props.data.recommendInfo.list))
  } else {
    list.value = []
  }

  console.log('获取到的本期推荐信息', list.value, props.data.recommendInfo, recommendInfo.value)
}
init()
const drag = ref(false)

// 上传视频
const uploadLoading = ref(false)
const headers = ref({
  'X-Requested-With': 'XMLHttpRequest',
  token: localStorage.getItem('token'),
  brandId: localStorage.getItem('brandInfo')
    ? JSON.parse(localStorage.getItem('brandInfo')).brandId
    : '',
  userId: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo')).userId
    : ''
})
let clickTime = ''
function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
    .replace(/-/g, '')
}

async function putObject(data, file) {
  try {
    const client = new OSS({
      // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
      region: data.region,
      secure: true, //* 这句话很重要！！！！！！！！！
      endpoint: data.endPoint, // 这句话更重要,不设置为报错。STS接入地址，例如sts.cn-hangzhou.aliyuncs.com。
      // 从STS服务获取的临时访问密钥（AccessKey ID和AccessKey Secret）。
      accessKeyId: data.stsData.credentials.accessKeyId,
      accessKeySecret: data.stsData.credentials.accessKeySecret,
      // 从STS服务获取的安全令牌（SecurityToken）。
      stsToken: data.stsData.credentials.securityToken,
      // refreshSTSToken: async () => {
      //   console.log('过期')
      //   // 向您搭建的STS服务获取临时访问凭证。
      //   const info = await fetch('your_sts_server')
      //   return {
      //     accessKeyId: info.accessKeyId,
      //     accessKeySecret: info.accessKeySecret,
      //     stsToken: info.stsToken
      //   }
      // },
      // // 刷新临时访问凭证的时间间隔，单位为毫秒。
      refreshSTSTokenInterval: 300000,
      timeout: 600000,
      // 填写Bucket名称。
      bucket: data.bucketName
    })
    const point = file.name.lastIndexOf('.')
    // const fileName = file.name.substr(0, point)
    const name = 'xm/file/' + guid() + '_' + clickTime + file.name.substr(point)
    return await client.put(name, file)
  } catch (e) {
    console.log(e)
  }
}

async function handleRequest(option) {
  const res = await getSts()
  if (res.code === 0) {
    putObject(res.data, option.file).then(resPut => {
      if (resPut) {
        // 手动调用上传成功
        handleHeadSuccess(resPut, option.file)
        // }
      } else {
        option.onError()
      }
    })
  }
}

const handleHeadSuccess = (res, file) => {
  uploadLoading.value = false
  const title = file.name
  const url = res.url
  const coverUrl = res.url + '?x-oss-process=video/snapshot,t_1000,m_fast'
  recommendVideoUpload({
    coverUrl,
    title,
    url
  }).then(result => {
    if (result.code === 0) {
      list.value.push({
        uniqueId: parseInt(Math.random() * 100000),
        source: 3,
        sourceBizId: result.data.id,
        coverUrl,
        title,
        url,
        recommendReason: ''
      })
    }
  })
}
const beforeHeadUploadFile = file => {
  clickTime = new Date().getTime() + ''
  if (file.size / 1024 / 1024 > 500) {
    ElMessage.warning('上传视频大小不能超过500M')
    return false
  }
  uploadLoading.value = true
  return true
}
const showDialog = ref(false)

// 创意模板弹窗
const showTemplateDialog = ref(false)
const showTaskDialog = ref(false)
const chooseTemplate = item => {
  list.value.push({
    uniqueId: parseInt(Math.random() * 100000),
    source: 1,
    sourceBizId: item.id,
    title: item.name,
    url: item.videoUrl,
    coverUrl: item.coverUrl,
    recommendReason: '',
    taskId: '',
    taskName: ''
  })
}
const currentItem = ref({})
const taskQueryInfo = reactive({
  taskStatuses: [3, 4, 5]
})
const openTaskDialog = item => {
  currentItem.value = item
  showTaskDialog.value = true
  if (item.source === 1) {
    taskQueryInfo.creationId = currentItem.value.sourceBizId
  } else {
    taskQueryInfo.creationId = null
  }
}
const onTaskConfirm = item => {
  currentItem.value.taskId = item.id
  currentItem.value.taskName = item.name
  currentItem.value.goldCnt = item.goldCnt
}
// 删除任务
const delTask = throttle((e, i) => {
  list.value[i].taskId = ''
  list.value[i].taskName = ''
  currentItem.value.goldCnt = null
})
// 任务视频选择
const selectTaskVideo = arr => {
  arr.forEach(item => {
    list.value.push({
      uniqueId: parseInt(Math.random() * 100000),
      source: 2,
      sourceBizId: item.id,
      coverUrl: item.videoCoverUrl,
      userId: item.userId,
      orgId: item.orgId,
      taskId: null,
      displayOptions: 'none',
      url: item.videoUrl,
      title: item.videoTitle,
      recommendReason: '',
      playCount: item.playCount || 0,
      diggCount: item.diggCount || 0,
      taskName: null,
      userPhoto: item.avatar,
      userName: item.name,
      orgName: item.taskOrgName
    })
  })
}

const emits = defineEmits(['updateSetting'])
watch(
  () => list.value,
  value => {
    emits('updateSetting', 'current_version_recommend', value)
  },
  { deep: true }
)
// 视频播放
const showPlayVideo = ref(false)

const playVideo = throttle(item => {
  currentItem.value = item
  showPlayVideo.value = true
}, 700)

// 修改封面
const coverDialog = ref({
  show: false,
  videoUrl: '',
  coverUrl: '',
  ossType: 'ali', // ali 阿里云的视频 tx 腾讯云的视频
  index: null
})
// 点击 修改封面，弹出对应弹窗
const changeCover = throttle((e, i) => {
  if (e.url) {
    coverDialog.value = {
      index: i,
      show: true,
      videoUrl: e.url || '',
      coverUrl: '',
      ossType: e.url.indexOf('aliyuncs.com') > -1 ? 'ali' : 'tx' // ali 阿里云的视频 tx 腾讯云的视频
    }
  } else {
    ElMessage.warning('暂未找到对应的视频相关信息')
  }
}, 700)
// 更新封面
function updateCover(e) {
  list.value[coverDialog.value.index].coverUrl = e
}
// 更新标题栏
function updateTitle(e) {
  recommendInfo.value.title = e
}
</script>

<style lang="scss" scoped>
@import '../../../components/css/setting_page.scss';

.recommend {
  :deep(.el-form-item) {
    margin-bottom: 0px;
  }

  .container {
    .button-line {
      margin-top: 16px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      flex-wrap: wrap;
      .one_button {
        margin: 0px 24px 5px 0 !important;
      }
      .button-line-tips {
        line-height: 32px;
        display: inline-block;
        margin-bottom: 5px;
        font-size: 14px;
        font-weight: 400;
        color: #909399;
      }
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

    .video-info {
      width: 573px;
      //height: 140px;
      padding: 16px 0 16px 16px;
      box-sizing: border-box;
      background: #f6f7f8;
      border-radius: 4px;
      position: relative;
      margin-top: 16px;
      display: flex;
      .video_left {
        position: relative;
        width: 102px;
        margin-right: 6px;
        .video_text {
          cursor: pointer;
          width: 102px;
          text-align: center;
          padding: 10px 0;
          font-size: 14px;
          font-weight: 400;
          color: #364fcd;
          line-height: 20px;
        }
        .one_tag {
          position: absolute;
          left: -16px;
          top: -16px;
          width: 52px;
          height: 52px;
          object-fit: contain;
          z-index: 2;
        }
      }
      .video-wrapper {
        text-align: center;
        position: relative;

        .video-cover {
          width: 102px;
          height: 136px;
          background: #ffffff;
          border-radius: 2px;
          object-fit: cover;
          display: block;
          .icon-plus {
            margin-top: 41px;
            font-size: 20px;
          }

          .add-video {
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

        .video-text {
          margin-top: 10px;
          text-align: center;
          font-size: 14px;
          color: $theme_color;
          line-height: 20px;
        }
      }

      .info-wrapper {
        flex: 1;

        .line-title {
          max-width: 200px;
          margin-right: 10px;
          @include mult_line(1);
        }

        .switch-text {
          color: $theme_color;
        }
      }
    }
  }
}
.right_task {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .name_box {
    width: 265px;
    height: 32px;
    background: #ffffff;
    border-radius: 2px;
    padding: 6px 12px;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
  }
  .task_btn {
    width: calc(100% - 265px);
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
  }
}
:deep(.info-wrapper .el-form-item__label) {
  padding: 0 !important;
}
:deep(.info-wrapper .el-checkbox) {
  margin-right: 24px !important;
  line-height: 20px !important;
  height: 20px !important;
}
:deep(.tag_check_box) {
  line-height: 20px;
  .el-form-item__content {
    padding-top: 6px;
    line-height: 20px;
  }
}
</style>
