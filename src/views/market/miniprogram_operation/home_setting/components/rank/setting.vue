<template>
  <div class="leaderboard">
    <title-wrapper title="" :subtitle="subtitleObj[rankInfo.switch]">
      <template #right>
        <el-switch
          @change="validConfigFun"
          v-model="rankInfo.switch"
          active-value="1"
          inactive-value="0"
        />
      </template>
    </title-wrapper>
    <!-- v-if="rankInfo.switch === '1'" -->
    <div class="container">
      <div class="container_content">
        <div class="content1">
          发视频：
          <el-radio-group v-model="radioForm.post_video" @change="postVideoChange">
            <el-radio label="1">按创意模板发视频</el-radio>
            <el-radio label="2">从素材库中选视频</el-radio>
          </el-radio-group>
        </div>
        <div class="post_video_warp">
          <template v-if="radioForm.post_video == 1">
            <el-tooltip placement="bottom">
              <template #content>
                <div class="tops_and_jump">
                  在智能短视频-企业模板中可设置模板开放状态，当前可用模板数量：
                  <span class="template_num">{{ followUpNum || 0 }}</span>
                  <div class="jump_btn template_num" @click="toFun">
                    去设置
                    <img
                      src="https://tagvv-1256030678.file.myqcloud.com/20240122f961s.png"
                      alt=""
                      class="jump_icon"
                    />
                  </div>
                </div>
              </template>
              <div class="tip_tip">
                员工通过开放模板
                <img
                  src="@/assets/images/operate/tip_line.png"
                  style="margin-right: 4px; width: 14px; height: 14px"
                />
                拍同款或选择通过模板式生成、流水线生产的0次使用素材视频直接发布
              </div>
            </el-tooltip>
          </template>
          <template v-if="radioForm.post_video == 2">
            <p class="chose_tip">员工可从视频池中选择一个直接发布</p>
            <el-button
              class="chose_btn"
              type="primary"
              :disabled="false"
              @click="showChoseVideoDialog"
            >
              视频池设置
            </el-button>
            <template v-if="videoListInfo.forwardConditions">
              <div class="rule">
                <p class="title">当前视频池规则</p>
                <div class="rule_content" v-if="!allRule">
                  <p v-if="videoListInfo.forwardConditions.publishTimeStart">
                    创建时间:&nbsp;&nbsp;&nbsp;{{
                      videoListInfo?.forwardConditions.publishTimeStart
                    }}~{{ videoListInfo?.forwardConditions.publishTimeEnd }}
                  </p>
                  <p v-if="videoListInfo.forwardConditions.useCountMin">
                    使用次数:&nbsp;&nbsp;{{ videoListInfo?.forwardConditions.useCountMin }}次~{{
                      videoListInfo?.forwardConditions.useCountMax
                    }}次
                  </p>
                  <p v-if="videoListInfo.forwardConditions.videoDurationMin">
                    视频时长:&nbsp;&nbsp;{{
                      videoListInfo?.forwardConditions.videoDurationMin
                    }}秒~{{ videoListInfo?.forwardConditions.videoDurationMax }}秒
                  </p>
                  <p v-if="videoListInfo.forwardConditions.tagNames.length !== 0">
                    标签:&nbsp;&nbsp;&nbsp;{{ videoListInfo?.forwardConditions.tagNames.join('/') }}
                  </p>
                  <p v-if="isNotEmpty(videoListInfo.forwardConditions.fileInfo)">
                    文件夹:&nbsp;&nbsp;&nbsp;{{
                      videoListInfo?.forwardConditions.fileInfo.name || ''
                    }}
                  </p>
                  <p v-if="videoListInfo.forwardConditions.sourceNames.length !== 0">
                    视频来源:&nbsp;&nbsp;{{
                      videoListInfo?.forwardConditions.sourceNames.join('/')
                    }}
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
          </template>
        </div>
      </div>
      <el-checkbox-group v-model="checkList" class="group_box" @change="checkChange" v-if="false">
        <el-checkbox :label="5" disabled>
          看数据：
          <el-radio-group v-model="radioForm.team_data">
            <el-radio label="1">
              <el-tooltip placement="right">
                <template #content>
                  <p>有“移动管理端”权限的用户看到团队数据，普通用户看到自己的数据</p>
                </template>
                <div class="tip_tip">
                  数据看板
                  <img src="@/assets/images/operate/tip_line.png" />
                </div>
              </el-tooltip>
            </el-radio>
          </el-radio-group>
        </el-checkbox>
        <el-checkbox :label="6">
          账号诊断：
          <el-radio-group v-model="radioForm.account_diagnosis">
            <el-radio label="1">矩阵号诊断</el-radio>
          </el-radio-group>
        </el-checkbox>
        <el-checkbox :label="2" class="wrap_checkbox" disabled>
          视频榜：
          <el-radio-group v-model="radioForm.video_rank">
            <el-radio label="play_increment_cnt">昨日发布的视频播放数排行</el-radio>
            <el-radio label="play_cnt">所有视频昨日播放数增量排行</el-radio>
            <div style="display: block">
              <el-radio label="task_play_cnt">昨日发布的任务视频播放数排行</el-radio>
              <el-radio label="task_play_increment_cnt">任务视频昨日播放数增量排行</el-radio>
            </div>
          </el-radio-group>
        </el-checkbox>
        <el-checkbox :label="3">
          直播榜：
          <el-radio-group v-model="radioForm.live_rank">
            <el-radio label="watch_cnt">昨日开播的直播场观排行</el-radio>
            <el-radio label="task_watch_cnt">任务直播昨日场观排行</el-radio>
          </el-radio-group>
        </el-checkbox>
        <el-checkbox :label="4">
          金币榜：
          <el-radio-group v-model="radioForm.gold_rank">
            <el-radio label="gold_cnt">昨日获得金币数</el-radio>
            <!-- gold_balance 假的 入参不需要，入参需要的是 goldRankFieldValue -->
            <el-radio label="gold_balance">金币余额</el-radio>
          </el-radio-group>
          <div class="gold_type_warp" v-if="radioForm.gold_rank == 'gold_balance'">
            <el-select placeholder="请选择" v-model="goldRankFieldValue" @change="getData()">
              <el-option
                v-for="item in goldRankSelectList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              ></el-option>
            </el-select>
            <p class="gold_type_tips">金币类型失效时，设置将自动变更为总余额</p>
          </div>
        </el-checkbox>
        <el-checkbox :label="1" disabled>
          找灵感：
          <el-radio-group v-model="radioForm.inspire">
            <el-radio label="1">灵感视频库</el-radio>
          </el-radio-group>
        </el-checkbox>

        <el-checkbox :label="7" disabled>
          文案提取：
          <el-radio-group v-model="radioForm.copy_extractio">
            <el-radio label="1">视频文案提取工具</el-radio>
          </el-radio-group>
        </el-checkbox>
        <el-checkbox :label="10">
          文案创作：
          <el-radio-group v-model="radioForm.text_create">
            <el-radio label="1">AI创意写文案</el-radio>
          </el-radio-group>
        </el-checkbox>
        <el-checkbox :label="11">
          爆款标题：
          <el-radio-group v-model="radioForm.text_title">
            <el-radio label="1">AI创意写标题</el-radio>
          </el-radio-group>
        </el-checkbox>
        <el-checkbox :label="12">
          智能仿写：
          <el-radio-group v-model="radioForm.text_writing">
            <el-radio label="1">AI智能仿写</el-radio>
          </el-radio-group>
        </el-checkbox>

        <el-checkbox :label="9" disabled>一键成片</el-checkbox>

        <el-checkbox :label="8" disabled>
          发视频：
          <el-radio-group
            v-model="radioForm.post_video"
            style="position: relative"
            @change="postVideoChange"
          >
            <el-radio label="1">按创意模板发视频</el-radio>
            <el-radio label="2">从素材库中选视频</el-radio>
          </el-radio-group>
          <div class="post_video_warp">
            <template v-if="radioForm.post_video == 1">
              <el-tooltip placement="bottom">
                <template #content>
                  <div class="tops_and_jump">
                    在智能短视频-企业模板中可设置模板开放状态，当前可用模板数量：
                    <span class="template_num">{{ followUpNum || 0 }}</span>
                    <div class="jump_btn template_num" @click="toFun">
                      去设置
                      <img
                        src="https://tagvv-1256030678.file.myqcloud.com/20240122f961s.png"
                        alt=""
                        class="jump_icon"
                      />
                    </div>
                  </div>
                </template>
                <div class="tip_tip">
                  员工通过开放模板
                  <img
                    src="@/assets/images/operate/tip_line.png"
                    style="margin-right: 4px; width: 14px; height: 14px"
                  />
                  拍同款或选择通过模板式生成、流水线生产的0次使用素材视频直接发布
                </div>
              </el-tooltip>
            </template>
            <template v-if="radioForm.post_video == 2">
              <p class="chose_tip">员工可从视频池中选择一个直接发布</p>
              <el-button
                class="chose_btn"
                type="primary"
                :disabled="false"
                @click="showChoseVideoDialog"
              >
                视频池设置
              </el-button>
              <template v-if="videoListInfo.forwardConditions">
                <div class="rule">
                  <p class="title">当前视频池规则</p>
                  <div class="rule_content" v-if="!allRule">
                    <p v-if="videoListInfo.forwardConditions.publishTimeStart">
                      创建时间:&nbsp;&nbsp;&nbsp;{{
                        videoListInfo?.forwardConditions.publishTimeStart
                      }}~{{ videoListInfo?.forwardConditions.publishTimeEnd }}
                    </p>
                    <p v-if="videoListInfo.forwardConditions.useCountMin">
                      使用次数:&nbsp;&nbsp;{{ videoListInfo?.forwardConditions.useCountMin }}次~{{
                        videoListInfo?.forwardConditions.useCountMax
                      }}次
                    </p>
                    <p v-if="videoListInfo.forwardConditions.videoDurationMin">
                      视频时长:&nbsp;&nbsp;{{
                        videoListInfo?.forwardConditions.videoDurationMin
                      }}秒~{{ videoListInfo?.forwardConditions.videoDurationMax }}秒
                    </p>
                    <p v-if="videoListInfo.forwardConditions.tagNames.length !== 0">
                      标签:&nbsp;&nbsp;&nbsp;{{
                        videoListInfo?.forwardConditions.tagNames.join('/')
                      }}
                    </p>
                    <p v-if="isNotEmpty(videoListInfo.forwardConditions.fileInfo)">
                      文件夹:&nbsp;&nbsp;&nbsp;{{
                        videoListInfo?.forwardConditions.fileInfo.name || ''
                      }}
                    </p>
                    <p v-if="videoListInfo.forwardConditions.sourceNames.length !== 0">
                      视频来源:&nbsp;&nbsp;{{
                        videoListInfo?.forwardConditions.sourceNames.join('/')
                      }}
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
            </template>
          </div>
          <!-- <div class="post_video_warp" @click.stop>
            <p class="tips">员工可使用模板制作视频或选择模板生产的素材视频发布</p>
            <div class="tops_and_jump">
              模板和素材视频来源：在智能短视频-企业模板中设置为开放状态的模板以及该模板生产的素材视频，当前可用模板数量：
              <span class="template_num">{{ followUpNum || 0 }}</span>
              <div class="jump_btn template_num" @click="toFun">
                前往查看
                <img
                  src="https://tagvv-1256030678.file.myqcloud.com/20230808peh4e.png"
                  alt=""
                  class="jump_icon"
                />
              </div>
            </div>
          </div> -->
        </el-checkbox>
      </el-checkbox-group>
    </div>
    <!-- v-if="videoListInfo.showVideoListDialog" -->
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
import { isNotEmpty, isEmpty, throttle } from '@/utils/tools.js'

import TitleWrapper from '../../../components/title_wrapper.vue'
import videoList from '@/views/market/marketing_task/create_task/components/video_setting/video_list.vue'
const props = defineProps({
  data: {
    type: Object,
    default() {
      return {
        rankInfo: {
          switch: '0'
        }
      }
    }
  },
  followUpNum: {
    type: String || Number,
    default: null
  }
})
const { rankInfo } = toRefs(props.data)
const emits = defineEmits(['updateSetting', 'validConfig'])

const subtitleObj = {
  1: '企业开放模板，全员自由创作发视频',
  0: '开关关闭，全员营销小程序首页将隐藏"发视频"'
}
const checkList = ref([])
const goldRankSelectList = ref([])
const goldRankFieldValue = ref('gold_type_')
const radioForm = ref({
  post_video: '1', // 发视频
  forward_video_config: '' // 从素材库发视频时，转发条件的配置，如用户未设置，要传默认条件
})
const videoListRef = ref(null)
const allRule = ref(false)

// 从素材库选择视频信息
const videoListInfo = reactive({
  showVideoListDialog: false,
  forwardConditions: null
})
// 素材库选择的信息
function filterConditions(option) {
  // console.log('option', option)
  videoListInfo.forwardConditions = JSON.parse(JSON.stringify(option))
  rule()
  radioForm.value.forward_video_config = {
    ...videoListInfo.forwardConditions,
    pageNo: 1,
    pageSize: 20
  }
  getData()
}
// 打开视频池设置
const showChoseVideoDialog = throttle(function () {
  videoListInfo.showVideoListDialog = true
})
// 选择按创意模板转发清空素材库信息
function postVideoChange() {
  // if (radioForm.value.post_video === '1') {
  //   videoListInfo.forwardConditions = null
  // }
}
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
// 发视频-获取从素材库选视频信息，有则回显，无则默认
function updatePostVideo(info) {
  if (info.post_video === '2' && isNotEmpty(info?.forward_video_config)) {
    nextTick(() => {
      const showConfig = JSON.parse(JSON.stringify(info.forward_video_config))
      if (showConfig.subSource === 12) {
        showConfig.sources.push(1)
      }
      videoListRef?.value?.setDefaultParam(showConfig, true) // 回显
    })
  } else {
    nextTick(() => {
      videoListRef?.value.getInitParam()
    })
  }
}

function init() {
  goldRankSelectList.value = props.data?.rankInfo?.goldRankSelectList
    ? props.data.rankInfo.goldRankSelectList
    : [
        {
          name: '总余额',
          value: 'gold_type_'
        }
      ]
  if (
    props.data.rankInfo &&
    props.data.rankInfo.info &&
    JSON.stringify(props.data.rankInfo.info) !== '{}'
  ) {
    console.log(props.data.rankInfo.info, '看看返回的配置信息')
    const info = JSON.parse(JSON.stringify(props.data.rankInfo.info))
    if (isNotEmpty(info.post_video)) {
      checkList.value.push(8)
      radioForm.value.post_video = info.post_video
      radioForm.value.forward_video_config = info.forward_video_config || null
      updatePostVideo(info)
    } else {
      checkList.value.push(8)
      radioForm.value.post_video = '1'
      // radioForm.forward_video_config = null
    }
  } else {
    checkList.value = [8]
    radioForm.value = {
      post_video: '1',
      forward_video_config: null
    }
  }
  console.log('获取到的排行榜信息', radioForm.value, props.data.rankInfo)
}
init()

watch(
  () => radioForm.value,
  () => {
    getData()
  },
  { deep: true, immediate: true }
)
watch(
  () => checkList.value,
  () => {
    getData()
  },
  { deep: true, immediate: true }
)
// 保存数据
function getData() {
  const data = {
    post_video: radioForm.value.post_video, // 发视频
    forward_video_config: radioForm.value.forward_video_config // 视频池选择的配置
  }
  if (data.post_video === '1') {
    data.forward_video_config = null
  }
  emits('updateSetting', 'mission:rank', data, 'info')
}

function checkChange(e) {
  checkList.value.forEach(x => {
    switch (x) {
      case 8:
        if (isEmpty(radioForm.value.post_video)) {
          radioForm.value.post_video = '1'
        }
        break
    }
  })

  console.log(e)
}
const toFun = throttle(() => {
  window.open(`${location.origin}/sumwhy_video/template_space`, '_blank')
}, 500)

function validConfigFun() {
  emits('validConfig', 'mission:rank')
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
}

.tip_tip {
  width: max-content;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  img {
    width: 16px;
    height: 16px;
    object-fit: contain;
    display: flex;
    margin-left: 4px;
  }
}

// .post_video_warp {
//   position: relative;
//   cursor: default;
//   .tips {
//     margin-left: 32px;
//     line-height: 32px;
//     color: #909399;
//   }
.tops_and_jump {
  display: flex;
  align-items: center;
  // position: absolute;
  // top: 32px;
  // left: -92px;
  // color: #333;
  line-height: 20px;
  .template_num {
    color: #8695e1;
  }
  .jump_btn {
    display: flex;
    align-items: center;
    font-size: 12px;
    line-height: 18px;
    margin-left: 16px;
    cursor: pointer;
    .jump_icon {
      width: 14px;
      height: 14px;
      margin-left: 2px;
    }
  }
}
// }
.post_video_warp {
  margin-top: 6px;
  color: var(--el-disabled-text-color);
  box-sizing: border-box;
  display: block;
  padding-left: 67px;
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
.container_content {
  .content1 {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
}
</style>
