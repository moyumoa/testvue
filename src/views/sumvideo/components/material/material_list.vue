<template>
  <div>
    <!-- 视频 -->
    <div v-if="props.rulesOrigin == 1 || props.rulesOrigin == 2" class="videoElement_box">
      <div
        :class="{
          video_item: true,
          video_item_checked: item.checked
        }"
        v-for="(item, index) in props.list"
        :key="item.id || index"
      >
        <div class="item_top" @click.stop="choseItem(item)">
          <img
            :src="
              item.thumbUrl && item.url ? item.thumbUrl : item.coverUrl || item.url || item.mediaUrl
            "
            alt=""
            class="cover_img"
          />
          <img
            v-if="item.source === 6"
            class="item_xm"
            src="https://tagvv-1256030678.file.myqcloud.com/202405134bhlq.png"
            alt=""
          />
          <img
            v-if="props.showMarkICON && item.markUrl"
            class="item_mark"
            src="https://tagvv-1256030678.file.myqcloud.com/202410210h1pp.png"
            alt=""
          />
          <div class="info_warp">
            <div class="time_box" v-if="item.type == 1 || item.mediaType == 1">
              {{ conversionTime(item.duration) }}
            </div>
            <div v-else></div>
            <div class="select_warp">
              <img
                src="https://tagvv-1256030678.file.myqcloud.com/20240328o5ms2.png"
                alt=""
                class="select_icon"
                v-if="item.checked"
              />
              <img
                src="https://tagvv-1256030678.file.myqcloud.com/20240328hqqm4.png"
                alt=""
                class="select_icon select_icon_active"
                v-else
              />
            </div>
          </div>
          <div class="video_mask" v-if="item.type == 1 || item.mediaType == 1">
            <img
              src="https://tagvv-1256030678.file.myqcloud.com/20221019xwjl7.png"
              alt=""
              class="play_icon"
              @click.stop="previewOne(item)"
            />
          </div>
        </div>
        <div class="item_name" v-if="!props.hideName">{{ item.name }}</div>
      </div>
    </div>
    <!-- 音频 -->
    <div v-if="props.rulesOrigin == 3" class="audioElement_box">
      <div
        :class="{
          audio_item: true,
          video_item_checked: item.checked
        }"
        v-for="(item, index) in props.list"
        :key="index"
        @click.stop="choseItem(item)"
      >
        <div class="audio_l">
          <img
            src="https://tagvv-1256030678.file.myqcloud.com/202403285txln.png"
            alt=""
            class="audio_icon"
          />
          <img
            src="https://tagvv-1256030678.file.myqcloud.com/20221019xwjl7.png"
            alt=""
            class="audio_play_icon"
            @click.stop="previewOne(item)"
          />
          <img
            v-if="item.source === 6"
            class="item_xm"
            src="https://tagvv-1256030678.file.myqcloud.com/202405134bhlq.png"
            alt=""
          />
        </div>
        <div class="audio_r">
          <div class="audio_name" v-if="!props.hideName">{{ item.name }}</div>
          <div class="info_warp">
            <div class="time_box">
              {{ conversionTime(item.duration) }}
            </div>
            <div class="select_warp">
              <img
                src="https://tagvv-1256030678.file.myqcloud.com/20240328o5ms2.png"
                alt=""
                class="select_icon"
                v-if="item.checked"
              />
              <img
                src="https://tagvv-1256030678.file.myqcloud.com/20240328hqqm4.png"
                alt=""
                class="select_icon select_icon_active"
                v-else
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 选择文本 -->
    <div class="textElement_box" v-if="props.rulesOrigin == 4">
      <div
        :class="{
          text_item: true,
          video_item_checked: item.checked
        }"
        v-for="(item, index) in props.list"
        :key="index"
        @click.stop="choseItem(item)"
      >
        <div class="text_warp" :title="item.content">
          {{ item.content || '--' }}
        </div>
        <img
          v-if="item.source === 6"
          class="item_xm"
          src="https://tagvv-1256030678.file.myqcloud.com/202405134bhlq.png"
          alt=""
        />
        <div class="select_warp">
          <img
            src="https://tagvv-1256030678.file.myqcloud.com/20240328o5ms2.png"
            alt=""
            class="select_icon"
            v-if="item.checked"
          />
          <img
            src="https://tagvv-1256030678.file.myqcloud.com/20240328hqqm4.png"
            alt=""
            class="select_icon select_icon_active"
            v-else
          />
        </div>
      </div>
    </div>
    <!-- 场景图 -->
    <div v-if="props.rulesOrigin == 21" class="videoElement_box">
      <div
        :class="{
          video_item: true,
          video_item_checked: item.checked,
          video_item_scene: true
        }"
        v-for="(item, index) in props.list"
        :key="item.id || index"
      >
        <div class="item_top" @click.stop="choseItem(item)">
          <sceneCover
            class="cover_img"
            :isByXM="item.brandId === '0'"
            :list="item.pictures ? JSON.parse(item.pictures) : [{ url: item.url }]"
          />

          <div class="info_warp">
            <div></div>
            <div class="select_warp">
              <img
                src="https://tagvv-1256030678.file.myqcloud.com/20240328o5ms2.png"
                alt=""
                class="select_icon"
                v-if="item.checked"
              />
              <img
                src="https://tagvv-1256030678.file.myqcloud.com/20240328hqqm4.png"
                alt=""
                class="select_icon select_icon_active"
                v-else
              />
            </div>
          </div>
        </div>
        <div class="item_name" v-if="!props.hideName">{{ item.name || '' }}</div>
      </div>
    </div>
    <!-- 预览视频 -->
    <previewDialog v-if="previewInfo.show" :previewDialog="previewInfo" />
  </div>
</template>
<script setup>
import { ELEMENT_TYPE } from '@/utils/dictionary/sumvideo.js'
import { secToMin } from '@/utils/tools.js'
import sceneCover from '@/views/sumvideo/components/scene_cover.vue'

import previewDialog from '@/components/preview_dialog/preview_dialog.vue'

const props = defineProps({
  list: {
    type: Array,
    default: () => {
      return []
    }
  },
  rulesOrigin: {
    type: Number,
    default: null
  }, // 规则来源 // 1视频 2图片 3音频 4文本 41添加文本 16场景图
  hideName: Boolean, // 是否隐藏文件名
  showMarkICON: Boolean // 是否要显示左上角的标识图片
})
const emits = defineEmits(['updateSelect'])

const previewInfo = reactive({
  show: false, // 是否显示预览弹窗
  title: '', // 预览标题
  url: '', // 地址
  type: '', // 类型 video视频 audio音频 image图片
  cover: ''
})
console.log('props.list', props.list)
console.log('props.rulesOrigin', props.rulesOrigin)

// 将毫秒转换成分秒
function conversionTime(time) {
  return secToMin((time || 0) / 1000)
}

// 预览
function previewOne(item) {
  console.log(`预览一个${ELEMENT_TYPE.getCN(item.type === 1 || item.mediaType === 1)}`, item)
  if (item.type === 1 || item.mediaType === 1) {
    previewInfo.show = true
    previewInfo.type = 'video'
    previewInfo.title = '查看视频'
    previewInfo.cover = item.coverUrl
    previewInfo.url = item.url
  }
  if (item.type === 3 || item.mediaType === 3) {
    previewInfo.show = true
    previewInfo.type = 'audio'
    previewInfo.title = '查看音频'
    previewInfo.url = item.url || item.mediaUrl
  }
  if (item.source === 21) {
    previewInfo.show = true
    previewInfo.type = 'scene'
    previewInfo.title = '查看场景图'
    previewInfo.urlList = item.pictures ? JSON.parse(item.pictures) : [{ url: item.url }]
  }
}
// 选择/取消选择
function choseItem(item) {
  emits('updateSelect', item)
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.videoElement_box {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  .video_item {
    width: 90px;
    height: max-content;
    margin-right: 12px;
    margin-bottom: 16px;
    &:nth-of-type(6n) {
      margin-right: 0;
    }
    .item_top {
      box-sizing: border-box;
      display: flex;
      cursor: pointer;
      width: 100%;
      height: 160px;
      position: relative;
      background: #f2f3f5;
      border-radius: 4px;
      border: 2px solid #fff;
      overflow: hidden;
    }
    .item_name {
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: center;
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 12px;
      color: #606266;
      line-height: 17px;
      margin-top: 8px;
    }
    .cover_img {
      object-fit: cover;
      width: 100%;
      height: 100%;
      display: flex;
      overflow-clip-margin: border-box;
      -webkit-overflow-clip-margin: border-box;
    }
    .info_warp {
      position: absolute;
      bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px;
      width: 100%;
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 12px;
      color: #909399;
      .time_box {
        color: #fff;
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        font-size: 12px;
        color: #ffffff;
        line-height: 14px;
        padding: 0 4px;
        height: max-content;
        width: max-content;
        background: rgba(0, 0, 0, 0.4);
        border-radius: 2px;
      }
    }
    .select_warp {
      .select_icon {
        width: 16px;
        height: 16px;
        display: block;
      }
    }
    .video_mask {
      width: max-content;
      height: max-content;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      align-items: center;
      justify-content: center;
      display: none;
      border-radius: 4px;
      z-index: 8;
      .play_icon {
        width: 40px;
        height: 40px;
      }
    }
    &:hover {
      .video_mask {
        display: flex;
      }
    }
  }
  .video_item_checked {
    .item_top {
      border-color: #364fcd;
    }
  }
}
.audioElement_box {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  .audio_item {
    width: 192px;
    height: 96px;
    padding: 4px;
    margin-right: 12px;
    margin-bottom: 12px;
    display: flex;
    position: relative;
    background: #f2f3f5;
    border-radius: 4px;
    border: 1px solid transparent;
    cursor: pointer;
    &:nth-of-type(3n) {
      margin-right: 0;
    }
    .audio_l {
      width: 88px;
      height: 88px;
      min-width: 88px;
      position: relative;
      &:hover .audio_play_icon {
        display: block;
      }

      .audio_icon {
        width: 100%;
        height: 100%;
      }
      .audio_play_icon {
        width: 40px;
        height: 40px;
        // cursor: pointer;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: none;
        z-index: 12;
      }
    }
    .audio_r {
      width: calc(100% - 88px);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .audio_name {
        width: 100%;
        font-size: 12px;
        font-weight: 400;
        color: #303133;
        line-height: 17px;
        margin-top: 2px;
        white-space: pre-wrap;
        height: max-content;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        word-break: break-all;
        line-break: anywhere;
        padding: 0 8px;
      }

      .info_warp {
        position: absolute;
        bottom: 2px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: calc(100% - 96px);
        padding-left: 8px;
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        font-size: 12px;
        color: #909399;
        line-height: 17px;
      }
      .select_warp {
        .select_icon {
          width: 16px;
          height: 16px;
          display: block;
        }
      }
    }
  }
}
.textElement_box {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  .text_item {
    width: 192px;
    height: 84px;
    padding: 8px;
    margin-right: 12px;
    margin-bottom: 12px;
    display: flex;
    position: relative;
    background: #f2f3f5;
    border-radius: 4px;
    border: 1px solid transparent;
    cursor: pointer;
    &:nth-of-type(3n) {
      margin-right: 0;
    }
    .text_warp {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 4;
      overflow: hidden;
      text-overflow: ellipsis;
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 12px;
      color: #606266;
      line-height: 17px;
      padding-right: 8px;
    }
    .select_warp {
      position: absolute;
      right: 8px;
      bottom: 8px;
      .select_icon {
        width: 16px;
        height: 16px;
        display: block;
      }
    }
  }
}
.item_mark {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 20px;
  height: 20px;
  object-fit: contain;
  display: flex;
}
.item_xm {
  position: absolute;
  left: 0;
  top: 0;
  width: 52px;
  height: 52px;
  object-fit: contain;
  transform: rotate(270deg);
  z-index: 10;
}
.video_item_scene {
  width: 120px !important;
  .item_top {
    height: 120px !important;
  }
}
.video_item_scene:nth-of-type(6n) {
  margin-right: 12px !important;
}
</style>
