<template>
  <div class="live_animation_all">
    <div class="live_animation_box">
      <div class="living_animation">
        <p></p>
        <p></p>
        <p></p>
      </div>
      <!-- <img src="@/assets/images/content_center/loading.gif" alt="" /> -->
      <!-- 注释的是loding以中间轴为基准的动画 -->
      <!-- <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        width="12px"
        height="12px"
        viewBox="0 0 24 30"
        style="enable-background: new 0 0 50 50; margin-right: 4px"
        xml:space="preserve"
      >
        <rect x="0" y="9.22656" width="4" height="12.5469" fill="#fff">
          <animate
            attributeName="height"
            attributeType="XML"
            values="5;21;5"
            begin="0s"
            dur="0.6s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y"
            attributeType="XML"
            values="13; 5; 13"
            begin="0s"
            dur="0.6s"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="10" y="5.22656" width="4" height="20.5469" fill="#fff">
          <animate
            attributeName="height"
            attributeType="XML"
            values="5;21;5"
            begin="0.15s"
            dur="0.6s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y"
            attributeType="XML"
            values="13; 5; 13"
            begin="0.15s"
            dur="0.6s"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="20" y="8.77344" width="4" height="13.4531" fill="#fff">
          <animate
            attributeName="height"
            attributeType="XML"
            values="5;21;5"
            begin="0.3s"
            dur="0.6s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y"
            attributeType="XML"
            values="13; 5; 13"
            begin="0.3s"
            dur="0.6s"
            repeatCount="indefinite"
          />
        </rect>
      </svg> -->
      直播中
    </div>
  </div>
</template>
<script setup></script>
<style lang="scss" scoped>
.live_animation_box {
  width: 100%;
  height: 18px;
  background: rgba(239, 62, 61, 0.8);
  border-radius: 4px;
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  font-weight: 400;
  color: #ffffff;
  line-height: 18px;
  img {
    display: flex;
    height: 10px;
    object-fit: contain;
    margin-right: 2px;
  }
}
.living_animation {
  margin-right: 4px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-end;
  height: 10px;
  text-align: center;
  width: 11px;
  p {
    border-radius: 11px;
    background-color: #fff;
    height: 100%;
    width: 2px;
    display: inline-block;

    &:first-child {
      animation: living_animation 1s linear infinite;
    }
    &:nth-child(2) {
      animation: living_animation2 1s linear infinite;
    }
    &:last-child {
      animation: living_animation3 1s linear infinite;
    }
  }
  p + p {
    margin-left: 2px;
  }
  @keyframes living_animation {
    0% {
      height: 3px;
    }

    25% {
      height: 6px;
    }

    50% {
      height: 10px;
    }
    75% {
      height: 6px;
    }

    100% {
      height: 3px;
    }
  }
  @keyframes living_animation2 {
    0% {
      height: 6px;
    }

    25% {
      height: 10px;
    }

    50% {
      height: 6px;
    }
    75% {
      height: 3px;
    }

    100% {
      height: 6px;
    }
  }
  @keyframes living_animation3 {
    0% {
      height: 10px;
    }

    25% {
      height: 6px;
    }

    50% {
      height: 3px;
    }
    75% {
      height: 6px;
    }

    100% {
      height: 10px;
    }
  }
}
</style>
