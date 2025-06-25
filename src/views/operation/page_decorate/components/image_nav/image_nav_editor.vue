<template>
  <div class="decorate">
    <div class="title">图文导航</div>
    <!-- 内容 -->
    <div class="content">
      <!-- 选择模板 -->
      <div class="one_content flex_between">
        <div class="label">选择模板</div>
        <div class="content_box">
          <el-radio-group v-model="componentData.templateStyle">
            <el-radio label="1">图片导航</el-radio>
            <el-radio label="2">文字导航</el-radio>
          </el-radio-group>
        </div>
      </div>
      <!-- 背景颜色 -->
      <div class="one_content flex_between">
        <div class="label">背景颜色</div>
        <div class="content_box flex_end">
          <colorPicker
            ref="colorPickerB"
            v-model:color="componentData.backgroundColor"
          ></colorPicker>
        </div>
      </div>
      <!-- 文本颜色 -->
      <div class="one_content flex_between">
        <div class="label">文本颜色</div>
        <div class="content_box flex_end">
          <colorPicker ref="colorPickerA" v-model:color="componentData.color"></colorPicker>
        </div>
      </div>
      <!-- 页面边距 -->
      <div class="one_content flex_between">
        <div class="label">页面边距</div>
        <div class="content_box">
          <sliderPicker v-model:slider="componentData.pmargin" :min="0" :max="30"></sliderPicker>
        </div>
      </div>
      <!--添加广告图 -->
      <uploadImgs
        type="image_nav"
        :templateStyle="componentData.templateStyle"
        v-model:imgList="componentData.navList"
      ></uploadImgs>
    </div>
  </div>
</template>
<script setup>
import colorPicker from '../color_picker/color_picker.vue'
import uploadImgs from '../upload_imgs/upload_imgs.vue'
import rulePicker from '../rule_picker/rule_picker.vue'
import sliderPicker from '../slider_picker/slider_picker.vue'
defineComponent(rulePicker, uploadImgs, colorPicker, sliderPicker)
const props = defineProps({
  componentData: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
const componentData = ref()

// 初始化
function init() {
  if (props.componentData) {
    componentData.value = JSON.parse(JSON.stringify(props.componentData))
  }
}
init()

const emits = defineEmits(['update:componentData'])
watch(
  () => componentData.value,
  newVal => {
    emits('update:componentData', newVal)
  },
  { deep: true }
)
</script>
<style lang="scss" scoped>
@import '../scss/decorate.scss';
div {
  box-sizing: border-box;
}
.add_box {
  margin-top: 24px;
  padding: 16px;
  background: #f6f8fa;

  .one_box {
    position: relative;
    margin-bottom: 16px;
    padding: 16px;
    width: 100%;
    min-height: 100px;
    background: #ffffff;
    box-shadow: 0px 2px 4px 0px rgba(95, 104, 147, 0.1);
    border-radius: 4px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .close_box {
      opacity: 0;
      cursor: pointer;
      position: absolute;
      right: -10px;
      top: -10px;
      color: #bbb;
      background: #fff;
      border-radius: 100%;
      font-size: 24px;
    }
    .one_image {
      width: 68px;
      height: 68px;
      margin-right: 24px;
      border-radius: 2px;
      position: relative;
      .img_cover {
        border: 1px solid #364fcd;
        width: 68px;
        height: 68px;
        border-radius: 2px;
        object-fit: cover;
        display: flex;
      }
      .img_mark {
        cursor: pointer;
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 100%;
        height: 18px;
        background: rgba(29, 31, 37, 0.4);
        border-radius: 0px 0px 2px 2px;
        font-size: 10px;
        font-weight: 400;
        color: #ffffff;
        line-height: 14px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
      }
    }
    .one_box_content {
      width: calc(100% - 92px);
      height: 68px;
      .content_one {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        p {
          margin-right: 16px;
          font-size: 14px;
          font-weight: 400;
          color: #333333;
          line-height: 20px;
        }
      }
      .content_one + .content_one {
        margin-top: 15px;
      }
    }
  }
  .one_box:hover {
    .close_box {
      opacity: 1;
    }
  }

  .one_upload {
    cursor: pointer;
    width: 100%;
    height: 90px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    font-weight: 400;
    color: #909399;
    line-height: 17px;
    background: #ffffff;
    border-radius: 2px;
    border: 1px solid #364fcd;
    .text1 {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      font-size: 14px;
      font-weight: 400;
      margin-bottom: 4px;
      color: #333333;
      line-height: 20px;
      .icon_mark {
        font-size: 16px;
        color: #364fcd;
        margin-right: 4px;
        font-weight: bold;
      }
    }
  }
  :deep(.choose_link) {
    max-width: calc(100% - 44px) !important;
  }
  :deep(.choose_link_text) {
    height: 22px !important;
    line-height: 21px !important;
    font-size: 12px !important;
  }
  :deep(.choose_link_icon) {
    height: 22px !important;
    font-size: 14px !important;
  }
}
</style>
