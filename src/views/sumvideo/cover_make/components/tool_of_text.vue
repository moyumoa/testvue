<template>
  <div class="tool_page">
    <div class="tool_left flex_box">
      <template v-if="!(form.textStyle[index].locked && form.textStyle[index].locked === 1)">
        <!-- 颜色 -->
        <div class="one_tool flex_box">
          <div class="tool_content">
            <el-tooltip popper-class="tooltip-class" placement="bottom" content="文字颜色">
              <div>
                <el-color-picker
                  v-model="form.textStyle[index].fontColor"
                  @change="fontColorChangeFun"
                  popper-class="xm_color_picker_marginTop8"
                />
              </div>
            </el-tooltip>
          </div>
        </div>
        <!-- 字体 -->
        <div class="one_tool flex_box">
          <div class="tool_content">
            <el-tooltip popper-class="tooltip-class" placement="bottom" content="字体">
              <el-select
                v-model="form.textStyle[index].font"
                placeholder="请选择字体"
                style="width: 180px"
                @change="fontChangeFun"
              >
                <el-option
                  v-for="item in fontList"
                  :label="item.font"
                  :value="item.fontKey"
                  :key="item.id"
                />
              </el-select>
            </el-tooltip>
          </div>
        </div>
        <!-- 字体大小 -->
        <div class="one_tool flex_box">
          <div class="tool_content">
            <el-tooltip popper-class="tooltip-class" placement="bottom" content="字体大小">
              <el-input-number
                v-model="form.textStyle[index].fontSize"
                :min="12"
                :max="50"
                :step="1"
                style="width: 100px"
                controls-position="right"
                @change="fontSizeChangeFun"
              />
            </el-tooltip>
          </div>
        </div>
        <!-- 粗体 -->
        <div class="one_tool flex_box one_tool_img">
          <div class="tool_content">
            <el-tooltip popper-class="tooltip-class" placement="bottom" content="粗体">
              <div
                :class="{
                  tool_img: true,
                  choose_tool_img:
                    form.textStyle[index].fontFace && form.textStyle[index].fontFace.bold
                }"
                @click="fontBoldChange"
              >
                <img src="https://tagvv-1256030678.file.myqcloud.com/20231023fhj4y.png" alt="" />
              </div>
            </el-tooltip>
          </div>
        </div>
        <!-- 斜体 -->
        <div class="one_tool flex_box one_tool_img">
          <div class="tool_content">
            <el-tooltip popper-class="tooltip-class" placement="bottom" content="斜体">
              <div
                :class="{
                  tool_img: true,
                  choose_tool_img:
                    form.textStyle[index].fontFace && form.textStyle[index].fontFace.italic
                }"
                @click="fontItalicChange"
              >
                <img src="https://tagvv-1256030678.file.myqcloud.com/20231023pgtmn.png" alt="" />
              </div>
            </el-tooltip>
          </div>
        </div>
        <!-- 下划线 -->
        <div class="one_tool flex_box one_tool_img">
          <div class="tool_content">
            <el-tooltip popper-class="tooltip-class" placement="bottom" content="下划线">
              <div
                :class="{
                  tool_img: true,
                  choose_tool_img:
                    form.textStyle[index].fontFace && form.textStyle[index].fontFace.underline
                }"
                @click="fontUnderlineChange"
              >
                <img src="https://tagvv-1256030678.file.myqcloud.com/20231023ikv29.png" alt="" />
              </div>
            </el-tooltip>
          </div>
        </div>
        <!-- 字间距 -->
        <div class="one_tool flex_box one_tool_img">
          <div class="tool_content">
            <el-popover
              @show="popverShowHide('showSpacing', true)"
              @hide="popverShowHide('showSpacing', false)"
              placement="bottom"
              :width="304"
              trigger="click"
              popper-class="tool_popver"
              :show-arrow="false"
              :offset="8"
            >
              <template #reference>
                <div
                  :class="{
                    tool_img: true,
                    tool_pointer: true,
                    choose_tool_img: $data.showSpacing
                  }"
                >
                  <el-tooltip popper-class="tooltip-class" placement="bottom" content="字间距">
                    <img
                      src="https://tagvv-1256030678.file.myqcloud.com/202310231mn9b.png"
                      alt=""
                    />
                  </el-tooltip>
                </div>
              </template>
              <div class="tool_popver_bottom flex_box">
                <div class="one_popver_content">
                  <div class="one_popver_label">字间距：</div>
                  <div class="one_popver_setting flex_box">
                    <el-slider
                      class="xm_slider"
                      tooltip-class="xm_slider"
                      style="width: 100px"
                      v-model="form.textStyle[index].spacing"
                      :show-tooltip="false"
                      :show-input-controls="false"
                      :max="$data.spacingMath"
                      :min="-2"
                      :step="1"
                      @change="fontSpacingChangeFun"
                    ></el-slider>
                    <el-input-number
                      style="width: 100px; margin-left: 8px"
                      v-model="form.textStyle[index].spacing"
                      :max="$data.spacingMath"
                      :min="-2"
                      :step="1"
                      controls-position="right"
                      @change="fontSpacingChangeFun"
                    />
                  </div>
                </div>
              </div>
            </el-popover>
          </div>
        </div>
        <!-- 行间距 -->
        <div class="one_tool flex_box one_tool_img">
          <div class="tool_content">
            <el-popover
              @show="popverShowHide('showLineSpacing', true)"
              @hide="popverShowHide('showLineSpacing', false)"
              placement="bottom"
              :width="304"
              trigger="click"
              popper-class="tool_popver"
              :show-arrow="false"
              :offset="8"
            >
              <template #reference>
                <div
                  :class="{
                    tool_img: true,
                    tool_pointer: true,
                    choose_tool_img: $data.showLineSpacing
                  }"
                >
                  <el-tooltip popper-class="tooltip-class" placement="bottom" content="行间距">
                    <img
                      src="https://tagvv-1256030678.file.myqcloud.com/202310237edpi.png"
                      alt=""
                    />
                  </el-tooltip>
                </div>
              </template>
              <div class="tool_popver_bottom flex_box">
                <div class="one_popver_content">
                  <div class="one_popver_label">行间距：</div>
                  <div class="one_popver_setting flex_box">
                    <el-slider
                      class="xm_slider"
                      tooltip-class="xm_slider"
                      style="width: 100px"
                      v-model="form.textStyle[index].lineSpacing"
                      :show-tooltip="false"
                      :show-input-controls="false"
                      :max="10"
                      :min="0"
                      :step="1"
                      @change="fontLineSpacingChangeFun"
                    ></el-slider>
                    <el-input-number
                      style="width: 100px; margin-left: 8px"
                      v-model="form.textStyle[index].lineSpacing"
                      :max="10"
                      :min="0"
                      :step="1"
                      controls-position="right"
                      @change="fontLineSpacingChangeFun"
                    />
                  </div>
                </div>
              </div>
            </el-popover>
          </div>
        </div>
        <!-- 不透明度 -->
        <div class="one_tool flex_box one_tool_img">
          <div class="tool_content">
            <el-popover
              @show="popverShowHide('showFontColorOpacity', true)"
              @hide="popverShowHide('showFontColorOpacity', false)"
              placement="bottom"
              :width="304"
              trigger="click"
              popper-class="tool_popver"
              :show-arrow="false"
              :offset="8"
            >
              <template #reference>
                <div
                  :class="{
                    tool_img: true,
                    tool_pointer: true,
                    choose_tool_img: $data.showFontColorOpacity
                  }"
                >
                  <el-tooltip popper-class="tooltip-class" placement="bottom" content="不透明度">
                    <img
                      src="https://tagvv-1256030678.file.myqcloud.com/202310230txlf.png"
                      alt=""
                    />
                  </el-tooltip>
                </div>
              </template>
              <div class="tool_popver_bottom flex_box">
                <div class="one_popver_content">
                  <div class="one_popver_label">不透明度：</div>
                  <div class="one_popver_setting flex_box">
                    <el-slider
                      class="xm_slider"
                      tooltip-class="xm_slider"
                      style="width: 100px"
                      v-model="form.textStyle[index].fontColorOpacity"
                      :show-tooltip="false"
                      :show-input-controls="false"
                      :max="100"
                      :min="0"
                      :step="1"
                      @change="fontColorOpacityChangeFun"
                    ></el-slider>
                    <el-input-number
                      style="width: 100px; margin-left: 8px"
                      v-model="form.textStyle[index].fontColorOpacity"
                      :max="100"
                      :min="0"
                      :step="1"
                      controls-position="right"
                      @change="fontColorOpacityChangeFun"
                    />
                  </div>
                </div>
              </div>
            </el-popover>
          </div>
        </div>
        <!-- 描边 -->
        <div class="one_tool flex_box one_tool_text">
          <div class="tool_content">
            <el-popover
              @show="popverShowHide('showOutline', true)"
              @hide="popverShowHide('showOutline', false)"
              placement="bottom"
              :width="304"
              trigger="click"
              popper-class="tool_popver"
              :show-arrow="false"
              :offset="8"
            >
              <template #reference>
                <div
                  @click="outlineClickFun"
                  :class="{
                    tool_text: true,
                    tool_pointer: true,
                    choose_tool_text: $data.showOutline
                  }"
                >
                  描边
                </div>
              </template>
              <div class="tool_popver_bottom flex_box">
                <div class="one_popver_content">
                  <div class="one_popver_label">颜色：</div>
                  <div class="one_popver_setting flex_box">
                    <el-color-picker
                      v-model="form.textStyle[index].outlineColour"
                      @change="outlineColourChangeFun"
                    />
                  </div>
                </div>
                <div class="one_popver_content">
                  <div class="one_popver_label">宽度：</div>
                  <div class="one_popver_setting flex_box">
                    <el-slider
                      class="xm_slider"
                      tooltip-class="xm_slider"
                      style="width: 100px"
                      v-model="form.textStyle[index].outline"
                      :show-tooltip="false"
                      :show-input-controls="false"
                      :max="5"
                      :min="0"
                      :step="1"
                      @change="outlineChangeFun"
                    ></el-slider>
                    <el-input-number
                      style="width: 100px; margin-left: 8px"
                      v-model="form.textStyle[index].outline"
                      :max="5"
                      :min="0"
                      :step="1"
                      controls-position="right"
                      @change="outlineChangeFun"
                    />
                  </div>
                </div>
                <div class="one_popver_content">
                  <div class="one_popver_label">不透明度：</div>
                  <div class="one_popver_setting flex_box">
                    <el-slider
                      class="xm_slider"
                      tooltip-class="xm_slider"
                      style="width: 100px"
                      v-model="form.textStyle[index].outlineOpacity"
                      :show-tooltip="false"
                      :show-input-controls="false"
                      :max="100"
                      :min="0"
                      :step="1"
                      @change="outlineOpacityChangeFun"
                    ></el-slider>
                    <el-input-number
                      style="width: 100px; margin-left: 8px"
                      v-model="form.textStyle[index].outlineOpacity"
                      :max="100"
                      :min="0"
                      :step="1"
                      controls-position="right"
                      @change="outlineOpacityChangeFun"
                    />
                  </div>
                </div>
              </div>
            </el-popover>
          </div>
        </div>
      </template>
    </div>
    <div class="tool_right">
      <template v-if="!(form.textStyle[index].locked && form.textStyle[index].locked === 1)">
        <!-- 复制 -->
        <div class="one_tool flex_box one_tool_img">
          <div class="tool_content">
            <el-tooltip popper-class="tooltip-class" placement="bottom" content="复制">
              <div
                :class="{
                  tool_right_img: true
                }"
                @click="copyFun"
              >
                <img
                  class="img_icon"
                  src="https://tagvv-1256030678.file.myqcloud.com/20231024a4kz5.png"
                  alt=""
                />
              </div>
            </el-tooltip>
          </div>
        </div>
        <!-- 图层 -->
        <div class="one_tool flex_box one_tool_img">
          <div class="tool_content">
            <el-popover
              @show="popverShowHide('showLevel', true)"
              @hide="popverShowHide('showLevel', false)"
              placement="bottom"
              :width="110"
              trigger="click"
              popper-class="cover_choose_tool_popver"
              :show-arrow="false"
              :offset="8"
            >
              <template #reference>
                <div
                  :class="{
                    tool_right_img: true,
                    tool_pointer: true,
                    choose_right_img: $data.showLevel
                  }"
                >
                  <el-tooltip popper-class="tooltip-class" placement="bottom" content="图层">
                    <img
                      class="img_icon"
                      src="https://tagvv-1256030678.file.myqcloud.com/20231024udxbj.png"
                      alt=""
                    />
                  </el-tooltip>
                </div>
              </template>
              <div class="tool_popver_choose">
                <div class="one_popver_choose" @click="clickOfMoveUp">上移一层</div>
                <div class="one_popver_choose" @click="clickOfMoveDown">下移一层</div>
                <div class="one_popver_choose" @click="clickOfTop">置顶图层</div>
                <div class="one_popver_choose" @click="clickOfBottom">置底图层</div>
              </div>
            </el-popover>
          </div>
        </div>
      </template>
      <!-- 锁定或解锁 -->
      <div class="one_tool flex_box one_tool_img">
        <div class="tool_content">
          <el-tooltip
            popper-class="tooltip-class"
            placement="bottom"
            :content="form.textStyle[index].locked === 1 ? '点我解锁' : '点我锁定'"
          >
            <div
              :class="{
                tool_right_img: true
              }"
              @click="lockedChangeFun"
            >
              <img
                v-if="form.textStyle[index].locked === 1"
                class="img_icon"
                src="https://tagvv-1256030678.file.myqcloud.com/202310253fkid.png"
                alt=""
              />
              <img
                v-else
                class="img_icon"
                src="https://tagvv-1256030678.file.myqcloud.com/20231024qo0sd.png"
                alt=""
              />
            </div>
          </el-tooltip>
        </div>
      </div>
      <!-- 删除 -->
      <div class="one_tool flex_box one_tool_img">
        <div class="tool_content">
          <!-- <el-tooltip popper-class="tooltip-class" placement="bottom" content="删除"> -->
          <div
            :class="{
              tool_right_img: true
            }"
            @click="delFun"
          >
            <img
              class="img_icon"
              src="https://tagvv-1256030678.file.myqcloud.com/2023102439hmo.png"
              alt=""
            />
          </div>
          <!-- </el-tooltip> -->
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools'
import { getNewIndex, moveUpFun, moveDownFun, toppingFun, bottomingFun } from '../js/tool.js'

const props = defineProps({
  form: {
    type: Object,
    default: () => {}
  },
  index: {
    type: Number,
    default: null
  },
  newForm: {
    type: Object,
    default: () => {}
  },
  fontList: {
    type: Array,
    default: () => []
  }
})

const { form, index, newForm, fontList } = toRefs(props)
const $data = reactive({
  spacingMath: 10, // 字间距的最大值
  showLineSpacing: false, // 是否显示行间距的设置项
  showSpacing: false, // 是否显示字间距的设置项
  showFontColorOpacity: false, // 是否显示不透明度的设置项
  showOutline: false, // 是否显示描边的设置项
  showLevel: false // 是否显示图层的设置项
})

// 设置操作项的选中/非选中样式
function popverShowHide(type, show) {
  $data[type] = show
}
// 描边的点击事件 如果之前没设置过描边 那默认还是2px #000
const outlineClickFun = throttle(() => {
  if (form.value.textStyle[index.value]) {
    if (form.value.textStyle[index.value].borderStyle !== 1) {
      form.value.textStyle[index.value].borderStyle = 1
      form.value.textStyle[index.value].outline = 2
      form.value.textStyle[index.value].outlineColour = '#000000'
      form.value.textStyle[index.value].outlineOpacity = 100
      newForm.value.textStyle[index.value].borderStyle = 1
      newForm.value.textStyle[index.value].outline = 2
      newForm.value.textStyle[index.value].outlineColour = '#000000'
      newForm.value.textStyle[index.value].outlineOpacity = 100
    }
  }
}, 500)
// 描边宽度的修改 如果宽度为0 那就设置没有描边
function outlineChangeFun(e) {
  if (!(e && e > 0)) {
    form.value.textStyle[index.value].borderStyle = null
    form.value.textStyle[index.value].outline = 0
    form.value.textStyle[index.value].outlineColour = ''
    form.value.textStyle[index.value].outlineOpacity = 100
    newForm.value.textStyle[index.value].borderStyle = null
    newForm.value.textStyle[index.value].outline = 0
    newForm.value.textStyle[index.value].outlineColour = ''
    newForm.value.textStyle[index.value].outlineOpacity = 100
  } else {
    newForm.value.textStyle[index.value].borderStyle = form.value.textStyle[index.value].borderStyle
    newForm.value.textStyle[index.value].outline = form.value.textStyle[index.value].outline
    newForm.value.textStyle[index.value].outlineColour =
      form.value.textStyle[index.value].outlineColour
    newForm.value.textStyle[index.value].outlineOpacity =
      form.value.textStyle[index.value].outlineOpacity
  }
}
const emits = defineEmits([
  'clearActiveFun',
  'changeActiveFun',
  'delElementFun',
  'updateReplaceShow'
])

// 复制元素
const copyFun = throttle(() => {
  nextTick(() => {
    const param = JSON.parse(JSON.stringify(newForm.value.textStyle[index.value]))
    param.id = new Date().getTime()
    param.level = getNewIndex(form.value)
    const y = param.y - 10
    param.y = y > 0 ? y : 0
    form.value.textStyle.push(param)
    newForm.value.textStyle.push(JSON.parse(JSON.stringify(param)))
    // 复制完，除了最新的其余活跃状态都要清空
    nextTick(() => {
      emits('clearActiveFun', false, form.value.textStyle.length - 1, 'text')
      emits('changeActiveFun', 'text', form.value.textStyle.length - 1, true)
    })
  })
}, 500)

// 上移一层
const clickOfMoveUp = throttle(() => {
  moveUpFun(form.value.textStyle[index.value].level, form.value, newForm.value)
}, 300)

// 下移一层
const clickOfMoveDown = throttle(() => {
  moveDownFun(form.value.textStyle[index.value].level, form.value, newForm.value)
}, 300)

// 置顶图层
const clickOfTop = throttle(() => {
  toppingFun(
    index.value,
    form.value.textStyle[index.value].level,
    form.value,
    newForm.value,
    'text'
  )
}, 300)

// 置底图层
const clickOfBottom = throttle(() => {
  bottomingFun(
    index.value,
    form.value.textStyle[index.value].level,
    form.value,
    newForm.value,
    'text'
  )
}, 300)
// 删除元素
const delFun = throttle(() => {
  emits('delElementFun', index.value, 'text')
}, 500)

function fontColorChangeFun() {
  newForm.value.textStyle[index.value].fontColor = form.value.textStyle[index.value].fontColor
}
function fontChangeFun() {
  newForm.value.textStyle[index.value].font = form.value.textStyle[index.value].font
}
function fontSizeChangeFun() {
  // 修改字号时，需重新修改字间距的最大值。
  // const fontSize = form.value.textStyle[index.value].fontSize
  // $data.spacingMath = Math.ceil((fontSize - 14) / 3) + 4
  // if (form.value.textStyle[index.value].spacing > $data.spacingMath) {
  //   form.value.textStyle[index.value].spacing = $data.spacingMath
  //   newForm.value.textStyle[index.value].spacing = form.value.textStyle[index.value].spacing
  // }
  // console.log('<', $data.spacingMath)
  newForm.value.textStyle[index.value].fontSize = form.value.textStyle[index.value].fontSize
}
function fontBoldChange() {
  form.value.textStyle[index.value].fontFace.bold = !form.value.textStyle[index.value].fontFace.bold
  newForm.value.textStyle[index.value].fontFace.bold =
    form.value.textStyle[index.value].fontFace.bold
}
function fontItalicChange() {
  form.value.textStyle[index.value].fontFace.italic =
    !form.value.textStyle[index.value].fontFace.italic
  newForm.value.textStyle[index.value].fontFace.italic =
    form.value.textStyle[index.value].fontFace.italic
}
function fontUnderlineChange() {
  form.value.textStyle[index.value].fontFace.underline =
    !form.value.textStyle[index.value].fontFace.underline
  newForm.value.textStyle[index.value].fontFace.underline =
    form.value.textStyle[index.value].fontFace.underline
}

function fontSpacingChangeFun() {
  newForm.value.textStyle[index.value].spacing = form.value.textStyle[index.value].spacing
}
function fontLineSpacingChangeFun() {
  newForm.value.textStyle[index.value].lineSpacing = form.value.textStyle[index.value].lineSpacing
}
function fontColorOpacityChangeFun() {
  newForm.value.textStyle[index.value].fontColorOpacity =
    form.value.textStyle[index.value].fontColorOpacity
}
function outlineColourChangeFun() {
  newForm.value.textStyle[index.value].outlineColour =
    form.value.textStyle[index.value].outlineColour
}
function outlineOpacityChangeFun() {
  newForm.value.textStyle[index.value].outlineOpacity =
    form.value.textStyle[index.value].outlineOpacity
}
function lockedChangeFun() {
  const locked = form.value.textStyle[index.value].locked === 1 ? 0 : 1
  form.value.textStyle[index.value].locked = locked
  newForm.value.textStyle[index.value].locked = locked
  // 文字替换区是否显示
  emits('updateReplaceShow', locked === 0)
}
</script>
<style lang="scss" scoped>
@import '../scss/tool.scss';
</style>
