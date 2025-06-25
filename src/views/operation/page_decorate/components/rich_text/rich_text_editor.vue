<template>
  <div class="decorate">
    <div class="title">富文本</div>
    <!-- 内容 -->
    <div class="content">
      <!-- 背景颜色 -->
      <div class="one_content flex_between">
        <div class="label">背景颜色</div>
        <div class="content_box flex_end" v-if="componentData.backgroundColor">
          <colorPicker
            ref="colorPickerB"
            v-model:color="componentData.backgroundColor"
          ></colorPicker>
        </div>
      </div>
      <!-- neirong -->
      <div class="one_content">
        <div id="richText" style="width: 100%"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import colorPicker from '../color_picker/color_picker.vue'
import E from 'wangeditor'
defineComponent(colorPicker)
const props = defineProps({
  componentData: {
    type: Object,
    default: () => {
      return {
        background: '#fff'
      }
    }
  }
})
const componentData = ref({
  background: '#fff'
})

const editor = ref(null)
onMounted(() => {
  editor.value = new E('#richText')
  editor.value.config.menus = [
    'head',
    'bold',
    'italic',
    'underline',
    'strikeThrough',
    'foreColor',
    'justify',
    'image'
  ]
  // 设置编辑区域高度为 500px
  editor.value.config.height = 400
  editor.value.config.zIndex = 3
  editor.value.config.fontSize = 14
  editor.value.config.uploadImgServer = '/api/v1/system/account/uploadImage'
  editor.value.config.uploadFileName = 'file'
  editor.value.config.uploadImgHeaders = {
    'X-Requested-With': 'XMLHttpRequest',
    token: localStorage.getItem('token')
  }
  editor.value.config.uploadImgHooks = {
    customInsert: function (insertImgFn, result) {
      if (result.code === 0) {
        insertImgFn(result.data)
      }
    }
  }
  onBeforeUnmount(() => {
    editor.value.destroy()
    editor.value = null
  })

  // 配置 onchange 回调函数
  editor.value.config.onchange = function (newHtml) {
    componentData.value.content = newHtml
  }
  // 配置触发 onchange 的时间频率，默认为 200ms
  editor.value.config.onchangeTimeout = 500 // 修改为 500ms
  editor.value.create()

  init()
})
// 初始化
function init() {
  if (props.componentData) {
    componentData.value = JSON.parse(JSON.stringify(props.componentData))
    editor.value.txt.html(componentData.value.content)
  }
}
const emits = defineEmits(['update:componentData'])
watch(
  () => componentData.value,
  newVal => {
    emits('update:componentData', newVal)
  },
  { deep: true }
)
// watch(
//   props.componentData,
//   () => {
//     init()
//   },
//   { deep: true }
// )
</script>
<style scoped lang="scss">
@import '../scss/decorate.scss';
</style>
