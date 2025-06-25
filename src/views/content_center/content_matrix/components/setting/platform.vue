<template>
  <div class="conditionPage">
    <div
      :class="errorStu ? 'conditionBox errorBox' : 'conditionBox'"
      style="align-items: flex-start"
    >
      <div class="conditionTitle">所属平台:</div>
      <div>
        <el-radio-group @change="platformChange" v-model="form.type">
          <el-radio label="1" style="line-height: 30px">抖音</el-radio>
          <el-radio label="2" style="line-height: 30px">视频号</el-radio>
          <el-radio label="3" style="line-height: 30px">小红书</el-radio>
          <el-radio label="4" style="line-height: 30px">快手</el-radio>
        </el-radio-group>
      </div>
    </div>
    <el-icon
      :class="errorStu ? 'closeCondition errorIcon' : 'closeCondition'"
      @click="delCondtionList('platform')"
    >
      <i-close />
    </el-icon>
  </div>
</template>
<script setup>
const emit = defineEmits(['changePlatform', 'changeConditionList'])
const props = defineProps({
  errorStu: {
    type: Boolean,
    default: false
  },
  platform: {
    type: String,
    default: ''
  }
})
const errorStu = toRef(props, 'errorStu')
const platform = toRef(props, 'platform')
const form = reactive({
  type: '' // 所属平台 1 抖音 2 视频号 3 小红书
})
// 单选按钮切换的回调
function platformChange(e) {
  emit('changePlatform', form.type)
}
// 关闭筛选条件的回调
function delCondtionList(stu) {
  emit('changeConditionList', stu)
}

onMounted(() => {
  form.type = platform.value
})
</script>
<style lang="scss" scoped>
@import './css/condition.scss';
</style>
