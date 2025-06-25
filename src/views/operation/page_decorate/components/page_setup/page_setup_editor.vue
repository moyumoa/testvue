<template>
  <div class="decorate">
    <div class="title">页面设置</div>
    <!-- 内容 -->
    <div class="content">
      <!-- 页面标题 -->
      <div class="one_content">
        <div class="label" style="margin-bottom: 16px">页面标题</div>
        <div>
          <!-- @blur="retEmit($event)" -->
          <el-input
            maxlength="20"
            v-model.trim="componentData.title"
            resize="none"
            placeholder="请输入页面标题"
            clearable
          ></el-input>
        </div>
      </div>
      <!-- 背景颜色 -->
      <div class="one_content flex_between" style="align-items: flex-start">
        <div class="label" style="line-height: 34px">背景颜色</div>
        <div class="content_box">
          <rulePicker
            :ruleList="backgroundList"
            type="pageBackground"
            @upBackground="upBackground"
            v-model:chooseValue="componentData.diyColor"
          ></rulePicker>
          <colorPicker
            v-if="componentData.diyColor == '2'"
            style="margin-top: 16px"
            ref="colorPickerA"
            v-model:color="componentData.backgroundColor"
          ></colorPicker>
        </div>
      </div>
      <!-- 关注品牌号 -->
      <!-- <div class="one_content flex_between">
        <div class="label">关注品牌号</div>
        <div class="content_box flex_between" style="width: calc(100% - 96px)">
          <div>{{ componentData.follow ? '展示' : '不展示' }}</div>
          <el-checkbox v-model="componentData.follow"></el-checkbox>
        </div>
      </div> -->
    </div>
  </div>
</template>
<script setup>
import rulePicker from '../rule_picker/rule_picker.vue'
import colorPicker from '../color_picker/color_picker.vue'
defineComponent(colorPicker, rulePicker)
const props = defineProps({
  componentData: {
    type: Object
  }
})
const componentData = computed(() => {
  return props.componentData
})
const backgroundList = ref([
  {
    label: '默认背景颜色',
    value: '1',
    hideLabel: true
  },
  {
    label: '自定义背景颜色',
    value: '2',
    hideLabel: true
  }
])
// 背景颜色修改
function upBackground() {
  if (componentData.value.diyColor === '1') {
    componentData.value.backgroundColor = '#fff'
  }
}
const emits = defineEmits(['upPageSetup'])
watch(
  () => componentData.value,
  newVal => {
    emits('upPageSetup', newVal)
  },
  { deep: true }
)
// 检查是否有表情包
// function retEmit(e) {
// const reg =
// /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
// componentData.value.title = e.target.value.replace(reg, '')
// }
</script>
<style lang="scss" scoped>
@import '../scss/decorate.scss';
</style>
