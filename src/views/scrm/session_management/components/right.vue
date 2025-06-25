<template>
  <div class="right_page">
    <chat-user-info></chat-user-info>
    <interactive-record :newMessage="newMessage"></interactive-record>
  </div>
</template>
<script setup>
import chatUserInfo from './chat_user_info.vue'
import interactiveRecord from './interactive_record.vue'
const props = defineProps({
  newMessage: Object
})
const { newMessage } = toRefs(props)
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.right_page {
  width: 100%;
  height: 100%;
  :deep .tab_box {
    background: #ffffff;
    border-radius: 4px;
    .tab_head {
      box-sizing: border-box;
      width: 100%;
      height: 51px;
      padding-left: 24px;
      border-bottom: 1px solid #dcdee0;
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      line-height: 51px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      img {
        width: 16px;
        height: 16px;
        margin-left: 8px;
      }
    }
  }
}
</style>
