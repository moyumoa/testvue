<template>
  <div class="goods_common_editor">
    <!-- 列表样式 -->
    <div class="one_content boder_top">
      <rulePickerTitle
        title="列表样式"
        type="listStyle"
        v-model:chooseValue="componentData.listStyle"
        @updateListStyle="listStyleChange"
      ></rulePickerTitle>
    </div>
    <!-- 商品样式 -->
    <div class="one_content boder_top">
      <rulePickerTitle
        :title="`${props.type === 'booking' ? '活动' : '商品'}样式`"
        type="goodsStyle"
        v-model:chooseValue="componentData.goodsStyle"
      ></rulePickerTitle>
    </div>
    <!-- 商品倒角 -->
    <div class="one_content flex_between">
      <div class="label">{{ props.type === 'booking' ? '活动' : '商品' }}倒角</div>
      <div class="content_box">
        <rulePicker type="imgAngle" v-model:chooseValue="componentData.imgAngle"></rulePicker>
      </div>
    </div>
    <!-- 图片比例 -->
    <div class="one_content flex_between">
      <div class="label">图片比例</div>
      <div class="content_box">
        <rulePicker
          type="imgScale"
          v-model:chooseValue="componentData.scale"
          :disValue="disValue"
        ></rulePicker>
      </div>
    </div>
    <!-- 填充方式 -->
    <div class="one_content flex_between">
      <div class="label">填充方式</div>
      <div class="content_box">
        <rulePicker type="fill" v-model:chooseValue="componentData.fill"></rulePicker>
      </div>
    </div>
    <!-- 文本样式 -->
    <div class="one_content flex_between">
      <div class="label">文本样式</div>
      <div class="content_box">
        <rulePicker type="fontWeight" v-model:chooseValue="componentData.fontWeight"></rulePicker>
      </div>
    </div>
    <!-- 文本对齐 -->
    <div class="one_content flex_between">
      <div class="label">文本对齐</div>
      <div class="content_box">
        <rulePicker
          type="goodAlign"
          :ruleList="goodAlignList"
          v-model:chooseValue="componentData.textAlign"
        ></rulePicker>
      </div>
    </div>
    <!-- 页面边距 -->
    <div class="one_content flex_between">
      <div class="label">页面边距</div>
      <div class="content_box">
        <sliderPicker v-model:slider="componentData.pmargin" :min="0" :max="30"></sliderPicker>
      </div>
    </div>
    <!-- 商品间距 -->
    <div class="one_content flex_between">
      <div class="label">{{ props.type === 'booking' ? '活动' : '商品' }}间距</div>
      <div class="content_box">
        <sliderPicker v-model:slider="componentData.imargin" :min="0" :max="30"></sliderPicker>
      </div>
    </div>
    <!-- 商品名称 -->
    <div class="one_content flex_between boder_top">
      <div class="label">{{ props.type === 'booking' ? '活动' : '商品' }}名称</div>
      <div class="content_box flex_between">
        <div>{{ componentData.showTitle ? '显示' : '不显示' }}</div>
        <el-checkbox
          :disabled="componentData.listStyle === 'list'"
          v-model="componentData.showTitle"
        ></el-checkbox>
      </div>
    </div>
    <!-- 商品价格 -->
    <div class="one_content flex_between">
      <div class="label">{{ props.type === 'booking' ? '活动' : '商品' }}价格</div>
      <div class="content_box flex_between">
        <div>{{ componentData.showPrice ? '显示' : '不显示' }}</div>
        <el-checkbox v-model="componentData.showPrice"></el-checkbox>
      </div>
    </div>
  </div>
</template>
<script setup>
import sliderPicker from '../slider_picker/slider_picker.vue'
import rulePicker from '../rule_picker/rule_picker.vue'
import rulePickerTitle from '../rule_picker/rule_picker_title.vue'
defineComponent(rulePicker, sliderPicker, rulePickerTitle)
const props = defineProps({
  type: {
    type: String,
    default: ''
  },
  componentData: {
    type: Object,
    default: () => {
      return {}
    }
  }
})

const componentData = computed(() => {
  return props.componentData
})
// const componentData = ref()
const goodAlignList = ref([
  {
    label: '左对齐',
    value: 'left',
    icon: 'icon-juzuo'
  },
  {
    label: '居中对齐',
    value: 'center',
    icon: 'icon-juzhong'
  }
])
// 初始化
// function init() {
//   if (props.componentData) {
//     componentData.value = JSON.parse(JSON.stringify(props.componentData))
//   }
// }
// init()

const emits = defineEmits(['update:componentData'])
watch(
  () => componentData.value,
  newVal => {
    emits('update:componentData', newVal)
  },
  { deep: true }
)

const disValue = computed(() => {
  return componentData.value.listStyle === 'list'
})
// 列表样式切换
function listStyleChange(e) {
  componentData.value.listStyle = e
  if (e === 'list') {
    componentData.value.scale = '1.00'
    componentData.value.showTitle = true
  }
}
</script>
<style lang="scss" scoped>
@import '../scss/decorate.scss';
div {
  box-sizing: border-box;
}
</style>
