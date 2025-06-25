<template>
  <div>
    <div class="rule_item" v-for="(item, index) in options" :key="index">
      <template v-if="type === 'keywords'">
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
      <div :class="{ rule_item_form: type === 'keywords' }">
        <template v-if="type === 'keywords'">
          <el-form-item label="关键词:">
            <el-select
              v-model="item.auto_reply_keywords"
              multiple
              filterable
              :allow-create="sourcePosition.canCreate"
              default-first-option
              :multiple-limit="10"
              :reserve-keyword="false"
              placeholder="请添加关键词"
              popper-class="rule_create_select"
              :style="{ width: '418px' }"
              @change="onChangeKeywords($event, item)"
              @blur="onBlurKeywords($event, item)"
            ></el-select>
          </el-form-item>
        </template>
        <el-form-item label="回复类型:" v-if="sourcePosition.from != 'strategySetting'">
          <el-radio-group v-model="item.reply_type" @change="onChangeReplyType($event, item)">
            <el-radio label="text">文本</el-radio>
            <el-radio label="image">图片</el-radio>
            <el-radio label="card">消息卡片</el-radio>
            <el-radio label="group_invite">群聊邀请</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="回复内容:">
          <div
            :style="{ 'margin-bottom': '16px' }"
            v-show="item.reply_type && item.reply_type != 'text'"
          >
            <el-button
              v-if="!item.auto_reply_seq[0].reply_content"
              :style="{ 'border-radius': '2px' }"
              type="primary"
              @click="showSpecialReplyDialog(item, index)"
            >
              选择
            </el-button>
            <div class="selected" v-else>
              <i
                v-if="item.reply_type == 'group_invite'"
                class="iconfont icon icon-jiaoseguanlibeifen"
              ></i>
              <el-icon v-else-if="item.reply_type == 'card'">
                <i-credit-card color="#364fcd" />
              </el-icon>
              <span v-if="item.reply_type != 'image'" style="margin-left: 8px">
                {{ item.auto_reply_seq[0].name }}
              </span>
              <el-image
                v-else
                style="width: 64px; height: 64px"
                :src="item.auto_reply_seq[0].name"
                :fit="cover"
                :preview-src-list="[item.auto_reply_seq[0].name]"
              />
              <span
                class="replace"
                :class="{
                  disabled: disabled
                }"
                @click="showSpecialReplyDialog(item, index)"
              >
                替换
              </span>
            </div>
          </div>
          <template v-for="(replyC, k) in item.auto_reply_seq" :key="k">
            <el-input
              v-if="replyC.reply_type == 'text'"
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
      </div>
    </div>
    <div
      v-if="options.length < 20 && type === 'keywords'"
      class="add_class"
      :class="{
        disabled: disabled
      }"
      @click="addRule"
    >
      <el-icon size="24"><i-plus /></el-icon>
      <span>添加规则</span>
    </div>

    <choose-image-material
      v-if="$data.visibleImageMaterial"
      v-model:show="$data.visibleImageMaterial"
      @confirm="onSelectSpecialReply($event, 'image')"
    ></choose-image-material>
    <choose-message-card
      v-if="$data.visibleMessageCard"
      v-model:show="$data.visibleMessageCard"
      @confirm="onSelectSpecialReply($event, 'card')"
    ></choose-message-card>
    <choose-group-chat
      v-if="$data.visibleGroupChat"
      v-model:show="$data.visibleGroupChat"
      @confirm="onSelectSpecialReply($event, 'group_invite')"
    ></choose-group-chat>
  </div>
</template>

<script setup>
import chooseGroupChat from './choose_group_chat.vue'
import chooseImageMaterial from './choose_image_material.vue'
import chooseMessageCard from './choose_message_card.vue'
import { ElMessageBox } from 'element-plus'

const props = defineProps({
  type: {
    type: String,
    default: 'all' // all keyword
  },
  options: Object,
  disabled: Boolean,
  sourcePosition: {
    type: Object,
    default: () => {
      return {
        from: null,
        canCreate: true
      }
    } // 是从哪里来的，2023/02/21改版的回复策略，不展示回复类型
  }
})
const { options, type, disabled, sourcePosition } = toRefs(props)
console.log(options.value, 'options--options', sourcePosition)
const $data = reactive({
  replyContent: '',
  replyIndex: -1,
  visibleGroupChat: false,
  visibleImageMaterial: false,
  visibleMessageCard: false
})

function showSpecialReplyDialog(item, index) {
  if (disabled.value) return
  $data.replyIndex = index
  switch (item.reply_type) {
    case 'image':
      $data.visibleImageMaterial = true
      break
    case 'card':
      $data.visibleMessageCard = true
      break
    case 'group_invite':
      $data.visibleGroupChat = true
      break
  }
}

function onChangeReplyType(value, item) {
  item.auto_reply_seq = item.auto_reply_seq.filter(e => e.reply_type === 'text')
  if (value !== 'text') {
    item.auto_reply_seq.unshift({
      reply_type: value,
      reply_content: '',
      name: 'null',
      id: null
    })
  }
}

// 选择特殊回复消息
function onSelectSpecialReply(data, type) {
  options.value[$data.replyIndex].auto_reply_seq.forEach(e => {
    if (e.reply_type === type) {
      switch (type) {
        case 'image':
          e.reply_content = data.mediaId
          e.name = data.mediaUrl1
          break
        case 'card':
          e.reply_content = data.cardId
          e.name = data.cardName
          break
        case 'group_invite':
          e.reply_content = data.groupId
          e.name = data.groupName
          break
      }
    }
  })
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

function onBlurKeywords(e, item) {
  if (e.target.value.trim() && item.auto_reply_keywords.length < 10) {
    item.auto_reply_keywords.push(e.target.value)
  }
}
function onChangeKeywords(value, item) {
  item.auto_reply_keywords = value.filter(e => e.trim())
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

.selected {
  display: flex;
  align-items: center;
  i {
    color: #364fcd;
  }
  .replace {
    cursor: pointer;
    color: #364fcd;
    margin-left: 24px;
  }
}
.disabled {
  cursor: not-allowed !important;
  color: #c0c4cc !important;
}
</style>
