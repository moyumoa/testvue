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
          <div class="info_left" @click="toLive">
            <el-image class="video_cover" :src="$data.info.roomCover" alt fit="cover">
              <template #error>
                <!-- errImg_box -->
                <div class="video_cover"></div>
              </template>
            </el-image>
            <template v-if="!$data.infoLoading">
              <div class="video_mask" v-if="!$data.cgpContentExist">
                <img
                  class="video_play"
                  src="https://tagvv-1256030678.file.myqcloud.com/20230728zqz28.png"
                  alt=""
                />
                未获取到直播
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
          <div class="info_right">
            <div class="video_title line-hidden2" :title="$data.info.roomTitle">
              {{ $data.info.roomTitle || '--' }}
            </div>
            <div class="video_time">
              时长：{{ $data.info.duration ? secondToDate($data.info.duration / 1000) : '--' }}
            </div>
            <div class="video_time">开播时间：{{ $data.info.liveStartTime || '--' }}</div>
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
              <div class="user_name row_overflow">
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
          <div class="title_left">弹幕列表</div>
          <div class="title_right">
            <el-tooltip placement="top">
              <template #content>
                <div style="max-width: 350px">开启后，无汉字内容的弹幕会被列表过滤不显示</div>
              </template>
              <div class="xm_tooltipOfRight" style="width: max-content">过滤无效弹幕</div>
            </el-tooltip>
            <el-switch
              :disabled="$data.listLoading"
              style="margin-left: 8px"
              v-model="$data.isFilter"
              @change="changeFilter"
              active-text="开"
              inactive-text="关"
              inline-prompt
            ></el-switch>
          </div>
        </div>
        <div class="bullet_box" v-loading="$data.listLoading && $data.page.index == 1">
          <template v-if="$data.list.length > 0">
            <div
              ref="listBoxRef"
              class="has_bullet"
              :infinite-scroll-delay="1000"
              v-infinite-scroll="loadFun"
              :infinite-scroll-distance="50"
              :infinite-scroll-immediate="false"
              :infinite-scroll-disabled="$data.list.length >= $data.page.total"
            >
              <div class="bullet_content" v-for="(item, index) in $data.list" :key="index">
                <div class="one_bullet">
                  <div class="bullet_head">
                    <img v-if="item.avatar" :src="item.avatar" alt="" />
                    <img v-else src="@/assets/images/content_center/default_user.png" alt="" />
                  </div>
                  <div class="bullet_info">
                    <div class="info_top">
                      <div class="bullet_name">{{ item.nickname || '--' }}</div>
                      <div class="bullet_time">
                        {{ item.msgSendTime ? item.msgSendTime.split(' ')[1] : '--' }}
                      </div>
                    </div>

                    <div class="bullet_bullet">
                      <span class="blue_inline_block" v-if="item.keyword">{{ item.keyword }}</span>
                      {{ item.content || '--' }}
                    </div>
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
                    ? $data.list.length > 8
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
import { liveChatMessageDetailByRoomId } from '@/api/scrm/interactive_management.js'
import { throttle, secondToDate } from '@/utils/tools'

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
  info: {}, // 直播间详情
  cgpContentExist: false, // 是否存在该直播
  isFilter: true,
  listLoading: true,
  list: [],
  page: {
    index: 1,
    size: 20,
    total: 0
  }
})
onMounted(() => {
  // 获取弹幕列表
  resetList(true)
})

// 过滤无效
function changeFilter() {
  resetList()
}
// 上拉加载
function loadFun() {
  if (!$data.listLoading) {
    $data.listLoading = true
    $data.page.index++
    getList()
  }
}

const listBoxRef = ref()
// 获取数据
function getList(isFirst, isReset) {
  $data.listLoading = true
  liveChatMessageDetailByRoomId({
    filterInvalidChat: $data.isFilter,
    id: props.detailInfo.id || '',
    roomId: props.detailInfo.roomId || '',
    pageNo: $data.page.index,
    pageSize: $data.page.size
  })
    .then(res => {
      if (res.code === 0) {
        if (isFirst) {
          $data.info = res.data
          $data.cgpContentExist = res.data ? res.data.noExistRoom === 0 : false
        }
        const chatMessageListVOS = res.data.chatMessageListVOS || {}
        if ($data.page.index === 1) {
          let list = []
          if (chatMessageListVOS.extra && chatMessageListVOS.extra.length > 0) {
            list = list.concat(chatMessageListVOS.extra)
          }
          list = list.concat(chatMessageListVOS.records || [])
          $data.list = list
          $data.page.total =
            (chatMessageListVOS.total || 0) +
            (chatMessageListVOS.extra && chatMessageListVOS.extra.length > 0 ? 1 : 0)
        } else {
          $data.newListData = chatMessageListVOS.records || []
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
  $data.listLoading = true
  $data.page = {
    index: 1,
    size: 20,
    total: 0
  }
  getList(isFirst, true)
}
const message = inject('$message')
// 打开直播间详情
const toLive = throttle(() => {
  if ($data.cgpContentExist) {
    window.open(
      `${location.origin}/content_center/live_center/detail?roomId=${props.detailInfo.roomId}&dyOpenId=${$data.info.dyOpenId}`,
      '_blank'
    )
  } else {
    message.warning('直播不存在')
  }
}, 500)
</script>
<style lang="scss" scoped>
@import '../components/scss/interactive_management.scss';

.bullet_box {
  width: 100%;
  height: calc(100% - 220px);
  .has_bullet {
    padding: 16px;
    width: 100%;
    height: 100%;
    overflow-y: auto;
  }
  .bullet_content {
    .one_bullet {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      .bullet_head {
        margin-top: 4px;
        width: 36px;
        height: 36px;
        margin-right: 12px;
        img {
          width: 100%;
          height: 100%;
          border-radius: 100%;
          display: flex;
        }
      }
      .bullet_info {
        width: calc(100% - 48px);
        .info_top {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }
        .bullet_name {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          line-height: 20px;
          width: calc(100% - 66px);
        }
        .bullet_bullet {
          font-size: 14px;
          font-weight: 400;
          color: #606266;
          line-height: 20px;
          margin: 4px 0 0;
          word-break: break-all;
        }
        .bullet_time {
          font-size: 12px;
          font-weight: 400;
          color: #909399;
          line-height: 18px;
        }
      }
    }
  }
  .bullet_content + .bullet_content {
    padding-top: 16px;
  }
}
</style>
