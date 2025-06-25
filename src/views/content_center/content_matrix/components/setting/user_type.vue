<template>
  <div class="conditionPage">
    <div
      :class="errorStu ? 'conditionBox errorBox' : 'conditionBox'"
      style="align-items: flex-start"
    >
      <div class="conditionTitle">矩阵号用户类型:</div>
      <div>
        <el-radio-group @change="userTypeChange" v-model="form.type">
          <el-radio label="1" style="line-height: 30px">KOS成员</el-radio>
          <el-radio label="2" style="line-height: 30px">KOC成员</el-radio>
        </el-radio-group>
      </div>
    </div>
    <el-icon
      :class="errorStu ? 'closeCondition errorIcon' : 'closeCondition'"
      @click="delCondtionList('userType')"
    >
      <i-close />
    </el-icon>
  </div>
</template>
<script setup>
const emit = defineEmits(['changeUserType', 'changeConditionList'])
const props = defineProps({
  errorStu: {
    type: Boolean,
    default: false
  },
  userType: {
    type: String,
    default: ''
  }
})
const errorStu = toRef(props, 'errorStu')
const userType = toRef(props, 'userType')
const form = reactive({
  type: '' // 矩阵号用户类型（1：内部达人，2：外部达人）
})
// 单选按钮切换的回调
function userTypeChange(e) {
  emit('changeUserType', form.type)
}
// 关闭筛选条件的回调
function delCondtionList(stu) {
  emit('changeConditionList', stu)
}

onMounted(() => {
  form.type = userType.value
})
</script>
<style lang="scss" scoped>
@import './css/condition.scss';
</style>
