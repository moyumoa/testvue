<template>
  <div>
    <div
      style="display: flex; flex-direction: row; justify-content: flex-start; align-items: center"
    >
      <span style="margin-right: 10px">
        已{{ behavior || '选择' }}{{ (chooseList && chooseList.length) || 0 }}个{{
          choseName ? choseName : '标签'
        }}
      </span>
      <el-button @click="openChoseLabel">选择</el-button>
    </div>
    <addTagDOM v-if="addTagDialog.show" :addDialog="addTagDialog" @updateTag="updateTag" />
  </div>
</template>

<script setup>
import { isNotEmpty } from '@/utils/tools.js'
import addTagDOM from '@/views/content_center/content_repository/components/addTag_dialog.vue'
const props = defineProps({
  behavior: {
    type: String,
    default: '选择'
  }, // 文案
  choseName: {
    type: String,
    default: '标签'
  }, // 文案

  addTagInfo: {
    type: Object,
    default: () => {
      return {}
    }
  },
  chooseList: {
    type: Array,
    default: () => {
      return []
    }
  } // 已选择列表
})
const { behavior, choseName, addTagInfo, chooseList } = toRefs(props)
const emits = defineEmits(['updateTag'])
const addTagDialog = reactive({
  type: 15,
  hideTitleSpan: false,
  id: null,
  index: [],
  source: null,
  show: false,
  chooseTagList: []
})
function openChoseLabel() {
  if (isNotEmpty(addTagInfo?.value)) {
    addTagDialog.type = addTagInfo.value.type || 15
    addTagDialog.hideTitleSpan = addTagInfo.value.hideTitleSpan || false
    addTagDialog.id = addTagInfo.value.id || null
    addTagDialog.index = addTagInfo.value.index || []
    addTagDialog.source = addTagInfo.value.source || null
  } else {
    addTagDialog.type = 15
    addTagDialog.hideTitleSpan = false
    addTagDialog.id = null
    addTagDialog.index = []
    addTagDialog.source = null
  }

  addTagDialog.show = true
}
// 直接抛出，页面显示使用传入组件数据维护
function updateTag(list) {
  addTagDialog.show = false
  emits('updateTag', list)
}

watch(
  () => props.chooseList,
  val => {
    console.log('已选择标签变化', val)
    addTagDialog.chooseTagList = val || []
  },
  {
    deep: true,
    immediate: true
  }
)
</script>

<style lang="scss" scoped></style>
