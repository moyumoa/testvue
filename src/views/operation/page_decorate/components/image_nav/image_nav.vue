<template>
  <div
    class="image_ads"
    :style="{
      paddingLeft: props.componentData.pmargin + 'px',
      paddingRight: props.componentData.pmargin + 'px'
    }"
  >
    <template v-if="props.componentData.navList.length > 0">
      <div
        class="ads_box"
        :style="{
          backgroundColor: props.componentData.backgroundColor
        }"
      >
        <div
          class="one_ads"
          :style="{
            width: boxWidth,
            paddingTop: props.componentData.templateStyle == '1' ? '12px' : '10px',
            paddingBottom: props.componentData.templateStyle == '1' ? '8px' : '10px'
          }"
          v-for="(item, index) in props.componentData.navList"
          :key="index"
        >
          <template v-if="props.componentData.templateStyle == '1'">
            <img
              :style="{
                width: imgWidth,
                height: imgWidth
              }"
              v-if="item.imgurl"
              :src="item.imgurl"
              alt=""
            />
            <img
              :style="{
                width: imgWidth,
                height: imgWidth
              }"
              v-else
              src="@/assets/images/operate/defalut_img.png"
              alt=""
            />
          </template>
          <div
            :style="{
              width: imgWidth,
              color: props.componentData.color
            }"
            class="line-hidden1"
          >
            {{ item.name || ' ' }}
          </div>
        </div>
      </div>
    </template>
    <div class="no_class" v-else>请设置图片导航</div>
  </div>
</template>
<script setup>
const props = defineProps({
  componentData: {
    type: Object
  }
})
const boxWidth = computed(() => {
  return `calc(( 373px -  ${props.componentData.pmargin}px * 2 ) / ${props.componentData.navList.length} )`
})
const imgWidth = computed(() => {
  return `calc(( 373px -  ${props.componentData.pmargin}px * 2 ) / ${props.componentData.navList.length} - 5px)`
})
</script>
<style lang="scss" scoped>
@import '../scss/decorate.scss';
div {
  box-sizing: border-box;
}
.image_ads {
  width: 100%;
  // overflow: hidden;
  // overflow-x: scroll;
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
.ads_box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  .one_ads {
    width: 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-left: 2.5px;
    padding-right: 2.5px;
    img {
      width: 36px;
      height: 36px;
      border-radius: 3px;
      margin-bottom: 4px;
      object-fit: cover;
    }
    div {
      font-size: 12px;
      font-weight: 400;
      color: #303133;
      line-height: 17px;
      width: 100%;
      height: 17px;
      text-align: center;
    }
  }
}
::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 7px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 7px;
  margin: 0 2px;
}
::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 7px;
  background-color: #c0c2c2;
  // margin: 0 5px;
}
</style>
