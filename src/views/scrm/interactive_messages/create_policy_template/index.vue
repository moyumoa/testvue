<template>
  <div>
    <div class="form_warapper">
      <el-form ref="formRef" :model="templateInfo" :rules="rules" label-width="330px">
        <div class="form_block">
          <div class="block_title">基本信息</div>
          <div class="block_main">
            <el-form-item label="模板名称：" prop="name">
              <el-input
                v-model.trim="templateInfo.name"
                placeholder="请输入模板名称"
                maxlength="10"
                :autosize="{ minRows: 1, maxRows: 1 }"
                :disabled="!!type"
              ></el-input>
            </el-form-item>
            <el-form-item label="模板简介：" prop="description">
              <el-input
                v-model.trim="templateInfo.description"
                placeholder="请输入模板简介"
                type="textarea"
                resize="none"
                maxlength="44"
                :autosize="{ minRows: 4, maxRows: 6 }"
                show-word-limit
                :disabled="!!type"
              ></el-input>
            </el-form-item>
          </div>
        </div>
        <div class="form_block">
          <div class="block_title">模板内容</div>
          <div class="block_main rule_wrapper" v-if="templateInfo.rules">
            <policy-template-rules
              :rules="templateInfo.rules"
              :type="type"
              @updateValidate="updateValidate"
            ></policy-template-rules>
          </div>
        </div>
      </el-form>
    </div>
    <div class="footer_btns" v-if="!type">
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" @click="saveTemplate" :loading="saving">保存</el-button>
    </div>
    <div class="footer_btns" v-else>
      <el-button @click="cancel">返回</el-button>
    </div>
  </div>
</template>

<script setup>
import policyTemplateRules from './policy_template_rules.vue'
import createPolicy from './create_policy'
import { useRoute } from 'vue-router'

const route = useRoute()
const formRef = ref(null)
const id = route.query.id || ''
const type = route.query.type || null

const { templateInfo, rules, saving, cancel, saveTemplate } = createPolicy(formRef, id, type)
console.log(templateInfo, 'templateInfo')
function updateValidate(formKey) {
  console.log('触发updateValidate', formKey)
  formRef.value.validateField(formKey)
}
</script>

<style lang="scss" scoped>
.form_block {
  background: #ffffff;
  border-radius: 4px;
  margin-bottom: 16px;
  .block_title {
    padding-left: 24px;
    line-height: 50px;
    border-bottom: 1px solid #e8e8e8;
    font-size: 18px;
    color: #323233;
  }
  .block_main {
    padding: 32px 0;
  }
  .rule_wrapper {
    width: 1020px;
    padding-left: 224px;
  }
}
.footer_btns {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 58px;
  box-sizing: border-box;
  background: #fff;
  > button {
    margin: 0 16px;
  }
}
:deep .el-form-item__content {
  display: block;
  flex: 0 0 345px;
}
</style>

<style lang="scss">
.rule_item_form {
  .el-input__suffix {
    display: none !important;
  }
}
.rule_create_select {
  display: none !important;
}
</style>
