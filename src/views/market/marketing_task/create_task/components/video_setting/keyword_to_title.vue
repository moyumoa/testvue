<template>
  <div>
    <!-- 输入框 -->
    <div class="input_box">
      <!-- <chooseKeywordDOM
        class="input_keyword_choose"
        :class="keywordErr ? 'keyword_red' : ''"
        :style="{ width: width }"
        :width="width"
        style="margin-right: 16px; flex-shrink: 0"
        origin="task2"
        :disabled="disabled"
        type="keyword"
        :maxSize="15"
        :historyType="2"
        placeholder="输入关键词，以回车键确认，最多可添加3个关键词，每词不超过15个字"
        v-model:topicList="formData.keywordList"
      />
      <el-button :loading="loading" type="primary" :disabled="disabled" @click.stop="createFun">
        {{ props.btnText || '生成文案' }}
      </el-button>  -->
      <div class="main_btn" @click.stop="dialogVisible = true">
        AI一键生成标题
        <img
          class="main_btn_img"
          src="https://tagvv-1256030678.file.myqcloud.com/20250331m175d.png"
          alt=""
        />
      </div>
      <!-- <el-button type="danger" plain @click.stop="dialogVisible = true">AI一键生成标题</el-button> -->
    </div>
    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" title="输入提示词" width="500px">
      <div class="inptu_dialog">
        <!-- <chooseKeywordDOM
          class="input_keyword_choose"
          :class="keywordErr ? 'keyword_red' : ''"
          :style="{ width: width }"
          :width="width"
          style="margin-right: 16px; flex-shrink: 0"
          origin="task2"
          :disabled="disabled"
          type="keyword"
          :maxSize="15"
          :historyType="2"
          placeholder="输入关键词，以回车键确认，最多可添加3个关键词，每词不超过15个字"
          v-model:topicList="formData.keywordList"
        /> -->
        <el-input
          v-model="formData.titlePrompt"
          :disabled="disabled"
          style="width: 440px"
          :rows="4"
          maxlength="50"
          placeholder="请输入提示词生成文案，提示词不超过50字，例如:生成一个100字左右关于智能沙发的文案，突出性价比高、智能省电的特点，整体语言幽默诙谐"
          type="textarea"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="loading" @click="createFun">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 生成结果 -->
    <div :class="{ result_box: true, result_box_dis: disabled }">
      <!-- 抖音/快手/视频号 -->
      <div
        v-loading="loading"
        element-loading-text="爆款文案生成中"
        class="one_result"
        v-if="
          showResultPlatform &&
          showResultPlatform.length > 0 &&
          (showResultPlatform.includes(1) ||
            showResultPlatform.includes(2) ||
            showResultPlatform.includes(4))
        "
      >
        <div class="title_del" @click.stop="delFun(1)">删除</div>

        <div class="result_title">
          <template v-for="(item, index) in showResultPlatform">
            <div class="one_title" v-if="item != 3" :key="index">
              <div class="title_line">/</div>
              <div :class="['platform_icon', `xm_platformIcon_${item}`]"></div>
              {{ PLATFORM.getCN(item) }}

              <!-- 批量发布的抖音平台要特殊处理 如果选择的视频，抖音后面自动加上快手平台 反之选择图文 移除快手平台 -->
              <template
                v-if="props.source == 'batchPublish' && props.subSource != 'batchPublishImgtext'"
              >
                <div class="title_line2">/</div>
                <div :class="['platform_icon', `xm_platformIcon_${4}`]"></div>
                {{ PLATFORM.getCN(4) }}
              </template>
            </div>
          </template>
        </div>
        <div class="result_content">
          <el-input
            ref="input1Ref"
            v-if="showInput1"
            class="input1"
            v-model.trim="formData.otherTitle"
            :disabled="disabled"
            placeholder=""
            type="textarea"
            resize="none"
            maxlength="100"
            show-word-limit
            @blur="inputBlurFun($event, 1)"
          ></el-input>
          <div class="input1_div input_div" v-else @click.stop="showInputFun(1)">
            <div class="input_div_content">
              {{ formData.otherTitle }}
              <div>
                <span v-for="(item, index) in props.dyTopicList" :key="index">
                  #{{ item.name }}
                </span>
                <template
                  v-if="
                    showResultPlatform &&
                    showResultPlatform.length > 0 &&
                    showResultPlatform.includes(1)
                  "
                >
                  <span v-for="(item, index) in props.dyAtList" :key="index">@{{ item.name }}</span>
                </template>
              </div>
            </div>
            <!-- 字数 -->
            <div :class="{ input_div_num: true, dis_num: disabled }">
              {{ formData.otherTitle ? formData.otherTitle.length || 0 : 0 }} / 100
            </div>
          </div>
        </div>
      </div>
      <!-- 小红书 -->
      <div
        v-loading="loading"
        element-loading-text="爆款文案生成中"
        class="one_result"
        v-if="showResultPlatform && showResultPlatform.length > 0 && showResultPlatform.includes(3)"
      >
        <div class="title_del" @click.stop="delFun(3)">删除</div>

        <div class="result_title">
          <div class="one_title">
            <div :class="['platform_icon', `xm_platformIcon_3`]"></div>
            {{ PLATFORM.getCN(3) }}
          </div>
        </div>
        <div class="result_content">
          <el-input
            ref="input2Ref"
            v-if="showInput2"
            class="input2"
            v-model.trim="formData.xhsTitle"
            :disabled="disabled"
            placeholder=""
            type="text"
            maxlength="20"
            show-word-limit
            @blur="inputBlurFun($event, 2)"
          ></el-input>
          <div class="input2_div input_div" v-else @click.stop="showInputFun(2)">
            <div class="input_div_content">{{ formData.xhsTitle }}</div>
            <!-- 字数 -->
            <div :class="{ input_div_num: true, dis_num: disabled }">
              {{ formData.xhsTitle ? formData.xhsTitle.length || 0 : 0 }} / 20
            </div>
          </div>
          <el-input
            ref="input3Ref"
            v-if="showInput3"
            class="input3"
            v-model.trim="formData.xhsDescription"
            :disabled="disabled"
            placeholder=""
            type="textarea"
            resize="none"
            maxlength="200"
            show-word-limit
            @blur="inputBlurFun($event, 3)"
          ></el-input>

          <div class="input3_div input_div" v-else @click.stop="showInputFun(3)">
            <div class="input_div_content">
              {{ formData.xhsDescription }}
              <div>
                <span v-for="(item, index) in props.xhsTopicList" :key="index">
                  #{{ item.name }}
                </span>
                <span v-for="(item, index) in props.xhsAtList" :key="index">@{{ item.name }}</span>
              </div>
            </div>
            <!-- 字数 -->
            <div :class="{ input_div_num: true, dis_num: disabled }">
              {{ formData.xhsDescription ? formData.xhsDescription.length || 0 : 0 }} / 200
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { createAiTitle } from '@/api/market/task'
import { PLATFORM } from '@/utils/dictionary/company.js'
// import chooseKeywordDOM from './choose_dy_topic.vue'
import { throttle, isEmpty, isNotEmpty } from '@/utils/tools'
import { useStore } from 'vuex'
const store = useStore()
const props = defineProps({
  source: String, // 来源  batchPublish 批量发布
  subSource: String, // 批量发布专属的子来源 batchPublishImgtext 选择图文
  btnText: String, // 按钮文案
  width: String, // 选项宽度
  disabled: Boolean,
  dyTopicList: Array,
  dyAtList: Array,
  xhsTopicList: Array,
  xhsAtList: Array,
  keywordList: Array,
  platformList: {
    type: Array,
    default: () => {
      return [1, 2, 3, 4]
    }
  }, // 平台列表
  formData: {
    type: Object,
    default: () => {
      return {
        titlePrompt: '', // 标题仿写的提示词
        keywordList: [],
        otherTitle: '', // 除小红书外的 抖音/视频号/快手标题
        xhsTitle: '',
        xhsDescription: ''
      }
    }
  }
})
const { formData } = toRefs(props)
const loading = ref(false)
watch(
  () => loading.value,
  val => {
    store.commit('market/setAiCreateLoading', val)
  }
)
const showResultPlatform = ref([])
const keywordErr = ref(false)
const message = inject('$message')
const dialogVisible = ref(false) // 输入关键词弹窗显示
// onMounted(() => {
  // 回显的时候，需要有AI标题文案才显示结果框
  // if (
  //   props.disabled &&
  //   !isEmpty(formData.value.keywordList) &&
  //   (formData.value.otherTitle || formData.value.xhsDescription || formData.value.xhsTitle)
  // ) {
  //   showResultPlatform.value = JSON.parse(JSON.stringify(props.platformList))
  // }
// })
watch(
  () => props.platformList,
  (val, oldVal) => {
    // 回显的时候，需要有AI标题文案才显示结果框
    if (
      props.disabled &&
      (formData.value.otherTitle || formData.value.xhsDescription || formData.value.xhsTitle)
    ) {
      showResultPlatform.value = JSON.parse(JSON.stringify(props.platformList))
    }
    // 创建的时候 常显
    if (!props.disabled) {
      showResultPlatform.value = JSON.parse(JSON.stringify(val))
    }
    if (!props.disabled && isNotEmpty(formData.value.titlePrompt)) {
      // 如果新增勾选了小红书 并且 没有标题和描述 并且 有提示词 就自动生成
      if (
        !props.disabled &&
        isEmpty(formData.value.xhsTitle) &&
        isEmpty(formData.value.xhsDescription) &&
        val.includes(3) &&
        !oldVal.includes(3)
      ) {
        // console.warn('新增勾选小红书', JSON.stringify(val), JSON.stringify(oldVal))
        createFun()
      }
      // 如果新增勾选了抖音/视频号/快手 并且 没有标题 并且 有提示词 就自动生成
      if (
        !props.disabled &&
        isEmpty(formData.value.otherTitle) &&
        val.find(item => [1, 2, 4].includes(item)) &&
        !oldVal.find(item => [1, 2, 4].includes(item)) &&
        isNotEmpty(formData.value.titlePrompt)
      ) {
        // console.warn('抖音/视频号/快手', JSON.stringify(val), JSON.stringify(oldVal))
        createFun()
      }
    }
  },
  {
    deep: true,
    immediate: true
  }
)
// 因为生成的结果可能会存在# 所以 #之后的内容就自动删除
function beautifyTextFun(result) {
  const index = result.indexOf('#')
  if (index > -1) {
    result = result.slice(0, index)
  }
  // 再过滤一下emoji
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi
  result = result.replace(reg, '')
  return result
}
//  添加时间戳 多次点击请求时 处理最后一次请求的结果
let timeFlag = 0
// 生成文案
const createFun = throttle(() => {
  if (props.disabled) return
  if (isEmpty(formData.value.titlePrompt)) {
    keywordErr.value = true
    message.warning('请先填写关键词')
    return
  }
  dialogVisible.value = false
  showResultPlatform.value = JSON.parse(JSON.stringify(props.platformList))
  loading.value = true
  const platforms = []
  if (showResultPlatform.value.includes(3)) {
    platforms.push(3)
  }
  if (
    showResultPlatform.value.includes(1) ||
    showResultPlatform.value.includes(2) ||
    showResultPlatform.value.includes(4)
  ) {
    platforms.push(1)
  }
  // 添加时间戳 多次点击请求时 处理最后一次请求的结果
  timeFlag = Date.now()
  const selfTimeFlag = timeFlag
  createAiTitle({
    keywords: formData.value.titlePrompt,
    platform: platforms
  })
    .then(res => {
      if (selfTimeFlag === timeFlag) {
        if (res.code === 0) {
          let xhsData = {}
          let otherData = {}
          ;(res.data || []).forEach(x => {
            if (x.platform.includes(3)) {
              xhsData = x
            } else {
              otherData = x
            }
          })
          console.log('xxxx', xhsData, otherData)
          formData.value.otherTitle = beautifyTextFun(otherData.content || '').split('').slice(0, 100).join('')
          formData.value.xhsTitle = beautifyTextFun(xhsData.title || '').split('').slice(0, 20).join('')
          formData.value.xhsDescription = beautifyTextFun(xhsData.content || '').split('').slice(0, 200).join('')
          loading.value = false
        } else {
          loading.value = false
        }
      }
    })
    .catch(() => {
      loading.value = false
    })
}, 500)
function delFun(type) {
  if (props.disabled) return
  const index = showResultPlatform.value.findIndex(x => x === 3)
  if (type === 1) {
    formData.value.otherTitle = ''
    if (index > -1) {
      showResultPlatform.value = [3]
    } else {
      showResultPlatform.value = []
    }
  } else {
    formData.value.xhsTitle = ''
    formData.value.xhsDescription = ''
    if (index > -1) {
      showResultPlatform.value.splice(index, 1)
    }
  }
}
// watch(
//   () => formData.value.keywordList,
//   val => {
//     if (isNotEmpty(val)) {
//       keywordErr.value = false
//     }
//   },
//   {
//     deep: true
//   }
// )
const input1Ref = ref()
const input2Ref = ref()
const input3Ref = ref()
const showInput1 = ref(false)
const showInput2 = ref(false)
const showInput3 = ref(false)
function showInputFun(type) {
  if (props.disabled) return
  switch (type) {
    case 1:
      showInput1.value = true
      nextTick(() => {
        input1Ref.value?.focus()
      })
      break
    case 2:
      showInput2.value = true
      nextTick(() => {
        input2Ref.value?.focus()
      })
      break
    case 3:
      showInput3.value = true
      nextTick(() => {
        input3Ref.value?.focus()
      })
      break
  }
}
function inputBlurFun(e, type) {
  if (props.disabled) return
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi

  switch (type) {
    case 1:
      formData.value.otherTitle = e.target.value.replace(reg, '')
      showInput1.value = false

      break
    case 2:
      formData.value.xhsTitle = e.target.value.replace(reg, '')
      showInput2.value = false

      break
    case 3:
      formData.value.xhsDescription = e.target.value.replace(reg, '')
      showInput3.value = false

      break
  }
}
// 实时返回 关键词 抖音标题 小红书标题 小红书描述
// // 数据修改
// watch(
//   () => formData,
//   () => {
//     if (initOver.value) {
//       updateTask()
//     }
//   },
//   {
//     deep: true
//   }
// )
</script>
<style lang="scss" scoped>
.input_box {
  margin-bottom: 8px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
.result_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
  flex-wrap: wrap;
  .one_result {
    position: relative;
    margin: 8px 22px 0 0;
    width: 576px;
    min-height: 160px;
    background: #f7f8fa;
    border-radius: 4px;
    border: 1px solid #ebedf0;
    padding: 8px 12px;
    .title_del {
      position: absolute;
      right: 0;
      top: 0;
      padding: 8px 12px;

      font-weight: 400;
      font-size: 14px;
      color: #364fcd;
      line-height: 20px;
      cursor: pointer;
    }
    .result_title {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      font-weight: 400;
      font-size: 14px;
      color: #303133;
      line-height: 20px;

      .title_line,
      .title_line2 {
        margin: 0 4px;
      }
      .one_title {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        .platform_icon {
          position: relative;
          margin-right: 4px;
        }
      }
    }
    .result_content {
      margin-top: 8px;
      span {
        color: #364fcd;
      }
      span + span {
        margin-left: 4px;
      }
      .input1 {
        :deep(.el-textarea__inner) {
          width: 100%;
          height: 112px;
          // background: #ffffff;
          // border-radius: 4px;
          // border: 1px solid #dcdfe6;
        }
      }
      .input2 {
        width: 100%;
      }
      .input3 {
        margin-top: 8px;
        :deep(.el-textarea__inner) {
          width: 100%;
          height: 72px;
          // background: #ffffff;
          // border-radius: 4px;
          // border: 1px solid #dcdfe6;
        }
      }
      .input_div {
        position: relative;
        background: #fff;
        background: #ffffff;
        border-radius: 4px;
        border: 1px solid #dcdfe6;
        font-weight: 400;
        font-size: 14px;
        color: #606266;
        line-height: 20px;
        white-space: pre-wrap;
        word-break: break-all;
        .input_div_content {
          padding: 6px 12px;
        }
      }
      .input_div_num {
        border-bottom-right-radius: 4px;
        position: absolute;
        right: 7px;
        bottom: 0px;
        font-weight: 400;
        padding: 0 0px 2px 0;
        background: #fff;
        font-size: 12px;
        color: #909399;
        line-height: 18px;
      }
      .input1_div {
        width: 100%;
        height: 112px;

        .input_div_content {
          width: 100%;
          height: 100%;
          overflow-y: auto;
        }
      }
      .input2_div {
        width: 100%;
        height: 32px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        .input_div_num {
          padding: 0 0px 6px 0;
        }
      }
      .input3_div {
        margin-top: 8px;
        width: 100%;
        height: 72px;
        .input_div_content {
          width: 100%;
          height: 100%;
          overflow-y: auto;
        }
      }
    }
  }
}
:deep(.el-textarea__inner) {
  padding: 6px 12px;
  font-weight: 400;
  font-size: 14px;
  color: #606266;
  line-height: 20px;
}
.keyword_red {
  :deep(.input_box) {
    border-color: red;
  }
}

.result_title .one_title:first-child .title_line {
  display: none;
}
.result_box_dis {
  .input_div {
    background: #f5f7fa !important;
    cursor: not-allowed !important;
    color: #c0c4cc !important;
  }
  .title_del {
    cursor: not-allowed !important;
  }
}
:deep(.el-input .el-input__count .el-input__count-inner) {
  padding: 0;
}
.dis_num {
  background: rgb(247, 247, 250) !important;
}
.main_btn {
  font-weight: 400;
  font-size: 14px;
  background-color: rgba(248, 81, 81, 0.1);
  color: #f85151;
  line-height: 18px;
  text-align: left;
  font-style: normal;
  padding: 5px 8px;
  border-radius: 4px;
  position: relative;
  margin-top: 2px;
  cursor: pointer;

  .main_btn_img {
    position: absolute;
    top: -12px;
    right: -12px;
    width: 19px;
    height: 17px;
  }
}
</style>
