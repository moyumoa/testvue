<template>
  <div class="ai_help" @click.stop>
    <div class="ai_title">
      AI创作助手
      <div class="close_box" @click.stop="close">关闭对话</div>
    </div>
    <div
      class="loading_warp"
      v-if="loading"
      v-loading="loading"
      element-loading-text="剧本生成中"
    ></div>
    <div class="ai_content" ref="contentRef">
      <div
        class="message_item_warp"
        :class="{ message_item_warp_mine: item.type == 2 }"
        v-for="(item, index) in messageList"
        :key="index"
      >
        <div class="message_item message_item_user" v-if="item.type == 1 && item.content">
          {{ item.content }}
          <div class="message_tag_line" v-if="item.needSelect">
            <div
              :class="['message_tag', selectedDisabled(item) ? 'disabled_cursor' : '']"
              v-for="tag in item.tag"
              :key="tag"
              @click="tagClick(tag, index)"
            >
              {{ tag }}
            </div>
            <div v-if="item.canIgnore" class="ignore_box">
              <span
                :class="['ignore_box_text', selectedDisabled(item) ? 'disabled_cursor' : '']"
                @click="tagClick('不选择', index)"
              >
                忽略
              </span>
            </div>
          </div>
        </div>
        <div class="message_item message_item_mine" v-if="item.type == 2 && item.content">
          {{ item.content }}
        </div>
        <div class="message_item message_item_user" v-if="item.type == 1 && item.result">
          <div class="title">好的，我了解啦！下面是我根据你的要求写的剧本：</div>
          <div class="result_warp">
            <div class="result_item" v-for="(item, index) in item.result" :key="index">
              <div class="name">{{ `${item.clipName}：` }}</div>
              <div class="">{{ `画面：${item.clipDesc || '-'}` }}</div>
              <div class="">{{ `旁白：${item.clipAside || '-'}` }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="ai_input">
      <div class="btn_warp" v-if="isNotEmpty(result)">
        <el-button type="default" class="re_create" @click.stop="reCreate">不满意，重写</el-button>
        <el-button type="primary" class="create" @click.stop="submit" :disabled="isEmpty(result)">
          满意，应用到剧本
        </el-button>
      </div>
      <div class="input_warp">
        <el-input
          style="width: 100%; height: 40px"
          v-model.trim="sendMessage"
          placeholder="发送消息"
          :disabled="inputDisabled"
          @focus="inputFocus = true"
          @blur="inputFocus = false"
          @keyup.enter="send"
        ></el-input>
        <div
          class="send_warp"
          :class="{ send_warp_focus: inputFocus, send_warp_disabled: inputDisabled }"
        >
          <img
            src="https://tagvv-1256030678.file.myqcloud.com/20240329qs9iz.png"
            alt=""
            :style="{ cursor: inputDisabled ? 'not-allowed' : 'pointer' }"
            class="send_icon"
            @click.stop="send"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { throttle, isEmpty, isNotEmpty } from '@/utils/tools.js'
import { aiGenerateScriptClip, getItemAICharacteristic } from '@/api/sumvideo/create_by_script.js'

const emits = defineEmits(['close'])
const contentRef = ref(null)
const sendMessage = ref('') // 输入的消息
const inputFocus = ref(false)
const loading = ref(false)
const result = ref({}) // 结果
const inputDisabled = ref(false)
const hasSelectTime = ref(false) // 是否已经选择过最后一步的时间了
const messageList = ref([
  {
    type: 1, // 1 麦麦的发言 2 用户的发言
    id: 0, // 唯一标识，0第一步说的话 1第二步说的话
    content:
      'Hi，我叫麦麦～我是短视频剧本创作大师，也是视频拍摄专家！我可以给你一些剧本的建议，请告诉我本次短视频的对象是？例如：沙发、洗碗机、运动鞋...',
    result: null, // 生成结果
    needSelect: false, // 需要选择
    tag: [],
    canIgnore: false
  }
]) // 消息列表
const close = throttle(function () {
  emits('close')
}, 500)
const reCreate = throttle(function () {
  // messageList.value = [
  //   {
  //     type: 1,
  //     id: 0, // 唯一标识，0第一步说的话 1第二步说的话
  //     content:
  //       'Hi，我叫麦麦～我是短视频剧本创作大师，也是视频拍摄专家！我可以给你一些剧本的建议，请告诉我本次短视频的对象是？例如：沙发、洗碗机、运动鞋...',
  //     result: null // 生成结果
  //   }
  // ]
  if (loading.value) return
  getResult()
}, 500)
const submit = throttle(function () {
  if (isEmpty(result.value)) return
  emits('submit', result.value)
}, 500)
// 物品名称
let itemName = ''
const send = throttle(async function (isIgnore) {
  // const sendedLength = messageList.value.filter(x => !(x.id % 2 === 0)).length
  // const sendedLength = messageList.value.length
  if (!sendMessage.value || loading.value || (inputDisabled.value && hasSelectTime.value)) return
  if (questionIndex === 0) {
    itemName = sendMessage.value
  }
  const oneMessage = {
    type: 2,
    id: messageList.value.length,
    content: sendMessage.value
  }
  messageList.value.push(oneMessage)
  // 字数超出十个字
  if (questionIndex !== 0 && sendMessage.value.length > 10) {
    delayReply({
      type: 1,
      id: messageList.value.length,
      content: '字数太多啦，请告诉麦麦10个字以内的答案吧🫡',
      result: null,
      needSelect: false,
      tag: [],
      canIgnore: false
    })
    scrollToBottom()
    sendMessage.value = ''
    return
  }
  loading.value = true
  // 本次回答放入
  if (questionIndex !== 0) {
    questionList[questionIndex - 1].value =
      typeof isIgnore === 'boolean' && isIgnore ? '' : sendMessage.value
  }
  const isEnd = questionList.length > 0 && questionIndex >= questionList.length
  // 如果结束了 就说明选过了
  hasSelectTime.value = isEnd
  if (isEnd) {
    // 我已经说完了所有的话，不能再说话了，要发起请求
    getResult()
  } else {
    toQuestion()
  }
  sendMessage.value = ''
  scrollToBottom()
})
const delayReply = item => {
  const timer = setTimeout(() => {
    messageList.value.push(item)
    scrollToBottom()
    clearTimeout(timer)
  }, randomDelay(200, 50))
}

// 请求结果
function getResult() {
  const params = {
    videoTarget: itemName,
    sellingPoint: '',
    painPoint: '',
    populationFeature: '',
    purpose: '',
    time: ''
  }
  questionList.forEach(item => {
    params[item.key] = item.value
  })
  let emptyFlag = false
  for (const key in params) {
    emptyFlag = isEmpty(params[key])
  }
  if (emptyFlag) return
  loading.value = true
  aiGenerateScriptClip(params)
    .then(res => {
      if (res.code === 0) {
        result.value = res.data || {}
        if (isEmpty(result.value)) {
          reQuestions()
        } else {
          const oneMessage = {
            type: 1,
            id: messageList.value.length + 1,
            content: null,
            result: res.data || []
          }
          messageList.value.push(oneMessage)
          scrollToBottom()
        }
      }
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

// 重新提问
const reQuestions = () => {
  messageList.value.push({
    type: 1,
    id: messageList.value.length,
    content: '输入的内容太复杂啦，请更换输入内容重新生成吧',
    result: null,
    needSelect: false,
    tag: [],
    canIgnore: false
  })
  delayReply({
    type: 1,
    id: messageList.value.length,
    content:
      'Hi，我叫麦麦～我是短视频剧本创作大师，也是视频拍摄专家！我可以给你一些剧本的建议，请告诉我本次短视频的对象是？例如：沙发、洗碗机、运动鞋...',
    result: null, // 生成结果
    needSelect: false, // 需要选择
    tag: [],
    canIgnore: false
  })
  questionIndex = 0
  inputDisabled.value = false
}

const selectedDisabled = item => {
  // 是不是最后一个可以选择的
  const copyList = JSON.parse(JSON.stringify(messageList.value))
  const target = copyList.reverse().find(item => item.needSelect)
  return target.content !== item.content || hasSelectTime.value
}

const tagClick = (item, index) => {
  // 只有最后一个才可以点
  if (index >= messageList.value.length - 1) {
    questionList[questionIndex - 1].value = item
    sendMessage.value = item
    send(item === '不选择')
  }
}

// 生成随机延迟
function randomDelay(end, start) {
  return Math.floor(Math.random() * (end - start + 1)) + start
}

// 问题下标
let questionIndex = 0
let questionList = []

// 第二问
async function toQuestion() {
  loading.value = false
  // const length = messageList.value.length
  if (questionIndex === 0) {
    // 第一次问问题获取提问特点
    const res = await getItemAICharacteristic({ videoTarget: sendMessage.value })
    if (res.code === 0) {
      const itemAIObj = res?.data || {}
      questionList = [
        {
          text: `你希望呈现${itemName}什么样的特点呢，比如：`,
          key: 'sellingPoint',
          value: null,
          needSelect: true,
          canIgnore: false,
          tag: []
        },
        {
          text: `好的，${itemName}主要能解决什么样的问题呢？比如：`,
          key: 'painPoint',
          value: null,
          needSelect: true,
          canIgnore: true,
          tag: []
        },
        {
          text: `ok，${itemName}主要面向的人群有哪些呢，比如：`,
          key: 'populationFeature',
          needSelect: true,
          canIgnore: true,
          value: null,
          tag: []
        }
      ]
      questionList.forEach(item => {
        item.tag = itemAIObj[item.key + 's'] || []
        item.tag = item.tag.slice(0, 3)
      })
      questionList.push({
        text: `ok，这段文字主要是用于？`,
        key: 'purpose',
        value: null,
        needSelect: true,
        canIgnore: true,
        tag: ['直播间引流', '短视频带货', '线索留资']
      })
      questionList.push({
        text: `好的，最后选择你希望生成的剧本时长吧`,
        key: 'time',
        value: null,
        needSelect: true,
        canIgnore: false,
        tag: ['10s-20s', '20s-40s', '40s-60s', '60s以上']
      })
    }
  }
  const { tag, needSelect, canIgnore, text: content, key } = questionList[questionIndex]
  if (key === 'time') {
    inputDisabled.value = true
  }
  const oneMessage = {
    type: 1,
    id: messageList.value.length,
    tag,
    needSelect,
    canIgnore,
    content
  }
  delayReply(oneMessage)
  questionIndex++
}

function scrollToBottom() {
  nextTick(() => {
    contentRef.value.scrollTop = contentRef.value.scrollHeight
  })
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style lang="scss" scoped>
div {
  box-sizing: border-box;
}

.ai_help {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 22;
  width: 360px;
  height: 600px;
  background: #ffffff;
  box-shadow: 0px 0px 8px 0px rgba(103, 103, 103, 0.3);
  border-radius: 4px;
  overflow: hidden;

  .loading_warp {
    position: absolute;
    top: 48px;
    left: 0;
    width: 100%;
    height: calc(100% - 164px);
  }

  .ai_title {
    position: relative;
    text-align: center;
    width: 100%;
    line-height: 48px;
    background: rgba(54, 79, 205, 0.1);
    border-radius: 4px 4px 0px 0px;
    user-select: none;

    .close_box {
      cursor: pointer;
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 14px;
      color: #364fcd;
      line-height: 20px;
      position: absolute;
      top: 50%;
      right: 12px;
      transform: translateY(-50%);
    }
  }

  .ai_content {
    height: calc(100% - 164px);
    width: 100%;
    padding: 16px;
    overflow-y: auto;

    .message_item_warp {
      word-break: break-all;
      margin-top: 12px;
      display: flex;
      justify-content: flex-start;

      &:first-child {
        margin-top: 0;
      }
    }

    .message_item_warp_mine {
      justify-content: flex-end;
    }

    .message_item {
      padding: 6px 10px;
      word-break: break-all;
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      width: max-content;
      max-width: 100%;

      .result_item {
        margin-top: 4px;
      }

      .message_tag_line {
        display: flex;
        align-items: center;
        padding: 8px 0 2px;

        .message_tag {
          padding: 2px 8px;
          background: rgba(54, 79, 205, 0.1);
          border-radius: 11px;
          font-weight: 400;
          font-size: 12px;
          color: #364fcd;
          line-height: 18px;
          margin-right: 8px;
          cursor: pointer;
        }

        .ignore_box {
          flex: 1;
          width: 24px;
          height: 18px;
          font-weight: 400;
          font-size: 12px;
          color: #909399;
          line-height: 18px;
          text-align: right;
          .ignore_box_text {
            cursor: pointer;
          }
        }

        .disabled_cursor {
          cursor: not-allowed;
        }
      }
    }

    .message_item_mine {
      background: #4c80f9;
      color: #ffffff;
      border-radius: 12px 12px 1px 12px;
    }

    .message_item_user {
      background: #f3f4f8;
      color: #303133;
      border-radius: 12px 12px 12px 1px;
    }
  }

  .ai_input {
    height: 116px;
    width: 100%;
    padding: 16px 0;

    .btn_warp {
      height: 28px;
      display: flex;
      align-items: center;

      .re_create {
        text-align: center;
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        font-size: 12px;
        color: #303133;
        line-height: 18px;
        width: 88px;
        line-height: 26px;
        border-radius: 4px;
        border: 1px solid rgba(153, 153, 153, 0.5);
        cursor: pointer;
        user-select: none;
        margin-left: 16px;
      }

      .create {
        cursor: pointer;
        user-select: none;
        width: 112px;
        line-height: 28px;
        background: #f85151;
        border-radius: 4px;
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        font-size: 12px;
        color: #ffffff;
        text-align: center;
        margin-left: 16px;
        border: unset;
      }
    }

    .input_warp {
      height: 40px;
      margin-top: 16px;
      padding: 0 16px;
      display: flex;
      align-items: center;

      :deep(.el-input__inner) {
        height: 40px;
        border-right: unset;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        transition: all;
      }

      .send_warp {
        width: 40px;
        height: 100%;
        border: 1px solid #dcdfe6;
        border-left: unset;
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
        display: flex;
        align-items: center;

        .send_icon {
          width: 24px;
          height: 24px;
          cursor: pointer;
        }
      }

      &:hover {
        .send_warp {
          border-color: #c0c4cc;
        }
      }

      .send_warp_focus {
        border-color: #364fcd !important;
      }
      .send_warp_disabled {
        background-color: #f5f7fa;
        border-color: #e4e7ed !important;
        cursor: not-allowed;
      }
    }
  }
}
</style>
