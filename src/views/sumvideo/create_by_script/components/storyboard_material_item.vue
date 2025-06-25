<template>
  <template v-if="props.materialType == 'video'">
    <div
      class="material_item"
      v-for="(sItem, sIndex) in props.mediaList"
      @click.stop="
        sItem.type == 1 || sItem.mediaType == 1 ? videoPreviewFn(sItem) : previewImg(sItem)
      "
      :key="sIndex"
    >
      <!-- 删除按钮 -->
      <div class="del_warp material_action" v-if="props.showDel" @click.stop="checkChange(sItem)">
        <div class="action_right">
          <div class="xm_check_box_round" style="margin-right: 8px">
            <div
              :class="
                props.checkList.includes(sItem.tagvvMediaId || sItem.id)
                  ? 'check_box check_box_active'
                  : 'check_box'
              "
            ></div>
          </div>
        </div>
      </div>
      <!-- <div class="del_warp">
        <img
          v-if="props.showDel"
          src="https://tagvv-1256030678.file.myqcloud.com/2024032998kkl.png"
          alt=""
          class="del_icon"
          @click.stop="delOne(sItem)"
        />
      </div> -->

      <!-- 封面/图片原料 -->
      <!-- <img :src="sItem.coverUrl || sItem.url || sItem.mediaUrl" alt="" class="cover_img" /> -->
      <el-image class="cover_img" :src="sItem.coverUrl || sItem.url || sItem.mediaUrl" fit="cover">
        <template #placeholder>
          <div class="cover_default_img">
            <img src="https://tagvv-1256030678.file.myqcloud.com/20240329g4wnf.png" alt="" />
          </div>
        </template>
      </el-image>
      <!-- 视频的时间 -->
      <div class="video_time" v-if="sItem.type == 1 || sItem.mediaType == 1">
        {{ conversionTime(sItem.duration) }}
      </div>
      <!-- 视频的播放 -->
      <img
        src="https://tagvv-1256030678.file.myqcloud.com/20240329aqyhk.png"
        alt=""
        class="video_preview"
        v-if="sItem.type == 1 || sItem.mediaType == 1"
        @click.stop="videoPreviewFn(sItem)"
      />
      <!-- 图片的icon -->
      <!-- <img
        src="https://tagvv-1256030678.file.myqcloud.com/20240329g4wnf.png"
        alt=""
        
      /> -->
      <div class="video_preview img_preview" @click.stop="previewImg(sItem)" v-else></div>
    </div>
  </template>
  <template v-if="props.materialType == 'audio'">
    <div
      class="audio_item"
      :class="props.audioClass"
      v-for="(item, index) in props.mediaList"
      :key="index"
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
          @click.stop="previewAudio(item)"
        />
      </div>
      <div class="audio_r" @click.stop="checkChange(item)">
        <div class="audio_name">{{ item.name }}</div>
        <div class="info_warp">
          <div class="time_box">
            {{ conversionTime(item.duration) }}
          </div>
        </div>
        <div class="del_warp_audio" v-if="false" @click="delOne(item)">
          <img
            src="https://tagvv-1256030678.file.myqcloud.com/20240422hao8o.png"
            alt=""
            class="del_icon"
          />
        </div>
        <!-- 删除按钮 -->
        <div class="del_warp_audio material_action" v-if="props.showDel">
          <div class="action_right">
            <div class="xm_check_box_round" style="margin-right: 8px">
              <div
                :class="
                  props.checkList.includes(item.tagvvMediaId || item.id)
                    ? 'check_box check_box_active'
                    : 'check_box'
                "
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
import { secToMin, throttle } from '@/utils/tools.js'
const props = defineProps({
  mediaList: {
    type: Array,
    default: () => {
      return []
    }
  },
  materialType: {
    type: String,
    default: 'video' // video 图片和视频 audio音频/bgm
  },
  audioClass: {
    type: Array,
    default: () => {
      return [] // 音频/bgm会有不一样的背景颜色
    }
  },
  showDel: {
    type: Boolean,
    default: false // 是否显示删除按钮
  },
  // scriptId: {
  //   type: Number || String,
  //   default: ''
  // },
  checkList: {
    type: Array,
    default: () => {
      return []
    }
  }
})
const emits = defineEmits(['preview', 'del', 'onCheckChangeFun'])

const delOne = throttle(function (item) {
  emits('del', item)
})

// 将毫秒转换成分秒
function conversionTime(time) {
  return secToMin((time || 0) / 1000)
}
const videoPreviewFn = throttle(function (item) {
  console.log('点击预览视频', item)

  const info = {
    show: true,
    cover: item.coverUrl,
    url: item.url || item.mediaUrl,
    type: 'video',
    title: '预览视频'
  }
  emits('preview', info)
}, 500)
const previewImg = throttle(function (item) {
  console.log('点击预览图片', item)
  const info = {
    show: true,
    url: item.mediaUrl || item.url,
    type: 'image',
    title: '预览图片'
  }
  emits('preview', info)
}, 500)
function previewAudio(item) {
  console.log('查看音频item', item)
  const info = {
    show: true,
    url: item.mediaUrl || item.url,
    type: 'audio',
    title: '预览BGM'
  }
  emits('preview', info)
}

// 设置选中/非选中
const checkChange = throttle(item => {
  if (props.showDel) {
    emits('onCheckChangeFun', item)
  }
})
</script>

<style lang="scss" scoped>
.material_item {
  width: 105px;
  height: 140px;
  min-width: 105px;
  min-height: 140px;
  margin-right: 12px;
  margin-bottom: 12px;
  box-sizing: border-box;
  border-radius: 4px;
  background: #b9b9b9;
  position: relative;
  .del_warp {
    position: absolute;
    bottom: 0px;
    right: 0px;
    cursor: pointer;
    border-radius: 4px;
    z-index: 13;
    padding-bottom: 8px;
    width: 50%;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: flex-end;
    height: 40px;
    .del_icon {
      width: 24px;
      height: 24px;
      object-fit: contain;
      display: flex;
      z-index: 13;
      border-radius: 4px;
    }
  }

  .cover_img {
    cursor: pointer;
    width: 100%;
    height: 100%;
    border-radius: 4px;
    position: absolute;
    top: 0;
    left: 0;
    object-fit: cover;
  }
  .cover_default_img {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    img {
      width: 60px;
      height: 60px;
    }
  }
  .video_time {
    position: relative;
    top: 6px;
    left: 6px;
    padding: 0 4px;
    font-family: PingFangSC, PingFang SC;
    font-weight: 400;
    font-size: 12px;
    color: #ffffff;
    line-height: 14px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 2px;
    width: max-content;
  }
  .video_preview {
    width: 36px;
    height: 36px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    cursor: pointer;
    border-radius: 50%;
  }
  .img_preview {
    width: 60px;
    height: 60px;
    border-radius: unset;
  }
}

.audio_item {
  width: 184px;
  height: 96px;
  padding: 4px;
  margin-right: 12px;
  margin-bottom: 12px;
  display: flex;
  position: relative;
  background: #ffffff;
  border-radius: 4px;
  border: 1px solid transparent;
  cursor: pointer;
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
      bottom: 6px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-left: 8px;
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 12px;
      color: #909399;
      line-height: 17px;
    }
    .del_warp_audio {
      cursor: pointer;
      position: absolute;
      right: 0px;
      bottom: 8px;
      .del_icon {
        width: 24px;
        height: 24px;
        object-fit: contain;
        display: flex;
      }
    }
  }
}
</style>
