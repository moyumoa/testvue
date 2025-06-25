<template>
  <div
    style="
      position: relative;
      margin-top: 12px;
      width: 100%;
      height: 420px;
      border-radius: 5px;
      overflow: hidden;
      background: #000;
    "
  >
    <!-- 视频主体部分 -->
    <div id="mse"></div>
  </div>
</template>
<script>
import Player from 'xgplayer'
import 'xgplayer/dist/index.min.css'
import HlsPlugin from 'xgplayer-hls'

export default {
  props: {
    videoList: {
      // 视频列表
      type: Array,
      default() {
        return []
      }
    },

    video: {
      // 视频相关信息
      type: Object,
      default() {
        return {}
      }
    },

    videoUrl: {
      type: String,
      default: ''
    },
    videoTime: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      Player: null
    }
  },
  // watch: {
  //   'video.currentTime': {
  //     handler() {
  //       this.timeupdate()
  //     }
  //   }
  // },
  methods: {
    timeupdate(currentTime) {
      this.$emit('timeupdate', currentTime)
    },
    newPlayer() {
      this.Player = new Player({
        lang: 'zh', // 设置中文
        width: 272,
        height: 422,
        id: 'mse',
        isLive: false,
        controls: {
          autoHide: false,
          initShow: true
        },
        playbackRate: [3.0, 2.0, 1.5, 1.0, 0.75, 0.5], // 倍速
        url: this.videoUrl, // hls 流地址
        plugins: [HlsPlugin]
      })
      // 因为直播开播时长和返回的直播录屏时长对不上，所以就不监听播放时间了
      // this.Player.on('timeupdate', e => {
      //   if (e.currentTime) {
      //     this.timeupdate(e.currentTime)
      //   }
      // })
    },
    // 设置播放时间点
    setVideoCurrentTime(time) {
      console.log('设置播放时间点', time)
      this.Player.seek(time)
    },
    setVideoPause() {
      this.Player.pause()
    },
    setVideoPlay() {
      this.Player.play()
    }
  },
  mounted() {
    if (this.videoUrl) {
      this.newPlayer()
    }
  },
  beforeUnmount() {
    this.Player = null
  }
}
</script>
<style scoped lang="scss">
:deep(.xgplayer) {
  .xgplayer-controls svg {
    width: 22px !important;
  }
  .xgplayer-progress-btn {
    background: rgba(255, 94, 94, 0.304093) !important;
    border-color: !important;
    box-shadow: 0 0 1px #ff000062 !important;
  }
  .xgplayer-time {
    margin-left: 0;
    left: 0;
    display: flex !important;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .time-separator {
      margin: 0 4px;
    }
  }
  .xg-right-grid {
    flex-wrap: nowrap !important;
    xg-icon {
      margin-right: 4px !important;
    }
    .xgplayer-fullscreen {
      margin-right: 0 !important;
    }
  }
  .xgplayer-playbackrate {
    .btn-text span {
      background: rgba(255, 255, 255, 0.2) !important;
      min-width: 42px !important;
    }
  }
  .xgplayer-cssfullscreen {
    display: none !important;
    .xg-get-cssfull {
      display: none !important;
    }
  }
  .xg-left-grid,
  .xg-right-grid {
    flex-wrap: nowrap !important;
  }
}
</style>
