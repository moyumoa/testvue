<template>
  <div class="setting_block">
    <div class="setting_title">内容设置</div>
    <div class="setting_main">
      <template v-for="(config, index) in courseConfig.children" :key="index">
        <el-form-item
          v-if="$data.showKeys.includes(config.ckey)"
          :label="`${config.name}：`"
          :prop="config.ckey"
        >
          <!-- 学习形式 -->
          <div class="form_item_content" v-if="config.ckey == 'course_form'">
            <el-radio-group v-model="config.cvalue" @change="courseFormChange" :disabled="disabled">
              <el-radio
                :label="item.value"
                v-for="(item, index) in $data.studyTypeList"
                :key="index"
              >
                {{ item.label }}
              </el-radio>
            </el-radio-group>
            <div class="tip">
              {{
                config.cvalue === '1' ? '一键选择下发课程库中的课程' : '线下学习，无需选择线上课程'
              }}
            </div>
          </div>
          <!-- 备注信息 -->
          <div class="form_item_content" v-if="config.ckey == 'course_note'">
            <el-input
              v-model.trim="config.cvalue"
              :disabled="disabled"
              placeholder="请简要描述本次学习基本内容"
              type="textarea"
              resize="none"
              maxlength="150"
              :autosize="{ minRows: 4, maxRows: 6 }"
              show-word-limit
            ></el-input>
          </div>
          <!-- 学习内容 -->
          <div class="form_item_content" v-if="config.ckey == 'learning_content'">
            <choose-class-dialog
              v-model:classInfo="$data.classInfo"
              :disabled="disabled"
            ></choose-class-dialog>
          </div>
        </el-form-item>
      </template>
    </div>
  </div>
</template>

<script setup>
import { STUDY_TYPE } from '@/utils/dictionary/task'
import chooseClassDialog from './choose_class_dialog.vue'

const props = defineProps({
  courseConfig: Object,
  disabled: Boolean
})
const { courseConfig, disabled } = toRefs(props)
const emits = defineEmits(['updateValidate'])

const $data = reactive({
  classInfo: {},
  studyTypeList: [],
  onlineKeys: ['course_form', 'learning_content'],
  offlineKeys: ['course_form', 'course_note'],
  showKeys: []
})
$data.studyTypeList = STUDY_TYPE.dictionaries.map(e => {
  return {
    label: e.cn,
    value: e.value
  }
})
watch(
  () => $data.classInfo,
  val => {
    courseConfig.value.children.forEach(config => {
      if (config.ckey === 'learning_content') {
        config.cvalue = JSON.stringify(val) === '{}' ? '' : JSON.stringify(val)
        emits('updateValidate', 'learning_content')
      }
    })
  },
  { deep: true }
)

onMounted(() => {
  courseConfig.value.children.forEach(config => {
    if (config.ckey === 'course_form' && !config.cvalue) {
      config.cvalue = '1'
    }
    if (config.cvalue) {
      if (config.ckey === 'learning_content') {
        $data.classInfo = JSON.parse(config.cvalue)
      }
    }
    if (config.ckey === 'course_form') {
      courseFormChange(config.cvalue)
    }
  })
})

// 学习形式的值变化
function courseFormChange(e) {
  console.log('学习形式', e)
  if (e === '1') {
    $data.showKeys = $data.onlineKeys
    clearValue('course_note')
    emits('updateValidate', 'course_note')
  } else {
    $data.showKeys = $data.offlineKeys
    $data.classInfo = {}
    clearValue('learning_content')
  }
}
// 清空对应的值
function clearValue(type) {
  for (const i in courseConfig.value.children) {
    const config = courseConfig.value.children[i]
    if (config.ckey === type) {
      config.cvalue = ''
    }
  }
}
</script>

<style lang="scss" scoped></style>
