<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="选择要创建的任务类型"
    width="420px"
    custom-class="hide_footer_line choose_part_dialog"
  >
    <div class="dialog_content">
      <div class="one_type" @click="chooseType(item)" v-for="item in [1, 2, 6]" :key="item">
        <img v-if="item === 2" src="@/assets/images/task/live.png" />
        <img v-if="item === 1" src="@/assets/images/task/video.png" />
        <img v-if="item === 6" src="@/assets/images/task/text.png" />
        {{ TASK_TYPE.getCN(item) }}任务
      </div>
    </div>
  </el-dialog>
</template>
<script setup>
import { TASK_TYPE } from '@/utils/dictionary/task'
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  initDialog: {
    type: Object,
    default: () => {
      return {
        showOfType: false // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.initDialog, 'showOfType')
const emits = defineEmits(['updateType'])
const chooseType = throttle(e => {
  console.log(e, '选择')
  emits('updateType', e)
  dialog.value.handleClose()
}, 500)
</script>
<style lang="scss" scoped>
.dialog_content {
  border-top: 1px solid #dcdee0;
  // width: calc(100% - 72px);
  width: calc(100%);
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding: 28px 36px 36px 36px;
  .one_type {
    width: 160px;
    height: 140px;
    border-radius: 2px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-weight: 400;
    color: #323233;
    line-height: 24px;
    cursor: pointer;
    img {
      width: 48px;
      height: 48px;
      object-fit: cover;

      margin-bottom: 8px;
    }
    &:hover {
      background: #f7f8fa;
    }
  }
  .one_type + .one_type {
    margin-left: 28px;
  }
}
</style>
