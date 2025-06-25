<template>
  <div class="split_text_page">
    <div
      v-for="(x, y) in textList"
      :key="y"
      class="text_box"
      :style="{
        marginTop:
          y > 0 ? `${info.lineSpacing ? (x && x.length > 0 ? info.lineSpacing : 0) : 0}px` : ''
      }"
    >
      <template v-if="x && x.length > 0">
        <!-- * 1.48 letterSpacing: info.spacing + 'px',-->
        <div
          v-for="(item, index) in x"
          :key="index"
          class="text"
          :data-attr="item"
          :data-decoration="info.fontFace.underline ? 'underline' : ''"
          :style="{
            minWidth: `${info.fontSize / 2}px`,
            '--subtitleColor': `${getColor(info.fontColor, info.fontColorOpacity)}`,
            fontSize: info.fontSize * scaleRadio + 'px',
            fontFamily: `'${'xm' + info.font || ''}'`,
            marginRight: `${item ? (32 / 10) * info.spacing : 0}px`,
            padding: `0 ${info.spacing ? 0 : '3'}px ${info.spacing ? 0 : '1'}px 0`,
            color: `${getColor(info.fontColor, info.fontColorOpacity)}`,
            fontStyle: info.fontFace.italic ? 'italic' : '',
            fontWeight: info.fontFace.bold ? '600' : '',
            // textDecoration: info.fontFace.underline ? 'underline' : '',
            textStroke:
              info.borderStyle == 1
                ? `${info.outline * 2.5}px ${getColor(info.outlineColour, info.outlineOpacity)}`
                : ''
          }"
        >
          {{ item || ' ' }}
          <div
            v-if="info.fontFace.underline"
            class="line"
            :style="{
              width: 'calc(100% - ' + `${info.spacing ? 0 : '1'}px` + ')',
              bottom: `${
                info.fontSize * scaleRadio * 0.1 +
                (info.fontSize / 12) * scaleRadio -
                (info.outline / 2 > 4 ? 4 : info.outline / 2)
              }px`,
              height: `${(info.fontSize / 12) * scaleRadio}px`,
              backgroundColor: `${getColor(info.fontColor, info.fontColorOpacity)}`,
              border:
                info.borderStyle == 1
                  ? `${info.outline / 2 > 4 ? 4 : info.outline / 2}px solid ${getColor(
                      info.outlineColour,
                      info.outlineOpacity
                    )}`
                  : ''
            }"
          ></div>
        </div>
      </template>
      <div
        v-else
        class="text"
        :style="{
          height: `calc( ${info.lineSpacing ? info.lineSpacing : 0}px + ${info.fontSize * 1}px`
        }"
      ></div>
    </div>
  </div>
</template>
<script setup>
import { getTextHeight } from '../js/tool.js'
const props = defineProps({
  info: {
    type: Object,
    default: () => {}
  },
  form: {
    type: Object,
    default: () => {}
  },
  newForm: {
    type: Object,
    default: () => {}
  },
  index: {
    type: Number,
    default: null
  }
})
const scaleRadio = ref(1.482)
const { info, form, index, newForm } = toRefs(props)
const textList = ref([])
watch(
  () => props.info,
  val => {
    if (val.content) {
      const list = val.content.split('\n')
      const newList = []
      list.forEach(x => {
        newList.push(x.trim().split(''))
      })
      console.log('newL', newList)
      textList.value = newList
      nextTick(() => {
        const allHeight = getTextHeight(newList, info.value.fontSize, info.value.lineSpacing)
        form.value.textStyle[index.value].height = allHeight
        newForm.value.textStyle[index.value].height = allHeight
      })
    }
  },
  { deep: true, immediate: true }
)

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
</script>

<style lang="scss" scoped>
.split_text_page {
  width: max-content;
  max-width: 100%;
  position: relative;
}
.text_box {
  position: relative;
  width: max-content;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  // flex-wrap: wrap;
}
.text {
  text-align: center;
  line-height: 1.36;
  padding: 0 2.8px 1.4px 0;
  position: relative;
}
.text::before {
  content: attr(data-attr);
  position: absolute;
  color: var(--subtitleColor);
  -webkit-text-stroke: 0;
  text-decoration: attr(data-decoration);
}
.text_lock {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 16px;
  height: 16px;
  object-fit: contain;
  display: flex;
}
.line {
  box-sizing: content-box;
  z-index: -1;
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
}
</style>
