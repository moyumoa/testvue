<template>
  <div
    :class="[
      'one_preview',
      'banner_preview',
      props.data.err ? 'err_preview' : '',
      props.chooseTab === 'mission:banner' ? 'choose_preview' : ''
    ]"
  >
    <!-- 背景白色 -->
    <div class="back_box"></div>
    <!-- 具体信息 -->
    <div class="banner_content">
      <!-- 如果轮播图超过1张 -->
      <el-carousel
        class="banner_swiper"
        trigger="click"
        height="100px"
        v-if="imgList.length > 1"
        arrow="never"
        :interval="3000"
      >
        <el-carousel-item v-for="(item, index) in imgList" :key="index">
          <div class="default_box" style="height: 100px">
            <img class="default_banner" :src="item.coverUrl" alt="" />
          </div>
        </el-carousel-item>
      </el-carousel>
      <!-- 轮播图只有一张 -->
      <div class="default_box" v-else-if="imgList.length == 1">
        <img class="default_banner" :src="imgList[0].coverUrl" alt="" />
      </div>
      <!-- 未设置轮播图 -->
      <div class="default_box" v-else>
        <!-- <img
          class="default_banner"
          src="https://tagvv-1256030678.file.myqcloud.com/20221018nrz9d.png"
          alt=""
        /> -->
        <el-carousel
          class="banner_swiper"
          trigger="click"
          height="100px"
          arrow="never"
          :interval="3000"
          indicator-position="none"
        >
          <el-carousel-item v-for="(item, index) in defaultImgList" :key="index">
            <div class="default_box" style="height: 100px">
              <img class="default_banner" :src="item" alt="" />
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>
  </div>
</template>
<script setup>
import { isEmpty } from '@/utils/tools.js'
const props = defineProps({
  data: {
    type: Object,
    data() {
      return {}
    }
  },
  chooseTab: {
    type: String
  }
})
const defaultImgList = ref([
  'https://tagvv-1256030678.file.myqcloud.com/20250226mk2dv.png',
  'https://tagvv-1256030678.file.myqcloud.com/20250226lvizd.png'
])
const imgList = ref([])
watch(
  () => props.data,
  val => {
    if (val && val.list && val.list.length > 0) {
      const bannerList = val.list.filter(item => !isEmpty(item.coverUrl))
      //   updateInfo(filter)
      imgList.value = bannerList
    } else {
      imgList.value = []
    }
    console.log('最后的轮播图信息', imgList.value)
  },
  { deep: true, immediate: true }
)
</script>
<style lang="scss" scoped>
@import '../../../components/css/preview_page.scss';
.banner_preview {
  width: 351px;
  height: 100px;
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-end;
  border-radius: 12px;
  .back_box {
    position: absolute;
    width: 100%;
    height: 60px;
    // background: #fff;
    border-radius: 12px 12px 0px 0px;
  }
  .banner_content {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100px;
    .default_box {
      width: 100%;
      height: 100px;
      // padding: 0 16px;
    }
    .default_banner {
      width: 100%;
      height: 100%;
      object-fit: cover;

      border-radius: 12px;
    }
  }
}
:deep(.banner_swiper .el-carousel__indicator .el-carousel__button) {
  width: 6px;
  height: 6px;
  border-radius: 100%;
}
</style>
