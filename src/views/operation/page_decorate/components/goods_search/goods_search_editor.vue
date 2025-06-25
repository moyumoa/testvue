<template>
  <div class="decorate">
    <div class="title">商品搜索</div>
    <!-- 内容 -->
    <div class="content">
      <!-- 显示位置 -->
      <!-- <div class="one_content flex_between">
        <div class="label">显示位置</div>
        <div class="content_box">
          <rulePicker
            :ruleList="positionList"
            v-model:chooseValue="componentData.position"
          ></rulePicker>
        </div>
      </div> -->
      <!-- 框体样式 -->
      <div class="one_content flex_between">
        <div class="label">框体样式</div>
        <div class="content_box">
          <rulePicker
            :ruleList="styleList"
            v-model:chooseValue="componentData.searchStyle"
          ></rulePicker>
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
      <!-- 框体高度 -->
      <div class="one_content flex_between">
        <div class="label">框体高度</div>
        <div class="content_box">
          <sliderPicker v-model:slider="componentData.height" :min="20" :max="56"></sliderPicker>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import sliderPicker from '../slider_picker/slider_picker.vue'
import rulePicker from '../rule_picker/rule_picker.vue'
defineComponent(rulePicker, sliderPicker)
const props = defineProps({
  componentData: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
const componentData = ref()

// 各种数组
// const positionList = ref([
//   {
//     label: '正常模式',
//     value: 'normal',
//     icon: 'icon-shangpinsousuo-zhengchangmoshi'
//   },
//   {
//     label: '滚动至顶部固定',
//     value: 'scroll',
//     icon: 'icon-shangpinsousuo-gundongzhidingbuguding'
//   }
// ])
const styleList = ref([
  {
    label: '方形',
    value: 'square',
    icon: 'icon-shangpinsousuo-fangxingkuangti'
  },
  {
    label: '圆形',
    value: 'circle',
    icon: 'icon-shangpinsousuo-yuanxingkuangti'
  }
])
const goodAlignList = ref([
  {
    label: '居左',
    value: 'left',
    icon: 'icon-juzuo'
  },
  {
    label: '居中',
    value: 'center',
    icon: 'icon-juzhong'
  }
])
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
</style>
