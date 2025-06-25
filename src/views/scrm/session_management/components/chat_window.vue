<template>
  <div class="chat_window">
    <!-- 顶部-聊天人 -->
    <div class="chat_window_top">
      <div class="left_top">
        <el-image
          v-if="fromChatInfo.avatar || toChatInfo.name"
          class="user_img"
          :src="fromChatInfo.avatar"
        >
          <template #error>
            <div class="user_img errImg_box"></div>
          </template>
        </el-image>
        <div v-else style="background: #f6f8fa" class="user_img"></div>
        <div class="user_name line-hidden1" v-if="fromChatInfo.name || toChatInfo.name">
          <!-- <el-tooltip
            class="box-item"
            effect="dark"
            placement="top"
            :content="fromChatInfo.name || '匿名客户'"
          >
            {{ fromChatInfo.name || '匿名客户' }}
          </el-tooltip> -->
          {{ fromChatInfo.name || '匿名客户' }}
        </div>
        <div class="user_name none_name" v-else></div>
        <div v-if="false" @click="emits('openUseInfo')" class="connection_detail line-hidden1">
          <img src="https://tagvv-1256030678.file.myqcloud.com/202304138ht3f.png" />
          客户详情
        </div>
      </div>
      <div class="right_top">
        <div v-if="toChatInfo.name" class="user_name line-hidden1" style="text-align: right">
          {{ toChatInfo.name }}
        </div>
        <div class="user_name none_name" v-else></div>
        <el-image class="user_img" v-if="toChatInfo.avatar" :src="toChatInfo.avatar">
          <template #error>
            <div class="user_img errImg_box"></div>
          </template>
        </el-image>

        <div v-else style="background: #f6f8fa" class="user_img"></div>
      </div>
    </div>
    <div class="chat_window_content_wrapper">
      <div class="chat_window_content">
        <template v-if="fromChatInfo.openId">
          <div class="warn_tips" v-if="toChatInfo.isOpenStrategyIm === 0 && !$data.hideTip">
            <img src="https://tagvv-1256030678.file.myqcloud.com/202307315hkac.png" alt="" />
            <div v-if="platform && platform == 1">
              因抖音官方消息发送限制，在客户发送一条消息后，
              <span>24 小时</span>
              内可向客户发送
              <span>6 条</span>
              消息
            </div>
            <div v-else>小红书私信消息可能有延迟，请以app为准</div>
            <img
              class="del_icon"
              src="https://tagvv-1256030678.file.myqcloud.com/20230801omktd.png"
              @click="$data.hideTip = true"
              alt=""
            />
          </div>
          <div class="content_chat" @scroll="onMessageScroll" ref="messageListRef">
            <!-- 聊天内容 -->
            <div class="loading_text" v-if="$data.messageList.length >= 10">
              {{ $data.hasNext ? '加载中...' : '暂无更多消息' }}
            </div>
            <div class="message_item" v-for="(item, index) in $data.messageList" :key="index">
              <!-- 聊天的时间 - 间隔半小时 -->
              <template v-if="index > 0">
                <div
                  class="chat_time"
                  v-if="
                    computedIntervalTime($data.messageList[index - 1].actTime, item.actTime) > 1800
                  "
                >
                  {{ transDate(item.actTime) }}
                </div>
              </template>
              <!-- 自己聊天信息 -->
              <div class="right_chat message_block" v-if="item.msgContent.sendType == 1">
                <!--                scrm五期当item.msgContent.msgSubType的类型为tip时，是发送失败的提示文案-->
                <template v-if="item.msgContent.msgSubType != 'tips'">
                  <!-- 发送失败的icon -->
                  <div
                    class="chat_img_box"
                    v-if="item.sendStatus === 'fail' || item.msgContent.sendStatus == 3"
                  >
                    <img class="chat_img" src="@/assets/images/scrm/session/error.png" />
                  </div>
                  <chat-content :chatInfo="item" :platform="platform"></chat-content>
                  <el-image class="user_img" :src="toChatInfo.avatar">
                    <template #error>
                      <div class="user_img errImg_box"></div>
                    </template>
                  </el-image>
                </template>
                <!--scrm五期当item.msgContent.msgSubType的类型为tip时，是发送失败的提示文案-->
                <div v-if="item.msgContent.msgSubType == 'tips'" class="tips_content">
                  {{ item.msgContent.content }}
                </div>
              </div>
              <!-- 对方聊天信息 -->
              <div
                v-else
                class="left_chat message_block"
                :style="{
                  'margin-bottom': item.msgContent.itemId ? '30px' : '20px'
                }"
              >
                <el-image class="user_img" :src="fromChatInfo.avatar">
                  <template #error>
                    <div class="user_img errImg_box"></div>
                  </template>
                </el-image>
                <chat-content :chatInfo="item" :platform="platform"></chat-content>
              </div>
            </div>
          </div>
          <!-- 发送信息 -->
          <div class="content_action">
            <el-input
              ref="messageInputRef"
              class="orderInput"
              v-model="$data.chatInputValue"
              type="textarea"
              :maxlength="200"
              :autosize="false"
              placeholder="请输入回复内容......"
            />
            <div class="action_bottom">
              <div class="msg_type">
                <div
                  class="type_item"
                  v-click-outside="() => ($data.visibleEmoji = false)"
                  @click="$data.visibleEmoji = true"
                >
                  <Biaoqing></Biaoqing>
                  <div class="emoji_wrapper" @click.stop v-if="$data.visibleEmoji">
                    <emoji @select="onSelectEmoji" :platform="platform"></emoji>
                  </div>
                </div>
                <template v-if="$data.iconShow">
                  <div
                    class="type_item"
                    v-for="(item, index) in $data.msgType"
                    :key="index"
                    @click="selectMsgType(item)"
                  >
                    <component :is="item.icon" />
                    <!-- <i class="iconfont icon" :class="item.icon">{{ item.name }}</i> -->
                  </div>
                </template>
              </div>
              <div>
                <el-button
                  :loading="platform == 3 && !$data.xhsIsSendSuccess"
                  :disabled="platform == 3 && !$data.xhsIsSendSuccess"
                  type="primary"
                  @click="sendMessage('text')"
                >
                  发送
                </el-button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <choose-image-material
      v-if="$data.visibleImageMaterial"
      v-model:show="$data.visibleImageMaterial"
      @confirm="onSelectSpecialReply($event, 'image')"
    ></choose-image-material>
    <choose-message-card
      v-if="$data.visibleMessageCard"
      v-model:show="$data.visibleMessageCard"
      @confirm="onSelectSpecialReply($event, 'card')"
    ></choose-message-card>
    <choose-group-chat
      v-if="$data.visibleGroupChat"
      v-model:show="$data.visibleGroupChat"
      @confirm="onSelectSpecialReply($event, 'group_invite')"
    ></choose-group-chat>
  </div>
</template>
<script setup>
import { useStore } from 'vuex'
import { computedIntervalTime, transDate, handleMessageVo } from '../js/tools'
import { dateFormat } from '@/utils/tools'
import { nextTick } from 'vue'
import {
  // pullXhsMessage,
  sendSessionMessage,
  getUserMessageList
} from '@/api/scrm/session_management'
import chatContent from './chat_content.vue'
import chooseGroupChat from '@/views/scrm/interactive_messages/message_policy/auto_reply_template/choose_group_chat.vue'
import chooseImageMaterial from '@/views/scrm/interactive_messages/message_policy/auto_reply_template/choose_image_material.vue'
import chooseMessageCard from '@/views/scrm/interactive_messages/message_policy/auto_reply_template/choose_message_card.vue'
import Biaoqing from '../icons/Biaoqing.vue'
import Tupian from '../icons/Tupian.vue'
import Kapian from '../icons/Kapian.vue'
import Qunzu from '../icons/Qunzu.vue'
import emoji from './emoji.vue'
import { ClickOutside } from 'element-plus'
// import { useRouter } from 'vue-router'

const props = defineProps({
  platform: { type: Number, default: 1 },
  newMessage: Object
})
const { newMessage, platform } = toRefs(props)
const $store = useStore()
const emits = defineEmits(['sendMessage', 'openUseInfo'])
const messageListRef = ref(null)
const $data = reactive({
  pageNo: 1,
  hasNext: true,
  listLoading: false,
  messageList: [],
  oldScrollTop: 0,
  chatInputValue: '',
  msgType: [
    {
      value: 'image',
      icon: Tupian
    },
    {
      value: 'card',
      icon: Kapian
    },
    {
      value: 'group_invite',
      icon: Qunzu
    }
  ],
  visibleImageMaterial: false,
  visibleMessageCard: false,
  visibleGroupChat: false,
  visibleEmoji: false,
  iconShow: false,
  hideTip: false,
  xhsIsSendSuccess: true // 小红书消息是否发送成功，因为小红书消息如果发送成功是send接口返回成功并且socket返回消息才算真的成功
})
// const router = useRouter()

// 聊天对方
const fromChatInfo = computed(() => {
  return $store.state.chat.currentChatUser
})
// 聊天自己
const toChatInfo = computed(() => {
  return $store.state.chat.currentChatMineInfo
})

function resetChatMessage() {
  $data.pageNo = 1
  $data.messageList = []
  $data.hasNext = true
  getUserChatMessage(scrollToBottom)
}
// 获取聊天记录
function getUserChatMessage(callback) {
  if ($data.listLoading) return
  $data.listLoading = true
  // // 根据用户来源区分时候可以发送特殊消息
  // if (
  //   fromChatInfo.value.source &&
  //   fromChatInfo.value.source >= 200 &&
  //   fromChatInfo.value.source < 300
  // ) {
  //   $data.iconShow = false
  // } else {
  //   $data.iconShow = true
  // }
  getUserMessageList({
    pageNo: $data.pageNo,
    pageSize: 30,
    fromUserId: fromChatInfo.value.openId,
    toUserId: toChatInfo.value.openId,
    type: 1
  })
    .then(res => {
      $data.hasNext = res.data.hasNext
      const _list = res.data.records || []
      _list.forEach(e => {
        handleMessageVo(e, 100, platform.value)
      })
      $data.messageList = _list.concat($data.messageList)
      $data.pageNo++
      callback && callback()
    })
    .finally(() => {
      $data.listLoading = false
    })
}
// 滚动至最新消息
function scrollToBottom() {
  nextTick(() => {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  })
}

function selectMsgType(item) {
  if (item.value === 'image') {
    $data.visibleImageMaterial = true
  }
  if (item.value === 'card') {
    $data.visibleMessageCard = true
  }
  if (item.value === 'group_invite') {
    $data.visibleGroupChat = true
  }
}

// 选择特殊消息
function onSelectSpecialReply(data, type) {
  switch (type) {
    case 'image':
      sendMessage('image', data, data.mediaId)
      break
    case 'card':
      sendMessage('card', data, data.cardId)
      break
    case 'group_invite':
      sendMessage('group_invite', data, data.groupId)
      break
  }
}

const messageInputRef = ref(null)

function onSelectEmoji(img, val) {
  $data.visibleEmoji = false
  const _start = messageInputRef.value.textarea.selectionStart
  $data.chatInputValue =
    $data.chatInputValue.slice(0, _start) + val + $data.chatInputValue.slice(_start)
}

// 发送数据
function sendMessage(messageType = 'text', specialData, specialId) {
  if (!$data.chatInputValue.trim() && messageType === 'text') return
  // 如果上一条消息还没发送成功，就不允许发送下一条
  if (platform.value === 3 && !$data.xhsIsSendSuccess) return
  $data.xhsIsSendSuccess = false
  let _message
  if (messageType === 'text') {
    _message = $data.chatInputValue
  } else {
    const emnu = {
      image: '图片',
      card: '卡片消息',
      group_invite: '群聊邀请'
    }
    _message = emnu[messageType]
  }
  const messageInfo = {
    fromNickName: fromChatInfo.value.name,
    fromAvatar: fromChatInfo.value.avatar,
    toNickName: toChatInfo.value.name,
    toAvatar: toChatInfo.value.avatar,
    sendStatus: 'loading',
    actTime: dateFormat(new Date(), 'YYYY-MM-DD hh:mm:ss'),
    msgContent: {
      msgSubType: messageType,
      content: _message,
      sendType: 1
    }
  }
  switch (messageType) {
    case 'image':
      messageInfo.msgContent.mediaDetail = specialData
      break
    case 'card':
      messageInfo.msgContent.cardDetail = specialData
      break
    case 'group_invite':
      messageInfo.msgContent.groupDetail = specialData
      break
  }
  handleMessageVo(messageInfo, 100, platform.value)
  $data.chatInputValue = ''
  // 抖音平台是点击发送了就往消息列表里插入数据，如果接口返回失败，则加一个失败的消息
  // 小红书是发送接口告诉发送成功，并且scoket接收到消息才去插入数据
  if (platform.value === 1) {
    $data.messageList.push(messageInfo)
  }
  emits('sendMessage')
  $store.commit('chat/setSendMessageInfo', {
    fromOpenId: fromChatInfo.value.openId,
    actTime: messageInfo.actTime,
    msgContent: {
      msgSubType: messageType,
      content: _message
    }
  })
  const sendParam = {
    contentType: messageType,
    contextStr: messageType === 'text' ? _message : specialId,
    fromUserId: fromChatInfo.value.openId,
    toUserId: toChatInfo.value.openId
  }
  sendSessionMessage(sendParam)
    .then(res => {
      if (res.data.msgContent && res.data.msgContent.msgSubType !== 'tips') {
        messageInfo.sendStatus = 'success'
        if (platform.value === 3) {
          // 发送成功，等消息推送过来才改变状态
        }
      } else {
        messageInfo.sendStatus = 'fail'
        // 小红书发送失败，就直接插数据
        if (platform.value === 3) {
          $data.messageList.push(messageInfo)
        }
        // 如果消息发送失败 需要在构造一个塞入
        const failMessageInfo = res.data
        $data.messageList.push(failMessageInfo)
        // 用来强制触发页面渲染
        $data.chatInputValue = ' '
        $data.chatInputValue = ''

        $data.xhsIsSendSuccess = true
        scrollToBottom()
      }
    })
    .catch(() => {
      messageInfo.sendStatus = 'fail'
      // 用来强制触发页面渲染
      $data.chatInputValue = ' '
      $data.chatInputValue = ''
      $data.xhsIsSendSuccess = true
    })
  scrollToBottom()
}
// 滚动监听
const onMessageScroll = function (e) {
  if (!$data.hasNext) return
  const el = e.target
  if ($data.oldScrollTop > el.scrollTop && el.scrollTop < 10) {
    const oldScrollHeight = messageListRef.value.scrollHeight
    getUserChatMessage(() => {
      nextTick(() => {
        const newScrollHeight = messageListRef.value.scrollHeight
        messageListRef.value.scrollTop = newScrollHeight - oldScrollHeight - 50
      })
    })
  }
  $data.oldScrollTop = el.scrollTop
}
// // 去开启策略
// const toStrategy = () => {
//   console.log('')
//   router.push({
//     path: '/scrm/message_policy',
//     query: {
//       dyNickname: toChatInfo.value.name
//     }
//   })
// }

// 监听聊天人变化
watch(
  () => fromChatInfo.value,
  newVal => {
    if (newVal && newVal.openId) {
      resetChatMessage()
      $data.chatInputValue = ''
      $data.xhsIsSendSuccess = true
    }
  },
  { deep: true, immediate: true }
)
// 获取最新消息
watch(
  () => newMessage.value,
  newVal => {
    // 小红书发出去的消息
    if (newVal && newVal.isXHSMsg && newVal.isXHSMsg === 1) {
      // 构造新的项 把新的消息塞进去
      const msgData = JSON.parse(JSON.stringify(newVal.msgData))
      const newItem = {
        actTime: msgData.createAt,
        msgContent: {
          content: msgData.content,
          sendType: msgData.messageType || 1,
          msgSubType: 'text'
        }
      }
      handleMessageVo(newItem, 100, platform.value)
      // 这里要注意因为不是实时推送，是5秒/次的定时器触发后才取检查有没有消息，然后推送过来
      // 所以最新的消息可能最先推送过来
      const iii = $data.messageList.findIndex(
        xxx =>
          new Date(xxx.actTime.replace(/-/g, '/')) > new Date(msgData.createAt.replace(/-/g, '/'))
      )
      if (iii > -1) {
        $data.messageList.splice(iii, 0, newItem)
      } else {
        $data.messageList.push(newItem)
      }

      $data.xhsIsSendSuccess = true
      scrollToBottom()
      return
    }
    if (newVal && newVal.data && newVal.data.lastMsgDetail && !newVal.isEventMessage) {
      console.log('聊天窗口新消息', newVal)
      const info = JSON.parse(JSON.stringify(newVal.data))
      if (
        fromChatInfo.value.openId === info[0].fromUserId &&
        toChatInfo.value.openId === info[0].toUserId
      ) {
        // 构造新的项 把新的消息塞进去
        const newItem = {
          actTime:
            platform.value === 3
              ? newVal.data.lastMsgDetail.createAt || newVal.data.lastMsgDetail.msgTime
              : newVal.data.lastMsgDetail.msgTime,
          msgContent: {
            content: newVal.data.lastMsgDetail.content,
            sendType: 2,
            msgSubType: 'text'
          }
        }
        handleMessageVo(newItem, 100, platform.value)
        if (platform.value === 3) {
          const iii = $data.messageList.findIndex(
            xxx =>
              new Date(xxx.actTime.replace(/-/g, '/')) >
              new Date(
                (newVal.data.lastMsgDetail.createAt || newVal.data.lastMsgDetail.msgTime).replace(
                  /-/g,
                  '/'
                )
              )
          )

          if (iii > -1) {
            $data.messageList.splice(iii, 0, newItem)
          } else {
            $data.messageList.push(newItem)
          }
        } else {
          $data.messageList.push(newItem)
        }

        scrollToBottom()
      }
    }
  },
  { deep: true, immediate: true }
)

// 显示提示语
function showTip() {
  if ($data.hideTip) {
    $data.hideTip = false
  }
}
defineExpose({
  showTip
})
</script>

<script>
export default {
  directives: { ClickOutside }
}
</script>

<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.chat_window {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 4px;
  .chat_window_top {
    padding: 16px 36px 12px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .user_img {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: 50%;
    }
    .user_name {
      //width: calc(100% - 60px);
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      line-height: 22px;
    }
    .none_name {
      width: 96px;
      height: 22px;
      background: #f6f8fa;
      border-radius: 1px;
    }
    .left_top {
      width: 48%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .user_name {
        margin-left: 12px;
      }
    }
    .right_top {
      width: 48%;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      .user_name {
        margin-right: 12px;
      }
    }
  }
  .chat_window_content_wrapper {
    width: 100%;
    height: calc(100% - 76px);
    padding: 0 16px 16px 16px;
    .chat_window_content {
      position: relative;
      height: 100%;
      width: 100%;
      background: #f6f8fa;
      border-radius: 4px;
      padding: 20px 0 20px 0;
      .warn_tips {
        width: calc(100% - 159px);
        z-index: 10;
        position: absolute;
        top: 20px;
        left: 76px;
        // left: 50%;
        // transform: translateX(-50%);
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        background: #fff5ed;
        border-radius: 2px;
        border: 1px solid #f1924e;
        font-size: 14px;
        font-weight: 400;
        color: #323233;
        line-height: 20px;
        padding: 11px 16px 11px 16px;
        img {
          width: 16px;
          height: 16px;
          object-fit: contain;
          display: flex;
          margin-right: 10px;
          margin-top: 2px;
        }
        div {
          width: calc(100% - 58px);
          // display: flex;
          // flex-direction: row;
          // justify-content: flex-start;
          // align-items: center;
          // flex-wrap: wrap;
          span {
            font-weight: 600;
          }
        }
        .del_icon {
          cursor: pointer;
          width: 18px;
          height: 18px;
          object-fit: contain;
          display: flex;
          margin: 0 0 0 14px;
        }
      }
      .loading_text {
        color: #bec4ce;
        line-height: 17px;
        text-align: center;
        margin-bottom: 20px;
      }
      .content_chat {
        width: 100%;
        overflow-y: auto;
        margin-bottom: 20px;
        padding: 0 24px;
        height: calc(100% - 140px);
        .message_item {
          margin-bottom: 20px;
          .chat_time {
            width: 100%;
            text-align: center;
            font-size: 12px;
            color: #bec4ce;
            line-height: 17px;
            margin-bottom: 15px;
          }
          .message_block {
            width: 100%;
            display: flex;
            flex-direction: row;
            .user_img {
              width: 40px;
              height: 40px;
              border-radius: 50%;
            }
          }
          .left_chat {
            justify-content: flex-start;
            align-items: flex-start;
          }
          .right_chat {
            justify-content: flex-end;
            align-items: flex-start;
            .chat_img_box {
              width: 14px;
              height: 44px;
              // margin-right: 10px;
              display: flex;
              flex-direction: row;
              justify-content: center;
              align-items: center;
              .chat_img {
                width: 14px;
                height: 14px;
              }
            }
          }
        }
      }
      // 发送框
      .content_action {
        width: 100%;
        height: 120px;
        padding: 0 24px;
        :deep(.el-textarea__inner) {
          height: 76px;
          resize: none;
        }
        .action_bottom {
          margin-top: 12px;
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: flex-start;
          .msg_type {
            display: flex;
            .type_item {
              position: relative;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 24px;
              height: 24px;
              border-radius: 4px;
              margin-right: 10px;
              &:hover {
                background: rgba(0, 0, 0, 0.1);
              }
              .emoji_wrapper {
                position: absolute;
                top: -212px;
                left: -10px;
              }
            }
          }
        }
      }
    }
  }
}
.tips_content {
  width: 100%;
  text-align: center;
  font-size: 12px;
  font-weight: 400;
  color: #8f939a;
  line-height: 20px;
}
.connection_detail {
  width: 92px;
  height: 28px;
  text-align: center;
  line-height: 28px;
  border-radius: 4px;
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #364fcd;
  cursor: pointer;
  margin-left: 8px;
  img {
    width: 16px;
    height: 16px;
    vertical-align: -3px;
  }
}
.connection_detail:hover {
  background: #e9edfb;
  border-radius: 4px;
}
</style>
