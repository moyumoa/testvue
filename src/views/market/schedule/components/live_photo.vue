<template>
  <div
    class="live_wrapper"
    :style="{ width: size + 'px', height: size + 'px' }"
    v-if="liveRoomPhoto"
  >
    <img
      :src="liveRoomPhoto"
      class="live_photo"
      alt=""
      :style="{ width: size + 'px', height: size + 'px' }"
      v-if="liveRoomPhoto"
    />
    <div class="default-img" :style="{ width: size + 'px', height: size + 'px' }" v-else>
      {{ liveRoomName && liveRoomName.toString().slice(liveRoomName.toString().length - 2) }}
    </div>
    <img
      v-if="isBegin || roomStatus == 2"
      class="live_status"
      src="@/assets/images/schedule/live_status.png"
      alt=""
      :style="{ width: size + 2 + 'px', height: size + 2 + 'px' }"
    />
    <img
      v-if="isBegin"
      class="live_ing"
      src="@/assets/images/schedule/live_ing.gif"
      alt=""
      :style="{ top: (size * 42) / 50 + 'px', left: (size * 10) / 50 + 'px' }"
    />
  </div>
</template>

<script>
export default {
  props: {
    size: {
      type: Number,
      default: 50
    },
    roomStatus: {
      type: Number
    },
    liveRoomPhoto: {
      type: String,
      default: ''
    },
    liveRoomName: {
      type: String,
      default: ''
    },
    isBegin: {
      type: [Number, Boolean],
      default: 0
    }
  }
}
</script>
<style lang="scss" scoped>
.live_wrapper {
  position: relative;
  .live_photo {
    margin-right: 8px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }
  .default-img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: $theme-color;
    font-size: 14px;
    line-height: 50px;
    text-align: center;
    color: #fff;
  }
  .live_status {
    position: absolute;
    top: 0;
    left: 0;
  }
  .live_ing {
    width: 6px;
    height: 6px;
    position: absolute;
    top: 42px;
    left: 10px;
  }
}
</style>
