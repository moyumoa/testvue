<template>
  <el-dialog v-model="show" :title="config.title || '新增关键词'" width="400px" destroy-on-close>
    <!--    v-if="['addKeyword', 'updateKeyword'].indexOf(config.type) > -1"-->
    <el-select
      v-if="config.showSelect"
      v-model="selectValue"
      value-key="id"
      placeholder="请选择所属关键词组"
      style="width: 300px; margin-bottom: 20px"
    >
      <el-option
        v-for="item in config.keywordGroupList"
        :key="item.id"
        :value="item"
        :label="item.groupName"
      ></el-option>
    </el-select>
    <el-input
      style="width: 300px"
      @input="formatter"
      :model-value="inputValue"
      maxlength="15"
      :placeholder="config.placeholder || '请输入'"
    ></el-input>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="onConfirm">确定</el-button>
        <el-button @click="show = false">取消</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { isEmpty } from '@/utils/tools.js'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  config: Object,
  title: {
    // 弹窗标题
    type: String,
    default: '编辑关键词'
  },
  placeholder: {
    // 输入框占位符
    type: String,
    default: '请输入关键词'
  },
  initialValue: {
    // 输入框初始值
    type: String,
    default: ''
  },
  keywordGroupList: {
    // 关健词组列表
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])
const { config } = toRefs(props)
const show = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    return emit('update:modelValue', value)
  }
})
const selectValue = ref(null)
const inputValue = ref('')
if (props.config.initialValue) {
  inputValue.value = config.value.initialValue
}
if (props.config.showSelect && config.value?.selectValue) {
  const row = config.value.selectValue
  selectValue.value = {
    id: row?.groupId,
    groupName: row.groupName
  }
}

function formatter(item) {
  inputValue.value = item.replace(/\s+/g, '')
}

const onConfirm = () => {
  let result = inputValue.value
  if (props.config.showSelect) {
    if (isEmpty(selectValue.value)) return ElMessage.warning('请选择关键词组')
    result = {
      groupId: selectValue.value.id,
      keyName: inputValue.value
    }
  }
  if (isEmpty(inputValue.value)) return ElMessage.warning(props.config.placeholder)
  show.value = false
  emit('confirm', result)
}
</script>

<style lang="scss" scoped></style>
