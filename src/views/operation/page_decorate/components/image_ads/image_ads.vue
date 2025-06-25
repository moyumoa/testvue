<template>
  <div class="image_ads">
    <!-- 一行一个 -->
    <template v-if="props.componentData.templateStyle != '2'">
      <div
        class="image_box"
        :style="{
          paddingLeft: props.componentData.pmargin + 'px',
          paddingRight: props.componentData.pmargin + 'px'
        }"
      >
        <div
          :style="{
            marginBottom: props.componentData.imargin + 'px'
          }"
          :class="{
            one_image: true,
            one_shadow: props.componentData.imgStyle == 'shadow',
            one_round: props.componentData.imgAngle == 'round'
          }"
          v-for="(item, index) in props.componentData.imgList.length > 0
            ? props.componentData.imgList
            : [{}]"
          :key="index"
        >
          <img v-if="item.imgurl" :src="item.imgurl" class="image_cover" alt="" />
          <img v-else src="@/assets/images/operate/defalut_img.png" class="image_cover" alt="" />
          <div class="image_title line-hidden1" v-if="item.name">{{ item.name }}</div>
        </div>
      </div>
    </template>
    <template v-else>
      <!-- <div class="no_class" v-if="props.componentData.imgList.length == 0">请上传图片</div> -->
      <el-carousel
        trigger="click"
        height="348px"
        arrow="never"
        :indicator-position="props.componentData.indicator ? null : 'none'"
        :initial-index="0"
      >
        <el-carousel-item
          v-for="(item, index) in props.componentData.imgList.length > 0
            ? props.componentData.imgList
            : [{}]"
          :key="index"
        >
          <div
            class="image_box"
            :style="{
              height: '348px',
              paddingLeft: props.componentData.pmargin + 'px',
              paddingRight: props.componentData.pmargin + 'px'
            }"
          >
            <div
              :class="{
                one_image: true,
                carousel_one: true,
                one_shadow: props.componentData.imgStyle == 'shadow',
                one_round: props.componentData.imgAngle == 'round'
              }"
            >
              <img
                v-if="item.imgurl"
                :style="{
                  height: '100%',
                  objectFit: props.componentData.fill
                }"
                :src="item.imgurl"
                class="image_cover"
                alt=""
              />
              <img
                class="image_cover"
                :style="{
                  height: '100%',
                  objectFit: props.componentData.fill
                }"
                v-else
                src="@/assets/images/operate/defalut_img.png"
                alt=""
              />
              <div class="image_title line-hidden1" v-if="item.name">{{ item.name }}</div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </template>
  </div>
</template>
<script setup>
const props = defineProps({
  componentData: {
    type: Object
  }
})
</script>
<style lang="scss" scoped>
@import '../scss/decorate.scss';

.one_image {
  width: 100%;
  position: relative;
  height: auto;
  min-height: 30px;
  .image_cover {
    width: 100%;
    height: auto;
    display: flex;
  }
  .image_title {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 28px;
    line-height: 28px;
    background: rgba(68, 69, 73, 0.15);
    color: #fff;
    padding: 0 15px;
    box-sizing: border-box;
    font-size: 12px;
    font-weight: 400;
    color: #ffffff;
  }
}
.one_shadow {
  box-shadow: 0px 4px 6px 0px rgba(95, 104, 147, 0.1);
}
.one_round {
  border-radius: 10px;
  .image_cover {
    border-radius: 10px;
  }
  .image_title {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }
}
.carousel_one {
  height: 100%;
}
.image_ads {
  :deep(.el-carousel__button) {
    width: 4px;
    height: 4px;
    border-radius: 100%;
    background: rgba(0, 0, 0, 0.2);
  }
}
.no_class {
  padding-left: 16px;
  width: 100%;
  height: 32px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  font-size: 14px;
  color: #909399;
}
:deep(.el-carousel--horizontal) {
  overflow-y: hidden;
}
</style>
