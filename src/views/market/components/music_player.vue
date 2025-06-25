<template>
  <div class="music-palyer blog-item" :class="size + '-palyer'">
    <audio
      class="audio"
      :src="bgm.url"
      @canplay="loadSuccess"
      @timeupdate="timeupdate"
      @ended="onEnded"
    ></audio>
    <div class="play_btn" @click="switchPlayerState">
      <img v-if="audio.isPlay" src="https://tagvv-1256030678.file.myqcloud.com/20220329x4i19.png" />
      <img v-else src="https://tagvv-1256030678.file.myqcloud.com/202203296xe9n.png" />
    </div>
    <div class="music-progress">
      <div class="progress-time">{{ audio.currentTime }}/{{ audio.duration }}</div>
      <div class="progress-bar" @mousedown="progressMousedown" ref="progressBar">
        <div class="played-progress-bar" :style="{ width: audio.percent + '%' }">
          <div class="progress-control" ref="progressControl"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    bgm: Object,
    size: {
      type: String,
      default: 'small'
    }
  },
  data() {
    return {
      audio: {
        currentTime: '00:00',
        duration: '00:00',
        percent: 0,
        isDown: false,
        isPlay: false,
        isMute: false,
        volumePercent: 100
      },
      audioELe: null
    }
  },
  mounted() {
    this.audioELe = document.querySelector('.audio')
    this.watchProgress()
  },
  methods: {
    // 加载完成
    loadSuccess() {
      const time = parseInt(this.audioELe.duration)
      this.audio.duration = this.computedTime(time)
    },
    // 播放时更新进度条
    timeupdate() {
      if (this.audio.isDown) return
      const time = parseInt(this.audioELe.duration)
      const curTime = parseInt(this.audioELe.currentTime)
      this.audio.percent = (curTime / time) * 100
      this.audio.currentTime = this.computedTime(curTime)
    },
    onEnded() {
      this.audio.isPlay = false
    },
    // 进度条拖拽
    watchProgress() {
      const that = this
      const progress = this.$refs.progressControl
      const progressBar = this.$refs.progressBar
      const PW = progressBar.offsetWidth // 进度条总宽度
      let newPer = 0
      progress.onmousedown = function (ed) {
        ed.stopPropagation()
        that.audio.isDown = true
        const startX = ed.clientX
        // 已播放宽度 这个要写在内部动态获取
        const palyedW = (that.audio.percent * PW) / 100
        const changeProgerss = function (e) {
          const newX = e.clientX
          const diffX = newX - startX
          newPer = ((diffX + palyedW) / PW) * 100
          if (newPer > 100) newPer = 100
          if (newPer < 0) newPer = 0
          that.audio.percent = newPer
        }
        progress.onmousemove = function (em) {
          em.stopPropagation()
          if (that.audio.isDown) {
            changeProgerss(em)
          }
        }
        progress.onmouseup = function (es) {
          es.stopPropagation()
          that.audio.isDown = false
          changeProgerss(es)
          progress.onmousemove = null
          const time = parseInt(that.audioELe.duration)
          const curTime = parseInt((time * newPer) / 100)
          that.audioELe.currentTime = curTime
          that.audio.currentTime = that.computedTime(curTime)
        }
      }
    },
    // 进度条点击
    progressMousedown(e) {
      const that = this
      const progressBar = this.$refs.progressBar
      const PW = progressBar.offsetWidth
      // 获取元素在页面的坐标 对标事件的clientX
      const position = progressBar.getBoundingClientRect()
      const startX = position.left
      const newX = e.clientX
      const diffX = newX - startX
      let newPer = (diffX / PW) * 100
      if (newPer > 100) newPer = 100
      if (newPer < 0) newPer = 0
      progressBar.onmouseup = function (es) {
        const time = parseInt(that.audioELe.duration)
        const curTime = parseInt((time * newPer) / 100)
        that.audio.percent = newPer
        that.audioELe.currentTime = curTime
        that.audio.currentTime = that.computedTime(curTime)
      }
    },
    // 转换显示时间格式
    computedTime(time) {
      let m = parseInt(time / 60)
      m = m < 10 ? '0' + String(m) : m
      let s = time % 60
      s = s < 10 ? '0' + String(s) : s
      return `${m}:${s}`
    },
    // 暂停/播放
    switchPlayerState() {
      if (this.audioELe.paused) {
        this.audio.isPlay = true
        this.audioELe.play()
      } else {
        this.audio.isPlay = false
        this.audioELe.pause()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.music-palyer {
  padding: 0;
  .audio {
    opacity: 0;
    width: 0;
    height: 0;
  }
  &.small-palyer {
    display: flex;
    align-items: center;
    // height: 66px;
    .play_btn {
      cursor: pointer;
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      margin-right: 8px;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .music-progress {
      flex: 1;
      display: flex;
      align-items: center;
      user-select: none;
      .progress-time {
        flex-shrink: 0;
        font-size: 12px;
        color: #999;
        margin-right: 8px;
      }
      .progress-bar {
        cursor: pointer;
        flex: 1;
        background-color: #cdcdcd;
        height: 2px;
        margin-top: 2px;
        .played-progress-bar {
          position: relative;
          height: 100%;
          background-color: #b7daff;
          .progress-control {
            cursor: pointer;
            position: absolute;
            top: 50%;
            transform: translate(50%, -50%);
            right: 0;
            background-color: #fff;
            border: 1px solid #b7daff;
            width: 10px;
            height: 10px;
            box-sizing: border-box;
            border-radius: 50%;
          }
        }
      }
    }
  }
}
</style>
