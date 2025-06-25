<template>
  <div
    class="preview_page"
    :style="{
      width: `${props.bigWidth}px`
    }"
  >
    <!-- 大图预览 -->
    <div class="preview_big">
      <el-carousel
        :loop="false"
        ref="carouselRef"
        :class="{ big_swiper: true, big_swiper_2: imgAspectRatio !== 1 }"
        trigger="click"
        :height="`${bigImgHeight}px`"
        v-if="props.imgList.length > 1"
        :interval="3000"
        :autoplay="false"
        :initial-index="imgIndex"
        :arrow="props.operButPosition == 'offset' ? 'always' : 'hover'"
        @change="bigChangeFun"
        indicator-position="none"
      >
        <el-carousel-item v-for="(item, index) in props.imgList" :key="index">
          <div
            class="default_box"
            :style="{
              height: `${bigImgHeight}px`,
              width: bigImgWidth ? `${bigImgWidth}px` : '100%'
            }"
          >
            <el-image
              v-if="item.url"
              class="big_img"
              :src="item.url"
              fit="contain"
              :preview-src-list="acceptPreivew ? previewSrcList : []"
              :initial-index="index"
              preview-teleported
            >
              <template #placeholder>
                <div class="image_placeholder_loading">
                  <div class="image_placeholder_icon"></div>
                </div>
              </template>
            </el-image>
            <div v-else class="default_cover">
              <img src="https://tagvv-1256030678.file.myqcloud.com/20240914lrejw.png" alt="" />
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
      <!-- 轮播图只有一张 -->
      <div
        :style="{
          height: `${bigImgHeight}px`,
          width: bigImgWidth ? `${bigImgWidth}px` : '100%'
        }"
        class="default_box"
        v-else-if="props.imgList.length == 1"
      >
        <el-image
          v-if="props.imgList[0].url"
          class="big_img"
          :src="props.imgList[0].url"
          fit="contain"
          :preview-src-list="acceptPreivew ? previewSrcList : []"
          :initial-index="0"
          preview-teleported
        >
          <template #placeholder>
            <div class="image_placeholder_loading">
              <div class="image_placeholder_icon"></div>
            </div>
          </template>
        </el-image>
        <!-- <img v-if="props.imgList[0].url" class="big_img" :src="props.imgList[0].url" alt="" /> -->
        <div v-else class="default_cover">
          <img src="https://tagvv-1256030678.file.myqcloud.com/20240914lrejw.png" alt="" />
        </div>
      </div>
    </div>
    <!-- 小图排列 -->
    <div class="preview_small_parent">
      <div
        class="preview_small"
        :style="{
          paddingBottom: props.imgList && props.imgList.length > 4 ? '4px' : '0',
          height: `${
            props.smallHeight + 16 + (props.imgList && props.imgList.length > 4 ? 16 : 8)
          }px`
        }"
        ref="smallRef"
        v-if="props.imgList && props.imgList.length > 1"
      >
        <div class="small_scroll">
          <div
            :ref="smallContentRef"
            :class="{ one_small: true, choose_small: imgIndex == index }"
            v-for="(item, index) in props.imgList"
            :key="index"
            @click="smallChangeFun(index)"
            :style="{
              width:
                imgIndex == index
                  ? `${(props.smallHeight + 2) * imgAspectRatio}px`
                  : `${props.smallHeight * imgAspectRatio}px`,
              height: imgIndex == index ? `${props.smallHeight + 2}px` : `${props.smallHeight}px`
            }"
          >
            <img
              class="small_img"
              v-if="item.thumbUrl || item.url"
              :src="item.thumbUrl || item.url"
              alt=""
            />
            <div v-else class="default_cover">
              <img src="https://tagvv-1256030678.file.myqcloud.com/20240914lrejw.png" alt="" />
            </div>
          </div>
        </div>
      </div>
      <div
        :style="{
          height: `${
            props.smallHeight + 16 + (props.imgList && props.imgList.length > 4 ? 12 : 8)
          }px`
        }"
        class="small_mask_left"
      ></div>
      <div
        :style="{
          height: `${
            props.smallHeight + 16 + (props.imgList && props.imgList.length > 4 ? 12 : 8)
          }px`
        }"
        class="small_mask_right"
      ></div>
    </div>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools'

const props = defineProps({
  bigWidth: {
    type: Number,
    default: 271
  }, // 大图的宽度 大图基本是1:1
  smallHeight: {
    type: Number,
    default: 52
  }, // 小图的高度
  imgList: {
    type: Array,
    default: () => {
      return []
    }
  },
  operButPosition: {
    type: String,
    default: 'inset' // 操作按钮位置 inset在图片内 offset在图片外
  },
  bigImgWidth: {
    type: Number,
    default: null // 大的图片宽度
  },
  imgAspectRatio: {
    type: Number,
    default: 1 // 图片宽高比 宽：高
  },
  acceptPreivew: {
    type: Boolean,
    default: false
  } // 支持图片放大预览
})

const { bigWidth, bigImgWidth, imgAspectRatio, acceptPreivew } = toRefs(props)
// 计算大图的高度
const bigImgHeight = computed(() => {
  let h = bigWidth.value
  if (bigImgWidth.value) {
    h = bigImgWidth.value / imgAspectRatio.value
  }
  return h
})

const imgIndex = ref(0)
function bigChangeFun(e) {
  imgIndex.value = e
}
const carouselRef = ref()
const smallChangeFun = throttle(e => {
  if (imgIndex.value === e) return
  imgIndex.value = e
  carouselRef.value?.setActiveItem(e)
})
const smallRef = ref()

const oneSmallRef = ref([])
const smallContentRef = el => {
  oneSmallRef.value.push(el)
}
watch(
  () => imgIndex.value,
  val => {
    console.log('val', val, oneSmallRef.value[val], oneSmallRef.value[val].offsetLeft)
    // oneSmallRef.value[val].scrollIntoView({ behavior: 'smooth' })
    // const left = oneSmallRef.value[val].offsetLeft
    // if (left > 271 / 2) {
    //   smallRef.value.scrollTo({
    //     left: left - 271 / 2,
    //     behavior: 'smooth'
    //   })
    // } else {
    //   smallRef.value.scrollTo({
    //     left: 0,
    //     behavior: 'smooth'
    //   })
    // }
    const w = parseInt(props.smallHeight * imgAspectRatio.value)
    // 8是每个小图的间距 14是第一个小图距离左边的间距
    smallRef.value.scrollTo({
      left: val > 2 ? (val - 2) * (w + 8) + 14 : 0,
      behavior: 'smooth'
    })
    console.log('xxxx', smallRef.value.scrollLeft)
  },
  { deep: true }
)
const previewSrcList = ref([])
onMounted(() => {
  previewSrcList.value = props.imgList.map(x => x.url)
})
</script>
<style lang="scss" scoped>
.preview_page {
  width: 100%;
  .default_cover {
    background: #f2f3f5;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    img {
      display: flex;
      width: 80px;
      height: 80px;
      object-fit: contain;
    }
  }
  .default_box {
    width: 100%;
    .big_img {
      margin: 0 auto;
      display: flex;
      max-width: 100%;
      height: 100%;
      object-fit: contain;
      overflow-clip-margin: border-box;
      -webkit-overflow-clip-margin: border-box;
    }
  }
  .preview_big {
    width: 100%;
    .big_swiper_2 {
      .el-carousel__item {
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
  .preview_small {
    position: relative;
    padding-top: 16px;
    width: 100%;
    overflow-y: hidden;
    overflow-x: auto;
    transition: all 0.15s;
    .default_cover img {
      width: 30px;
      height: 30px;
    }

    .small_scroll {
      width: max-content;
      height: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;

      .one_small {
        cursor: pointer;
        border-radius: 4px;

        .small_img {
          overflow-clip-margin: border-box;
          -webkit-overflow-clip-margin: border-box;
          border-radius: 4px;
          width: 100%;
          height: 100%;
          display: flex;
          object-fit: cover;
        }
      }
      .default_cover {
        border-radius: 4px;
        border: 1px solid #e4e5e6;
      }
      .choose_small {
        padding: 1px;
        outline: 2px solid #364fcd;
        .default_cover {
          width: calc(100% - 1px);
          height: calc(100% - 1px);
          margin: 1px 0 0 1px;
          border: 1px solid transparent;
        }
      }
      .one_small:first-child {
        margin-left: 14px;
      }
      .one_small:last-child {
        margin-right: 14px;
      }
      .one_small + .one_small {
        margin-left: 8px;
      }
    }
  }
  .preview_small_parent {
    position: relative;
  }
  .small_mask_left {
    width: 14px;
    background: linear-gradient(90deg, #fff 50%, transparent);
    position: absolute;
    left: 0;
    top: 0;
  }

  .small_mask_right {
    width: 14px;
    background: linear-gradient(-90deg, #fff 50%, transparent);
    position: absolute;
    right: 0;
    top: 0;
  }
}
:deep(.el-carousel__arrow) {
  display: flex;
  font-size: 22px;
  font-weight: 800;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
}
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
</style>
