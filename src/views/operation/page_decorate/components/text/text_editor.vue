<template>
  <div class="decorate">
    <div class="title">文本</div>
    <!-- 内容 -->
    <div class="content">
      <!-- 文本 -->
      <div class="one_content">
        <div class="label" style="margin-bottom: 16px">文本</div>
        <div>
          <el-input
            :rows="5"
            type="textarea"
            maxlength="100"
            v-model.trim="componentData.text"
            show-word-limit
            resize="none"
            placeholder="请输入要说明的文字，最多100字"
          ></el-input>
        </div>
      </div>
      <!-- 字体大小 -->
      <div class="one_content flex_between">
        <div class="label">字体大小</div>
        <div class="content_box">
          <rulePicker
            :ruleList="sizeList"
            type="fontSize"
            v-model:chooseValue="componentData.fontSize"
          ></rulePicker>
        </div>
      </div>
      <!-- 文本颜色 -->
      <div class="one_content flex_between">
        <div class="label">文本颜色</div>
        <div class="content_box flex_end">
          <colorPicker ref="colorPickerA" v-model:color="componentData.color"></colorPicker>
        </div>
      </div>
      <!-- 背景颜色 -->
      <div class="one_content flex_between">
        <div class="label">背景颜色</div>
        <div class="content_box flex_end">
          <colorPicker
            ref="colorPickerB"
            v-model:color="componentData.backgroundColor"
          ></colorPicker>
        </div>
      </div>
      <!-- 显示位置 -->
      <div class="one_content flex_between">
        <div class="label">显示位置</div>
        <div class="content_box">
          <rulePicker type="textAlign" v-model:chooseValue="componentData.textAlign"></rulePicker>
        </div>
      </div>
      <!-- 链接 -->
      <div class="one_content flex_between">
        <div class="label">链接</div>
        <div class="content_box flex_end">
          <template v-if="componentData.link">
            <div class="choose_link">
              <div class="choose_link_text line-hidden1" @click="showModalFun">
                {{ componentData.link.label || '--' }}
              </div>
              <div class="choose_link_icon">
                <el-icon @click="clearLink"><i-close /></el-icon>
              </div>
            </div>
          </template>
          <template v-else>
            <el-link type="primary" @click="showModalFun">设置连接</el-link>
          </template>
        </div>
      </div>

      <!-- 底部分割线 -->
      <div class="one_content flex_between">
        <div class="label">底部分割线</div>
        <div class="content_box flex_between" style="width: calc(100% - 96px)">
          <div>{{ componentData.showBottomLine ? '显示' : '不显示' }}</div>
          <el-checkbox v-model="componentData.showBottomLine"></el-checkbox>
        </div>
      </div>
      <!-- 文本样式 -->
      <div class="one_content flex_between">
        <div class="label">文本样式</div>
        <div class="content_box">
          <rulePicker type="fontWeight" v-model:chooseValue="componentData.fontWeight"></rulePicker>
        </div>
      </div>
    </div>
    <chooseModal v-if="modal.show" :modal="modal" @upLink="upLink"></chooseModal>
  </div>
</template>
<script setup>
import chooseModal from '@/views/operation/components/choose_modal/choose_modal.vue'
import rulePicker from '../rule_picker/rule_picker.vue'
import colorPicker from '../color_picker/color_picker.vue'
defineComponent(colorPicker, rulePicker, chooseModal)
const props = defineProps({
  componentData: {
    type: Object
  }
})
const componentData = ref()
// 字体大小的数组
const sizeList = ref([
  {
    label: '大（16）号',
    value: '16px'
  },
  {
    label: '中（14）号',
    value: '14px'
  },
  {
    label: '小（12）号',
    value: '12px'
  }
])
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
const modal = ref({
  show: false
})
function showModalFun() {
  modal.value.show = true
}
// 选中的链接
function upLink(e) {
  console.log('text--link：', e)
  componentData.value.link = e
}
function clearLink() {
  componentData.value.link = null
}
</script>
<style lang="scss" scoped>
@import '../scss/decorate.scss';
</style>
