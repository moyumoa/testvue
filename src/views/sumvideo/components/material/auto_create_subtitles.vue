<template>
  <div class="auto_create_sub" :class="props.classList.length > 0 ? [...props.classList] : ''">
    <div class="page_top flex_c" :style="{ paddingBottom: pageData.isOpen ? 0 : '12px' }">
      <div class="top_l flex_c">
        自动生成字幕
        <el-switch
          style="margin-left: 8px"
          v-model="pageData.isOpen"
          inline-prompt
          @change="beforeEmits"
        ></el-switch>
      </div>
      <div class="top_r flex_c" @click.stop="showSubSetting" v-if="pageData.isOpen">
        高级设置
        <img
          src="https://tagvv-1256030678.file.myqcloud.com/20240401svays.png"
          alt=""
          class="more_icon"
        />
      </div>
    </div>
    <div
      class="content"
      :style="{ paddingBottom: pageData.isOpen ? '12px' : 0 }"
      v-if="pageData.isOpen"
    >
      <div
        class="sub_item flex_c"
        v-for="(item, index) in subList"
        :key="index"
        @click="chooseOne(item)"
      >
        <div class="sub_item_l flex_c">
          {{ item.label }}
          <el-tooltip
            popper-class="tooltip_no_padding"
            effect="light"
            placement="right"
            :fallback-placements="['top', 'bottom', 'left', 'right']"
            :show-after="300"
            append-to-body
          >
            <template #content>
              <previewSubTitles :fontSetting="item.fontSetting" />
            </template>
            <div class="icon_warp">
              <img
                src="https://tagvv-1256030678.file.myqcloud.com/2024040111ct8.png"
                alt=""
                class="icon_item"
              />
            </div>
          </el-tooltip>
        </div>
        <div class="voice_check_box">
          <div :class="{ check_box: true, check_box_active: item.isChoose }"></div>
        </div>
      </div>
    </div>

    <!-- 声音的更多设置 -->
    <highSettingSubTitles
      :info="null"
      v-if="showSubHSetting"
      :show="showSubHSetting"
      @close="closeSetting"
      @save="saveSetting"
    />
  </div>
</template>

<script setup>
import previewSubTitles from './preview_subTitles.vue'
import highSettingSubTitles from './high_setting_subTitles_dialog.vue'

import { throttle, isNotEmpty } from '@/utils/tools.js'
import { getTextPoint } from './high_setting_subTitles_dialog.js'
import { getTextHeight } from '@/views/sumvideo/cover_make/js/tool'

const props = defineProps({
  extraConfig: {
    type: Object,
    default: () => {
      return {}
    }
  },
  classList: {
    type: Array,
    default: () => {
      return []
    }
  }
})
const subList = ref([
  {
    value: 1,
    label: '黄黑描边',
    isChoose: false, // 是否选择
    // 详细参数
    fontSetting: {
      autoAsr: false, // 自动生成字幕 默认关闭
      id: 1,
      font: 'f63e6bb000b271f09ed8e6f6c74b6304', // 字体
      fontSize: 18, // 字号
      fontColor: '#FFEA00', // 字体颜色
      fontColorOpacity: 100, // 透明度，1-100
      spacing: 0, // 字间距
      lineSpacing: 0, // 行间距
      fontFace: {
        bold: false, // 加粗
        italic: false, // 斜体
        underline: false // 下划线
      },
      borderStyle: 1, // 边框格式类型 1描边 3背景
      outlineColour: '#000000', // 描边颜色
      outline: 3, // 描边宽度
      outlineOpacity: 100, // 不透明度
      alignment: true,
      x: 0,
      y: undefined
    }
  },
  {
    value: 2,
    label: '白字黑边',
    isChoose: false,
    fontSetting: {
      autoAsr: false, // 自动生成字幕 默认关闭
      id: 2,
      font: 'f7e6766000b271f09ed8e6f6c74b6304', // 字体
      fontSize: 18, // 字号
      fontColor: '#FFFFFF', // 字体颜色
      fontColorOpacity: 100, // 透明度，1-100
      spacing: 0, // 字间距
      lineSpacing: 0, // 行间距
      fontFace: {
        bold: false, // 加粗
        italic: false, // 斜体
        underline: false // 下划线
      },
      borderStyle: 1, // 边框格式类型 1描边 3背景
      outlineColour: '#000000', // 描边颜色
      outline: 2, // 描边宽度
      outlineOpacity: 100, // 不透明度
      alignment: true,
      x: 0,
      y: undefined
    }
  },
  {
    value: 3,
    label: '黑字白边',
    isChoose: false,
    fontSetting: {
      autoAsr: false, // 自动生成字幕 默认关闭
      id: 3,
      font: 'f06142d000b271f09ed8e6f6c74b6304', // 字体
      fontSize: 18, // 字号
      fontColor: '#000000', // 字体颜色
      fontColorOpacity: 100, // 透明度，1-100
      spacing: 0, // 字间距
      lineSpacing: 0, // 行间距
      fontFace: {
        bold: false, // 加粗
        italic: false, // 斜体
        underline: false // 下划线
      },
      borderStyle: 1, // 边框格式类型 1描边 3背景
      outlineColour: '#FFFFFF', // 描边颜色
      outline: 3, // 描边宽度
      outlineOpacity: 100, // 不透明度
      alignment: true,
      x: 0,
      y: undefined
    }
  }
])

const showSubHSetting = ref(false) // 是否显示字幕的高级设置
const pageData = reactive({
  isOpen: false, // 自动生成字幕是否打开
  choseIds: [], // 选择的ids
  chooseItem: [] // 选择的信息
})
const emits = defineEmits(['updateSubtitles'])

// function switchChange(e) {
//   emits('updateSubtitles', pageData.chooseItem, pageData.isOpen)
// }

function chooseOneNoDelay(item) {
  if (pageData.choseIds.includes(item.value)) {
    item.isChoose = false
    pageData.choseIds = pageData.choseIds.filter(x => x !== item.value)
    pageData.chooseItem = pageData.chooseItem.filter(x => (x.value || x.id) !== item.value)
  } else {
    pageData.choseIds.push(item.value || item.id)
    pageData.chooseItem.push(item)
    item.isChoose = true
  }
}

// 选择一个
const chooseOne = throttle(function (item) {
  if (pageData.choseIds.includes(item.value || item.id)) {
    item.isChoose = false
    pageData.choseIds = pageData.choseIds.filter(x => x !== item.value)
    pageData.chooseItem = pageData.chooseItem.filter(x => {
      if (x.value <= 3) {
        delete x.fontSetting.x
        delete x.fontSetting.y
        delete x.fontSetting.alignment
      }
      return (x.value || x.id) !== item.value
    })
  } else {
    const deepItem = JSON.parse(JSON.stringify(item))
    if (deepItem.value <= 3) {
      // 如果是内置的，就不用传位置相关信息x\y\alignment，就会是底部居中，数据内的仅用作显示
      delete deepItem.fontSetting.x
      delete deepItem.fontSetting.y
      delete deepItem.fontSetting.alignment
    }
    pageData.choseIds.push(deepItem.value)
    pageData.chooseItem.push(deepItem)
    item.isChoose = true
  }

  // console.log('pageData.chooseItem', pageData.chooseItem)
  // if (pageData.chooseItem) return
  beforeEmits()
}, 500)

function beforeEmits() {
  pageData.chooseItem = pageData.chooseItem.filter(x => {
    if (x.value <= 3) {
      delete x.fontSetting.x
      delete x.fontSetting.y
      delete x.fontSetting.alignment
    }
    return x
  })
  // 提交时，内置字幕不提交x,y,alignment，让字幕显示在屏幕下三分之一处
  emits('updateSubtitles', pageData.chooseItem, pageData.isOpen)
}

const showSubSetting = throttle(function () {
  showSubHSetting.value = true
}, 500)
function closeSetting() {
  showSubHSetting.value = false
}

function getFontSettingId() {
  const maxId = subList.value.reduce(
    (max, item) => (item.fontSetting.id > max ? item.fontSetting.id : max),
    0
  )
  return maxId
}

function saveSetting(val) {
  const posiInfo = getTextPoint(val.fontSetting.x, val.fontSetting.y)
  const index = subList.value.filter(x => x.label.startsWith('自定义字幕')).length
  const oneFont = {
    value: subList.value.length + 1,
    label: `自定义字幕${index + 1}`,
    isChoose: false, // 是否选择
    fontSetting: {
      ...val.fontSetting,
      // 添加id，找到当前列表内已添加过的最大id+1，id与label不一定相等
      id: getFontSettingId() + 1,
      x: posiInfo.finX,
      y: posiInfo.finY || 0,
      alignment: val.fontSetting.alignment ? 'TopCenter' : ''
    }
  }
  subList.value.push(oneFont)
  // pageData.choseIds.push(oneFont.value)
  closeSetting()
}
onMounted(() => {
  const canvasH = 404
  if (isNotEmpty(props.extraConfig)) {
    pageData.isOpen = props.extraConfig.autoAsr
    let { fontSettings: fontList = [] } = props.extraConfig
    fontList = fontList || []
    const initSubList = fontList.filter(x => Number(x.id) <= 3) // 数据内写死的，需要回显true
    const addSubList = fontList.filter(x => Number(x.id) > 3) // 高级设置添加的

    subList.value.forEach(y => {
      // 初始化y
      const hDiff =
        canvasH - getTextHeight([y.label], y.fontSetting.fontSize, y.fontSetting.lineSpacing)
      y.fontSetting.y = parseInt((hDiff / canvasH) * 1920)
      initSubList.forEach(x => {
        // eslint-disable-next-line eqeqeq
        if (y.value == x.id) {
          chooseOneNoDelay(y)
        }
      })
    })
    if (addSubList && addSubList.length > 0) {
      const lastList = []
      addSubList.forEach((x, index) => {
        const oneFont = {
          value: subList.value.length + index + 1,
          label: `自定义字幕${index + 1}`,
          isChoose: false, // 是否选择
          fontSetting: {
            ...x
          }
        }
        chooseOneNoDelay(oneFont)
        lastList.push(oneFont)
      })

      subList.value = subList.value.concat(lastList)
    }
  } else {
    subList.value.forEach(y => {
      const hDiff =
        canvasH - getTextHeight([y.label], y.fontSetting.fontSize, y.fontSetting.lineSpacing)
      y.fontSetting.y = parseInt((hDiff / canvasH) * 1920)
    })
  }
})
</script>

<style lang="scss" scoped>
.flex_c {
  display: flex;
  align-items: center;
}
.auto_create_sub {
  background: linear-gradient(180deg, #e0eaff 0%, #f4f9ff 100%);
  border-radius: 4px;
  height: max-content;
  .page_top {
    justify-content: space-between;
    font-family: PingFangSC, PingFang SC;
    color: #364fcd;
    line-height: 20px;
    font-size: 16px;
    font-weight: 400;
    padding: 12px 16px 0 16px;
    .top_l {
      font-weight: 500;
    }
    .top_r {
      font-size: 14px;
      cursor: pointer;
      .more_icon {
        margin-left: 4px;
        width: 14px;
        height: 14px;
        min-width: 14px;
      }
    }
  }
  .content {
    display: flex;
    flex-wrap: wrap;
    margin-top: 8px;
    height: 120px;
    overflow-y: auto;
    .sub_item {
      padding: 10px 12px;
      width: 168px;
      justify-content: space-between;
      background: #ffffff;
      border-radius: 4px;
      margin-left: 12px;
      margin-top: 12px;
      cursor: pointer;
      height: max-content;

      .sub_item_l {
        font-family: PingFangSC, PingFang SC;
        font-weight: 500;
        font-size: 14px;
        color: #303133;
        line-height: 20px;
        .item_tooltip {
          padding: 0;
        }
      }
      .icon_warp {
        margin-left: 4px;
        width: 20px;
        height: 20px;
        border-radius: 3px;
        &:hover {
          background: rgba(54, 79, 205, 0.1);
        }
        .icon_item {
          width: 100%;
          height: 100%;
          border-radius: 3px;
        }
      }

      .voice_check_box {
        .check_box {
          width: 16px;
          height: 16px;
          background: #ffffff;
          border-radius: 2px;
          border: 1px solid #dcdee0;
          margin-left: 16px;
          cursor: pointer;
          position: relative;
        }
        .check_box_active {
          background: #364fcd;
          position: relative;
          &::after {
            box-sizing: content-box;
            content: '';
            border: 1px solid #fff;
            border-left: 0;
            border-top: 0;
            height: 8px;
            left: 5px;
            position: absolute;
            top: 1px;
            transform: rotate(45deg) scaleY(1);
            width: 4px;
            transition: transform 0.15s ease-in 0.05s;
            transform-origin: center;
          }
        }
      }
    }
  }
}
</style>
