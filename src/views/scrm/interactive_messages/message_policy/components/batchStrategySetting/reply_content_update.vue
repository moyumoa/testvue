<template>
  <div>
    <!-- 套用模板行 -->
    <div class="content_header">
      <div class="text">
        {{
          sourcePosition.showType == 'userMessage'
            ? '匹配关键词'
            : `匹配关键词回复（识别用户${
                sourcePosition.showType == 'videoCustomer'
                  ? '评论内容'
                  : sourcePosition.showType == 'liveCustomer'
                  ? '弹幕内容'
                  : ''
              }，匹配关键词进行回复）`
        }}
      </div>
      <div
        class="select_template"
        :class="{
          disabled: disabled
        }"
        @click="onShowDialog"
      >
        <span>套用模板</span>
        <el-icon><i-arrow-right /></el-icon>
      </div>
    </div>
    <div class="rule_item" v-for="(item, index) in options" :key="index">
      <template v-if="true">
        <div class="rule_header">
          <span>规则{{ index + 1 }}:</span>
          <span
            class="del_btn"
            :class="{
              disabled: disabled
            }"
            @click="deleteRule(index)"
            v-if="index > 0"
          >
            删除
          </span>
        </div>
      </template>
      <div :class="{ rule_item_form: true }">
        <el-form ref="formRef" label-width="94px" :disabled="disabled">
          <template v-if="true">
            <el-form-item label="关键词:" :required="true">
              <!-- 关键词只有 用户私信 可以创建，其他的的都只能选择 loading基本没用了-->
              <el-select
                v-model="item.auto_reply_keywords"
                :multiple="true"
                :filterable="true"
                :remote-method="getKeyWords()"
                :remote="!sourcePosition.canCreate"
                :allow-create="sourcePosition.canCreate"
                default-first-option
                :multiple-limit="10"
                :reserve-keyword="false"
                placeholder="请添加关键词"
                :style="{ width: '418px' }"
                :popper-class="canSelect"
                :loading="sourcePosition.keyWordsObj?.loading"
                :loading-text="'加载中...'"
                :no-match-text="'暂无数据'"
                @change="onChangeKeywords($event, item)"
                @blur="onBlurKeywords($event, item)"
              >
                <el-option
                  v-for="item in sourcePosition.keyWordsObj?.list"
                  :key="item.id"
                  :label="item.keyName"
                  :value="item.keyName"
                />
              </el-select>
            </el-form-item>
          </template>
          <el-form-item label="回复内容:" :required="true">
            <div
              :style="{ 'margin-bottom': '16px' }"
              v-show="item.reply_type && item.reply_type != 'text'"
            ></div>
            <template v-for="(replyC, k) in item.auto_reply_seq" :key="k">
              <el-input
                v-model.trim="replyC.reply_content"
                placeholder="请输入回复内容"
                type="textarea"
                resize="none"
                maxlength="200"
                :autosize="{ minRows: 6, maxRows: 6 }"
                :style="{ width: '418px' }"
                show-word-limit
              ></el-input>
            </template>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <!-- 添加规则 -->
    <div
      v-if="options.length < 20"
      class="add_class"
      :class="{
        disabled: disabled
      }"
      @click="addRule"
    >
      <el-icon size="24"><i-plus /></el-icon>
      <span>添加规则</span>
    </div>
    <!-- 模板弹窗 -->
    <choose-policy-template
      v-if="$choosePolicyData.isShowDialog"
      v-model:show="$choosePolicyData.isShowDialog"
      @confirm="onSelectTemplate"
    ></choose-policy-template>
  </div>
</template>

<script setup>
import choosePolicyTemplate from '../../reply_rules_dialog/choose_policy_template.vue'
import { ElMessageBox } from 'element-plus'

const canSelect = computed(() => {
  return sourcePosition.value.canCreate ? 'rule_create_select' : ''
})

const props = defineProps({
  options: Object,
  disabled: Boolean,
  sourcePosition: {
    default: () => {
      return {
        from: null,
        canCreate: true
      }
    } // 是从哪里来的，2023/02/21改版的回复策略，不展示回复类型
  }
})
const { options, disabled, sourcePosition } = toRefs(props)
const $choosePolicyData = reactive({
  isShowDialog: false
})
// // 关键词搜索框数据
// const $selectData = reactive({
//   elOptions: [],
//   selectLoading: false
// })

const emit = defineEmits(['updateTemplateInfo'])
function onShowDialog() {
  if (disabled.value) return
  $choosePolicyData.isShowDialog = true
}
function onSelectTemplate(item) {
  emit('updateTemplateInfo', item)
  // console.log('选择完毕', item)
}

function deleteRule(index) {
  if (disabled.value) return
  ElMessageBox.confirm(`确认删除规则${index + 1}？`, '系统提醒', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    options.value.splice(index, 1)
  })
}

function addRule() {
  if (disabled.value) return
  options.value.push({
    keyWords: [],
    auto_reply_seq: [
      {
        reply_type: 'text',
        reply_content: ''
      }
    ]
  })
}
// 输入/选择关键词 失焦添加，只有 用户私信 才会起作用
function onBlurKeywords(e, item) {
  if (sourcePosition.value.canCreate)
    if (e.target.value.trim() && item.auto_reply_keywords.length < 10) {
      item.auto_reply_keywords.push(e.target.value)
    }
}
// 输入/选择 关键词改变
function onChangeKeywords(value, item) {
  // console.log('关键词改变', value, item)
  item.auto_reply_keywords = value.filter(e => String(e).trim())
}
// 更新关键词
function getKeyWords() {
  // console.log('应该更新关键词，但是这里的接口没有是获取全部的关键词，不走接口')
}
</script>

<style lang="scss" scoped></style>

<style lang="scss">
.rule_item {
  margin-bottom: 20px;
  .rule_header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    padding: 0 24px;
    background: #f6f8fa;
    font-size: 14px;
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
  color: #364fcd;
  > span {
    margin-left: 4px;
    font-size: 14px;
  }
}
.rule_create_select {
  display: none !important;
  .el-input__suffix {
    display: none !important;
  }
}

.disabled {
  cursor: not-allowed !important;
  color: #c0c4cc !important;
}

.content_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 15px;
  .text {
    font-size: 14px;
    font-weight: 400;
    color: #333333;
    line-height: 20px;
  }
  .select_template {
    display: flex;
    align-items: center;
    color: #364fcd;
    cursor: pointer;
    &.disabled {
      cursor: not-allowed;
      color: #c0c4cc;
    }
    > span {
      margin-right: 4px;
    }
  }
}
</style>
