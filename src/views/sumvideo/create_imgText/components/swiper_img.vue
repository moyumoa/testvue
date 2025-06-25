<template>
  <div class="swiper_dom">
    <!-- 上半部分轮播 -->
    <div class="top_warp">
      <img
        src="https://tagvv-1256030678.file.myqcloud.com/20240914gnk2q.png"
        alt=""
        class="prev_btn"
        @click="prev"
      />
      <el-carousel
        class="banner_swiper"
        ref="topBannerRef"
        height="360px"
        arrow="never"
        :autoplay="false"
        :loop="false"
        @change="carouselChang"
      >
        <el-carousel-item v-for="item in list" :key="item.id">
          <div class="swiper_content">
            <img :src="item.url" alt="" class="item_img" v-if="item.url" />
            <div class="defualut_img_warp" v-else>
              <img
                src="https://tagvv-1256030678.file.myqcloud.com/20240914wo96g.png"
                alt=""
                class="default_img"
              />
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
      <img
        src="https://tagvv-1256030678.file.myqcloud.com/2024091427l5f.png"
        alt=""
        class="next_btn"
        @click="next"
      />
    </div>
  </div>
</template>

<script setup>
import { throttle } from '@/utils/tools'
const props = defineProps({
  list: {
    type: Array,
    default: () => {
      return []
    }
  }
})
const { list } = toRefs(props)
const topBannerRef = ref(null) // 上边轮播图实例
const topcurrentIndex = ref(0) // 上边轮播图当前位置
// 上边轮播图点击上一张
const prev = throttle(function () {
  topBannerRef.value?.prev()
}, 500)
// 上边轮播图点击下一场
const next = throttle(function () {
  topBannerRef.value?.next()
}, 500)
// 上边轮播图窃魂
function carouselChang(e) {
  topcurrentIndex.value = e
}
</script>

<style lang="scss" scoped>
.swiper_dom {
  .top_warp {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 360px;
    .prev_btn,
    .next_btn {
      width: 48px;
      height: 48px;
      min-width: 48px;
      cursor: pointer;
    }
    .prev_btn {
      margin-right: 20px;
    }
    .next_btn {
      margin-left: 20px;
    }
  }
  :deep(.banner_swiper) {
    width: 100%;
    box-sizing: border-box;
    .swiper_content {
      width: 100%;
      height: 100%;
      .item_img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
      }
      .defualut_img_warp {
        width: 100%;
        height: 100%;
        border-radius: 4px;
        background: #f2f3f5;
        display: flex;
        align-items: center;
        justify-content: center;
        .default_img {
          width: 80px;
          height: 80px;
          object-fit: contain;
        }
      }
    }
    .el-carousel__indicators {
      display: none;
    }
  }
}
</style>
