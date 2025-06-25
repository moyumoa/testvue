<template>
  <div class="storyboard_info">
    <div class="info_left">
      <div class="info_left1" @click.stop="previewFun">
        <!-- 视频 -->
        <img
          class="info_img"
          v-if="info.coverUrl && info.mediaType == 1"
          :src="info.coverUrl"
          alt=""
        />
        <!-- 图片 -->
        <img
          class="info_img"
          v-if="info.aliyunMediaUrl && info.mediaType == 8"
          :src="
            info.aliyunMediaUrl || 'https://tagvv-1256030678.file.myqcloud.com/20231108fm8hm.png'
          "
          alt=""
        />
        <!-- 音频 -->
        <div class="info_img" v-if="info.mediaType == 2">
          <img
            class="info_img_audio"
            src="https://tagvv-1256030678.file.myqcloud.com/20231108x525v.png"
            alt=""
          />
        </div>

        <!-- 文本 -->
        <div class="info_img" v-if="info.mediaType == 3">
          文本
          <br />
          内容
        </div>
        <img
          v-if="info.mediaType == 1"
          class="info_play"
          src="https://tagvv-1256030678.file.myqcloud.com/20240329k6ty6.png"
          alt=""
        />
      </div>
      <div class="info_left2">
        <div class="info_time">
          {{ info.mediaType == 3 ? '字幕' : conversionTime(info.itemDuration) }}
        </div>
        <div :class="['info_tag', `info_tag${info.mediaType}`]">
          {{ info.isBgm ? 'BGM' : MEDIA_TYPE.getCN(info.mediaType) }}
        </div>
      </div>
      <div class="info_left3" :title="info.name">
        <div class="info_title info_title line-hidden1">{{ info.name || '--' }}</div>
      </div>
      <div class="info_tip line-hidden1" :title="info.remark">
        {{ info.remark || ' ' }}
      </div>
    </div>
    <div class="info_right">
      <slot name="rightOperation"></slot>
    </div>
  </div>
</template>
<script setup>
import { MEDIA_TYPE } from '@/utils/dictionary/sumvideo'

import { secToMin, throttle } from '@/utils/tools.js'

const props = defineProps({
  info: {
    type: Object,
    default: () => {
      return {}
    }
  },
  index: {
    type: Number,
    default: null
  }
})
const { info } = toRefs(props)

// 将毫秒转换成分秒
function conversionTime(time) {
  return secToMin((time || 0) / 1000)
}

const emits = defineEmits(['previewFun', 'previewTextFun'])
const previewFun = throttle(() => {
  if (info.value.mediaType === 3) {
    if (info.value.textContent) emits('previewTextFun', info.value.textContent)
    return
  }
  let url = ''
  let cover = ''
  let type = ''
  switch (info.value.mediaType) {
    case 1:
      url = info.value.materialPath || info.value.clipMediaUrl || info.value.aliyunMediaUrl
      type = 'video'
      cover = info.value.coverUrl || null
      break
    case 2:
      url = info.value.clipMediaUrl || info.value.aliyunMediaUrl
      cover = ''
      type = 'audio'
      break

    case 8:
      url = info.value.clipMediaUrl || info.value.aliyunMediaUrl
      cover = info.value.clipMediaUrl || info.value.aliyunMediaUrl
      type = 'image'
      break
  }
  emits('previewFun', '查看' + MEDIA_TYPE.getCN(info.value.mediaType), url, type, cover)
}, 500)
</script>
<style lang="scss" scoped>
@import './scss/step.scss';
</style>
