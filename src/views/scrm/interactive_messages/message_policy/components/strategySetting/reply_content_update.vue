<template>
  <div>
    <div class="content_header_area">
      匹配关键词回复
      <span style="color: #909399">
        ({{
          sourcePosition.showType === 'userMessage'
            ? '对私信对话中的关键词进行回复'
            : '对命中关键词的评论进行回评，1个视频同1个用户仅支持1次'
        }})
      </span>
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
                :reserve-keyword="false"
                :allow-create="sourcePosition.canCreate"
                default-first-option
                :multiple-limit="100"
                placeholder="请添加关键词"
                :style="{ width: '418px' }"
                @remove-tag="removeTag"
                @visible-change="updateKeyWords($event, index)"
              >
                <template #empty>
                  <el-collapse v-model="activityGroups" :name="index" :key="index">
                    <div class="item_warp">
                      <el-collapse-item
                        :name="index_group"
                        v-for="(group, index_group) in choseList[currentOptionsIndex]"
                        :key="index_group"
                      >
                        <template #title>
                          <div class="collapse_title">
                            <!-- 多选框 -->
                            <div
                              class="checked_box"
                              @click.stop="
                                updateGroup(group, item.auto_reply_keywords, index_group)
                              "
                              :class="{
                                'activity-100-check':
                                  group.isActive === 100 && index === currentOptionsIndex,
                                'activity-101-check':
                                  group.isActive === 101 && index === currentOptionsIndex,
                                'activity-102-check':
                                  group.isActive === 102 && index === currentOptionsIndex,
                                'disabled-check': group.scrmKeywords.length === 0
                              }"
                            ></div>
                            <span
                              style="margin-left: 8px"
                              :class="{
                                'activity-100-text': group.isActive === 100
                              }"
                            >
                              {{ group.groupName }}
                            </span>
                          </div>
                        </template>
                        <div class="keyWords_warp">
                          <div
                            class="keyWords_item"
                            style="cursor: pointer"
                            v-for="(keyWords, wordsIndex) in group.scrmKeywords"
                            :key="wordsIndex"
                            @click="choseOne(group, keyWords, item.auto_reply_keywords)"
                          >
                            <div
                              class="childCheckbox"
                              :class="{ childCheckbox_active: keyWords.keyActive }"
                            ></div>
                            <span style="margin-left: 8px">
                              {{ keyWords.keyName }}
                            </span>
                          </div>
                        </div>
                      </el-collapse-item>
                    </div>
                  </el-collapse>
                </template>
                <!-- <el-option-group
                  v-for="(group, index_group) in sourcePosition.keyWordsObj.list"
                  :key="index_group"
                  :label="getGroupName(group.groupName)"
                  @click="chooseGroup(group, item.auto_reply_keywords)"
                  style="cursor: pointer"
                >
                  <el-option
                    v-for="item in group.scrmKeywords"
                    :key="item.id"
                    :label="item.keyName"
                    :value="item.keyName"
                  />
                </el-option-group> -->
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
                :maxlength="100"
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
      <el-icon size="24">
        <i-plus />
      </el-icon>
      <span>添加规则</span>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox } from 'element-plus'
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

function deleteRule(index) {
  if (disabled.value) return
  ElMessageBox.confirm(`确认删除规则${index + 1}？`, '系统提醒', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    options.value.splice(index, 1)
    getChoseList()
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
  getChoseList()
}
// 点击select内选中词后的删除，数据上已经同步，只需将显示同步即可
function removeTag() {
  initIsActive()
}

const activityGroups = ref([]) // 展开的折叠面板信息--每次切换的时候要把他关掉
// 当前点击的options的index
const currentOptionsIndex = ref(0)
function updateKeyWords(val, index) {
  console.log('下拉框隐藏', val, index)
  if (val) {
    currentOptionsIndex.value = index
    initIsActive()
  } else {
    activityGroups.value = []
  }
}

// 选择词组/取消选择词组
function updateGroup(group, autoReplyKeywords, index) {
  if (group.isActive === 100) {
    // 取消全选收起词组
    // activityGroups.value = activityGroups.value.filter(x => {
    //   return x !== index
    // })
    // 取消选择词组
    cancelChoseAll(group, autoReplyKeywords)
  }
  if (group.isActive === 101 || group.isActive === 102) {
    activityGroups.value.push(index)
    // 选择词组
    chooseGroup(group, autoReplyKeywords)
  }
  // 更新选中状态
  nextTick(() => {
    initIsActive(group.groupName)
  })
}
// 选择一个/取消选择一个
function choseOne(group, item, autoReplyKeywords) {
  if (item.keyActive) {
    // 取消选择
    const index = autoReplyKeywords.indexOf(item.keyName)
    if (index !== -1) {
      autoReplyKeywords.splice(index, 1)
    }
  }
  if (!item.keyActive) {
    // 添加选择
    if (autoReplyKeywords.length < 100) {
      if (autoReplyKeywords.indexOf(item.keyName) === -1) {
        autoReplyKeywords.push(item.keyName)
      }
    }
  }
  // 更新选中状态
  nextTick(() => {
    initIsActive(group.groupName)
  })
}

// 初始化词组选中/关键词选中 onlyGroup是否只更词数组状态，onlyGroupItem是否只更新单个词（scrmKeywords数组的item）
function initIsActive(groupName = null, onlyGroup = true, onlyGroupItem = true) {
  // 给每个内容不为空的词组加上是否选中的控制变量isActive：true是全选，false不是全选
  // 给每个关键词添加添加属性keyActive：true选中，false未选中
  let forEachList = choseList.value[currentOptionsIndex.value]
  const optionsValue = options.value

  if (groupName) {
    forEachList = forEachList.filter(x => {
      return x.groupName === groupName
    })
  }

  forEachList.forEach(groupItem => {
    if (onlyGroup) {
      groupItem.isActive = null
      addIsActive(groupItem)
    }
    if (onlyGroupItem) {
      groupItem.scrmKeywords.forEach(keyWordsItem => {
        keyWordsItem.keyActive = false
        checkKeywords(keyWordsItem, optionsValue)
      })
    }
  })
}

// 添加词组选中
function addIsActive(groupItem) {
  if (!groupItem.scrmKeywords.length) return
  // 找出groupItem.scrmKeywords是否全包含在optionsItem.auto_reply_keywords内
  checkKeywordsGroup(groupItem, options.value)
}

// 判断词组是否选中，用于显示按钮状态 100：全选中 101：部分选中 102：全部都未选中
function checkKeywordsGroup(groupItem, options) {
  const keywords = options[currentOptionsIndex.value].auto_reply_keywords
  const { scrmKeywords } = groupItem
  let isActive
  // 判断是否全部包含
  if (scrmKeywords.every(keyword => keywords.includes(keyword.keyName))) {
    isActive = 100
  } else {
    // 判断部分包含还是一个也不包含
    const includedKeywords = scrmKeywords.filter(keyword => keywords.includes(keyword.keyName))
    if (includedKeywords.length > 0) {
      isActive = 101
    } else {
      isActive = 102
    }
  }
  groupItem.isActive = isActive
}
// 判断关键词是否选中，用于添加样式
function checkKeywords(keyWordsItem, options) {
  const autoReplyKeywords = options[currentOptionsIndex.value].auto_reply_keywords
  const keyName = keyWordsItem.keyName

  let keyActive = false
  if (autoReplyKeywords.includes(keyName)) {
    keyActive = true
  }
  keyWordsItem.keyActive = keyActive
}

// function getGroupName(groupName) {
//   // groupName不足15个子补足15个字 // 暂未处理中文符号
//   const groupNameLength = 15 - groupName.length
//   for (let a = 0; a < groupNameLength; a++) {
//     groupName += 'e'
//   }
//   const str = `${groupName}eeeeeeeeeeeeetttt`
//   return str.replace(/e/g, '&nbsp;')
// }

// // 输入/选择关键词 失焦添加，只有 用户私信 才会起作用
// function onBlurKeywords(e, item) {
//   if (sourcePosition.value.canCreate)
//     if (e.target.value.trim() && item.auto_reply_keywords.length < 10) {
//       item.auto_reply_keywords.push(e.target.value)
//     }
// }
//
// // 输入/选择 关键词改变
// function onChangeKeywords(value, item) {
//   // console.log('关键词改变', value, item)
//   item.auto_reply_keywords = value.filter(e => String(e).trim())
// }

// // 更新关键词
// function getKeyWords() {
//   // console.log('应该更新关键词，但是这里的接口没有是获取全部的关键词，不走接口')
// }
// 全选
function chooseGroup(item, val) {
  // 关键词已经选中和超出的过滤掉
  item.scrmKeywords.forEach(e => {
    if (val.indexOf(e.keyName) === -1 && val.length < 100) {
      val.push(e.keyName)
    }
  })
}
// 取消全选
function cancelChoseAll(group, autoReplyKeywords) {
  group.scrmKeywords.forEach(item => {
    if (autoReplyKeywords.includes(item.keyName)) {
      autoReplyKeywords.splice(autoReplyKeywords.indexOf(item.keyName), 1)
    }
  })
}
const choseList = ref([])
// 处理choseList
async function getChoseList() {
  await options.value
  choseList.value = []
  const length = options.value.length
  for (let i = 0; i < length; i++) {
    choseList.value.push(sourcePosition.value.keyWordsObj.list)
  }
  initIsActive()
}
onMounted(() => {
  nextTick(() => {
    getChoseList()
  })
})
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

.content_header_area {
  width: 100%;
  margin-bottom: 15px;
  font-size: 14px;
  font-weight: 400;
  color: #333333;
  line-height: 20px;
}
:deep .el-select-group__title {
  cursor: pointer !important;
}

.el-collapse {
  --el-collapse-header-height: 32px;
  font-size: 14px;
  .el-collapse-item__header {
    border: unset;
    &:hover {
      background: #edf4ff;
    }
  }
  .el-collapse-item__wrap {
    border: unset;
  }
}
.item_warp {
  max-height: 580px;
  overflow-y: auto;
}

.collapse_title {
  width: 100%;
  display: flex;
  align-items: center;
  padding-left: 12px;
}
.hide {
  display: none;
}
.el-collapse-item__content {
  padding-bottom: unset;
}
.keyWords_warp {
  .keyWords_item {
    height: 32px;
    display: flex;
    align-items: center;
    .childCheckbox {
      margin-left: 24px;
    }
    .keyActive {
      color: #f99;
    }
    &:hover {
      background: #edf4ff;
    }
  }
}

// 仿照el-check样式
.checked_box,
.childCheckbox {
  position: relative;
  box-sizing: border-box;
  border: 1px solid #dcdfe6;
  width: 14px;
  height: 14px;
  cursor: pointer;
  border-radius: 2px;
}
// 全部选中
.activity-100-check,
.childCheckbox_active {
  background-color: #364fcd;
  border-color: #364fcd;
  transition: border-color 0.25s cubic-bezier(0.71, -0.46, 0.29, 1.46),
    background-color 0.25s cubic-bezier(0.71, -0.46, 0.29, 1.46);
}
.activity-100-check::after,
.childCheckbox_active::after {
  transform: rotate(45deg) scaleY(1);
  box-sizing: content-box;
  content: '';
  border: 1px solid #fff;
  border-left: 0;
  border-top: 0;
  height: 7px;
  left: 4px;
  position: absolute;
  top: 1px;
  width: 3px;
  transition: transform 0.15s ease-in 50ms;
  transform-origin: center;
}
.activity-100-text {
  color: #364fcd;
  font-size: 500;
}
// 部分选中
.activity-101-check {
  background-color: #364fcd;
  border-color: #364fcd;
}
.activity-101-check::before {
  content: '';
  position: absolute;
  display: block;
  background-color: #fff;
  height: 2px;
  transform: scale(0.5);
  left: 0;
  right: 0;
  top: 5px;
  transition: transform 0.15s ease-in 50ms;
  transform-origin: center;
}
// 全部都不选中
.activity-102-check {
  transition: transform 0.15s ease-in 50ms;
  transform-origin: center;
}
// 禁用
.disabled-check {
  background-color: #f2f6fc;
  border-color: #dcdfe6;
  cursor: not-allowed;
}
</style>
