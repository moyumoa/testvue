<template>
  <div>
    <div>
      <div>
        <div
          class="tag_list"
          v-if="addTagDialog.chooseTagList && addTagDialog.chooseTagList.length > 0"
        >
          <div
            class="one_tag"
            v-for="(item, index) in addTagDialog.chooseTagList"
            :key="index"
            :style="index === addTagDialog.chooseTagList.length - 1 ? 'margin-right: 6px;' : ''"
          >
            {{ index > 0 ? '/' : '' }}{{ item.name }}
          </div>

          <el-link :disabled="props.disabled" type="primary" @click="showDialog">修改</el-link>
        </div>
        <el-button :disabled="props.disabled" v-else type="primary" @click="showDialog">
          设置
        </el-button>
      </div>
      <div class="tip" v-if="!props.hideTip">
        {{
          props.taskType == 3
            ? '视频上传到素材库中会自动打上此处设置的标签'
            : '发布成功后，视频会存到内容库中会自动打上此处设置的标签'
        }}
      </div>
    </div>
    <!-- 设置标签 -->
    <tagDialog
      v-if="addTagDialog.show"
      :addDialog="addTagDialog"
      @updateTag="updateTag"
    ></tagDialog>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'
import tagDialog from '@/views/content_center/content_repository/components/addTag_dialog.vue'
const props = defineProps({
  tagList: Array,
  tagInfo: String,
  type: String,
  hideTip: Boolean,
  disabled: Boolean,
  taskType: Number
})
const addTagDialog = reactive({
  show: false,
  origin: 'task',
  max: 10,
  chooseTagList: [] // 选中的标签
})

// 更新标签
const emits = defineEmits(['updateTag'])
function updateTag(e) {
  console.log('选中的标签', e)
  addTagDialog.chooseTagList = e
  if (props.type === 'videoTagSet') {
    if (e.length > 0) {
      const obj = {
        tagNames: [],
        tagIds: [],
        tag: []
      }
      addTagDialog.chooseTagList.forEach(x => {
        obj.tagNames.push(x.name)
        obj.tagIds.push(x.id)
        obj.tag.push(x)
      })
      emits('updateTag', obj)
    } else {
      emits('updateTag', null)
    }
  } else {
    emits('updateTag', addTagDialog.chooseTagList)
  }
}

// 显示设置标签的弹窗
const showDialog = throttle(() => {
  addTagDialog.show = true
}, 700)

// 初始化
function init() {
  console.log('传过来的标签列表', props.tagList, props.tagInfo)
  if (props.type === 'videoTagSet') {
    if (props.tagInfo) {
      const tagInfo = JSON.parse(props.tagInfo)
      if (tagInfo.tag && tagInfo.tag.length > 0) {
        addTagDialog.chooseTagList = tagInfo.tag
      } else {
        addTagDialog.chooseTagLis = []
      }
    } else {
      addTagDialog.chooseTagList = []
    }
  } else {
    if (props.tagList && props.tagList.length > 0) {
      addTagDialog.chooseTagList = JSON.parse(JSON.stringify(props.tagList))
    } else {
      addTagDialog.chooseTagList = []
    }
  }
}
init()
</script>
<style lang="scss" scoped>
.tag_list {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  line-height: 32px;
}
</style>
