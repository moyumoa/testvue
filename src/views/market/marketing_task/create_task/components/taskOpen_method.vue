<template>
  <div class="setting_block">
    <div class="setting_title">任务开启方式</div>
    <div class="setting_main">
      <el-form-item label="开启方式：" prop="isAutoStart">
        <el-radio-group v-model="taskInfo.isAutoStart" :disabled="disabled">
          <el-radio v-for="(item, index) in methodList" :key="index" :label="item.id">
            {{ item.label }}
          </el-radio>
        </el-radio-group>
        <div class="tip small_tips" v-if="taskInfo.isAutoStart === 1">
          任务审核通过后将自动开启，无需审核的任务创建后即自动开启
        </div>
        <div class="tip small_tips" v-if="taskInfo.isAutoStart === 0">
          任务审核通过后需手动开启，无需审核的任务创建后可手动开启
        </div>
      </el-form-item>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  taskInfo: Object,
  disabled: Boolean
})
const taskInfo = toRef(props, 'taskInfo')
const disabled = toRef(props, 'disabled')

const methodList = reactive([
  {
    id: 1,
    label: '自动开启'
  },
  {
    id: 0,
    label: '手动开启'
  }
])
</script>
<style lang="scss" scoped></style>
