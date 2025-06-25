<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="info.show"
    title="AI标题助手"
    width="820px"
    custom-class="info_dialog hide_footer_line"
    :before-close="closeFun"
  >
    <div class="condition_scroll" :style="{ padding: createStep == 3 ? 0 : '16px' }">
      <!-- 第一步，填写信息 -->
      <template v-if="createStep === 1">
        <!-- 文案类型 -->
        <div class="type_title" style="margin-top: 0">文案类型</div>
        <div class="text_type">
          <div
            class="text_type_item"
            :class="{ text_type_item_active: $data.textTypeChecked.value == item.value }"
            v-for="(item, index) in textTypeList"
            :key="index"
            @click="choseTextType(item)"
          >
            <img :src="item.icon" alt="" class="text_item_icon" />
            {{ item.text }}
          </div>
        </div>
        <!-- 关键词 -->
        <el-tooltip placement="right">
          <template #content>
            <div>可输入产品名称、卖点、活动信息...支持最多10个关键词、每个关键词最多10个字</div>
          </template>
          <div class="c_title">
            关键词
            <img
              style="width: 16px; height: 16px; margin-left: 8px; vertical-align: -3px"
              src="@/assets/images/operate/tip_line.png"
            />
          </div>
        </el-tooltip>
        <div class="keyword_warp">
          <el-select
            v-model="$data.keyword"
            multiple
            filterable
            allow-create
            default-first-option
            :reserve-keyword="false"
            :multiple-limit="10"
            placeholder="请输入关键词，以回车键确认"
            popper-class="publish_video_form_topic_select"
            style="width: 100%"
            :class="{ select_err: keywordsTipsFn }"
            @change="onChangeKeywords($event)"
            @blur="onBlurKeywords($event)"
          />
        </div>
        <div class="keyword_tip_warp">
          <span class="tips">文案是根据录入内容AI自动生成的，使用时请注意内容的合规性</span>
        </div>
        <!-- 其他 -->
        <div class="type_title">其他</div>
        <div class="other_box">
          生成条数：
          <el-input-number
            v-model="$data.createNum"
            @change="checkInt"
            style="width: 100px; margin-left: 8px"
            :min="1"
            :max="info.videoNum"
            controls-position="right"
          />
          <div class="tone_select">
            <el-select
              v-model="$data.toneSelect"
              placeholder="请选择生成语气"
              popper-class="icon_select"
              style="width: 100%; margin-left: 24px"
            >
              <el-option
                v-for="(item, index) in toneList"
                :key="index"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </div>
        </div>
      </template>
      <!-- 第二步，等待 -->
      <template v-if="createStep === 2">
        <div class="wait_warp">
          <img src="/public/loading_2.gif" alt="" class="em_img em_loading" />
          <p class="text text_loading">AI正在生成，请耐心等待</p>
        </div>
      </template>
      <!-- 第三步，结果 -->
      <template v-if="createStep === 3">
        <div class="result_warp">
          <div class="result_item" v-for="(item, index) in createList" :key="index">
            <div class="item_content">
              {{ item.title }}
            </div>
          </div>
          <template v-if="createList.length % 3 == 2"><div class="w_250"></div></template>
          <template v-if="createList.length % 3 == 1">
            <div class="w_250" style="margin-left: 14px; margin-right: 14px"></div>
            <div class="w_250"></div>
          </template>
        </div>
      </template>
      <!-- 失败 -->
      <template v-if="createStep === 4">
        <div class="em_warp">
          <img
            src="https://tagvv-1256030678.file.myqcloud.com/20231127bx2c1.png"
            alt=""
            class="err_i"
          />
          <span class="text">生成失败</span>
        </div>
      </template>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="createFn" v-if="createStep === 1">立即生成</el-button>
        <div v-if="createStep === 2 || createStep === 4" style="height: 58px"></div>
        <template v-if="createStep === 3">
          <el-button @click="closeFun">取消</el-button>
          <el-button type="primary" @click="saveFun">确定</el-button>
        </template>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'
// ElMessageBox
import { ElMessage } from 'element-plus'
import { getProductUseInfo } from '@/api/system_setting/brand_info.js'
import { generate, getGenerateResult } from '@/api/sumvideo/creative_ai_title.js'
const props = defineProps({
  info: {
    type: Object,
    default: () => {
      return {
        show: false,
        videoNum: 0 // 视频条数，就是标题最大生成条数
      }
    }
  }
})
const { info } = toRefs(props)
// const $confirm = inject('$confirm')
const dialog = ref(null)

const emits = defineEmits(['close', 'submit'])
const createStep = ref(1) // 是否隐藏按钮
const keywordsTips = ref(false) // 关键词未填写时红框
const aiCreationTicketRemainNum = ref(0) // 剩余的生产券数量
const createList = ref([]) // 生成结果
// 表单数据
const $data = reactive({
  keyword: [], // 关键词
  textTypeChecked: {
    text: '爆款标题',
    value: 1,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/202402299p6qd.png'
  }, // 当前选中的文案类型
  createNum: 0, // 生成条数
  toneSelect: 1 // 当前选中的语气，选中的即是value
})
const textTypeList = [
  {
    text: '爆款标题',
    value: 1,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/202402299p6qd.png'
  },
  {
    text: '种草文案',
    value: 2,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20240229e1haq.png'
  },
  {
    text: '测评文案',
    value: 3,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/202402295rmfg.png'
  },
  {
    text: '教程文案',
    value: 4,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20240229be84b.png'
  }
]
const toneList = [
  {
    label: '友好',
    value: 1
  },
  {
    label: '专业',
    value: 2
  },
  {
    label: '接地气',
    value: 3
  },
  {
    label: '活泼',
    value: 4
  },
  {
    label: '文艺',
    value: 5
  }
]

const createResultTicket = ref(null)
const pollingTimer = ref(null)
const showKeyWordTip = ref(false)

const keywordsTipsFn = computed(() => {
  return keywordsTips.value && $data.keyword.length === 0
})
function startTip() {
  // ElMessageBox.confirm(`本次任务预计消耗${$data.createNum}张AI文案创作券，确认后开始生成`, {
  //   confirmButtonText: '确认',
  //   cancelButtonText: '取消',
  //   type: 'warning'
  // })
  //   .then(() => {
  // ElMessage.success('请在右侧生成结果处查看进度')
  getResult()
  createStep.value = 2
  // })
  // .catch(() => {
  //   console.log('取消')
  // })
}
// 点击生成
const createFn = throttle(function () {
  console.log('生成')
  if (showKeyWordTip.value) return
  if ($data.keyword.length === 0) {
    keywordsTips.value = true
    ElMessage.warning('关键词不能为空！')
    return
  }

  // if ($data.createNum > aiCreationTicketRemainNum.value) {
  //   ElMessage.warning('AI文案创作券余额不足，请先充值！')
  //   return
  // }
  startTip()
}, 500)
// 获取生成结果
function getResult() {
  const params = {
    bizType: 2,
    creativeId: info.value.creativeId,
    creationType: 0, // 生成类型  0通用 1小红书文案 2抖音标题 3快手 4视频号
    generateCount: $data.createNum, // 期望生成条数
    generateTone: $data.toneSelect || 1, // 生成语气 1友好 2专业 3接地气 4活泼 5文艺
    titleDescType: $data.textTypeChecked.value, // 文案类型 1 爆款文案 2种草文案 3 测评文案 4 教程文案
    keyWords: $data.keyword.join('、') // 关键词
  }

  generate(params)
    .then(res => {
      if (res.code === 0) {
        createResultTicket.value = res.data
        openPolling()
      }
    })
    .catch(() => {
      createList.value = []
      createStep.value = 3
    })
    .finally(() => {
      getProductUseInfoFn()
    })
}
// 轮询
const openPolling = () => {
  pollingTimer.value && closePolling()
  pollingTimer.value = setInterval(() => {
    getGenerateResult({
      bizId: createResultTicket.value
    })
      .then(res => {
        // res.data 1生成中，2生成成功，3生成失败
        if (res.code === 0) {
          if (res.data !== '1') {
            closePolling(true)
            if (res.data === '2' && res.msg) {
              createList.value = JSON.parse(res.msg || '{}')
            } else {
              createStep.value = 4
            }
          }
        } else {
          createStep.value = 4
          closePolling(true)
        }
      })
      .catch(() => {
        createStep.value = 4
        closePolling(true)
      })
  }, 2000)
}
const closePolling = (success = false) => {
  clearInterval(pollingTimer.value)
  pollingTimer.value = null
  if (success) {
    createStep.value = 3
    getProductUseInfoFn()
  }
}

// 输入框转为正整数
function checkInt(value) {
  nextTick(() => {
    $data.createNum = parseInt(value)
  })
}
// 选择文案类型
function choseTextType(item) {
  if ($data.textTypeChecked.value === item.value) return
  $data.textTypeChecked = item
}
// 关键词内容改变
const onChangeKeywords = value => {
  keywordsTips.value = false
  value.forEach((x, i) => {
    const text = typeof x === 'string' ? x.replace(/\s+/g, '') : ''
    if (text.length > 10) {
      ElMessage.warning('关键词不能超过10个字')
      $data.keyword.splice(i, 1)
    } else if (!text.length) {
      $data.keyword.splice(i, 1)
    } else {
      $data.keyword[i] = text
    }
  })
}
// 失焦添加关键词
const onBlurKeywords = e => {
  keywordsTips.value = false
  const value = e.target.value.replace(/\s+/g, '')
  if (value && $data.keyword.length < 10 && value.length < 11) {
    $data.keyword.push(value)
  } else {
    if (value) {
      showKeyWordTip.value = true
      if ($data.keyword.length >= 10) {
        ElMessage.warning('最多添加10个关键词')
      } else if (value.length > 10) {
        ElMessage.warning('单个关键词不超过10字')
      }
      setTimeout(() => {
        showKeyWordTip.value = false
      }, 2000)
    }
  }
}
// 获取剩余生成券
function getProductUseInfoFn() {
  getProductUseInfo().then(res => {
    if (res.code === 0) {
      aiCreationTicketRemainNum.value = res.data.aiCreationTicketRemainNum || 0
    }
  })
}
const closeFun = throttle(function () {
  // if (createStep.value === 2 || createStep.value === 3) {
  // $confirm({
  //   title: '系统提醒',
  //   content: '关闭后将不会保留本次AI生成标题，请确认是否关闭？',
  //   success() {
  // dialog.value && dialog.value.close()
  // emits('close')
  // }
  // })
  // } else {
  dialog.value && dialog.value.close()
  emits('close')
  // }
}, 500)
const saveFun = throttle(function () {
  emits('submit', createList.value)
}, 500)
onMounted(() => {
  getProductUseInfoFn()
})
onBeforeUnmount(() => {
  closePolling()
})
</script>
<style lang="scss" scoped>
.condition_scroll {
  box-sizing: border-box;
  overflow-y: auto;
  height: 400px;
  .type_title {
    margin-top: 20px;
    font-weight: 600;
    color: #303133;
    line-height: 20px;
    font-size: 14px;
  }
  .c_title {
    font-weight: 600;
    color: #303133;
    line-height: 20px;
    width: max-content;
    font-size: 14px;
    margin-top: 20px;
  }
  // 文案类型
  .text_type {
    display: flex;
    margin-top: 12px;
    .text_type_item {
      display: flex;
      align-items: center;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      .text_item_icon {
        width: 16px;
        height: 16px;
        min-width: 16px;
        margin-right: 4px;
      }
    }
    .text_type_item + .text_type_item {
      margin-left: 16px;
    }
    .text_type_item_active {
      background: rgba(244, 66, 10, 0.1);
    }
  }
  .keyword_warp {
    margin-top: 12px;
    width: 100%;
    min-height: 124px;
    border-radius: 4px;
    border: 1px solid #dcdee0;
    :deep(.el-input__inner) {
      border: none;
    }
    :deep(.el-input__suffix) {
      display: none;
    }
  }
  .keyword_tip_warp {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;
    .tips {
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 14px;
      color: #909399;
      line-height: 20px;
    }
    .clear {
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 14px;
      color: #364fcd;
      line-height: 20px;
      cursor: pointer;
    }
  }
  // 其他
  .other_box {
    font-size: 12px;
    color: #303133;
    line-height: 20px;
    margin-top: 16px;
    display: flex;
    align-items: center;
    :deep(.el-input-number__increase) {
      top: 2px;
    }
    :deep(.el-input-number__decrease) {
      bottom: 2px;
    }
    :deep(.el-input-number__decrease) {
      --el-input-number-controls-height: 14px;
    }
  }
  .wait_warp {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: 100%;
    .em_loading {
      width: 36px;
      height: 36px;
      opacity: 0.6;
    }
    .text {
      margin-top: 8px;
      color: #8f939a;
      line-height: 20px;
      font-size: 12px;
    }
  }
  .result_warp {
    width: 100%;
    height: 100%;
    padding: 0 16px 16px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    .result_item {
      width: 250px;
      height: 154px;
      background: #f2f3f5;
      border-radius: 4px;
      padding: 8px 12px 6px;
      margin-top: 14px;
      position: relative;
      &:nth-child(3n - 1) {
        margin-left: 14px;
        margin-right: 14px;
      }
      &:nth-child(1),
      &:nth-child(2),
      &:nth-child(3) {
        margin-top: 16px;
      }
      .item_content {
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        font-size: 14px;
        color: #333;
        line-height: 20px;
        height: max-content;
        height: 100%;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 7;
        -webkit-box-orient: vertical;
      }
    }
  }
  .em_warp {
    width: 100%;
    height: 100%;
    padding: 0 16px 16px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    .err_i {
      width: 40px;
      height: 40px;
      display: flex;
      object-fit: contain;
    }
    .text {
      margin-top: 8px;
      color: #8f939a;
      line-height: 20px;
      font-size: 14px;
    }
  }
  .w_250 {
    width: 250px;
  }
}
</style>
