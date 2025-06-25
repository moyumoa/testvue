<template>
  <div class="emoji">
    <div class="list">
      <!-- <el-tooltip
        placement="top"
        :content="item.tips"
        v-for="(item, index) in emojiList"
        :key="index"
      >
      </el-tooltip> -->
      <template v-if="platform && platform == 3">
        <img
          v-for="(item, index) in XHSEmojiList"
          :key="index"
          :src="`https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xhs/emoji/${item.img}.png`"
          @click="onChooseEmoji(item.img, item.tips)"
        />
      </template>

      <template v-else>
        <img
          v-for="(item, index) in emojiList"
          :key="index"
          :src="`https://applet-1256030678.cos.ap-chengdu.myqcloud.com/emoji/${item.img}.png`"
          @click="onChooseEmoji(item.img, item.tips)"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { emojiList, XHSEmojiList } from '@/utils/emoji'
const props = defineProps({
  platform: { type: Number, default: 1 }
})
const { platform } = toRefs(props)
const emits = defineEmits(['select'])

function onChooseEmoji(img, val) {
  emits('select', img, '[' + val + ']')
}
</script>

<style lang="scss" scoped>
.emoji {
  width: 280px;
  height: 250px;
  overflow: hidden;
  .list {
    margin-top: 50px;
    width: 280px;
    height: 150px;
    padding: 10px 0 10px 16px;
    background: #eee;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    overflow: auto;
    border-radius: 5px;
  }
  img {
    width: 24px;
    height: 24px;
    margin-right: 12px;
    margin-bottom: 8px;
  }
}
</style>
