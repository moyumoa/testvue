<template>
  <div class="preview_subTitles">
    <img
      class="right_phone"
      src="https://tagvv-1256030678.file.myqcloud.com/20240401nvxx0.png"
      alt=""
    />
    <div class="right_bottom">
      <sampleSubtitlesDOM :fontSetting="props.fontSetting" type="preview" />
    </div>
  </div>
</template>

<script setup>
import sampleSubtitlesDOM from '@/views/sumvideo/creative_mould/components/template/sample_subtitles.vue'
const props = defineProps({
  fontSetting: {
    type: Object,
    default: () => {
      return {
        autoAsr: false, // 自动生成字幕 默认关闭
        font: 'wqy-microhei', // 字体
        fontSize: 16, // 字号
        fontColor: '#ffffff', // 字体颜色
        fontColorOpacity: 100, // 透明度，1-100
        spacing: 0, // 字间距
        lineSpacing: 0, // 行间距
        fontFace: {
          bold: false, // 加粗
          italic: false, // 斜体
          underline: false // 下划线
        },
        borderStyle: null, // 边框格式类型 1描边 3背景
        outlineColour: null, // 描边颜色
        outline: null, // 描边宽度
        outlineOpacity: null, // 不透明度
        alignment: '', // 是否居中
        x: 0,
        y: undefined
      }
    }
  } // 预览类型
})
</script>

<style lang="scss" scoped>
.preview_subTitles {
  width: 228px;
  position: relative;
  overflow: hidden;
  .right_phone {
    width: 100%;
    height: 514px;
    display: flex;
    object-fit: contain;
  }
  .right_mark {
    width: 100%;
    font-size: 12px;
    font-weight: 400;
    color: #909399;
    line-height: 17px;
    text-align: center;
  }
  .right_bottom {
    position: absolute;
    left: 5px;
    bottom: 71px;
    width: calc(100% - 10px);
    text-align: center;
    overflow: hidden;
    height: 404px;
    // display: flex;
    // flex-direction: column;
    // justify-content: flex-end;
    // align-items: flex-end;
  }
  .right_text {
    width: 100%;
    text-align: center;
    line-height: 1.2;
  }
}
</style>
