<template>
  <div class="content_page">
    <div class="content_box">
      <div class="box_left">
        <div v-loading="uploadLoading">
          <div v-if="info.videoUrl" class="has_box" @click="previewFun">
            <img class="has_cover" :src="info.videoCoverUrl" alt="" />

            <img
              class="has_play"
              src="https://tagvv-1256030678.file.myqcloud.com/20230207n94sx.png"
              alt=""
            />
          </div>
          <!-- 没有视频 从素材库选择+本地上传 -->
          <div class="none_box" v-else>
            <div class="none_top">
              <el-button class="choose_box" type="primary" @click="showChooseFun">
                从素材库选择
              </el-button>
              <uploadVideo
                :maxSize="512000"
                :index="0"
                @success="uploadVideoSuccess"
                :acceptTypeList="['video/mp4', 'video/quicktime']"
              >
                <el-button class="choose_box">本地上传</el-button>
              </uploadVideo>
            </div>
            <div class="upload_text">格式支持mp4、mov，大小不超过500M</div>
          </div>
        </div>
        <div class="left_btn">
          <el-link :disabled="!info.videoUrl" type="primary" @click="changeCover">修改封面</el-link>
          <!-- <div class="btn_line"></div>
          <uploadVideo
            :showLoading="false"
            :disabled="!info.videoUrl"
            :maxSize="512000"
            :index="1"
            v-model:uploadLoading="uploadLoading"
            @success="uploadVideoSuccess"
            :acceptTypeList="['video/mp4', 'video/quicktime']"
          >
            <el-link :disabled="!info.videoUrl" type="primary">重新上传</el-link>
          </uploadVideo> -->
          <div class="btn_line"></div>
          <el-link :disabled="!info.videoUrl" type="primary" @click="delVideo">删除</el-link>
        </div>
      </div>
      <div class="box_right">
        <div class="form_box">
          <div class="one_form">
            <div class="form_title">视频标题</div>
            <div class="form_content">
              <el-input
                style="height: 76px"
                :rows="3"
                type="textarea"
                maxlength="500"
                v-model.trim="info.title"
                show-word-limit
                resize="none"
                placeholder="请输入视频标题"
              ></el-input>
            </div>
          </div>
          <template v-if="props.platform === 1 || props.platform === 3">
            <div class="one_form">
              <div class="form_title">话题</div>
              <div class="form_content publish_video_form_topic">
                <chooseDYTopic
                  v-if="props.platform === 1 && showTopicAndAt"
                  origin="publishVideo"
                  v-model:topicList="info.topicList"
                />
                <chooseXHSTopic
                  v-if="props.platform === 3 && showTopicAndAt"
                  origin="publishVideo"
                  v-model:topicList="info.topicList"
                />
              </div>
            </div>
            <div class="one_form">
              <div class="form_title">@</div>
              <div class="form_content">
                <chooseAtPerson
                  v-if="showTopicAndAt"
                  :type="props.platform === 1 ? 'dy' : props.platform === 3 ? 'xhs' : ''"
                  origin="publishVideo"
                  :placeholder="
                    props.platform === 1
                      ? '请选择@的人，最多可添加3个@的人'
                      : '请选择@的人，以回车键查询，最多可添加3个@的人'
                  "
                  v-model:atPersonList="info.accountList"
                />
              </div>
            </div>
            <div class="one_form">
              <div class="form_title">POI位置</div>
              <div class="form_content">
                <el-select
                  v-if="props.platform === 1"
                  :style="{ width: '100%' }"
                  v-model="info.poiInfo"
                  filterable
                  remote
                  remote-show-suffix
                  clearable
                  :remote-method="_getPOIList"
                  value-key="poi"
                  placeholder="请输入POI名称/值"
                >
                  <el-option
                    v-for="item in POIList"
                    :key="item.poi"
                    :label="item.label"
                    :value="item"
                  ></el-option>
                </el-select>

                <el-select
                  v-if="props.platform === 3"
                  popper-class="poi_select"
                  :style="{ width: '100%' }"
                  v-model="info.poiInfo"
                  filterable
                  remote
                  clearable
                  :remote-method="_getXhsPOIList"
                  placeholder="请输入需要挂载POI位置名称"
                  value-key="poi"
                  :fit-input-width="true"
                  :loading="xhsPoiLoading"
                >
                  <el-option
                    v-for="item in xhsPOIList"
                    :key="item.poi"
                    :label="item.poiName"
                    :value="item"
                  >
                    <div class="one_options">
                      <div class="option_name">{{ item.poiName || '' }}</div>
                      <div class="option_addr">
                        {{ item.poiSubname }}
                      </div>
                    </div>
                  </el-option>
                </el-select>
              </div>
            </div>
          </template>
        </div>
        <div style="width: fit-content">
          <el-tooltip effect="dark" placement="right">
            <template #content>
              <div class="tip_content" style="max-width: 360px">
                若视频画面黑屏，可能是因为该视频格式无法在浏览器中直接预览，不影响正常发布
              </div>
            </template>
            <div class="tip_box">
              视频黑屏怎么办？
              <img
                class="tip_img"
                src="https://tagvv-1256030678.file.myqcloud.com/20230207c9zo0.png"
              />
            </div>
          </el-tooltip>
        </div>
      </div>
    </div>
    <div class="content_bottom">
      <el-button
        type="primary"
        :loading="saveLoading"
        :disabled="!info.videoUrl || saveDis"
        style="width: 240px"
        @click="publishFun"
      >
        发布至{{
          props.platform === 1
            ? '抖音'
            : props.platform === 2
            ? '视频号'
            : props.platform === 3
            ? '小红书'
            : props.platform === 4
            ? '快手'
            : ''
        }}
      </el-button>
    </div>
    <!-- 选择封面的弹窗 -->
    <chooseCoverDialog
      v-if="coverDialog.show"
      :coverDialog="coverDialog"
      @updateCover="updateCover"
    />
    <!-- 视频预览的弹窗 -->
    <previewVideo v-if="videoDialog.show" :videoDialog="videoDialog" />
    <!-- 发布状态的弹窗 -->
    <el-dialog
      destroy-on-close
      title=""
      width="420px"
      :close-on-click-modal="false"
      custom-class="addTaskToLevelDialog publish_video_status_dialog"
      :before-close="handleStatusClose"
      v-model="publishStatusDialog.show"
    >
      <!-- 发布中 -->
      <div class="publish_loading" style="padding-top: 8px" v-if="publishStatusDialog.status === 1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          width="36px"
          height="36px"
          viewBox="0 0 40 40"
          enable-background="new 0 0 40 40"
          xml:space="preserve"
        >
          <path
            opacity="0.1"
            fill="#364fcd"
            d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946
      s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634
      c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"
          ></path>
          <path
            fill="#364fcd"
            d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0
      C22.32,8.481,24.301,9.057,26.013,10.047z"
            transform="rotate(42.1171 20 20)"
          >
            <animateTransform
              attributeType="xml"
              attributeName="transform"
              type="rotate"
              from="0 20 20"
              to="360 20 20"
              dur="1s"
              repeatCount="indefinite"
            ></animateTransform>
          </path>
        </svg>
        <div class="publish_loading_title" style="margin-top: 16px">发布中，请耐心等待...</div>
        <div class="publish_loading_text">请勿关闭弹窗，以保证获取到发布状态！</div>
      </div>
      <!-- 发布成功 -->
      <div class="publish_loading" style="padding-top: 8px" v-if="publishStatusDialog.status === 3">
        <el-icon class="icon_publish" style="color: #31c16c">
          <i-circle-check />
        </el-icon>
        <div class="publish_loading_title">发布成功！</div>
      </div>
      <!-- 发布失败 -->
      <div class="publish_loading" style="padding-top: 8px" v-if="publishStatusDialog.status === 4">
        <el-icon class="icon_publish" style="color: #df4545">
          <i-circle-close />
        </el-icon>
        <div class="publish_loading_title">发布失败！</div>
        <div class="publish_loading_text" v-if="publishStatusDialog.errReason">
          {{ publishStatusDialog.errReason || '' }}
        </div>
      </div>
    </el-dialog>
    <!-- 选择视频 -->
    <chooseVideoDialog
      v-if="showChooseDialog.show"
      :chooseDialog="showChooseDialog"
      @updateChooseFun="updateChooseFun"
    />
  </div>
</template>
<script setup>
import chooseDYTopic from '@/views/market/marketing_task/create_task/components/video_setting/choose_dy_topic.vue'
import chooseXHSTopic from '@/views/market/marketing_task/create_task/components/video_setting/choose_xhs_topic.vue'
import chooseAtPerson from '@/views/market/marketing_task/create_task/components/video_setting/choose_atPerson.vue'
import chooseVideoDialog from './choose_video_dialog.vue'
import api from '@/api/content_center/content_matrix.js'
import { listPoi, xhsLocation } from '@/api/market/store'
import uploadVideo from '@/views/market/miniprogram_operation/components/upload_video.vue'
import previewVideo from '@/components/preview_video/preview_video.vue'
import chooseCoverDialog from '@/views/market/miniprogram_operation/components/choose_cover_dialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import { throttle, isNotEmpty } from '@/utils/tools.js'
const props = defineProps({
  xuserId: {
    type: String,
    default: () => ''
  },
  openId: {
    type: String,
    default: () => ''
  },
  platform: {
    type: Number || String,
    default: 1
  }
})
const uploadLoading = ref(false) // 上传视频的loading
const info = ref({
  videoUrl: '', // 视频地址
  videoCoverUrl: '', // 视频封面
  title: '', // 标题
  topicList: [], // 添加的话题列表
  accountList: [], // 选择@的用户列表
  poiInfo: null // 选中的poi位置信息
})
// 视频预览的弹窗
const videoDialog = ref({
  show: false,
  url: ''
})
const previewFun = throttle(() => {
  videoDialog.value.url = info.value.videoUrl
  videoDialog.value.show = true
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
const changeCover = throttle(() => {
  if (info.value.videoUrl) {
    coverDialog.value = {
      index: 0,
      show: true,
      videoUrl: info.value.videoUrl || '',
      coverUrl: '',
      ossType: info.value.videoUrl.indexOf('aliyuncs.com') > -1 ? 'ali' : 'tx' // ali 阿里云的视频 tx 腾讯云的视频
    }
  } else {
    ElMessage.warning('暂未找到对应的视频相关信息')
  }
}, 700)
// 删除视频
const delVideo = throttle(() => {
  info.value.videoUrl = ''
  info.value.videoCoverUrl = ''
  chooseVideoInfo.value = null
}, 700)
// 更新封面
function updateCover(e) {
  console.log(e)
  info.value.videoCoverUrl = e
}
// 视频上传成功
function uploadVideoSuccess(data) {
  info.value.videoCoverUrl = data.url + '?x-oss-process=video/snapshot,t_1000,m_fast'
  info.value.videoUrl = data.url
}

const POIList = ref([])
const poiLoading = ref(false)
// 获取POI列表
function _getPOIList(name) {
  if (name) {
    poiLoading.value = true
    listPoi({
      nameOrValue: name || ''
    })
      .then(res => {
        POIList.value = res.data.map(e => {
          return {
            label: `${e.poiName}(${e.poi})`,
            poi: e.poi,
            poiName: e.poiName
          }
        })
        poiLoading.value = false
      })
      .catch(() => {
        poiLoading.value = false
      })
  }
}
const publishStatusDialog = reactive({
  show: false,
  status: 1, // 1发布中 3发布成功 4发布失败
  errReason: '' // 发布失败的原因
})
const saveLoading = ref(false)
const saveDis = ref(false)
const showTopicAndAt = ref(true) // 是否需要显示话题和@
// 发布视频
const publishFun = throttle(() => {
  saveDis.value = true
  if (info.value.videoUrl) {
    ElMessageBox.confirm('点击确认发布即代表您作为矩阵号实际运营者授权本系统进行内容发布', {
      confirmButtonText: '确认发布',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'xm_confirm_warning_icon'
    })
      .then(() => {
        const topics = []
        // 选择了话题
        if (isNotEmpty(info.value.topicList)) {
          if (props.platform === 1) {
            info.value.topicList.forEach(x => {
              topics.push({
                name: x
              })
            })
          } else if (props.platform === 3) {
            info.value.topicList.forEach(x => {
              topics.push({
                id: x.id,
                link: x.link,
                name: x.name,
                viewNum: x.viewNum
              })
            })
          }
        }
        let atAccounts = []
        // 选择了@的人
        if (isNotEmpty(info.value.accountList)) {
          const atList = JSON.parse(JSON.stringify(info.value.accountList))

          atList.forEach(x => {
            x.nickname = x.name || x.nickname || ''
            if (props.platform === 3) {
              x.openId = x.userId
            }
          })

          atAccounts = atList
        }
        const params = {
          videoCoverUrl: info.value.videoCoverUrl,
          videoUrl: info.value.videoUrl,
          xuserId: props.xuserId,
          publishVideoDTOS: [
            {
              openId: props.openId,
              platform: props.platform,
              videoTitle: info.value.title || '', // 视频标题
              topics: topics, // 话题
              atAccounts: atAccounts
            }
          ]
        }
        // 是否选择了Poi信息
        if (isNotEmpty(info.value.poiInfo)) {
          params.publishVideoDTOS[0].poi = info.value.poiInfo.poi
          params.publishVideoDTOS[0].poiName = info.value.poiInfo.poiName
          if (props.platform === 3) {
            params.publishVideoDTOS[0].poiSubname = info.value.poiInfo.poiSubname
            params.publishVideoDTOS[0].poiType = info.value.poiInfo.poiType
          }
        }
        // 代表是从素材库选择
        if (isNotEmpty(chooseVideoInfo.value)) {
          params.creationId = chooseVideoInfo.value.id
          // 如果视频封面没有改动，那封面就为空
          if (params.videoCoverUrl === chooseVideoInfo.value.coverUrl) {
            params.videoCoverUrl = ''
          }
          // 素材库选择的视频 url不传
          params.videoUrl = ''
          params.publishSource = 6
        } else {
          params.publishSource = 1
          params.creationId = ''
        }
        console.log(params, '保存的信息')

        api
          .saveVideoPublishInfo(params)
          .then(res => {
            if (res.code === 0) {
              publishStatusDialog.status = 1
              publishStatusDialog.errReason = ''
              publishStatusDialog.show = true
              console.log('保存信息', res)
              setTimer(res.data)
            } else {
              saveDis.value = false
            }
          })
          .catch(() => {
            saveDis.value = false
          })
      })
      .catch(() => {
        saveDis.value = false
      })
  } else {
    saveDis.value = false
  }
}, 1000)
const publishTimer = ref(null)
// 查询发布视频的状态
const setTimer = id => {
  publishTimer.value = setInterval(() => {
    api
      .listSubmitedVideo({
        publishIds: [id],
        pageNo: 1,
        pageSize: 10
      })
      .then(res => {
        if (res.code === 0 && res.data && res.data.records && res.data.records.length > 0) {
          const status = res.data.records[0].status
          if (status === 3 || status === 4) {
            clearTimer()
            publishStatusDialog.errReason = res.data.records[0].errorMsg
          }
          publishStatusDialog.status = status === 3 || status === 4 ? status : 1
        }
      })
  }, 5000)
}
function clearTimer() {
  clearInterval(publishTimer.value)
  publishTimer.value = null

  saveDis.value = false
}

onBeforeUnmount(clearTimer)
// 关闭视频发布状态的弹窗
function handleStatusClose() {
  clearTimer()
  // 发布成功，关闭弹窗要清空数据
  if (publishStatusDialog.status === 3) {
    info.value = { topicList: [], accountList: [], poiInfo: null }
    chooseVideoInfo.value = null
    showTopicAndAt.value = false
    nextTick(() => {
      showTopicAndAt.value = true
    })
  }
  publishStatusDialog.show = false
  POIList.value = []
  xhsPOIList.value = []
}
// 是否显示选择视频的弹窗
const showChooseDialog = reactive({
  show: false
})
const chooseVideoInfo = ref(null)
const showChooseFun = throttle(() => {
  showChooseDialog.show = true
}, 500)
// 更新选择的数据
function updateChooseFun(e) {
  console.log('选中的数据', e)
  if (isNotEmpty(e)) {
    chooseVideoInfo.value = e
    info.value.videoUrl = e.url
    info.value.videoCoverUrl = e.coverUrl
  }
}

// 小红书POI
const xhsPoiLoading = ref(false)
const xhsPOIList = ref([])
// 获取POIlist
const _getXhsPOIList = name => {
  if (name) {
    xhsPoiLoading.value = true
    xhsLocation({
      keyword: name || ''
    })
      .then(res => {
        if (res.code === 0 && res.data) {
          const list = res.data || []
          xhsPOIList.value = list.map(item => {
            return {
              poi: item.poiOid,
              poiName: item.name,
              poiSubname: item.subname,
              poiType: item.source
            }
          })
        } else {
          xhsPOIList.value = []
        }
        xhsPoiLoading.value = false
      })
      .catch(() => {
        xhsPOIList.value = []
        xhsPoiLoading.value = false
      })
  }
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.content_page {
  background: #fff;
  width: 100%;
  height: 100%;
  .content_box {
    padding: 22px 24px;
    width: 100%;
    height: calc(100% - 56px);
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    overflow-y: auto;
    .box_left {
      margin-right: 24px;
      .left_btn {
        margin-top: 16px;
        width: 252px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        .btn_line {
          width: 1px;
          height: 14px;
          background: rgba(220, 222, 224, 1);
          margin: 0 6px;
        }
      }
      .none_box {
        background: #ffffff;
        border-radius: 2px;
        border: 1px dashed #dcdee0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 252px;
        height: 448px;
        border-radius: 2px;
        position: relative;
      }
      .none_top {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .choose_box {
          width: 114px;
          height: 32px;
          margin-bottom: 16px;
        }
      }

      .upload_text {
        width: 100%;
        text-align: center;
        font-weight: 400;
        font-size: 12px;
        color: #909399;
        line-height: 18px;
      }
      .has_box {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        width: 252px;
        height: 448px;
        border-radius: 2px;
        position: relative;
        cursor: pointer;
        overflow: hidden;
        .has_cover {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .has_play {
          position: absolute;
          top: 192px;
          left: 94px;
          width: 64px;
          height: 64px;
        }
      }
    }
    .box_right {
      width: 400px;
      .tip_box {
        margin-top: 16px;

        color: #909399;
        font-size: 14px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        .tip_img {
          // margin-left: 1px;
          width: 16px;
          height: 16px;
        }
      }
      .form_box {
        width: 400px;
        min-height: 448px;
        background: #f6f7f8;
        border-radius: 4px;
        padding: 16px 20px 16px;
        .one_form + .one_form {
          margin-top: 16px;
        }
        .one_form {
          .form_title {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
            line-height: 22px;
            margin-bottom: 12px;
          }
          .form_content {
            width: 100%;
          }
        }
      }
    }
  }
  .content_bottom {
    height: 56px;
    width: 100%;
    box-shadow: 0px 0px 7px 0px rgba(224, 224, 224, 0.5);
    background: #ffffff;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
}
:deep(.el-link.el-link--primary.is-disabled) {
  color: rgba(191, 196, 205, 1);
}

.add_topic_select .el-input__suffix {
  display: none !important;
}
.publish_loading {
  padding: 0;
  width: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .icon_publish {
    font-size: 48px;
  }
  .publish_loading_title {
    font-size: 16px;
    font-weight: 600;
    color: #323233;
    line-height: 20px;
    margin-top: 12px;
  }
  .publish_loading_text {
    margin-top: 20px;
    font-size: 14px;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
    padding: 0 30px;
  }
}
:deep(.form_content .el-textarea__inner) {
  padding: 5px 11px;
}
</style>
