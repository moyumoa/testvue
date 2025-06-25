<template>
  <div class="tool_page">
    <div class="tool_left flex_box"></div>
    <div class="tool_right">
      <template v-if="!(form.imageStyle[index].locked && form.imageStyle[index].locked === 1)">
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
        <!-- 水平翻转 -->
        <div class="one_tool flex_box one_tool_img">
          <div class="tool_content">
            <el-tooltip popper-class="tooltip-class" placement="bottom" content="水平翻转">
              <div
                :class="{
                  tool_right_img: true
                }"
                @click="flipChangeFun"
              >
                <img
                  class="img_icon"
                  src="https://tagvv-1256030678.file.myqcloud.com/20231024ylc47.png"
                  alt=""
                />
              </div>
            </el-tooltip>
          </div>
        </div>
        <!-- 纵向翻转 -->
        <!-- <div class="one_tool flex_box one_tool_img">
        <div class="tool_content">
          <el-tooltip popper-class="tooltip-class" placement="bottom" content="纵向翻转">
            <div
              :class="{
                tool_right_img: true
              }"
              @click="filpOfVerticalFun"
            >
              <img
                class="img_icon"
                src="https://tagvv-1256030678.file.myqcloud.com/20231024ockq4.png"
                alt=""
              />
            </div>
          </el-tooltip>
        </div>
      </div> -->
      </template>
      <!-- 锁定或解锁 -->
      <div class="one_tool flex_box one_tool_img">
        <div class="tool_content">
          <el-tooltip
            popper-class="tooltip-class"
            placement="bottom"
            :content="form.imageStyle[index].locked === 1 ? '点我解锁' : '点我锁定'"
          >
            <div
              :class="{
                tool_right_img: true
              }"
              @click="lockedChangeFun"
            >
              <img
                v-if="form.imageStyle[index].locked === 1"
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

  canvasW: {
    type: Number,
    default: 375
  },
  canvasH: {
    type: Number,
    default: 666.666
  }
})

const { form, index, newForm, canvasW, canvasH } = toRefs(props)
const $data = reactive({
  fontList: [],
  showLineSpacing: false, // 是否显示行间距的设置项
  showSpacing: false, // 是否显示字间距的设置项
  showFontColorOpacity: false, // 是否显示不透明度的设置项
  showOutline: false, // 是否显示描边的设置项
  showLevel: false // 是否显示图层的设置项
})
function popverShowHide(type, show) {
  $data[type] = show
}

const emits = defineEmits(['clearActiveFun', 'changeActiveFun', 'delElementFun'])

// 复制元素
const copyFun = throttle(() => {
  nextTick(() => {
    const param = JSON.parse(JSON.stringify(newForm.value.imageStyle[index.value]))
    param.id = new Date().getTime()
    param.level = getNewIndex(form.value)
    const y = param.y + 10
    const x = param.x + 10
    param.y = y + param.height < canvasH.value ? y : canvasH.value - param.height
    param.x = x + param.width < canvasW.value ? x : canvasW.value - param.width
    form.value.imageStyle.push(param)

    newForm.value.imageStyle.push(JSON.parse(JSON.stringify(param)))
    // 复制完，除了最新的其余活跃状态都要清空
    nextTick(() => {
      emits('clearActiveFun', false, form.value.imageStyle.length - 1, 'image')
      emits('changeActiveFun', 'image', form.value.imageStyle.length - 1, true)
    })
  })
}, 500)

// 上移一层
const clickOfMoveUp = throttle(() => {
  moveUpFun(form.value.imageStyle[index.value].level, form.value, newForm.value)
}, 300)

// 下移一层
const clickOfMoveDown = throttle(() => {
  moveDownFun(form.value.imageStyle[index.value].level, form.value, newForm.value)
}, 300)

// 置顶图层
const clickOfTop = throttle(() => {
  toppingFun(
    index.value,
    form.value.imageStyle[index.value].level,
    form.value,
    newForm.value,
    'image'
  )
}, 300)

// 置底图层
const clickOfBottom = throttle(() => {
  bottomingFun(
    index.value,
    form.value.imageStyle[index.value].level,
    form.value,
    newForm.value,
    'image'
  )
}, 300)
// 删除元素
const delFun = throttle(() => {
  emits('delElementFun', index.value, 'image')
}, 500)
function lockedChangeFun() {
  form.value.imageStyle[index.value].locked =
    form.value.imageStyle[index.value].locked === 1 ? 0 : 1

  newForm.value.imageStyle[index.value].locked = form.value.imageStyle[index.value].locked
}
// 水平翻转
function flipChangeFun() {
  form.value.imageStyle[index.value].flip =
    form.value.imageStyle[index.value].flip === 'horizontal' ? '' : 'horizontal'
  newForm.value.imageStyle[index.value].flip = form.value.imageStyle[index.value].flip
}
</script>
<style lang="scss" scoped>
@import '../scss/tool.scss';
</style>
