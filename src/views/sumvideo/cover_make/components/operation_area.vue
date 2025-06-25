<template>
  <div class="operation_page">
    <!-- 工具区 -->
    <div class="operation_tools">
      <toolOfText
        :origin="props.origin"
        :canvasW="canvasW"
        :canvasH="canvasH"
        :form="form"
        :newForm="newForm"
        :fontList="fontList"
        :index="activeInfo.index"
        @delElementFun="delElementFun"
        @clearActiveFun="clearActiveFun"
        @changeActiveFun="changeActiveFun"
        @updateReplaceShow="updateReplaceShow"
        v-if="activeInfo && activeInfo.type == 'text'"
      />
      <toolOfImage
        :origin="props.origin"
        :canvasW="canvasW"
        :canvasH="canvasH"
        :form="form"
        :newForm="newForm"
        :index="activeInfo.index"
        @delElementFun="delElementFun"
        @clearActiveFun="clearActiveFun"
        @changeActiveFun="changeActiveFun"
        v-else-if="activeInfo && activeInfo.type == 'image'"
      />
      <toolOfBackground
        :origin="props.origin"
        v-else
        :canvasW="canvasW"
        :canvasH="canvasH"
        :form="form"
        :newForm="newForm"
        @updateImgMaterial="updateImgMaterial"
      />
    </div>
    <!-- 画布区 -->
    <div class="operation_canvas" @click="canvasOtherClickFun">
      <div
        class="operation_canvas_b"
        :style="{
          '--canvasW': `${canvasW}px`,
          '--canvasH': `${canvasH}px`
        }"
      >
        <div
          class="operation_canvas_canvas"
          :style="{
            '--canvasW': `${canvasW}px`,
            '--canvasH': `${canvasH}px`
          }"
        >
          <div
            class="canvas_box"
            @click.stop=""
            :style="{
              '--canvasW': `${canvasW}px`,
              '--canvasH': `${canvasH}px`
            }"
          >
            <div class="has_canvas" id="canvasId" @click.stop="">
              <!-- 背景 -->
              <template v-if="form && form.backgroundStyle && form.backgroundStyle.url">
                <!-- 四张图 -->
                <template
                  v-if="
                    form.backgroundStyle &&
                    form.backgroundStyle.urlList &&
                    form.backgroundStyle.urlList.length == 4
                  "
                >
                  <vueDragResize
                    :minW="canvasW"
                    :minH="canvasH"
                    key="back44"
                    :isActive="backActive"
                    :parentLimitation="true"
                    :isResizable="false"
                    :isDraggable="false"
                    :w="canvasW"
                    :h="canvasH"
                    :x="0"
                    :y="0"
                    :z="0"
                    :aspectRatio="false"
                    :parentW="canvasW"
                    :parentH="canvasH"
                    @clicked="clickedFun($event, null, null, 'back', 'click')"
                  >
                    <div
                      style="
                        display: flex;
                        flex-direction: row;
                        justify-content: flex-start;
                        align-items: flex-start;
                        flex-wrap: wrap;
                      "
                    >
                      <div
                        :style="{
                          width: `calc(${canvasW}px / 2)`,
                          height: `calc(${canvasH}px / 2)`,
                          overflow: 'hidden',
                          position: 'relative'
                        }"
                        v-for="(a, b) in form.backgroundStyle.urlList"
                        :key="'back44' + b"
                      >
                        <img
                          class="drag_img"
                          :style="{
                            width: a.width + 'px',
                            height: a.height + 'px',
                            left: a.x + 'px',
                            top: a.y + 'px',
                            position: 'absolute'
                          }"
                          :src="a.url"
                          alt=""
                        />
                      </div>
                    </div>
                  </vueDragResize>
                </template>
                <!-- 三张图 -->
                <template
                  v-else-if="
                    form.backgroundStyle &&
                    form.backgroundStyle.urlList &&
                    form.backgroundStyle.urlList.length == 3
                  "
                >
                  <vueDragResize
                    :minW="canvasW"
                    :minH="canvasH"
                    key="back33"
                    :isActive="backActive"
                    :parentLimitation="true"
                    :isResizable="false"
                    :isDraggable="false"
                    :w="canvasW"
                    :h="canvasH"
                    :x="0"
                    :y="0"
                    :z="0"
                    :aspectRatio="false"
                    :parentW="canvasW"
                    :parentH="canvasH"
                    @clicked="clickedFun($event, null, null, 'back', 'click')"
                  >
                    <div>
                      <div
                        :style="{
                          width: `calc(${canvasW}px)`,
                          height: `calc(${canvasH}px / 3)`,
                          overflow: 'hidden',
                          position: 'relative'
                        }"
                        v-for="(a, b) in form.backgroundStyle.urlList"
                        :key="'back33' + b"
                      >
                        <img
                          class="drag_img"
                          :style="{
                            width: a.width + 'px',
                            height: a.height + 'px',
                            left: a.x + 'px',
                            top: a.y + 'px',
                            position: 'absolute'
                          }"
                          :src="a.url"
                          alt=""
                        />
                      </div>
                    </div>
                  </vueDragResize>
                </template>
                <!-- 两张图 -->
                <template
                  v-else-if="
                    form.backgroundStyle &&
                    form.backgroundStyle.urlList &&
                    form.backgroundStyle.urlList.length == 2
                  "
                >
                  <vueDragResize
                    :minW="canvasW"
                    :minH="canvasH"
                    key="back22"
                    :isActive="backActive"
                    :parentLimitation="true"
                    :isResizable="false"
                    :isDraggable="false"
                    :w="canvasW"
                    :h="canvasH"
                    :x="0"
                    :y="0"
                    :z="0"
                    :aspectRatio="false"
                    :parentW="canvasW"
                    :parentH="canvasH"
                    @clicked="clickedFun($event, null, null, 'back', 'click')"
                  >
                    <div
                      style="
                        display: flex;
                        flex-direction: row;
                        justify-content: flex-start;
                        align-items: flex-start;
                      "
                    >
                      <div
                        :style="{
                          width: `calc(${canvasW}px / 2)`,
                          height: `calc(${canvasH}px )`,
                          overflow: 'hidden',
                          position: 'relative'
                        }"
                        v-for="(a, b) in form.backgroundStyle.urlList"
                        :key="'back22' + b"
                      >
                        <img
                          class="drag_img"
                          :style="{
                            width: a.width + 'px',
                            height: a.height + 'px',
                            left: a.x + 'px',
                            top: a.y + 'px',
                            position: 'absolute'
                          }"
                          :src="a.url"
                          alt=""
                        />
                      </div>
                    </div>
                  </vueDragResize>
                </template>
                <!-- 一张图 -->
                <vueDragResize
                  v-else
                  :minW="canvasW"
                  :minH="canvasH"
                  key="back1"
                  :isActive="backActive"
                  :parentLimitation="true"
                  :isResizable="false"
                  :isDraggable="false"
                  :w="form.backgroundStyle.width"
                  :h="form.backgroundStyle.height"
                  :x="form.backgroundStyle.x"
                  :y="form.backgroundStyle.y"
                  :z="0"
                  :aspectRatio="false"
                  :parentW="canvasW"
                  :parentH="canvasH"
                  @clicked="clickedFun($event, null, null, 'back', 'click')"
                >
                  <img class="drag_img" :src="form.backgroundStyle.url" alt="" />
                </vueDragResize>
              </template>
              <vueDragResize
                v-else
                :minW="canvasW"
                :minH="canvasH"
                key="back2"
                :isActive="backActive"
                :parentLimitation="true"
                :isResizable="false"
                :isDraggable="false"
                :w="canvasW"
                :h="canvasH"
                :x="0"
                :y="0"
                :z="0"
                :aspectRatio="false"
                :parentW="canvasW"
                :parentH="canvasH"
                @clicked="clickedFun($event, null, null, 'back', 'click')"
              >
                <div class="drag_img"></div>
              </vueDragResize>

              <!-- 文本素材
            :preventActiveBehavior="true" -->
              <vueDragResize
                v-for="(item, index) in form.textStyle"
                :key="item.id"
                :class="{ locked_line: item.active && item.locked === 1 }"
                :isActive="item.active"
                :parentLimitation="false"
                :isResizable="false"
                :isDraggable="item.locked === 0"
                :minw="20"
                :minh="20"
                :snapToGrid="true"
                :gridX="1"
                :gridY="1"
                :w="canvasW"
                :h="item.height"
                :x="item.x"
                :y="item.y"
                :z="item.level"
                :aspectRatio="false"
                :parentW="canvasW"
                :parentH="canvasH"
                @dragging="isStaring = true"
                @resizing="isStaring = true"
                @activated="activatedFun($event, item, index, 'text')"
                @dragstop="endFun($event, item, index, 'text', 'drag')"
                @resizestop="endFun($event, item, index, 'text', 'resize')"
                @clicked="clickedFun($event, item, index, 'text', 'click')"
              >
                <div class="show_text_box">
                  <splitTextDOM :info="item" :newForm="newForm" :index="index" :form="form" />
                  <!-- 锁定图标 -->
                  <img
                    v-if="item.active && item.locked === 1"
                    class="text_lock"
                    src="https://tagvv-1256030678.file.myqcloud.com/20231024n6oca.png"
                    alt=""
                  />
                </div>
              </vueDragResize>
              <!-- 图片素材 -->
              <template v-if="form && form.imageStyle && form.imageStyle.length > 0">
                <vueDragResize
                  @click.stop=""
                  v-for="(item, index) in form.imageStyle"
                  :class="{ locked_line: item.active && item.locked === 1 }"
                  :minW="50"
                  :minH="50"
                  :handles="['tl', 'tr', 'bl', 'br']"
                  :key="item.id"
                  :snapToGrid="true"
                  :gridX="1"
                  :gridY="1"
                  :isActive="item.active"
                  :parentLimitation="true"
                  :aspectRatio="true"
                  :isResizable="item.locked === 0"
                  :isDraggable="item.locked === 0"
                  :w="item.width"
                  :h="item.height"
                  :preventActiveBehavior="true"
                  :x="item.x"
                  :y="item.y"
                  :z="item.level"
                  :parentW="canvasW"
                  :parentH="canvasH"
                  @activated="activatedFun($event, item, index, 'image')"
                  @deactivated="deactivatedFun($event, item, index, 'image')"
                  @dragging="isStaring = true"
                  @resizing="isStaring = true"
                  @dragstop="endFun($event, item, index, 'image', 'drag')"
                  @resizestop="endFun($event, item, index, 'image', 'resize')"
                  @clicked="clickedFun($event, item, index, 'image', 'click')"
                >
                  <div class="show_img_box">
                    <img
                      :class="{
                        drag_img: true,
                        horizontal_img: item.flip === 'horizontal',
                        vertical_img: item.flip === 'vertical'
                      }"
                      :src="item.url"
                      alt=""
                    />
                    <!-- 锁定图标 -->
                    <img
                      v-if="item.active && item.locked === 1"
                      class="text_lock"
                      src="https://tagvv-1256030678.file.myqcloud.com/20231024n6oca.png"
                      alt=""
                    />
                  </div>
                </vueDragResize>
              </template>
            </div>
            <!-- 未添加文本或图片素材 -->
            <div
              @click="canvasOtherClickFun"
              class="none_canvas"
              v-if="
                !(
                  form &&
                  ((form.textStyle && form.textStyle.length > 0) ||
                    (form.imageStyle && form.imageStyle.length > 0))
                )
              "
            >
              <el-empty
                :image-size="70"
                image="https://tagvvcloud-material-center-test.oss-cn-shanghai.aliyuncs.com/xm/file/bb500557fe2e43cea32c45b68eca89dc_1685948431961.png"
                description="请添加文本或图片"
                style="--el-empty-description-margin-top: 8px; --el-text-color-secondary: #8f939a"
              />
            </div>
          </div>
          <!-- 文本替换区 -->
          <div
            v-if="replaceInfo.show"
            @click.stop=""
            class="canvas_text_replace"
            :style="{
              '--canvasW': `${canvasW}px`,
              '--canvasH': `${canvasH}px`,
              top: replaceInfo.top + 'px'
            }"
          >
            <div class="replace_label">请在此处修改文字内容：</div>
            <el-input
              class="replace_input"
              ref="textareaRef"
              type="textarea"
              v-model.trim="replaceInfo.text"
              :maxlength="50"
              @keydown="checkEnter"
              @focus="checkFocus"
              @input="checkInput"
              placeholder="请输入文字内容"
            ></el-input>
          </div>

          <!-- 背景图片顺序 云封面管理、工具栏是画布背景的时候、背景图片是多张图片的情况下才显示 -->
          <div
            :style="{
              '--canvasW': `${canvasW}px`,
              '--canvasH': `${canvasH}px`
            }"
            class="drag_backImg_box"
            v-if="
              origin === 'cloud_cover_management' &&
              !activeInfo.isActive &&
              form &&
              form.backgroundStyle &&
              form.backgroundStyle.urlList &&
              form.backgroundStyle.urlList.length > 1
            "
          >
            <div class="drag_title">图片顺序</div>
            <div class="drag_content">
              <draggable
                v-model="form.backgroundStyle.urlList"
                group="operation_backimgList"
                @start="drag = true"
                @end="drag = false"
                item-key="id"
                handle=".one_drag"
                :animation="300"
              >
                <template #item="{ element }">
                  <div class="one_drag">
                    <i class="iconfont icon-tuodongweizhi"></i>

                    <img class="drag_cover" :src="element.url" alt="" />
                  </div>
                </template>
              </draggable>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import draggable from 'vuedraggable'
import splitTextDOM from './split_text.vue'
import vueDragResize from 'vue-drag-resize/src'
import toolOfBackground from './tool_of_background.vue'
import toolOfText from './tool_of_text.vue'
import toolOfImage from './tool_of_image.vue'
import { throttle, isEmpty } from '@/utils/tools'

const props = defineProps({
  origin: String, // 页面来源 cloud_cover_management 云封面管理
  form: {
    type: Object,
    default: () => {}
  },
  newForm: {
    type: Object,
    default: () => {}
  },
  canvasW: {
    type: Number,
    default: 375
  },
  canvasH: {
    type: Number,
    default: 500
  },
  fontList: {
    type: Array,
    default: () => []
  }
})
const { form, newForm, canvasW, canvasH, fontList } = toRefs(props)
const isStaring = ref(false) // 元素拖拽中
const backActive = ref(false) // 背景的选中状态
const activeInfo = reactive({
  isActive: false, // 没有选中的元素
  type: '', // 元素类型
  index: null // 某类型下第几个元素
}) // 选中元素信息
const dragResizeInfo = ref({}) // 拖拽时的数据
// 元素的点击事件-让该元素设为活跃状态
const clickedFun = throttle((data, item, index, type) => {
  console.log('clickedFun', data, item, index, type)
  if (type === 'back') {
    clearActiveFun(true, null, '')
  } else {
    let newIndex = null
    if (type === 'text') {
      form.value.textStyle.forEach((x, i) => {
        if (x.id === item.id) {
          newIndex = i
        }
      })
    } else {
      form.value.imageStyle.forEach((x, i) => {
        if (x.id === item.id) {
          newIndex = i
        }
      })
    }
    clearActiveFun(false, newIndex, type)
  }
}, 100)
// 元素拖动/缩放结束
const endFun = (data, item, index, type, clickType) => {
  console.log('end', data, item, index, type, clickType)
  dragResizeInfo.value = data
  if (type === 'text') {
    // 文本超出画布就直接删除
    if (
      data.left < 5 - canvasW.value ||
      data.left > canvasW.value - 5 ||
      data.top > canvasH.value - 5 ||
      data.top < 5 - form.value.textStyle[index].height
    ) {
      delElementFun(index, 'text')
    } else {
      emits('updateFormInfo', JSON.parse(JSON.stringify(data)), index, type)
    }
  } else {
    // 图片超出画布就直接删除
    if (
      data.left < 10 - data.width ||
      data.left > canvasW.value - 10 ||
      data.top > canvasH.value - 10 ||
      data.top < 10 - data.height
    ) {
      delElementFun(index, 'image')
    } else {
      emits('updateFormInfo', JSON.parse(JSON.stringify(data)), index, type)
    }
  }

  // nextTICK settimout 如果单单nextTick，拖拽中，在画布空白处松开还是会执行end 和canvasOtherClickFun
  nextTick(() => {
    setTimeout(() => {
      isStaring.value = false
    }, 0)
  })
}

// 元素失去焦点
function deactivatedFun() {
  console.log('deactivatedFun', dragResizeInfo.value)
}

// 元素从非活跃状态到活跃状态
function activatedFun(data, item, index, type) {
  textareaRef.value && textareaRef.value.blur()
  console.log('activatedFun', data, item, index, type)
  let newIndex = null
  if (type === 'text') {
    form.value.textStyle.forEach((x, i) => {
      if (x.id === item.id) {
        newIndex = i
      }
    })
  } else {
    form.value.imageStyle.forEach((x, i) => {
      if (x.id === item.id) {
        newIndex = i
      }
    })
  }

  changeActiveFun(type, newIndex, true)
}

// 修改活跃状态
function changeActiveFun(type, index, isActive) {
  if (isActive && type === 'text') {
    changeReplaceTopFun(index)

    replaceInfo.show = !(
      form.value.textStyle[index].locked && form.value.textStyle[index].locked === 1
    )

    replaceInfo.oldText = form.value.textStyle[index].content || ''
    replaceInfo.text = replaceInfo.oldText
  } else {
    replaceInfo.show = false
  }
  activeInfo.type = type
  activeInfo.index = index
  activeInfo.isActive = isActive
}

// 清空元素的活跃状态值 clearAll 是否清空所有 index 要保留的Index type 要保留的类型
function clearActiveFun(clearAll = true, index, type) {
  if (form.value && form.value.textStyle && form.value.textStyle.length > 0) {
    form.value.textStyle.forEach((x, i) => {
      if (clearAll) {
        x.active = false
      } else {
        x.active = i === index && type === 'text'
      }
    })
  }
  if (form.value && form.value.imageStyle && form.value.imageStyle.length > 0) {
    form.value.imageStyle.forEach((x, i) => {
      if (clearAll) {
        x.active = false
      } else {
        x.active = i === index && type === 'image'
      }
    })
  }

  if (clearAll) {
    backActive.value = true
    changeActiveFun('', null, false)
  } else {
    backActive.value = false
  }
}
defineExpose({
  changeActiveFun,
  clearActiveFun,
  changeReplaceTopFun
})
// 画布的空白地方点击，显示背景工具栏
function canvasOtherClickFun() {
  console.log('画布空白处', isStaring.value)
  // 元素拖拽中，如果鼠标在画布空白处松开，不触发点击事件。
  if (isStaring.value) {
    return
  }
  clearActiveFun(true, null, '')
}
// 上传背景图后 刷新图片素材列表
const emits = defineEmits(['updateImgMaterial', 'delElementFun', 'updateFormInfo'])
function updateImgMaterial() {
  emits('updateImgMaterial')
}
// 删除元素
function delElementFun(index, type) {
  emits('delElementFun', index, type)
}
// 文本替换
const textareaRef = ref(null)
const replaceInfo = reactive({
  show: false, // 是否显示替换文本区
  oldText: '', // 初始时的文字
  text: '', // 输入的文字
  top: 0 // 文本替换区的距顶
})
// 禁止输入空格和回车
function checkEnter(e) {
  // const et = e || window.event
  // const keycode = et.charCode || et.keyCode
  // if (keycode === 13 || keycode === 32) {
  //   if (window.event) {
  //     window.event.returnValue = false
  //   } else {
  //     e.preventDefault() // for firefox
  //   }
  // }
}
function checkInput() {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi
  replaceInfo.text = replaceInfo.text.replace(reg, '')
  if (isEmpty(replaceInfo.text)) {
    // replaceInfo.oldText
    form.value.textStyle[activeInfo.index].content = '星麦云封面制作'
    newForm.value.textStyle[activeInfo.index].content = '星麦云封面制作'
  } else {
    form.value.textStyle[activeInfo.index].content = replaceInfo.text
    newForm.value.textStyle[activeInfo.index].content = replaceInfo.text
  }
}
function checkFocus() {
  isStaring.value = true
  replaceInfo.oldText = form.value.textStyle[activeInfo.index].content
}
// 修改文本替换区距顶的距离
function changeReplaceTopFun(index) {
  const y = newForm.value.textStyle[index].y

  if (y + 159 > canvasH.value) {
    replaceInfo.top = canvasH.value - 159 - 12
  } else {
    replaceInfo.top = y
  }
}
// 文字锁定或解锁后，动态判断是否显示替换区
function updateReplaceShow(show) {
  replaceInfo.show = show
}

// 背景图片顺序拖动
const drag = ref(false)
</script>
<style lang="scss" scoped>
.show_img_box {
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;

  .horizontal_img {
    transform: scaleX(-1);
  }
  .vertical_img {
    transform: scaleY(-1);
  }
}
.drag_img {
  width: 100%;
  height: 100%;
}
.show_text_box {
  // padding: 3px 5px;
  padding: 0;
  // position: relative;
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
div {
  box-sizing: border-box;
}
.operation_page {
  width: 100%;
  height: 100%;
  padding: 0px 16px 0;
  .operation_tools {
    width: 100%;
    height: 64px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .operation_canvas_b {
    height: 100%;
    min-height: var(--canvasH);
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  .operation_canvas {
    width: 100%;
    height: calc(100% - 64px);
    background: #f6f8fa;
    position: relative;
    overflow-y: auto;
    .operation_canvas_canvas {
      margin-top: 2px;
      width: 100%;
      height: var(--canvasH);
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      position: relative;
    }
    .canvas_box {
      width: var(--canvasW);
      height: var(--canvasH);
      background: #ffffff;
      box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
      position: relative;
      .canvas_back {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        .back_img {
          width: 100%;
          height: 100%;
          display: flex;
        }
      }
      .none_canvas {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      .has_canvas {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
    }
    .canvas_text_replace {
      position: absolute;
      left: calc((100% - 375px) / 2 + 375px + 12px);
      top: 0;
      width: calc(100% - ((100% - 375px) / 2 + 375px + 12px + 12px));
      max-width: 304px;
      height: 159px;
      background: #ffffff;
      box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
      border-radius: 4px;
      padding: 16px;
      .replace_label {
        font-size: 14px;
        font-weight: 400;
        color: #303133;
        line-height: 20px;
        margin-bottom: 12px;
      }
      :deep(.el-textarea__inner) {
        width: 100%;
        height: 95px;
        background: #ffffff;
        border-radius: 4px;
        padding: 6px 12px;
        border: 1px solid #dcdfe6;
        resize: none;
      }
    }
  }
}
.locked_line,
.locked_line::before {
  outline: 1px solid #364fcd;
}
.vdr.active:before {
  outline: 1px solid #364fcd;
}
:deep(.vdr-stick-ml),
:deep(.vdr-stick-mr),
:deep(.vdr-stick-tm),
:deep(.vdr-stick-bm) {
  display: none !important;
}
.drag_backImg_box {
  margin-left: 16px;
  position: absolute;
  left: calc((100% - 375px) / 2 + 375px + 12px);
  top: 0;
  // width: calc(100% - ((100% - 375px) / 2 + 375px + 12px + 12px));
  height: var(--canvasH);
  .drag_title {
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 12px;
  }
  .drag_content {
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
    background: #fff;
    border-radius: 4px;
    padding: 16px;
    .one_drag + .one_drag {
      margin-top: 8px;
    }
    .one_drag {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .drag_cover {
        margin-left: 8px;
        width: 40px;
        height: 40px;
        display: flex;
        object-fit: cover;
        border-radius: 2px;
      }
    }
  }
}
</style>
