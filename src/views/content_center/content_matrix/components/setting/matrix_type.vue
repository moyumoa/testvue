<template>
  <div class="conditionPage">
    <div
      :class="errorStu ? 'conditionBox errorBox' : 'conditionBox'"
      style="align-items: flex-start"
    >
      <div class="conditionTitle">矩阵号类型:</div>
      <div>
        <el-radio-group @change="matrixTypeChange" v-model="form.type">
          <el-radio label="1" style="line-height: 30px">个人号</el-radio>
          <el-radio label="2" style="line-height: 30px">普通企业号</el-radio>
          <el-radio label="3" style="line-height: 30px">认证企业号</el-radio>
          <el-radio label="5" style="line-height: 30px">员工号-认证企业号</el-radio>
        </el-radio-group>
      </div>
    </div>
    <el-icon
      :class="errorStu ? 'closeCondition errorIcon' : 'closeCondition'"
      @click="delCondtionList('matrixType')"
    >
      <i-close />
    </el-icon>
  </div>
</template>
<script setup>
const emit = defineEmits(['changeMatrixType', 'changeConditionList'])
const props = defineProps({
  errorStu: {
    type: Boolean,
    default: false
  },
  matrixType: {
    type: String,
    default: ''
  }
})
const errorStu = toRef(props, 'errorStu')
const matrixType = toRef(props, 'matrixType')
const form = reactive({
  type: '' // 矩阵号类型（1：个人号，2：普通企业号，3：认证企业号，4：品牌企业号）
})
// 单选按钮切换的回调
function matrixTypeChange(e) {
  emit('changeMatrixType', form.type)
}
// 关闭筛选条件的回调
function delCondtionList(stu) {
  emit('changeConditionList', stu)
}

onMounted(() => {
  form.type = matrixType.value
})
</script>
<style lang="scss" scoped>
@import './css/condition.scss';
</style>
