<template>
  <div
    class="brand-avatar-wrapper"
    :class="{
      'live-breath': isBreath
    }"
    :style="{ width: size + 'px', height: size + 'px' }"
  >
    <div class="brand-avatar">
      <img
        class="cover"
        :src="cover || 'https://tagvv-1256030678.file.myqcloud.com/20220414mh1o3.png'"
      />
    </div>
    <div class="brand-avatar-line-in"></div>
    <div class="brand-avatar-line-out"></div>
  </div>
</template>

<script>
export default {
  props: {
    // 开启呼吸灯
    isBreath: {
      type: Boolean,
      default: true
    },
    // 呼吸灯容器图片
    cover: {
      type: String
    },
    // 呼吸灯大小 px
    size: {
      type: Number,
      default: 38
    }
  }
}
</script>

<style lang="scss" scoped>
$lampColor: rgba(
  $color: #eb4d78,
  $alpha: 0.41
);
.brand-avatar-wrapper {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  font-size: 0;
  .brand-avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    position: relative;
    .live-icon {
      display: none;
      position: absolute;
      top: 0;
      left: 50%;
      width: 26px;
      height: 9px;
      z-index: 1;
      transform: translateX(-50%);
    }
    .cover {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: fill;
    }
  }
  &.live-breath {
    position: relative;
    .brand-avatar {
      box-sizing: border-box;
      animation: live-box 1s linear 0s infinite both;
      .live-icon {
        display: block;
      }
    }
    .brand-avatar-line-in,
    .brand-avatar-line-out {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0);
      border-radius: 50%;
      border: 1px solid $lampColor;
    }
    .brand-avatar-line-in {
      border: 1px solid $lampColor;
      animation: live-in 1s linear 0s infinite both;
    }
    .brand-avatar-line-out {
      border: 1px solid $lampColor;
      animation: live-out 1s linear 0s infinite both;
    }
  }
}

@keyframes live-box {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes live-in {
  0% {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  50% {
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
  }
  80%,
  100% {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
@keyframes live-out {
  0% {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  50% {
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
  }
  70% {
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
  }
  100% {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
</style>
