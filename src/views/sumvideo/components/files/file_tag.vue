<template>
  <div class="file_tag" @click.stop="showRemoveFun" v-if="fileName || fileInfo.name">
    <img src="https://tagvv-1256030678.file.myqcloud.com/202403263zjwo.png" alt="" />
    <div class="file_name line-hidden1">{{ fileName || fileInfo.name }}</div>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'
import { defineProps } from 'vue'
const props = defineProps({
  fileInfo: {
    type: Object,
    default: () => {
      return {}
    }
  },
  fileName: {
    type: String,
    default: ''
  }
})
const { fileInfo, fileName } = toRefs(props)
const emits = defineEmits(['showRemoveFun'])
const showRemoveFun = throttle(() => {
  emits('showRemoveFun', fileInfo.id, fileInfo.parentIds)
}, 500)
</script>
<style lang="scss" scoped>
.file_tag {
  cursor: pointer;
  padding: 0 6px;
  width: max-content;
  max-width: 90%;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;

  font-weight: 400;
  font-size: 12px;
  color: #ffffff;
  line-height: 20px;
  text-align: left;
  font-style: normal;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  img {
    width: 16px;
    height: 16px;
    object-fit: contain;
    display: flex;
    margin-right: 4px;
  }
  .file_name {
    max-width: calc(100% - 20px);
  }
}
</style>
