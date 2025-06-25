<template>
  <!-- 互动记录 -->
  <div class="interaction_box tab_box">
    <div class="tab_content" v-loading="tableForm.loading">
      <!-- 有数据 -->
      <div
        class="data_box"
        v-if="tableForm.listData.length > 0"
        v-infinite-scroll="loadNextList"
        :infinite-scroll-immediate="false"
      >
        <div class="list_box">
          <el-steps direction="vertical">
            <el-step
              class="one_list"
              v-for="item in tableForm.listData"
              :key="item"
              :title="item.eventTime"
            >
              <template v-slot:description>
                <div class="one_box">
                  <i
                    :style="{
                      'background-image': `url(${tableForm.typeIcons[item.eventType]})`
                    }"
                  ></i>
                  <div class="box_content">
                    <div class="one_content line-hidden2">
                      <div class="one_title">
                        <!-- 110,215视频评论 210弹幕-->
                        <div>{{ POLICY_TYPE.getCN(item.eventType) }}</div>
                      </div>
                    </div>
                    <!-- 110,215视频评论 210弹幕-->
                    <div
                      v-if="
                        item.eventType === 110 || item.eventType === 215 || item.eventType === 210
                      "
                      class="one_detail"
                    >
                      {{ item.eventContent.content }}
                    </div>
                    <div
                      class="one_title_right"
                      v-if="
                        (item.eventType === 110 ||
                          item.eventType === 215 ||
                          item.eventType === 210) &&
                        item.cgpContentExist
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
              </template>
            </el-step>
          </el-steps>
          <!-- 提示文案 -->
          <div class="one_mark" v-if="tableForm.listData.length >= 10">
            {{
              tableForm.hasNext ? (tableForm.loading ? '加载中~' : '上拉加载更多~') : '已经到底啦'
            }}
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
import { useRoute } from 'vue-router'
import { getEventList } from '@/api/scrm/session_management'
import { POLICY_TYPE } from '@/utils/dictionary/session-management'
const route = useRoute()
// const props = defineProps({
//   info: {
//     type: Object,
//     default: () => {
//       return {
//         fromUserId: null,
//         toUserId: null,
//         clientUserId: null
//       }
//     },
//     required: true
//   }
// })
const { fromUserId, toUserId, clientUserId } = route.query
console.log('query', route.query)
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

function resetList() {
  tableForm.hasNext = true
  tableForm.listData = []
  getList()
}
// 查询列表
function getList() {
  getEventList({
    pageNo: tableForm.index,
    pageSize: 50,
    fromUserId: fromUserId || '',
    toUserId: toUserId || '',
    clientUserId: clientUserId || '' // scrm五期新增
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
  if (tableForm.hasNext && !tableForm.loading) {
    tableForm.loading = true
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

// // 监听聊天人变化
// watch(
//   () => fromChatInfo.value,
//   newVal => {
//     if (newVal && newVal.openId) {
//       tableForm.loading = true
//       resetList()
//     } else {
//       tableForm.listData = []
//     }
//   },
//   { deep: true, immediate: true }
// )

// // 获取最新消息
// watch(
//   () => newMessage.value,
//   newVal => {
//     if (newVal && newVal.data) {
//       const info = JSON.parse(JSON.stringify(newVal.data))
//       const _message = info.lastMsgDetail
//       if (
//         fromChatInfo.value.openId === info.fromOpenId &&
//         toChatInfo.value.openId === info.toOpenId &&
//         _message.eventType &&
//         _message.eventType !== 3
//       ) {
//         console.log('互动关注新消息', newVal)
//         tableForm.listData.unshift(_message)
//       }
//     }
//   }
// )
onMounted(() => {
  tableForm.loading = true
  resetList()
})
</script>

<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.interaction_box {
  height: 100%;
  width: 100%;
  background: #ffffff;
  .tab_content {
    height: 100%;
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
      padding: 20px 0px;
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
        // 更改步骤条圆圈样式
        :deep(.is-text) {
          // 圆圈border
          border: unset;
        }

        :deep(.el-step__icon-inner) {
          // 隐藏数字
          display: none;
        }

        :deep(.el-step__line) {
          // 线
          width: 1px;
          left: 4px;
          top: 8px;
          background-color: $theme_color;
          .el-step__line-inner {
            border-width: 0 !important;
          }
        }

        :deep(.el-step__main) {
          margin-top: -4px;
          padding-left: 0;
          width: calc(100% - 24px);
        }
        :deep(.el-step__icon) {
          // 圆
          width: 9px;
          height: 9px;
          background: $theme_color;
        }
        :deep(.el-step__title) {
          // 标题
          font-size: 14px;
          font-weight: 400;
          color: #909399;
        }
        :deep(.el-step__description) {
          // 内容区域
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          padding: 12px 16px;
          background: #f6f7f8;
          margin-bottom: 24px;
        }
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
      }
    }
  }
}
.one_detail {
  margin-top: 6px;
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #909399;
  line-height: 20px;
  white-space: normal;
  word-break: break-all;
}
.one_title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  line-height: 20px;
}
.one_title_right {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 400;
  color: #364fcd;
  line-height: 18px;
  cursor: pointer;
  display: flex;
  vertical-align: middle;
  justify-content: flex-start;
  align-items: center;
  .one_title_right_img {
    width: 14px;
    height: 14px;
    margin-left: 2px;
    img {
      width: 14px;
      height: 14px;
    }
  }
}
</style>
