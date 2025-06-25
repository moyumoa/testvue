<template>
  <div class="rule_item" v-for="(item, index) in rules" :key="index">
    <div class="rule_header">
      <span>规则{{ index + 1 }}:</span>
      <span class="del_btn" @click="deleteRule(index)" v-if="index > 0">删除</span>
    </div>
    <div class="rule_item_form">
      <el-form-item
        label="关键词："
        :prop="`rules[${index}].keywords`"
        :rules="[
          {
            required: true,
            validator: () => validatorKeywords(item)
          }
        ]"
        label-width="114px"
      >
        <el-select
          v-model="item.keywords"
          multiple
          filterable
          allow-create
          default-first-option
          :multiple-limit="10"
          :reserve-keyword="false"
          placeholder="请添加关键词"
          popper-class="rule_create_select"
          :style="{ width: '662px' }"
          :disabled="!!type"
          @change="onChangeKeywords($event, item)"
          @blur="onBlurKeywords($event, item, index)"
        ></el-select>
      </el-form-item>
      <el-form-item
        label="回复内容："
        :prop="`rules[${index}].replyContent`"
        :rules="[
          {
            required: true,
            message: '请输入回复内容',
            trigger: 'blur'
          }
        ]"
        label-width="114px"
      >
        <el-input
          v-model.trim="item.replyContent"
          placeholder="请输入回复内容"
          type="textarea"
          resize="none"
          maxlength="200"
          :autosize="{ minRows: 6, maxRows: 6 }"
          :style="{ width: '662px' }"
          show-word-limit
          :disabled="!!type"
        ></el-input>
      </el-form-item>
    </div>
  </div>
  <div class="add_class" @click="addRule" v-if="rules.length < 20 && !type">
    <el-icon size="24" color="#364fcd"><i-plus /></el-icon>
    <span>添加规则</span>
  </div>
</template>

<script setup>
import { ElMessageBox } from 'element-plus'

const props = defineProps({
  rules: Object,
  type: String
})
const { rules, type } = toRefs(props)
console.log(rules.value, type.value, 'rules value')
const emits = defineEmits(['updateValidate'])

function validatorKeywords(item) {
  return new Promise((resolve, reject) => {
    if (!item.keywords || !item.keywords.length) {
      reject(new Error('请添加关键词'))
    } else {
      resolve()
    }
  })
}

function addRule() {
  rules.value.push({
    keywords: [],
    replyContent: ''
  })
}

function deleteRule(index) {
  ElMessageBox.confirm(`确认删除规则${index + 1}？`, '系统提醒', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    rules.value.splice(index, 1)
  })
}

function onBlurKeywords(e, item, index) {
  if (e.target.value.trim() && item.keywords.length < 10) {
    item.keywords.push(e.target.value)
    emits('updateValidate', `rules[${index}].keywords`)
  }
}
function onChangeKeywords(value, item) {
  item.keywords = value.filter(e => e.trim())
}
</script>

<style lang="scss" scoped>
.rule_item {
  margin-bottom: 20px;
  .rule_header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    padding: 0 24px;
    background: #f6f8fa;
    font-size: 16px;
    .del_btn {
      cursor: pointer;
      color: #364fcd;
      font-size: 14px;
    }
  }
  .rule_item_form {
    padding: 20px 0;
    border: 1px solid #dcdee0;
    border-top: none;
  }
}
.add_class {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  background: #f6f8fa;
  > span {
    margin-left: 4px;
    font-size: 14px;
    color: #364fcd;
  }
}
</style>
