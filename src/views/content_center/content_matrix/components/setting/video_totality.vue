<template>
  <div class="conditionPage">
    <div :class="errorStu ? 'conditionBox errorBox' : 'conditionBox'">
      <div class="conditionTitle">视频总数:</div>
      <div class="conditionContent">
        <el-input
          class="formItemInput"
          v-model="form.minCount"
          clearable
          placeholder="请输入视频数"
          @blur="inputChange('min')"
          @clear="inputChange('min')"
          style="margin-right: 10px"
        />
        -
        <el-input
          class="formItemInput"
          v-model="form.maxCount"
          clearable
          @blur="inputChange('max')"
          @clear="inputChange('max')"
          placeholder="请输入视频数"
          style="margin: 0 10px"
        />
      </div>
    </div>
    <el-icon
      :class="errorStu ? 'closeCondition errorIcon' : 'closeCondition'"
      @click="delCondtionList('videoTotality')"
    >
      <i-close />
    </el-icon>
  </div>
</template>
<script setup>
const emit = defineEmits(['changeVideoNum', 'changeConditionList'])
const props = defineProps({
  errorStu: {
    type: Boolean,
    default: false
  },
  videoMin: {
    type: Number || String,
    default: undefined
  },
  videoMax: {
    type: Number || String,
    default: undefined
  }
})
const errorStu = toRef(props, 'errorStu')
const videoMin = toRef(props, 'videoMin')
const videoMax = toRef(props, 'videoMax')
const form = reactive({
  minCount: undefined, // 最少视频数
  maxCount: undefined // 最多视频数
})
// 输入框失去焦点的回调
function inputChange(stu) {
  console.log(stu)
  const reg = /^[0-9]+(\.\d+)?$/
  console.log(reg.test(form.minCount))
  if (stu === 'min') {
    if (!reg.test(form.minCount)) {
      console.log(1)
      form.minCount = undefined
    } else {
      if (parseInt(form.minCount) > parseInt(form.maxCount)) {
        form.minCount = parseInt(form.maxCount)
      } else {
        if (parseInt(form.minCount) > 99999999) {
          form.minCount = 99999999
        } else {
          form.minCount = parseInt(form.minCount)
        }
      }
    }
  } else {
    if (!reg.test(form.maxCount)) {
      form.maxCount = undefined
    } else {
      if (parseInt(form.maxCount) < parseInt(form.minCount)) {
        form.maxCount = form.minCount
      } else {
        if (parseInt(form.maxCount) > 99999999) {
          form.maxCount = 99999999
        } else {
          form.maxCount = parseInt(form.maxCount)
        }
      }
    }
  }
  console.log(form.minCount, form.maxCount)
  emit('changeVideoNum', form.minCount, form.maxCount)
}
// 关闭筛选条件的回调
function delCondtionList(stu) {
  emit('changeConditionList', stu)
}
onMounted(() => {
  form.minCount = videoMin.value
  form.maxCount = videoMax.value
})
</script>
<style lang="scss" scoped>
@import './css/condition.scss';
:deep(.el-input-number__increase) {
  display: none !important;
  width: 0 !important;
}
:deep(.el-input-number .el-input__inner) {
  padding: 0px 31px 0px 11px;
  text-align: left;
}
:deep(.el-input-number__decrease, ) {
  display: none !important;
  width: 0 !important;
}
:deep(.el-input-number) {
  width: auto !important;
}
</style>
