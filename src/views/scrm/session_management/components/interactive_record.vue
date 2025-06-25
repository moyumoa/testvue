<template>
  <!-- 互动记录 -->
  <div class="interaction_box tab_box">
    <!-- head -->
    <div class="tab_head">
      互动记录
      <!-- <el-tooltip
        class="item"
        effect="dark"
        content="用户与所选矩阵号发生的关注/取关、评论记录"
        placement="top"
      >
        <img src="@/assets/images/scrm/session/question.png" />
      </el-tooltip> -->
    </div>
    <!-- content -->
    <div class="tab_content" v-loading="tableForm.loading">
      <!-- 有数据 -->
      <div
        class="data_box"
        v-if="tableForm.listData.length > 0"
        v-infinite-scroll="loadNextList"
        :infinite-scroll-immediate="false"
      >
        <div class="list_box">
          <div class="one_list" v-for="item in tableForm.listData" :key="item">
            <div class="one_box">
              <i
                :style="{
                  'background-image': `url(${tableForm.typeIcons[item.eventType]})`
                }"
              ></i>
              <div class="box_content">
                <div class="one_content line-hidden2">
                  <!-- <template v-if="item.eventType == 4">{{ fromChatInfo.name }}关注了你</template>
                  <template v-else-if="item.eventType == 5">{{ fromChatInfo.name }}取关了你</template> -->
                  <!--                  <div-->
                  <!--                    v-if="-->
                  <!--                      item.eventType == POLICY_TYPE.get('video_comment') ||-->
                  <!--                      item.eventType == POLICY_TYPE.get('im_message')-->
                  <!--                    "-->
                  <!--                    v-html="item.msgContent.content || item.msgContent.replyCommentContent"-->
                  <!--                  ></div>-->
                  <div class="one_title">
                    <!-- 110,215视频评论 210弹幕-->
                    <div>{{ POLICY_TYPE.getCN(item.eventType) }}</div>
                    <div
                      class="one_title_right"
                      v-if="
                        item.eventType === 110 || item.eventType === 215 || item.eventType === 210
                      "
                    >
                      <div
                        v-if="item.eventType === 110 || item.eventType === 215"
                        @click="goToDetailPage(item, 'video')"
                      >
                        视频详情
                      </div>
                      <div v-if="item.eventType === 210" @click="goToDetailPage(item, 'live')">
                        直播详情
                      </div>
                      <div class="one_title_right_img">
                        <img src="https://tagvv-1256030678.file.myqcloud.com/20230313dfj48.png" />
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 110,215视频评论 210弹幕-->
                <div
                  v-if="item.eventType === 110 || item.eventType === 215 || item.eventType === 210"
                  class="one_detail"
                >
                  {{ item.eventContent.content }}
                </div>
                <div class="one_time">{{ item.eventTime }}</div>
              </div>
            </div>
          </div>
          <!-- 提示文案 -->
          <div class="one_mark" v-if="tableForm.listData.length >= 10">
            {{ tableForm.hasNext ? '加载中~' : '已经到底啦' }}
          </div>
        </div>
      </div>
      <!-- 无数据 -->
      <div class="none_data" v-else>
        <img src="@/assets/images/content_center/no_data.png" />
        <div>暂无记录</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
import { getEventList } from '@/api/scrm/session_management'
import { POLICY_TYPE } from '@/utils/dictionary/session-management'
import { useRoute } from 'vue-router'

const $store = useStore()
const props = defineProps({
  newMessage: Object
})
const { query } = useRoute()
const { newMessage } = toRefs(props)
const tableForm = reactive({
  index: 1,
  loading: false,
  hasNext: true,
  listData: [],
  typeIcons: {
    110: 'https://tagvv-1256030678.file.myqcloud.com/2022062391ont.png', // 评论
    113: 'https://tagvv-1256030678.file.myqcloud.com/20220623a8oda.png', // 关注
    114: 'https://tagvv-1256030678.file.myqcloud.com/20220623akv04.png', // 取关
    115: 'https://tagvv-1256030678.file.myqcloud.com/20220623wl9zd.png', // 进入会话
    116: 'https://tagvv-1256030678.file.myqcloud.com/20220623eskm1.png', // 点赞
    117: 'https://tagvv-1256030678.file.myqcloud.com/20220623md97r.png', // 取消点赞
    118: 'https://tagvv-1256030678.file.myqcloud.com/20220623j01e7.png', // 主页互动
    210: 'https://tagvv-1256030678.file.myqcloud.com/20230313lwzlo.png', // 直播间弹幕
    211: 'https://tagvv-1256030678.file.myqcloud.com/20230313eyzy7.png', // 直播间礼物
    212: 'https://tagvv-1256030678.file.myqcloud.com/202303134y9o9.png', // 直播间关注
    213: 'https://tagvv-1256030678.file.myqcloud.com/20230313lsydf.png', // 直播间分享
    214: 'https://tagvv-1256030678.file.myqcloud.com/202303132d91k.png', // 直播间点赞
    215: 'https://tagvv-1256030678.file.myqcloud.com/2022062391ont.png' // 评论
  }
})

// 聊天对方
const fromChatInfo = computed(() => {
  return $store.state.chat.currentChatUser
})
// 聊天自己
const toChatInfo = computed(() => {
  return $store.state.chat.currentChatMineInfo
})

function resetList() {
  tableForm.hasNext = true
  tableForm.listData = []
  getList()
}
// 查询列表
function getList() {
  getEventList({
    pageNo: 1,
    pageSize: 50,
    fromUserId: fromChatInfo.value.openId,
    toUserId: toChatInfo.value.openId,
    clientUserId: fromChatInfo.value.clientUserId || query.clientUserId // scrm五期新增
  })
    .then(res => {
      tableForm.hasNext = res.data.hasNext
      const _list = res.data.records.map(e => {
        e.msgContent = e.eventContent
        return e
      })
      tableForm.listData = tableForm.listData.concat(_list)
    })
    .finally(() => {
      tableForm.loading = false
    })
}
// 上拉加载列表
function loadNextList() {
  if (tableForm.hasNext) {
    tableForm.index++
    getList()
  }
}

// 前往页面跳转
function goToDetailPage(val, type) {
  // 前往视频详情页面
  if (type === 'video') {
    console.log(val)
    window.open(
      `/content_center/content_manage/manage_detail?itemId=${encodeURIComponent(
        val.eventContent.itemId
      )}`,
      '_blank'
    )
  }

  // 前往直播详情页面
  if (type === 'live') {
    console.log(val)
    window.open(
      `/content_center/live_center/detail?roomId=${val.eventContent.roomId}&dyOpenId=${val.eventContent.dyOpenId}`,
      '_blank'
    )
  }
}

// 监听聊天人变化
watch(
  () => fromChatInfo.value,
  newVal => {
    if (newVal && newVal.openId) {
      tableForm.loading = true
      resetList()
    } else {
      tableForm.listData = []
    }
  },
  { deep: true, immediate: true }
)

// 获取最新消息
watch(
  () => newMessage.value,
  newVal => {
    if (newVal && newVal.data) {
      const info = JSON.parse(JSON.stringify(newVal.data))
      const _message = info.lastMsgDetail
      if (
        fromChatInfo.value.openId === info.fromOpenId &&
        toChatInfo.value.openId === info.toOpenId &&
        _message.eventType &&
        _message.eventType !== 3
      ) {
        console.log('互动关注新消息', newVal)
        tableForm.listData.unshift(_message)
      }
    }
  }
)
</script>

<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.interaction_box {
  height: calc(100% - 337px);
  width: 100%;
  background: #ffffff;
  border-radius: 4px;
  .tab_content {
    height: calc(100% - 52px);
    padding: 20px 0px;
    .none_data {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-size: 14px;
      font-weight: 400;
      color: #8f939a;
      line-height: 20px;
      text-align: center;
      img {
        width: 72px;
        height: 52px;
        margin-bottom: 8px;
      }
    }
    .data_box {
      overflow-y: auto;
      height: 100%;
      .one_mark {
        // font-size: 12px;
        font-weight: 400;
        color: #bec4ce;
        line-height: 17px;
        text-align: center;
        padding: 20px 0 0;
      }
      .list_box {
        padding: 0 24px;
        .one_list {
          .one_box {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: flex-start;
            i {
              width: 20px;
              height: 20px;
              background-size: cover;
              margin-right: 8px;
            }
            .box_content {
              width: calc(100% - 28px);
              font-size: 14px;
              font-weight: 400;
              color: #303133;
              line-height: 20px;
              .one_time {
                margin-top: 4px;
                font-size: 12px;
                font-weight: 400;
                color: #bec4ce;
                line-height: 17px;
              }
            }
          }
        }
        .one_list + .one_list {
          margin-top: 16px;
        }
      }
    }
  }
}
.one_detail {
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #909399;
  line-height: 20px;
  white-space: normal;
  word-break: break-all;
}
.one_title {
  display: flex;
  justify-content: space-between;
  .one_title_right {
    font-size: 12px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #364fcd;
    line-height: 18px;
    cursor: pointer;
    display: flex;
    vertical-align: middle;
    justify-content: center;
    align-items: center;
    .one_title_right_img {
      width: 14px;
      height: 14px;
      margin-left: 2px;
      img {
        margin-top: 1px;
        width: 14px;
        height: 14px;
      }
    }
  }
}
</style>
