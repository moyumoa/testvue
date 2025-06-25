<template>
  <div
    class="chat_content"
    :class="{
      right_chat_content: chatInfo.msgContent.sendType == 1,
      left_chat_content: chatInfo.msgContent.sendType == 2,
      special_content: specialTypes.includes(chatInfo.msgContent.msgSubType)
    }"
  >
    <i
      v-if="typeIcons[chatInfo.msgType]"
      class="icon"
      :style="{
        'background-image': `url(${typeIcons[chatInfo.msgType]})`
      }"
    ></i>
    <!-- 消息内容 - start -->
    <template v-if="chatInfo.msgType == MESSAGE_TYPE.get('follow')">
      {{ fromChatInfo.name }}关注了你
    </template>
    <template v-else-if="chatInfo.msgType == MESSAGE_TYPE.get('unfollow')">
      {{ fromChatInfo.name }}取关了你
    </template>
    <template v-else>
      <div
        v-if="chatInfo.msgContent.msgSubType == 'text'"
        style="display: flex; align-items: center"
        v-html="chatInfo.msgContent.content || chatInfo.msgContent.replyCommentContent"
      ></div>
      <div v-else style="display: flex; align-items: center">
        暂不支持的消息类型，请打开{{ platform == 3 ? '小红书' : '抖音' }}APP查看
      </div>
      <!-- <div class="group_invite_msg" v-if="chatInfo.msgContent.msgSubType == 'group_invite'">
        <div class="group_info">
          <img
            class="cover"
            :src="chatInfo.msgContent.sendType === 1 ? chatInfo.toAvatar : chatInfo.fromAvatar"
          />
          <div class="info">
            <div class="title">邀请你加入群聊</div>
            <div class="desc">
              “{{
                chatInfo.msgContent.sendType === 1 ? chatInfo.toNickName : chatInfo.fromNickName
              }}”邀请你加入“{{ chatInfo.msgContent?.groupDetail?.groupName }}”群聊，进
            </div>
          </div>
        </div>
        <div class="text">群聊消息</div>
      </div>
      <template
        v-else-if="chatInfo.msgContent.msgSubType == 'card' && chatInfo.msgContent.cardDetail"
      >
        <div class="card_msg_2" v-if="chatInfo.msgContent.cardDetail.cardType == 2">
          <img
            class="cover"
            src="https://p3.douyinpic.com/aweme/100x100/aweme-avatar/mosaic-legacy_3791_5070639578.jpeg?from=4010531038"
          />
          <div class="link">
            <i></i>
            <span>{{ chatInfo.msgContent.cardDetail.cardContent }}</span>
          </div>
        </div>
        <div
          class="card_msg_5"
          :style="{
            'background-color': chatInfo.msgContent.sendType == 1 ? '#fff' : '#e9edfb'
          }"
          v-else-if="chatInfo.msgContent.cardDetail.cardType == 5"
        >
          {{ chatInfo.msgContent.cardDetail.cardContent }}
        </div>
        <div
          class="card_msg_3"
          :style="{
            'background-color': chatInfo.msgContent.sendType == 1 ? '#fff' : '#e9edfb'
          }"
          v-else
        >
          {{ chatInfo.msgContent.cardDetail.cardContent }}
          <div
            class="card_btn"
            v-for="(btnItem, index) in chatInfo.msgContent.cardDetail.cardActions"
            :key="index"
          >
            {{ btnItem.button_name }}
          </div>
        </div>
      </template>
      <div class="image_msg" v-else-if="chatInfo.msgContent.msgSubType == 'image'">
        <el-image
          style="width: 100px"
          :src="chatInfo.msgContent.mediaDetail.mediaUrl1"
          :preview-src-list="[chatInfo.msgContent.mediaDetail.mediaUrl1]"
          fit="cover"
        />
      </div>
      <div
        v-else
        style="display: flex; align-items: center"
        v-html="chatInfo.msgContent.content || chatInfo.msgContent.replyCommentContent"
      ></div> -->
    </template>
    <!-- 消息内容 - end -->
    <div v-if="chatInfo.msgContent.itemId" class="content_mark" @click="toVideoDetail(chatInfo)">
      视频详情
      <el-icon style="margin-left: 2px"><i-arrow-right /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { MESSAGE_TYPE } from '@/utils/dictionary/session-management'
import { useStore } from 'vuex'

const $store = useStore()
const props = defineProps({
  chatInfo: Object,
  platform: { type: Number, default: 1 }
})
const { chatInfo, platform } = toRefs(props)

const typeIcons = {
  1: 'https://tagvv-1256030678.file.myqcloud.com/2022062391ont.png',
  4: 'https://tagvv-1256030678.file.myqcloud.com/20220623a8oda.png',
  5: 'https://tagvv-1256030678.file.myqcloud.com/20220623akv04.png'
}

// const specialTypes = ['image', 'card', 'group_invite']
const specialTypes = []
function handleData() {
  if (chatInfo.value.msgContent.msgSubType === 'card') {
    const _cardDetail = chatInfo.value.msgContent.cardDetail
    const _cardType = _cardDetail ? _cardDetail.cardType : ''
    if (_cardType === 3 || _cardType === 4 || _cardType === 1) {
      chatInfo.value.msgContent.cardDetail.cardActions = JSON.parse(
        chatInfo.value.msgContent.cardDetail.cardActions
      )
    }
  }
}
handleData()

// 聊天对方
const fromChatInfo = computed(() => {
  return $store.state.chat.currentChatUser
})
// 聊天自己
// const toChatInfo = computed(() => {
//   return $store.state.chat.currentChatMineInfo
// })

// 前往视频详情
function toVideoDetail(item) {
  window.open(
    `/content_center/content_manage/manage_detail?itemId=${encodeURIComponent(
      item.msgContent.itemId
    )}`,
    '_blank'
  )
}
</script>

<style lang="scss" scoped>
.chat_content {
  display: flex;
  align-items: center;
  max-width: calc(100% - 84px);
  font-size: 14px;
  color: #303133;
  line-height: 20px;
  padding: 12px 16px;
  border-radius: 0 4px 4px 4px;
  white-space: pre-wrap;
  word-break: break-all;
  word-wrap: break-word;
  line-break: anywhere;
  position: relative;
  margin-left: 12px;
  background-color: #e9edfb;
  &.right_chat_content {
    margin-right: 12px;
    background: #ffffff;
    border-radius: 4px 0 4px 4px;
  }
  &.special_content {
    padding: 0;
    background-color: transparent !important;
  }
  .icon {
    display: inline-block;
    margin-right: 6px;
    width: 20px;
    height: 20px;
    background-size: cover;
    // transform: scale(2);
  }
  .content_mark {
    cursor: pointer;
    position: absolute;
    bottom: -22px;
    right: 0;
    display: flex;
    align-items: center;
    width: 68px;
    font-size: 12px;
    color: #364fcd;
    line-height: 18px;
  }
  .group_invite_msg {
    width: 256px;
    padding: 0 16px;
    box-sizing: border-box;
    background: #fff;
    border-radius: 4px;
    .group_info {
      display: flex;
      padding: 16px 0;
      .cover {
        flex-shrink: 0;
        width: 56px;
        height: 56px;
        border-radius: 4px;
        margin-right: 8px;
        object-fit: cover;
      }
      .info {
        flex: 1;
        .title {
          font-weight: bold;
        }
        .desc {
          @include mult_line(2);
          margin-top: 2px;
          font-size: 12px;
          color: #8f959e;
          line-height: 17px;
        }
      }
    }
    .text {
      line-height: 18px;
      padding: 4px 0;
      font-size: 12px;
      color: #8f959e;
      border-top: 1px solid #dcdee0;
    }
  }
  .card_msg_2 {
    width: 228px;
    box-sizing: border-box;
    background: #fff;
    border-radius: 4px;
    overflow: hidden;
    .cover {
      width: 228px;
      height: 128px;
      object-fit: cover;
    }
    .link {
      display: flex;
      padding: 8px 12px;
      i {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        margin-right: 4px;
        background-image: url('https://tagvv-1256030678.file.myqcloud.com/20220616wt1cs.png');
        background-size: cover;
      }
      > span {
        flex: 1;
        @include mult_line(1);
        display: inline-block;
        vertical-align: middle;
        color: #364fcd;
        line-height: 20px;
      }
    }
  }
  .card_msg_3 {
    padding: 12px 16px;
    .card_btn {
      margin-top: 12px;
      color: #364fcd;
      line-height: 20px;
    }
  }
  .card_msg_5 {
    padding: 12px 16px;
  }
}
</style>
