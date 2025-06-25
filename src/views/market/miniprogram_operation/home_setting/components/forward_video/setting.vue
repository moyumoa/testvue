<template>
  <div class="leaderboard">
    <title-wrapper
      title=""
      :hasSolt="false"
      :subtitle="'员工可从视频池中选择一个直接发布'"
    ></title-wrapper>
    <div class="container">
      <el-button class="chose_btn" type="primary" :disabled="false" @click="showChoseVideoDialog">
        视频池设置
      </el-button>
      <template v-if="videoListInfo.forwardConditions">
        <div class="rule">
          <p class="title">当前视频池规则</p>
          <div class="rule_content" v-if="!allRule">
            <p v-if="videoListInfo.forwardConditions.publishTimeStart">
              创建时间:&nbsp;&nbsp;&nbsp;{{ videoListInfo?.forwardConditions.publishTimeStart }}~{{
                videoListInfo?.forwardConditions.publishTimeEnd
              }}
            </p>
            <p v-if="videoListInfo.forwardConditions.useCountMin">
              使用次数:&nbsp;&nbsp;{{ videoListInfo?.forwardConditions.useCountMin }}次~{{
                videoListInfo?.forwardConditions.useCountMax
              }}次
            </p>
            <p v-if="videoListInfo.forwardConditions.videoDurationMin">
              视频时长:&nbsp;&nbsp;{{ videoListInfo?.forwardConditions.videoDurationMin }}秒~{{
                videoListInfo?.forwardConditions.videoDurationMax
              }}秒
            </p>
            <p v-if="videoListInfo.forwardConditions.tagNames.length !== 0">
              标签:&nbsp;&nbsp;&nbsp;{{ videoListInfo?.forwardConditions.tagNames.join('/') }}
            </p>
            <p v-if="isNotEmpty(videoListInfo.forwardConditions.fileInfo)">
              文件夹:&nbsp;&nbsp;&nbsp;{{ videoListInfo?.forwardConditions.fileInfo.name || '' }}
            </p>
            <p v-if="videoListInfo.forwardConditions.sourceNames.length !== 0">
              视频来源:&nbsp;&nbsp;{{ videoListInfo?.forwardConditions.sourceNames.join('/') }}
            </p>
          </div>
          <div v-else class="content">
            <p>全部内容库视频</p>
          </div>
          <p style="display: flex; align-items: center">
            从素材库中共筛选了约&nbsp;&nbsp;
            <span style="color: rgba(54, 79, 205, 1)">
              {{ videoListInfo?.forwardConditions.total || 0 }}
            </span>
            &nbsp; 条视频
          </p>
        </div>
      </template>
    </div>
    <videoList
      ref="videoListRef"
      title="视频池设置"
      :subTitle="null"
      materialType="video"
      v-model:showDialog="videoListInfo.showVideoListDialog"
      @filterConditions="filterConditions"
    />
  </div>
</template>

<script setup>
import TitleWrapper from '../../../components/title_wrapper.vue'
import videoList from '@/views/market/marketing_task/create_task/components/video_setting/video_list.vue'

import { throttle, isNotEmpty, isEmpty } from '@/utils/tools.js'

const props = defineProps({
  data: {
    type: Object,
    default() {
      return {}
    }
  },
  followUpNum: {
    type: String || Number,
    default: null
  }
})

const emits = defineEmits(['updateSetting', 'updatePreviewInfo'])
const settingInit = ref(true)
const allRule = ref(false)
const videoListRef = ref(null)
const radioForm = ref({
  video_rank: 'task_play_increment_cnt',
  live_rank: '',
  gold_rank: 'gold_cnt',
  team_data: '1',
  inspire: '1',
  account_diagnosis: '',
  copy_extractio: '1',
  foolish_pipeline_open: '1',

  forward_video_config: null, // 从素材库发视频时，转发条件的配置，如用户未设置，要传默认条件
  post_video: '2' // 1模板转发，2视频池转发
})
// 从素材库选择视频信息
const videoListInfo = reactive({
  showVideoListDialog: false,
  forwardConditions: null
})
// 素材库选择的信息
function filterConditions(option, list) {
  // 初次
  if (!radioForm?.value?.forward_video_config) {
    settingInit.value = false
  }
  videoListInfo.forwardConditions = JSON.parse(JSON.stringify(option))
  rule()
  radioForm.value.forward_video_config = {
    ...videoListInfo.forwardConditions,
    pageNo: 1,
    pageSize: 20
  }
  console.log('settingInit.value', settingInit.value)
  console.log('radioForm', radioForm.value)

  if (!settingInit.value) {
    // if (list.length > 6) {
    // // radioForm.value.list = list
    // data.list = list
    // }
    emits('updatePreviewInfo', 'followVideoList', list)
  } else {
    // data.list = radioForm.value.list
    settingInit.value = false
  }
  getData(list)
}
// 打开视频池设置
const showChoseVideoDialog = throttle(function () {
  videoListInfo.showVideoListDialog = true
})
function rule() {
  if (
    videoListInfo.forwardConditions.publishTimeStart?.length !== 0 ||
    videoListInfo.forwardConditions?.videoDurationMin ||
    videoListInfo.forwardConditions?.useCountMin ||
    videoListInfo.forwardConditions.tagIds?.length !== 0 ||
    videoListInfo.forwardConditions.sourceNames?.length !== 0 ||
    isEmpty(videoListInfo.forwardConditions.fileInfo)
  ) {
    allRule.value = false
  } else {
    allRule.value = true
  }
}
function updatePostVideo(info) {
  if (isNotEmpty(info?.forward_video_config)) {
    nextTick(() => {
      const showConfig = JSON.parse(JSON.stringify(info.forward_video_config))
      if (showConfig.subSource === 12) {
        showConfig.sources.push(1)
      }
      settingInit.value = true
      videoListRef.value?.setDefaultParam(showConfig, true) // 回显
    })
  }
}
// 初始化
function init() {
  const info = JSON.parse(JSON.stringify(props.data.rankInfo.info))
  if (
    props.data.rankInfo &&
    props.data.rankInfo.info &&
    JSON.stringify(props.data.rankInfo.info) !== '{}'
  ) {
    if (isNotEmpty(info.post_video) && info.post_video === '2') {
      updatePostVideo(info)
    }
    radioForm.value.account_diagnosis = info.account_diagnosis
    radioForm.value.copy_extractio = info.copy_extractio
    radioForm.value.foolish_pipeline_open = info.foolish_pipeline_open
    radioForm.value.gold_rank = info.gold_rank
    radioForm.value.inspire = info.inspire
    radioForm.value.live_rank = info.live_rank
    radioForm.value.team_data = info.team_data
    radioForm.value.video_rank = info.video_rank
    radioForm.value.post_video = info.post_video
    // forward_video_config参数在updatePostVideo成功回调内回显
  } else {
    radioForm.value = {
      video_rank: 'task_play_increment_cnt',
      live_rank: '',
      gold_rank: 'gold_cnt',
      team_data: '1',
      inspire: '1',
      account_diagnosis: '',
      copy_extractio: '1',
      foolish_pipeline_open: '1',
      forward_video_config: null,
      post_video: '2' // 以上全是兼容版本，这里实际只需要post_video=2即可
    }
  }
}
init()
// 保存数据
function getData(list) {
  const data = {
    ...radioForm.value,
    post_video: radioForm.value.post_video,
    forward_video_config: radioForm?.value?.forward_video_config
      ? radioForm.value.forward_video_config
      : null
  }
  emits('updateSetting', 'mission:rank', data, 'info')
}
</script>

<style lang="scss" scoped>
@import '../../../components/css/setting_page.scss';
.leaderboard {
  .container {
    color: #323233;
    :deep(.el-form-item) {
      margin-bottom: 8px !important;
    }
    :deep(.el-form-item__label) {
      color: #333333;
    }

    :deep(.el-radio) {
      color: #333;
    }
  }
  .post_video_warp {
    box-sizing: border-box;
    position: absolute;
    display: block;
    top: 40px;
    left: 78px;
    cursor: default;
    .chose_btn {
      margin-top: 16px;
    }
  }
  .rule {
    margin-top: 20px;
    margin-bottom: 64px;
    background: #f6f7f8;
    border-radius: 4px;
    padding: 16px 16px 24px 16px;
    color: #303133;

    .title {
      height: 20px;
      font-size: 15px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 600;
      color: rgba(48, 49, 51, 1);
      line-height: 20px;
      margin-bottom: 16px;
    }
    .rule_content {
      p {
        padding-left: 12px;
        padding-right: 12px;
        background: #e2e5f4;
        border-radius: 4px;
        margin-bottom: 12px;
        line-height: 32px;
        word-break: break-all;
      }
    }
  }
}
</style>
