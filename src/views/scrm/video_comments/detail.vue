<template>
  <div class="detail_page">
    <!-- 关闭弹窗入口 -->
    <div class="close_box" @click="closeFun">
      <img src="https://tagvv-1256030678.file.myqcloud.com/2023111714stt.png" alt="" />
    </div>
    <!-- 弹窗具体信息 -->
    <div class="drawer_box">
      <template v-if="show">
        <div class="video_info" v-loading="$data.infoLoading">
          <div class="info_left" @click="toVideo">
            <el-image class="video_cover" :src="$data.info.coverUrl" alt fit="cover">
              <template #error>
                <div class="video_cover"></div>
              </template>
            </el-image>

            <!-- 图文 -->
            <imgTextTask_ICON
              v-if="$data.info && $data.info.mediaType == 2"
              :info="$data.info"
              :useClick="false"
            />

            <template v-if="!$data.infoLoading">
              <!-- cgpContentExist   1不存在业务库 0 存在业务库 -->
              <div class="video_mask" v-if="!$data.cgpContentExist">
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
              <template v-else>
                <!-- 图文不需要播放按钮 -->
                <div
                  class="video_mask video_mask_play"
                  v-if="!($data.info && $data.info.mediaType == 2)"
                >
                  <img
                    class="video_play"
                    src="https://tagvv-1256030678.file.myqcloud.com/20230801ri53u.png"
                    alt=""
                  />
                </div>
              </template>
            </template>
          </div>
          <div class="info_right">
            <div
              class="video_title line-hidden2"
              :title="$data.cgpContentExist ? $data.info.videoTitle || '' : ''"
            >
              {{ $data.cgpContentExist ? $data.info.videoTitle || '--' : '--' }}
            </div>
            <div class="video_time" v-if="!($data.info && $data.info.mediaType == 2)">
              时长：{{
                $data.info.videoDuration ? secondToDate($data.info.videoDuration / 1000) : '--'
              }}
            </div>
            <div class="video_time">发布时间：{{ $data.info.createTime || '--' }}</div>
            <div class="video_user">
              <img
                v-if="$data.info.fromXUserAvatar"
                :src="$data.info.fromXUserAvatar"
                class="user_head"
                alt=""
              />
              <img
                v-else
                src="@/assets/images/content_center/default_user.png"
                class="user_head"
                alt=""
              />
              <div class="user_name">
                <div
                  :title="$data.info.fromXUserNickname"
                  class="name row_overflow"
                  :style="
                    $data.info && $data.info.xuserIsDelete === 1
                      ? 'max-width:calc(100% - 52px)'
                      : ''
                  "
                >
                  {{ $data.info.fromXUserNickname || '--' }}
                </div>
                <div class="xm_delClass" v-if="$data.info && $data.info.xuserIsDelete === 1"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="drawer_line"></div>
        <div class="comment_title">
          <div class="title_left">视频评论区</div>
          <div class="title_right">
            <el-tooltip placement="top">
              <template #content>
                <div style="max-width: 350px">开启后，无汉字内容的评论会被列表过滤不显示</div>
              </template>
              <div class="xm_tooltipOfRight" style="width: max-content">过滤无效评论</div>
            </el-tooltip>
            <el-switch
              :disabled="$data.listLoading"
              style="margin-left: 8px"
              v-model="$data.isFilter"
              @change="resetList"
              active-text="开"
              inactive-text="关"
              inline-prompt
            ></el-switch>
          </div>
        </div>
        <div class="comment_box" v-loading="$data.listLoading && $data.page.index == 1">
          <template v-if="$data.list.length > 0">
            <div
              ref="listBoxRef"
              class="has_comment"
              :infinite-scroll-delay="1000"
              v-infinite-scroll="loadFun"
              :infinite-scroll-distance="50"
              :infinite-scroll-immediate="false"
              :infinite-scroll-disabled="$data.list.length >= $data.page.total"
            >
              <div
                :ref="listRef"
                class="comment_content"
                v-for="(item, index) in $data.list"
                :key="index"
              >
                <div class="one_comment">
                  <div class="comment_head">
                    <img v-if="item.avatar" :src="item.avatar" alt="" />
                    <img v-else src="@/assets/images/content_center/default_user.png" alt="" />
                  </div>
                  <div class="comment_info">
                    <div class="comment_name">{{ item.nickname || '--' }}</div>
                    <div class="comment_comment">
                      <span class="blue_inline_block" v-if="item.keyword">{{ item.keyword }}</span>
                      {{ item.content || '--' }}
                    </div>
                    <div class="comment_time">
                      <!-- 矩阵号未被删除 并且 (内容中台有公开视频[有视频并且是公开的]||内容中台没有视频) 并且 未被评论过  -->

                      <div
                        v-if="
                          $data.info &&
                          $data.info.xuserIsDelete === 0 &&
                          (($data.isPublic && $data.cgpContentExist) || !$data.cgpContentExist) &&
                          !item.subComment
                        "
                        class="comment_reply"
                        @click="showReplyFun(item, index)"
                      >
                        <img
                          src="https://tagvv-1256030678.file.myqcloud.com/20231117npxg7.png"
                          alt=""
                        />
                        回复{{ item.showReply ? '中' : '' }}
                      </div>
                      {{ getVideoCommentDateDiff(item.commentTime || '--') }}
                    </div>
                  </div>
                </div>
                <!-- 子评论 -->
                <div class="one_comment child_comment" v-if="item.subComment">
                  <div class="comment_head">
                    <img v-if="item.subComment.avatar" :src="item.subComment.avatar" alt="" />
                    <img v-else src="@/assets/images/content_center/default_user.png" alt="" />
                  </div>
                  <div class="comment_info">
                    <div class="comment_name">
                      {{ item.subComment.nickname }}
                      <span v-if="item.subComment.sendType && item.subComment.sendType == 1">
                        自动回复
                      </span>
                    </div>
                    <div class="comment_comment">
                      {{ item.subComment.content }}
                    </div>
                    <div class="comment_time">
                      {{ getVideoCommentDateDiff(item.subComment.commentTime || '--') }}
                    </div>
                  </div>
                </div>
                <div class="one_reply" v-if="item.showReply">
                  <el-input
                    :ref="replyInputRef"
                    :class="{
                      reply_input: true,
                      default_input_height: !(
                        $data.replyInfo.text && $data.replyInfo.text.length > 0
                      )
                    }"
                    :disabled="$data.replyInfo.loading"
                    type="textarea"
                    :autosize="{ minRows: 1, maxRows: 6 }"
                    resize="none"
                    :placeholder="$data.replyInfo.placeholder"
                    v-model.trim="$data.replyInfo.text"
                    maxlength="100"
                  ></el-input>
                  <div class="replay_btn" @click="sendFun">
                    <el-icon
                      style="margin-right: 4px"
                      v-if="$data.replyInfo.loading"
                      class="is-loading"
                    >
                      <i-loading />
                    </el-icon>
                    <img
                      v-else
                      src="https://tagvv-1256030678.file.myqcloud.com/20231117ihy8v.png"
                      alt=""
                    />
                    发送
                  </div>
                </div>
              </div>
              <div class="xm_pullUpToLoadMore">
                <img
                  src="/public/loading.gif"
                  v-if="$data.listLoading && $data.page.index > 1"
                  alt=""
                />
                {{
                  $data.listLoading
                    ? $data.page.index === 1
                      ? ''
                      : '加载中...'
                    : $data.list.length >= $data.page.total
                    ? $data.list.length > 3
                      ? '已经到底了~'
                      : ''
                    : '上拉加载更多~'
                }}
              </div>
            </div>
          </template>
          <div
            class="xm_noneData"
            v-if="!$data.listLoading && !($data.list && $data.list.length > 0)"
          >
            <img src="@/assets/images/content_center/no_activity.png" alt />
            暂无数据
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script setup>
import { getComment, replyComment } from '@/api/scrm/customer.js'

import { videoCommentDetail } from '@/api/scrm/interactive_management.js'
import { throttle, judgeIsPublicVideo, getVideoCommentDateDiff, secondToDate } from '@/utils/tools'

const props = defineProps({
  detailInfo: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    }
  }
})
const show = toRef(props.detailInfo, 'show')
const closeFun = throttle(() => {
  show.value = false
}, 500)

const $data = reactive({
  infoLoading: true,
  info: {},
  cgpContentExist: false, // 是否存在业务库
  isPublic: false, // 是否是公开视频
  isFilter: true,
  listLoading: true,
  list: [],
  page: {
    index: 1,
    size: 10,
    total: 0
  },
  replyInfo: {
    loading: false,
    text: '',
    placeholder: '',
    commentId: '',
    dyOpenId: '',
    itemId: '',
    index: null
  }
})
onMounted(() => {
  // 获取评论列表
  resetList(true)
})

// 上拉加载
const loadFun = () => {
  if (!$data.listLoading) {
    $data.listLoading = true
    $data.page.index++
    getList()
  }
}
// 单个评论的DOM
const allListRef = ref([])
const listRef = el => {
  if (el) {
    allListRef.value.push(el)
  }
}
const listBoxRef = ref()
// 获取数据
function getList(isFirst, isReset) {
  $data.listLoading = true
  videoCommentDetail({
    openId: props.detailInfo.openId,
    filterInvalidComment: $data.isFilter,
    id: props.detailInfo.id || '',
    itemId: props.detailInfo.itemId || '',
    pageNo: $data.page.index,
    pageSize: $data.page.size
  })
    .then(res => {
      if (res.code === 0) {
        if (isFirst) {
          $data.info = res.data
          if (res.data) {
            $data.cgpContentExist = res.data.noExistVideo === 0
            $data.isPublic = judgeIsPublicVideo({
              isDelete: res.data.isDel,
              dyVideoStatus: res.data.dyVideoStatus
            })
          }
        }
        const commentPage = res.data.commentPage || {}
        if ($data.page.index === 1) {
          let list = []
          if (commentPage.extra && commentPage.extra.length > 0) {
            list = list.concat(commentPage.extra)
          }
          list = list.concat(commentPage.records || [])
          $data.list = list
          $data.page.total =
            (commentPage.total || 0) + (commentPage.extra && commentPage.extra.length > 0 ? 1 : 0)
        } else {
          $data.newListData = commentPage.records || []
          $data.list = $data.list.concat($data.newListData)
        }
      } else {
        if ($data.page.index === 1) {
          $data.list = []
          $data.page.total = 0
        }
      }
      // 初始化需要滚回顶部
      if (isReset) {
        listBoxRef.value && listBoxRef.value.scrollTo(0, 0)
      }
      $data.infoLoading = false
      $data.listLoading = false
    })
    .catch(() => {
      $data.infoLoading = false
      $data.listLoading = false
    })
}

// 重置列表
function resetList(isFirst) {
  allListRef.value = []
  $data.listLoading = true
  $data.page = {
    index: 1,
    size: 10,
    total: 0
  }
  getList(isFirst, true)
}
// 输入框的DOM
const inputRef = ref([])
const replyInputRef = el => {
  if (el) {
    inputRef.value.push(el)
  }
}
function clearReplyInfo() {
  $data.replyInfo = {
    loading: false,
    text: '',
    placeholder: '',
    commentId: '',
    dyOpenId: '',
    fromUserId: '',
    itemId: '',
    index: null
  }
}
// 显示回复入口
const showReplyFun = throttle((e, i) => {
  inputRef.value = []
  if (i === $data.replyInfo.index) {
    $data.list[i].showReply = false
    clearReplyInfo()
    return
  }
  $data.replyInfo = {
    loading: false,
    text: '',
    placeholder: `回复 ${e.nickname || ''}：`,
    commentId: e.commentId || '',
    dyOpenId: e.toUserId || '',
    fromUserId: e.fromUserId || '',
    itemId: e.itemId || '',
    index: i
  }
  $data.list.forEach((x, y) => {
    x.showReply = y === i
  })
  nextTick(() => {
    inputRef.value && inputRef.value[inputRef.value.length - 1].focus()
  })
}, 500)

const message = inject('$message')
// 发送回复
const sendFun = throttle(e => {
  if ($data.replyInfo.loading) {
    return
  }
  if (!$data.replyInfo.text) {
    message.warning('请输入评论内容')
    return
  }
  $data.replyInfo.loading = true
  replyComment({
    commentId: $data.replyInfo.commentId,
    content: $data.replyInfo.text || '',
    dyOpenId: $data.replyInfo.dyOpenId,
    itemId: $data.replyInfo.itemId
  })
    .then(res => {
      // 不存在业务库 提示 视频已删除或隐藏  抖音授权失效 提示 抖音授权失效，发送失败
      if (res.code === 0) {
        message.success('评论成功')
        // 更新单条评论
        getOneComment()
      } else {
        $data.replyInfo.loading = false
      }
    })
    .catch(() => {
      $data.replyInfo.loading = false
    })
}, 700)
// 更新单条评论信息
function getOneComment() {
  getComment({
    clientDyOpenId: $data.replyInfo.fromUserId,
    itemId: $data.replyInfo.itemId,
    commentDetailBiz: true,
    commentId: $data.replyInfo.commentId
  })
    .then(res => {
      if (res.code === 0 && res.data) {
        $data.list[$data.replyInfo.index] = res.data
        clearReplyInfo()
      } else {
        $data.replyInfo.loading = false
      }
    })
    .catch(() => {
      $data.replyInfo.loading = false
    })
}
// 打开视频详情
const toVideo = throttle(() => {
  if ($data.cgpContentExist) {
    window.open(
      `${
        location.origin
      }/content_center/content_manage/manage_detail?itemId=${window.encodeURIComponent(
        props.detailInfo.itemId
      )}`,
      '_blank'
    )
  } else {
    message.warning('视频不存在')
  }
}, 500)
</script>
<style lang="scss" scoped>
@import '../components/scss/interactive_management.scss';

.comment_box {
  width: 100%;
  height: calc(100% - 220px);
  .has_comment {
    padding: 16px;
    width: 100%;
    height: 100%;
    overflow-y: auto;
  }
  .comment_content {
    .one_comment {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      .comment_head {
        width: 48px;
        height: 48px;
        margin-right: 12px;
        img {
          width: 100%;
          height: 100%;
          border-radius: 100%;
          display: flex;
        }
      }
      .comment_info {
        width: calc(100% - 60px);
        .comment_name {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          line-height: 20px;
          span {
            font-size: 12px;
            font-weight: 400;
            color: #364fcd;
            line-height: 16px;
            background: rgba(54, 79, 205, 0.1);
            border-radius: 2px;
            border: 1px solid #364fcd;
            padding: 0 4px;
            margin-left: 8px;
            display: inline-block;
          }
        }
        .comment_comment {
          font-size: 14px;
          font-weight: 400;
          color: #606266;
          line-height: 20px;
          margin: 6px 0;
          word-break: break-all;
        }
        .comment_time {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;

          font-size: 12px;
          font-weight: 400;
          color: #909399;
          line-height: 18px;
        }
        .comment_reply {
          // width: 56px;
          padding: 0 8px;
          height: 20px;
          background: rgba(96, 98, 102, 0.1);
          border-radius: 10px;
          font-size: 12px;
          font-weight: 400;
          color: #606266;
          line-height: 18px;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          margin-right: 8px;
          img {
            width: 14px;
            height: 14px;
            object-fit: contain;
            display: flex;
            margin-right: 2px;
          }
        }
      }
    }
    .child_comment {
      margin-top: 12px;
      margin-left: 60px;
      .comment_head {
        width: 36px;
        height: 36px;
      }
      .comment_info {
        width: calc(100% - 48px);
      }
    }
    .one_reply {
      margin-top: 12px;
      margin-left: 60px;
      width: calc(100% - 60px);
      position: relative;
      :deep(.reply_input .el-input__inner),
      :deep(.reply_input .el-textarea__inner) {
        padding-right: 58px;
      }
      .replay_btn {
        cursor: pointer;
        padding: 0 12px;
        height: 32px;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        position: absolute;
        right: 0;
        bottom: 0;
        font-size: 14px;
        font-weight: 400;
        color: #364fcd;
        line-height: 20px;
        img {
          width: 16px;
          height: 16px;
          object-fit: contain;
          display: flex;
          margin-right: 4px;
        }
      }
    }
  }
  .comment_content + .comment_content {
    padding-top: 20px;
  }
}
:deep(.default_input_height .el-textarea__inner) {
  height: 33px !important;
  min-height: 33px !important;
  line-height: 33px;
  padding-top: 0;
  padding-bottom: 0;
  overflow-y: hidden;
}
</style>
