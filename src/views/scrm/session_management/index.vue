<template>
  <div class="session_page">
    <!-- 左侧 -->
    <div class="session_left">
      <message-list
        :newMessage="newMessage"
        :newMessageInList="newMessageInList"
        @changeTab="onChangeTab"
        @updateList="getMessageList"
        @getmatrixNumberList="getMatrixNumberList"
        @changeNewMessageInList="changeNewMessageInList"
        @updatePlatform="updatePlatform"
      ></message-list>
    </div>
    <!-- 聊天框 -->
    <div class="session_center">
      <chat-window
        ref="chatWindowRef"
        @sendMessage="sendMessage"
        :newMessage="newMessage"
        @openUseInfo="openUseInfo"
        :platform="platform"
      ></chat-window>
    </div>
    <!-- 右侧 -->
    <div v-if="userInfo" class="session_right" v-click-outside="onClickOutsideUserInfo">
      <div @click="userInfo = false" class="close_button">X</div>
      <right-page :newMessage="newMessage"></right-page>
    </div>
  </div>
</template>
<script setup>
import { useStore } from 'vuex'
// import SockJS from 'sockjs-client/dist/sockjs.min.js'
// import Stomp from 'stompjs'
import messageList from './components/message_list.vue'
import chatWindow from './components/chat_window.vue'
import rightPage from './components/right.vue'
import { readMessage } from '@/api/scrm/session_management.js'
import { handleMessageVo } from './js/tools'
import { ClickOutside } from 'element-plus'
const $store = useStore()
// 聊天对方
const fromChatInfo = computed(() => {
  return $store.state.chat.currentChatUser
})
// 聊天自己
const toChatInfo = computed(() => {
  return $store.state.chat.currentChatMineInfo
})

const messageType = ref(null)
function onChangeTab(type) {
  messageType.value = type
}

const messagelist = ref(null)
function getMessageList(list) {
  messagelist.value = list
}

// 矩阵号列表（接收矩阵号列表-在接收到新消息的时候做判断）
const matrixNumberList = ref(null)
function getMatrixNumberList(list) {
  matrixNumberList.value = list
}

const newMessage = ref(null)
const newMessageInList = ref(false) // 用于判断消息是否存在消息列表当中

// 关闭横幅
function changeNewMessageInList(val) {
  newMessageInList.value = val
}

// 获取Authorization(token权限验证)
const TokenKey = localStorage.getItem('token')
let websocket = null
const brandInfo = JSON.parse(localStorage.getItem('brandInfo'))
// 本地调试用ws
// const url = `ws://${location.host}/ws/msg/scrm/im?deviceId=${brandInfo.brandId}_${TokenKey}`
const url = `wss://${location.host}/ws/msg/scrm/im?deviceId=${brandInfo.brandId}_${TokenKey}`
// 判断当前浏览器是否支持WebSocket
if ('WebSocket' in window) {
  console.log('当前浏览器支持')
  websocket = new WebSocket(url)
} else {
  console.log('当前浏览器不支持')
}

function reconnect() {
  // 先关闭链接在重新连接
  websocket.close(1000)
  setTimeout(() => {
    websocket = new WebSocket(url)
  }, 10000)
}

// 连接发生错误的回调方法
websocket.onerror = function () {
  console.log('WebSocket连接发生错误')
}

// 连接成功建立的回调方法
websocket.onopen = function () {
  console.log('WebSocket连接成功')
}

// 接收到消息的回调方法
websocket.onmessage = function (event) {
  console.log('接收')
  let msgData = JSON.parse(event.data)
  // msgData.data值用来判断是否能收到具体的消息内容
  if (event.data && msgData.data) {
    msgData = msgData.data
  } else {
    console.log('没有接收到消息内容')
    return
  }
  handleMessageVo(msgData, 100, platform.value)
  console.log('消息内容', msgData)

  // 判断是否是当前聊天人
  const isChatting =
    fromChatInfo.value.openId === msgData.fromUserId && toChatInfo.value.openId === msgData.toUserId

  console.log(
    '判断是否是当前聊天人',
    isChatting,
    '当前聊天人信息',
    fromChatInfo.value.openId,
    toChatInfo.value.openId
  )

  // 矩阵号列表左上角有多少条未读的标签
  if (isChatting) {
    // 这种代表是小红书自己发送消息的推送，不算已读
    if (!(msgData.pushSource && msgData.pushSource === 1)) {
      // 设置已读
      readMessage({
        fromUserId: msgData.fromUserId,
        toUserId: msgData.toUserId,
        ts: msgData.msgTime
      }).finally(() => {
        setMessage()
      })
    } else {
      setMessage()
    }
  } else {
    // 这种代表是小红书自己发送消息的推送，不算到消息数量里面
    if (!(msgData.pushSource && msgData.pushSource === 1)) {
      // 新增未读数量
      $store.commit('chat/setUnreadMessageChange', {
        openId: msgData.toUserId,
        changeNum: 1
      })
    }
    setMessage()
  }

  // 处理消息
  function setMessage() {
    // 矩阵号列表是否存在
    const newMatrixNumberList = matrixNumberList.value.filter(item => {
      return item.dyOpenId === msgData.toUserId || item.dyWebUid === msgData.toUserId
    })
    console.log(
      '看看聊天列表的数据',
      matrixNumberList.value,
      newMatrixNumberList,
      msgData,
      toChatInfo.value,
      $store.state.chat,
      fromChatInfo.value,
      msgData.pushSource && msgData.pushSource === 1,
      msgData.toUserId === fromChatInfo.value.openId,
      msgData.fromUserId === toChatInfo.value.openId
    )
    // 消息列表是否存在
    const newMessagelist = messagelist.value.filter(item => item.fromUserId === msgData.fromUserId)
    // 是当前矩阵号过来的消息
    // 判断条件 选了具体的聊天窗口匹配toChatInfo.value.openId   没选择具体的聊天窗口可能是匹配policyOpenId或者policyDyWebUid
    if (
      msgData.toUserId === toChatInfo.value.openId ||
      msgData.toUserId === $store.state.chat.policyOpenId ||
      msgData.toUserId === $store.state.chat.policyDyWebUid
    ) {
      // 是当前的聊天的列表
      if (fromChatInfo.value.openId === msgData.fromUserId) {
        console.log('是当前矩阵号的当前聊天', newMessagelist)
        const _msg = JSON.parse(JSON.stringify(newMessagelist))
        _msg.lastMsgDetail = msgData
        _msg.isChatting = isChatting
        // 如果是当前聊天，未读消息=0
        _msg.unreadMessageCount += 0
        newMessage.value = {
          infoType: msgData.messageType,
          // 是否是互动事件
          isEventMessage: msgData.infoType === 4,
          data: _msg
        }
      } else if (newMessagelist && newMessagelist.length) {
        console.log('存在已有的聊天列表当中')
        const _msg = JSON.parse(JSON.stringify(newMessagelist))
        _msg.lastMsgDetail = msgData
        _msg.isChatting = isChatting
        // 如果不是当前聊天，未读消息+1
        _msg.unreadMessageCount += 1
        newMessage.value = {
          infoType: msgData.messageType,
          // 是否是互动事件
          isEventMessage: msgData.infoType === 4,
          data: _msg
        }
      } else {
        // 这种代表是小红书自己发送消息的推送，不显示刷新消息列表的按钮
        if (!(msgData.pushSource && msgData.pushSource === 1)) {
          newMessageInList.value = true
        }
        console.log('不存在当前聊天列表中，需要做刷新列表按钮的处理')
      }
    } else if (newMatrixNumberList && newMatrixNumberList.length) {
      console.log('存在已有的矩阵号列表当中，通过监听未读消息的增加改变顺序')
    } else {
      // 这种代表是小红书自己发送消息的推送，不显示刷新消息列表的按钮
      if (!(msgData.pushSource && msgData.pushSource === 1)) {
        newMessageInList.value = true
        console.log('不存在当前矩阵号中，需要做刷新列表按钮的处理')
      }
      // 如果是小红书推送过来的消息，并且当前正处于双方的聊天框里就往页面里推送消息
      if (
        msgData.pushSource &&
        msgData.pushSource === 1 &&
        msgData.toUserId === fromChatInfo.value.openId &&
        msgData.fromUserId === toChatInfo.value.openId
      ) {
        newMessage.value = {
          isXHSMsg: 1,
          msgData
        }
      }
    }
  }
}

// 连接关闭的回调方法
websocket.onclose = function (e) {
  console.log('websocket 断开: ' + e.code + ' ' + e.reason + ' ' + e.wasClean)
  if (e.code === 1005 || e.code === 1006) {
    reconnect()
  }
}

// 监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
window.onbeforeunload = function () {
  websocket.close()
}

const userInfo = ref(false)
function onClickOutsideUserInfo(e) {
  // 点集中高低意向的时候不关闭
  const text = e.target.innerHTML
  if (
    text.indexOf('高意向') === -1 &&
    text.indexOf('中意向') === -1 &&
    text.indexOf('低意向') === -1
  ) {
    userInfo.value = false
  }
}

function openUseInfo() {
  userInfo.value = true
}

function sendMessage() {
  console.log('虽然这个方法没有用，但我还是想定义一下，警告的让人难受捏')
}

onBeforeUnmount(() => {
  // client.disconnect()
  websocket.close(1000)
  $store.commit('chat/initChatInfo')
})
const chatWindowRef = ref(null)
const platform = ref(1) // 打开的平台
function updatePlatform(e) {
  // 如果是打开的平台和上一次的平台不一致，就在聊天框里重新显示提示
  if (platform.value !== (e || 1)) {
    chatWindowRef.value.showTip()
  }
  platform.value = e || 1
}
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
.session_page {
  width: 100%;
  height: 100%;
  min-height: 500px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  position: relative;
  .session_left {
    margin-right: 16px;
    height: 100%;
  }
  .session_center {
    flex: 1;
    min-width: 350px;
    height: 100%;
    // padding-right: 16px;
  }
  .session_right {
    height: 100%;
    position: absolute;
    top: 0;
    width: 320px;
    right: -16px;
    box-shadow: -4px 0px 18px 0px #e4e8f7;
    border-radius: 4px 0px 0px 4px;
    background: #f6f8fa;

    .close_button {
      width: 40px;
      height: 40px;
      line-height: 40px;
      background: #364fcd;
      border-radius: 4px 0px 0px 4px;
      z-index: 2;
      position: absolute;
      top: 76px;
      left: -40px;
      text-align: center;
      color: #ffffff;
      font-size: 18px;
      cursor: pointer;
    }
  }
}
</style>
