<template>
  <el-dialog
    ref="dialog"
    destroy-on-close
    v-model="show"
    title="评论详情"
    width="560px"
    custom-class="rule_setting_dialog "
  >
    <div class="dialog_content" v-loading="$data.loading">
      <div class="content_top">
        <!-- 删除/隐藏或者评论过才有提示框 -->
        <div class="content_tip" v-if="getTip()">
          <div class="tip_left">
            <img src="https://tagvv-1256030678.file.myqcloud.com/20230529xhu7v.png" alt="" />
            {{ getTip() }}
          </div>
        </div>
        <div class="content_video">
          <div
            class="video_left"
            @click="toVideoDetail"
            :style="!cgpContentExist ? 'cursor: default;' : ''"
          >
            <div class="video_box">
              <el-image class="video_cover" :src="$data.videoCover" alt fit="cover">
                <template #error>
                  <div class="video_cover errImg_box"></div>
                </template>
              </el-image>
              <template v-if="!$data.loading">
                <div class="video_mask" v-if="!cgpContentExist">
                  <img
                    class="video_play"
                    src="https://tagvv-1256030678.file.myqcloud.com/20230728zqz28.png"
                    alt=""
                  />
                  未获取到视频
                </div>
                <div class="video_mask" v-else-if="!$data.isPublic">
                  <img
                    class="video_play"
                    src="https://tagvv-1256030678.file.myqcloud.com/20230728zqz28.png"
                    alt=""
                  />
                  已删除或隐藏
                </div>
                <div class="video_mask video_mask_play" v-else>
                  <img
                    class="video_play"
                    src="https://tagvv-1256030678.file.myqcloud.com/20230801ri53u.png"
                    alt=""
                  />
                </div>
              </template>
            </div>
            <div class="video_title" v-if="!$data.loading">
              {{ cgpContentExist ? $data.videoTitle || '--' : '--' }}
            </div>
          </div>
          <div class="tip_right" @click="toMore">
            更多互动记录
            <img src="https://tagvv-1256030678.file.myqcloud.com/202307276miwf.png" alt="" />
          </div>
        </div>
        <div class="video_comment" v-if="$data.commentInfo">
          <div class="first_comment comment_common">
            <img class="comment_head" :src="$data.commentInfo.avatar" alt="" />
            <div class="comment_content">
              <div class="comment_name_box">
                <div class="comment_name">{{ $data.commentInfo.nickname || '--' }}</div>
              </div>
              <div class="comment_comment">
                {{ $data.commentInfo.content || '--' }}
              </div>
              <div class="comment_time">
                {{ getVideoCommentDateDiff($data.commentInfo.commentTime || '--') }}
              </div>
            </div>
          </div>
          <div class="second_comment comment_common" v-if="$data.isHaveComment">
            <img class="comment_head" :src="$data.commentInfo.subComment.avatar" alt="" />
            <div class="comment_content">
              <div class="comment_name_box">
                <div class="comment_name">
                  {{ $data.commentInfo.subComment.nickname || '--' }}
                </div>

                <div class="comment_tag">
                  {{ $data.commentInfo.subComment.sendType == 1 ? '自动回复' : '手动回复' }}
                </div>
              </div>
              <div class="comment_comment">
                {{ $data.commentInfo.subComment.content || '--' }}
              </div>
              <div class="comment_time">
                {{ getVideoCommentDateDiff($data.commentInfo.subComment.commentTime || '--') }}
              </div>
            </div>
          </div>
        </div>
        <div class="video_comment none_data" v-if="!$data.commentInfo && !$data.loading">
          <div>暂未获取到评论信息</div>
          <!-- <div class="tip_right" @click="toMore">
              更多互动记录
              <img src="https://tagvv-1256030678.file.myqcloud.com/202307276miwf.png" alt="" />
            </div> -->
        </div>
      </div>
      <!-- (内容中台有公开视频[有视频并且是公开的]||内容中台没有视频) && 有评论 && 没有被回评过的 才有评论按钮 -->
      <div
        class="content_comment"
        v-if="
          ((cgpContentExist && $data.isPublic) || !cgpContentExist) &&
          $data.commentInfo &&
          !$data.isHaveComment
        "
      >
        <el-input
          type="text"
          placeholder="请输入评论内容"
          maxlength="100"
          v-model.trim="$data.commentValue"
        ></el-input>
        <el-button
          type="primary"
          :disabled="$data.loading"
          :loading="$data.sendLoading"
          @click="sendFun"
        >
          发送
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script setup>
import { videoStatisticsInfo } from '@/api/content_center/content_manage.js'
import { getComment, replyComment } from '@/api/scrm/customer.js'

import { throttle, judgeIsPublicVideo, getVideoCommentDateDiff } from '@/utils/tools'
const props = defineProps({
  videoDialog: {
    type: Object,
    default: () => {
      return {
        show: true, // 是否显示弹窗
        info: null, // 跳转的信息
        videoId: null,
        cgpContentExist: false // 是否在业务库里有item_id
      }
    },
    required: true
  }
})
const dialog = ref()
const { show, info, videoId, cgpContentExist } = toRefs(props.videoDialog)

// 更多互动记录
const toMore = throttle(() => {
  console.log('info', info.value)

  const url =
    location.origin +
    `/scrm/potential_customer_list/potential_details?clientUserBindId=${window.encodeURIComponent(
      info.value.clientUserBindId || ''
    )}&fromOpenId=${window.encodeURIComponent(
      info.value.fromOpenId || ''
    )}&toOpenId=${window.encodeURIComponent(
      info.value.toOpenId || ''
    )}&fromUid=${window.encodeURIComponent(
      info.value.fromUid || ''
    )}&clientUserId=${window.encodeURIComponent(info.value.clientUserId || '')}&clientUserType=${
      info.value.clientUserType || 1
    }&toUserId=${window.encodeURIComponent(
      info.value.toUserId || ''
    )}&fromUserId=${window.encodeURIComponent(
      info.value.fromUserId || ''
    )}&toType=${'interactiveRecord'}`

  window.open(url, '_blank')
}, 300)
const $data = reactive({
  loading: true,
  sendLoading: false,
  commentValue: '', // 要发送的评论信息
  videoCover: '', // 视频封面
  videoTitle: '', // 视频标题
  isPublic: false, // 是否是公开视频
  isHaveComment: false, // 是否有回评过
  commentId: null, // 父评论ID
  commentInfo: null // 视频评论信息
})
// 获取视频评论信息en
function getVideoInfo() {
  console.log('videoId', videoId)
  $data.loading = true
  console.log(videoId)
  videoStatisticsInfo({
    itemId: videoId.value
  })
    .then(res => {
      if (res.code === 0) {
        $data.videoCover = res.data?.cover
        $data.videoTitle = res.data?.title
        $data.isPublic = judgeIsPublicVideo(res.data)
      }
      $data.loading = false
    })
    .catch(() => {
      $data.loading = false
    })
}
function getVideoCommentInfo() {
  getComment({
    clientDyOpenId: info.value.fromOpenId,
    itemId: videoId.value
  })
    .then(res => {
      if (res.code === 0 && res.data) {
        const data = res.data

        $data.commentInfo = data
        $data.commentId = data.commentId
        $data.isHaveComment = !!(data.subComment || data.sendType)
      } else {
        $data.isHaveComment = false
        $data.commentInfo = null
      }
    })
    .catch(() => {
      $data.commentInfo = null
      $data.isHaveComment = false
    })
}

// 获取视频评论信息
getVideoCommentInfo()
// 获取视频信息
getVideoInfo()

const message = inject('$message')
const sendFun = throttle(() => {
  if ($data.commentValue) {
    $data.sendLoading = true
    replyComment({
      commentId: $data.commentId,
      content: $data.commentValue,
      dyOpenId: info.value.toOpenId,
      itemId: videoId.value
    })
      .then(res => {
        if (res.code === 0) {
          message.success('评论成功')
          $data.commentValue = ''
          $data.sendLoading = false
          getVideoCommentInfo()
        } else {
          $data.sendLoading = false
        }
      })
      .catch(() => {
        $data.sendLoading = false
      })
  } else {
    message.warning('请先输入评论内容')
  }
}, 500)

// 打开视频详情
const toVideoDetail = throttle(() => {
  if (!cgpContentExist.value) return
  const url =
    location.origin +
    `/content_center/content_manage/manage_detail?itemId=${window.encodeURIComponent(
      videoId.value
    )}`
  window.open(url, '_blank')
}, 500)

function getTip() {
  let tip = ''
  if (!$data.loading) {
    // 业务库有没有item_id
    if (cgpContentExist.value) {
      // 有item_id：如果是删除就显示删除，否则如果有评论就显示自评，没有就不显示提示框
      if (!$data.isPublic) {
        tip = '视频已被删除或隐藏'
      } else {
        tip = $data.isHaveComment ? '仅支持手动/自动回复评论 1 次' : ''
      }
    } else {
      // 没有item_id：如果有评论就显示自评，没有就不显示提示框
      tip = $data.isHaveComment ? '仅支持手动/自动回复评论 1 次' : ''
    }
  }

  return tip
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.dialog_content {
  width: 100%;
  padding: 16px;
  overflow-y: auto;
  max-height: 50vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  .content_top {
    width: 100%;
  }
  .content_tip {
    margin-bottom: 16px;
    width: 100%;
    height: 40px;
    padding: 0 0 0 16px;
    background: #eaedfa;
    border-radius: 4px;
    border: 1px solid #889cff;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .tip_left {
      font-size: 14px;
      font-weight: 400;
      color: #323233;
      line-height: 20px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      img {
        width: 14px;
        height: 14px;
        object-fit: contain;
        margin-right: 10px;
        display: flex;
      }
    }
  }
  .tip_right {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    cursor: pointer;
    font-size: 14px;
    font-weight: 400;
    color: #364fcd;
    line-height: 20px;
    img {
      width: 14px;
      height: 14px;
      object-fit: contain;
      margin-left: 4px;
      display: flex;
    }
  }
  .content_video {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    .video_left {
      cursor: pointer;
      width: max-content;
      max-width: calc(100% - 120px);
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
    }
    .video_box {
      margin-right: 12px;

      width: 90px;
      height: 120px;
      background: #d8d8d8;
      border-radius: 2px;
      position: relative;
      .video_cover {
        width: 90px;
        height: 120px;
        object-fit: cover;
        display: flex;
        border-radius: 2px;
      }
      .video_mask {
        border-radius: 2px;
        position: absolute;
        left: 0;
        top: 0;
        width: 90px;
        height: 120px;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 12px;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.8);
        line-height: 18px;
      }
      .video_play {
        width: 40px;
        height: 40px;
        display: flex;
        object-fit: contain;
        margin-bottom: 8px;
      }
      .video_mask_play {
        opacity: 0;
        &:hover {
          opacity: 1;
        }
        .video_play {
          margin: 0;
        }
      }
    }
    .video_title {
      width: calc(100% - 102px);
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      line-height: 20px;
    }
  }
  .video_comment {
    margin-top: 20px;
    padding-bottom: 8px;
    width: 100%;
    .comment_common {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      .comment_head {
        width: 48px;
        height: 48px;
        border-radius: 100%;
        margin-right: 12px;
        display: flex;
        object-fit: contain;
      }
      .comment_content {
        width: calc(100% - 60px);
        .comment_name {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          line-height: 20px;
          @include mult_line(1);
        }
        .comment_tag {
          margin-left: 8px;
          width: 56px;
          height: 19px;
          background: rgba(54, 79, 205, 0.1);
          border-radius: 2px;
          border: 1px solid #364fcd;
          font-size: 12px;
          font-weight: 400;
          color: #364fcd;
          line-height: 18px;
          text-align: center;
          display: inline-block;
        }
        .comment_comment {
          margin-top: 4px;
          font-size: 14px;
          font-weight: 400;
          color: #606266;
          line-height: 20px;
        }
        .comment_time {
          margin-top: 4px;
          font-size: 12px;
          font-weight: 400;
          color: #909399;
          line-height: 18px;
        }
      }
    }

    .first_comment {
      width: 100%;
      .comment_name_box {
        display: flex !important;
        flex-direction: row !important;
        justify-content: space-between !important;
        align-items: center !important;
        .comment_name {
          width: calc(100% - 110px) !important;
        }
      }
    }
    .second_comment {
      margin-top: 16px;
      width: 100%;
      padding-left: 60px;
      .comment_head {
        width: 36px !important;
        height: 36px !important;
      }
      .comment_content {
        width: calc(100% - 48px);

        .comment_name_box {
          display: flex !important;
          flex-direction: row !important;
          justify-content: flex-start !important;
          align-items: center !important;
          .comment_name {
            max-width: calc(100% - 64px);
          }
        }
      }
    }
  }
  .content_comment {
    margin-top: 20px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .el-input {
      width: 438px;
    }
    .el-button {
      margin-left: 16px;
      width: 74px;
      height: 32px;
    }
  }
}
.none_data {
  width: 100%;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  color: #8f939a;
  line-height: 20px;
  text-align: center;
  // position: relative;
  // .tip_right {
  //   position: absolute !important;
  //   right: 0 !important;
  //   top: 0 !important;
  // }
}
</style>
