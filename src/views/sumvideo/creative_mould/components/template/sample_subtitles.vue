<template>
  <div
    class="subtitles_page"
    :class="{ subtitles_page_un_center: !props.fontSetting.alignment }"
    ref="subtitlesPageRef"
    v-resizeObserve="resizeObserve"
    :style="{
      marginBottom: fontSetting.borderStyle == 3 ? `-${fontSetting.outline}px` : '',
      transform: 'translate(' + textPosition.finX + 'px, ' + textPosition.finY + 'px)',
      width: !props.fontSetting.alignment ? getCanvasInfo().canvasW - textPosition.finX + 'px' : ''
    }"
  >
    <!-- :style="{
        marginBottom: fontSetting.borderStyle == 3 ? `-${fontSetting.outline}px` : '',
        marginTop:
          y == 1
            ? fontSetting.borderStyle == 3
              ? fontSetting.lineSpacing > fontSetting.outline
                ? `${fontSetting.lineSpacing}px `
                : `${fontSetting.outline}px`
              : `${fontSetting.lineSpacing}px`
            : ''
      }" -->
    <!-- 背景的宽度是从中间往外发射，所以是marginBottom。但如果多行的话，marginTop就要分条件判断：如果设置了背景，要判断行间距是否大于背景宽度，大于就行间距，否则就背景宽度。 未设置那就是行间距。 -->
    <div
      class="subtitles_box"
      v-for="(x, y) in fontSetting.lineSpacing && fontSetting.lineSpacing > 0 ? 2 : 1"
      :key="x"
      :style="{
        marginTop: y == 1 ? `${fontSetting.lineSpacing}px` : '',
        justifyContent: fontSetting.alignment ? 'center' : 'flex-start',
        width: !props.fontSetting.alignment
          ? getCanvasInfo().canvasW - textPosition.finX + 'px'
          : ''
      }"
    >
      <div
        :data-attr="item"
        class="subtitles_text"
        v-for="(item, index) in textList"
        :key="index"
        :style="{
          '--subtitleColor': `${getColor(fontSetting.fontColor, fontSetting.fontColorOpacity)}`,
          fontSize: fontSetting.fontSize + 'px',
          fontFamily: `'${'xm'+fontSetting.font || ''}','${fontSetting.font || ''}'`,
          letterSpacing: fontSetting.spacing + 'px',
          color: `${getColor(fontSetting.fontColor, fontSetting.fontColorOpacity)}`,
          fontStyle: fontSetting.fontFace.italic ? 'italic' : '',
          fontWeight: fontSetting.fontFace.bold ? '600' : '',
          textDecoration: fontSetting.fontFace.underline ? 'underline' : '',
          background:
            fontSetting.borderStyle == 3
              ? `${getColor(fontSetting.outlineColour, fontSetting.outlineOpacity)}`
              : '',
          padding:
            fontSetting.borderStyle == 3
              ? index == 0
                ? `${fontSetting.outline}px 0 ${fontSetting.outline}px ${fontSetting.outline}px `
                : index == textList.length - 1
                ? `${fontSetting.outline}px ${fontSetting.outline}px ${fontSetting.outline}px 0`
                : `${fontSetting.outline}px 0`
              : '',

          textStroke:
            fontSetting.borderStyle == 1
              ? `${fontSetting.outline}px ${getColor(
                  fontSetting.outlineColour,
                  fontSetting.outlineOpacity
                )}`
              : ''
        }"
      >
        {{ item }}
      </div>
    </div>
  </div>
</template>
<script setup>
import vResizeObserve from '@/directive/resizeObserver'
const props = defineProps({
  fontSetting: {
    type: Object,
    default: () => {
      return {}
    }
  },
  type: {
    type: String,
    default: 'edit' // edit时的范围是375*667 preview时以1080*1920为准
  }
})
const { fontSetting, type } = toRefs(props)
const emits = defineEmits(['updatePosition'])
const textList = ref(['智', '能', '字', '幕', '示', '例'])
const subtitlesPageRef = ref(null)
const textPosition = reactive({
  finX: 0,
  finY: 0
})
function colorChangeFun(data, opa) {
  // 16进制颜色值的正则
  const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
  // 把颜色值变成小写
  let color = data.toLowerCase()
  if (reg.test(color)) {
    // 如果只有三位的值，需变成六位，如：#fff => #ffffff
    if (color.length === 4) {
      let colorNew = '#'
      for (let i = 1; i < 4; i += 1) {
        colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1))
      }
      color = colorNew
    }
    // 处理六位的颜色值，转为RGB
    const colorChange = []
    for (let i = 1; i < 7; i += 2) {
      colorChange.push(parseInt('0x' + color.slice(i, i + 2)))
    }
    return 'rgba(' + colorChange.join(',') + ',' + opa / 100 + ')'
  } else {
    return color
  }
}
// 颜色转换
function getColor(color, opacity) {
  if (color) {
    return colorChangeFun(color, opacity)
  } else {
    return color
  }
}
watch(
  () => props.fontSetting,
  val => {
    const { x, y, lineSpacing, fontSize, spacing, alignment } = val
    getTextShow(x || 0, y || 0, lineSpacing || 0, fontSize || 12, spacing || 0, alignment)
  },
  {
    deep: true,
    immediate: true
  }
)

// 位置换算，屏幕比例定为9:16（生成视频实际是1080 * 1920，入参要等比扩大），预览时盒子宽高为218 * 404，所以需要转换
function getTextShow(x, y, lineSpacing, fontSize, spacing, alignment) {
  const { canvasW, canvasH } = getCanvasInfo()
  const markW = type.value === 'edit' ? 375 : 1080
  const markH = type.value === 'edit' ? 667 : 1920
  const finX = (x / markW) * canvasW
  const finY = (y / markH) * canvasH
  textPosition.finX = finX
  textPosition.finY = finY
}

// 获取画布宽高（宽208px 高394px，有5px边框，是死的，暂不获取）
function getCanvasInfo() {
  return {
    canvasW: 218,
    canvasH: 404
  }
}

function resizeObserve(dom) {
  emits('updatePosition', getCanvasInfo().canvasH, dom.height)
}

function initY() {
  const height = (subtitlesPageRef.value && subtitlesPageRef.value.offsetHeight) || 22
  emits('updatePosition', getCanvasInfo().canvasH, height)
}

defineExpose({
  initY
})
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.subtitles_page {
  width: 100%;
  line-height: 1.2;
  box-sizing: border-box;
  border: 1px solid #364fcd;

  .subtitles_box {
    display: flex;
    flex-direction: row;
    // justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    .subtitles_text::before {
      content: attr(data-attr);
      position: absolute;
      color: var(--subtitleColor);
      -webkit-text-stroke: 0;
    }
  }
}
.subtitles_page_un_center {
  width: max-content;
}
</style>
