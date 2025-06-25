<template>
  <div class="rules_page">
    <div class="rule_box">
      <div class="rule_box2">
        <div class="one_rule" v-if="pageSource === 'createByTemplate'">
          关联模板：{{ chooseTemplateInfo ? chooseTemplateInfo.name : '--' }}
        </div>
        <div class="one_rule" v-if="pageSource === 'createByScript'">
          关联剧本：{{ chooseTemplateInfo ? chooseTemplateInfo.name : '--' }}
        </div>
        <div class="one_rule">
          任务名称：
          <el-input
            style="width: 320px; margin-left: 8px"
            placeholder="请输入任务名称"
            type="text"
            v-model.trim="ruleForm.jobName"
            @blur="retEmit($event, 'jobName')"
            maxlength="20"
          />
        </div>
        <div class="one_rule num_rule">
          生产条数：
          <!-- 实时监听输入计算按钮 -->
          <div
            class="script_input_warp"
            :class="{ script_input_warp_input: normalProductNumInputStatus }"
            v-if="pageSource === 'createByScript' || pageSource === 'createByFoolish'"
          >
            <el-input
              :model-value="ruleForm.normalProductNum"
              v-model="ruleForm.normalProductNum"
              class="input_item"
              type="text"
              @input="inputChange(ruleForm.normalProductNum)"
              @focus="normalProductNumInputStatus = true"
              @blur="numBlur"
            />
            <div
              class="btn_warp"
              @mouseenter="normalProductNumInputStatus = true"
              @mouseleave="normalProductNumInputStatus = false"
            >
              <div
                class="add_btn btn_item"
                :class="{ add_btn_disabled: ruleForm.normalProductNum >= maxNum || !maxNum }"
                @click.stop="addFun(ruleForm)"
              >
                <span class="icon_warp">
                  <svg
                    class="icon"
                    width="200"
                    height="200"
                    viewBox="0 0 1024 1024"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="currentColor"
                      d="M488.832 344.32l-339.84 356.672a32 32 0 000 44.16l.384.384a29.44 29.44 0 0042.688 0l320-335.872 319.872 335.872a29.44 29.44 0 0042.688 0l.384-.384a32 32 0 000-44.16L535.168 344.32a32 32 0 00-46.336 0z"
                    ></path>
                  </svg>
                </span>
              </div>
              <div
                class="reduce_btn btn_item"
                :class="{ reduce_btn_disabled: ruleForm.normalProductNum <= minNum || !maxNum }"
                @click.stop="reduceFn(ruleForm)"
              >
                <span class="icon_warp">
                  <svg
                    class="icon"
                    width="200"
                    height="200"
                    viewBox="0 0 1024 1024"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="currentColor"
                      d="M831.872 340.864L512 652.672 192.128 340.864a30.592 30.592 0 00-42.752 0 29.12 29.12 0 000 41.6L489.664 714.24a32 32 0 0044.672 0l340.288-331.712a29.12 29.12 0 000-41.728 30.592 30.592 0 00-42.752 0z"
                    ></path>
                  </svg>
                </span>
              </div>
            </div>
          </div>

          <el-input-number
            @change="numberChange"
            v-model="ruleForm.normalProductNum"
            :min="minNum"
            :max="maxNum"
            :step="1"
            style="width: 100px; margin: 0 16px 0 8px"
            controls-position="right"
            v-else
          />
          <div
            class="num_info"
            style="color: rgba(144, 147, 153, 1)"
            v-if="
              pageSource === 'createByFoolish' ||
              pageSource === 'createByScript' ||
              pageSource === 'createByImgText'
            "
          >
            单次合成不超过
            <span v-if="pageSource === 'createByFoolish'" style="margin: 0 4px">
              {{ maxNum || 0 }}
            </span>
            <span v-else style="margin: 0 4px">{{ 1000 }}</span>
            条
            <template v-if="pageSource === 'createByFoolish'">
              ，建议最大合成条数：
              <span>{{ foolishNum }}</span>
              <el-tooltip placement="top">
                <template #content>
                  <div style="max-width: 180px">
                    建议合成条数为系统根据合成设置和原料数量综合计算得出的重复度最低的组合结果数量
                  </div>
                </template>
                <span class="xm_tooltipOfRight"></span>
              </el-tooltip>
            </template>
          </div>
          <div style="color: rgba(144, 147, 153, 1)" v-else>
            预计最多条数：
            <span v-if="maxNum >= 1000">1000（每次合成条数上限1000）</span>
            <span v-else>{{ maxNum || 0 }}</span>
          </div>
        </div>

        <div
          class="one_rule one_rule_blue"
          :style="
            pageSource === 'createByFoolish'
              ? 'margin-left:24px;min-height:32px'
              : 'min-height:32px'
          "
          v-if="
            rewriteAsideShow &&
            (pageSource === 'createByScript' ||
              (pageSource === 'createByFoolish' && subPageSource === 'notUsedVideoVoice'))
          "
        >
          {{
            pageSource === 'createByScript' && foolishNum < 5
              ? `生产条数超过最大值20%`
              : `生产条数超过${parseInt(foolishNum * 0.2)}条`
          }}，已自动开启AI智能重写策略（在不改变逻辑的情况下，自动重写旁白文案）
          <!-- <el-switch
            v-if="false"
            style="margin-left: 8px"
            v-model="ruleForm.rewriteAside"
            inline-prompt
            :width="45"
          ></el-switch> -->
        </div>
        <div class="one_rule">
          {{ `素材${pageSource === 'createByImgText' ? '' : '视频'}命名规则：` }}
          <el-input
            style="width: 310px; margin: 0 4px 0 8px"
            placeholder="请输入命名规则"
            type="text"
            v-model.trim="ruleForm.videoNamePrefix"
            @blur="retEmit($event, 'videoNamePrefix')"
            maxlength="20"
          />

          +x
        </div>
        <div class="one_rule">
          <div v-if="pageSource === 'createByScript' || pageSource === 'createByFoolish'">
            生成结果，
          </div>
          若需存入文件夹，请选择
          <searchFileDOM
            :fileID="props.rulesInfo.fileID"
            @select="changeFileFun"
            failType="listCreationTagFolder"
            style="width: 230px; margin-left: 12px"
          />
        </div>

        <div class="one_rule">
          若需自动打上标签，请在此处设置
          <div class="content_btn" @click="openChoseLabel">
            <img src="https://tagvv-1256030678.file.myqcloud.com/20240328bjpfu.png" alt="" />
            素材标签
          </div>
          <div class="tag_mark">
            已选
            <span>{{ ruleForm.tags.length }}</span>
            个标签
          </div>
        </div>
        <!-- AI智能包装 图文生成不需要 -->
        <div class="one_rule rule_switch" v-if="pageSource != 'createByImgText'">
          <img
            class="switch_icon1"
            src="https://tagvv-1256030678.file.myqcloud.com/202501074vgci.png"
            alt=""
          />
          AI智能包装
          <el-switch
            class="switch_switch"
            v-model="ruleForm.enableWrap"
            inline-prompt
            :width="45"
          />
          <div class="rule_link" @click.stop="toAIFun">
            包装设置
            <img
              class="switch_icon2"
              src="https://tagvv-1256030678.file.myqcloud.com/20250107mpdoj.png"
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
    <!-- 预计消耗 -->
    <div class="consume_box" v-if="pageSource != 'createByImgText'">
      视频合成消耗星力值：<span>10</span>星力值/分钟
    </div>
    <div class="consume_box" v-else>
      预计消耗AI智能合成星力值：
      <span>{{ ruleForm.consumeNum || 0 }}</span>
      星力值
    </div>
    <!-- 编辑标签的弹窗 -->
    <addTagDOM v-if="addTagDialog.show" :addDialog="addTagDialog" @updateTag="updateTag" />
    <!-- 合成提示的弹窗 -->
  </div>
</template>
<script setup>
import addTagDOM from '@/views/content_center/content_repository/components/addTag_dialog.vue'
import {
  getProductNum,
  guessNum,
  getProductUseInfoForServ
} from '@/api/sumvideo/create_by_template.js'
import { foolishGuessNum } from '@/api/sumvideo/create_by_foolish.js'
import searchFileDOM from '@/views/sumvideo/components/files/search_file.vue'
import { isNotEmpty, isEmpty } from '@/utils/tools'
import { getProductGoodsPrice } from '@/api/system_setting/brand_info'
import { throttle } from 'echarts/core'
import { guessNumImgText } from '@/api/sumvideo/create_by_imgtext.js'

const props = defineProps({
  stepLoading: {
    type: Boolean,
    default: false
  },
  pageSource: {
    type: String,
    default: ''
  }, // 组件来源 createByTemplate 模板式生成 createByScript 剧本式生成 createByFoolish 一键成片(两种方式)  createByImgText 图文生成
  subPageSource: {
    type: String,
    default: null // 大的生成方式下小的分类   一键成片-使用视频原生 keepVideoVoice  一键成片-不使用视频原生 notUsedVideoVoice
  },
  chooseTemplateInfo: {
    type: Object,
    default: () => {
      return {}
    }
  }, // 模板信息
  pipelineId: {
    type: Number || String,
    default: null
  }, // 流水线ID
  rulesInfo: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
const { pageSource, pipelineId, chooseTemplateInfo, subPageSource } = toRefs(props)
console.log('props', props, pageSource.value, subPageSource.value)
const oneCouponNum = ref(10) // 一条视频对应的生产星力值数
const ruleForm = ref({
  enableWrap: false, // AI智能包装
  jobName: '', // 任务名称
  normalProductNum: 1, // 生产条数
  videoNamePrefix: '', // 素材视频命名规则前缀
  fileID: null, // 选中的文件夹ID
  tags: [], // 素材标签列表
  rewriteAside: false, // 开关
  consumeNum: 0, // 预计消耗券数
  creativeVersionInfo: null, // 模板版本  { "id": 0,"version": "" }
  chooseVoice: {} // 剧本式生成第二步选择的音色（确保生成时一致）
})

const rewriteAsideShow = ref(false) // 是否显示开关
const normalProductNumInputStatus = ref(false) // 是否显示聚焦时样式

function updateRewriteAside() {
  if (
    pageSource.value === 'createByScript' ||
    (pageSource.value === 'createByFoolish' && subPageSource.value === 'notUsedVideoVoice')
  ) {
    const { normalProductNum } = ruleForm.value
    if (normalProductNum > foolishNum.value * 0.2 && foolishNum.value) {
      rewriteAsideShow.value = true
      ruleForm.value.rewriteAside = true
    } else {
      rewriteAsideShow.value = false
      ruleForm.value.rewriteAside = false
    }
  } else {
    ruleForm.value.rewriteAside = false
    rewriteAsideShow.value = false
  }
}
function extractNumbers(text) {
  const numbers = text.match(/\d+/g)
  if (numbers) {
    return numbers.join('')
  }
  // 如果没有找到数字
  return ''
}

function numBlur() {
  normalProductNumInputStatus.value = false
  if (!ruleForm.value.normalProductNum) {
    ruleForm.value.normalProductNum = minNum.value
    numberChange(ruleForm.value.normalProductNum)
  }
}
const addFun = throttle(function (item) {
  if (ruleForm.value.normalProductNum >= maxNum.value || !maxNum.value) return
  item.normalProductNum++
  numberChange(ruleForm.value.normalProductNum)
}, 300)
const reduceFn = throttle(function (item) {
  if (ruleForm.value.normalProductNum <= minNum.value || !minNum.value) return
  item.normalProductNum--
  numberChange(ruleForm.value.normalProductNum)
}, 300)

function inputChange(e) {
  // 获取输入的值
  const value = e?.trim() || ''
  // 验证输入是否为0或者正整数
  if (value === '0' || /^\d+$/.test(value)) {
    let num = Number(value)
    if (num > maxNum.value) num = maxNum.value
    if (num < minNum.value) num = minNum.value
    ruleForm.value.normalProductNum = num
  } else if (!isEmpty(value)) {
    let num = Number(extractNumbers(value) || 0)
    if (num > maxNum.value) num = maxNum.value
    if (num < minNum.value) num = minNum.value
    ruleForm.value.normalProductNum = num
  }
  numberChange(ruleForm.value.normalProductNum)
}
// 合成条数的修改
function numberChange(e) {
  console.log('数量的修改', e, chooseTemplateInfo.value)
  let num = 0
  if (pageSource.value === 'createByImgText') {
    num = e
      ? parseInt(e) *
        parseInt(oneCouponNum.value) *
        (chooseTemplateInfo.value.imageCnt - chooseTemplateInfo.value.nonReplaceable.length)
      : 0
  } else {
    num = e ? parseInt(e) * parseInt(oneCouponNum.value) : 0
  }
  ruleForm.value.consumeNum = num
  updateRewriteAside()
}

// 获取到的文件夹信息
function changeFileFun(e) {
  console.log('获取到的文件夹信息', e)
  ruleForm.value.fileID = e
}
const addTagDialog = reactive({
  show: false,
  id: null,
  hideTitleSpan: false,
  type: null,
  chooseTagList: [],
  index: [],
  source: null
})
// 打开选择标签弹窗
function openChoseLabel() {
  addTagDialog.type = 12
  addTagDialog.hideTitleSpan = true
  addTagDialog.id = null
  addTagDialog.index = []
  addTagDialog.source = null
  addTagDialog.chooseTagList = ruleForm.value.tags || []
  addTagDialog.show = true
}
// 要打上的标签
function updateTag(e) {
  console.log('获取到的标签', e)
  ruleForm.value.tags = e
}
const initOver = ref(false) // 是否初始化完成
const emits = defineEmits(['updateRules', 'update:stepLoading', 'updateRechargeNum'])

onMounted(() => {
  emits('update:stepLoading', true)
  console.log('ruleForm', ruleForm, props.rulesInfo)
  // 除了生产条数以外，其余均回显
  if (isNotEmpty(props.rulesInfo)) {
    const info = JSON.parse(JSON.stringify(props.rulesInfo))
    ruleForm.value = {
      enableWrap: !!info.enableWrap,
      jobName: info.jobName || '',
      normalProductNum: 1,
      videoNamePrefix: info.videoNamePrefix || '',
      fileID: info.fileID || null,
      tags: info.tags || []
    }
  }

  const p1 = getMaxNum(
    pageSource.value === 'createByImgText' && props.rulesInfo && props.rulesInfo.creativeVersion
  )
  const p2 = getPrice()
  const p3 = getRechargeNum()
  Promise.all([p1, p2, p3]).then(() => {
    if (ruleForm.value.normalProductNum) {
      // 图文模板的星力值计算规则：(图文模板的图片数量-不可替换的数量)*一张图片需要的星力值*生产条数
      // 其余保持不变 就是生产条数*一个视频需要的星力值
      if (pageSource.value === 'createByImgText') {
        console.log('chooseTemplateInfo', chooseTemplateInfo.value)
        ruleForm.value.consumeNum =
          parseInt(ruleForm.value.normalProductNum) *
          parseInt(oneCouponNum.value) *
          (chooseTemplateInfo.value.imageCnt - chooseTemplateInfo.value.nonReplaceable.length)
      } else {
        ruleForm.value.consumeNum =
          parseInt(ruleForm.value.normalProductNum) * parseInt(oneCouponNum.value)
      }
    }
    console.log('xxxxx')
    emits('update:stepLoading', false)
    initOver.value = true
    if (pageSource.value === 'createByScript' || pageSource.value === 'createByFoolish') {
      // 回显开关状态
      updateRewriteAside()
      if (isNotEmpty(props.rulesInfo)) {
        const info = JSON.parse(JSON.stringify(props.rulesInfo))
        ruleForm.value.rewriteAside = info.rewriteAside || false
      }
    }
  })
})
const foolishNum = ref(0) // 实际最多的预估条数
const minNum = ref(1) // 最小生产条数
const maxNum = ref(0) // 最大生产条数
// 获取最大条数--具体看后端 useProps 就用父级传过来的
function getMaxNum(useProps) {
  return new Promise(resolve => {
    if (useProps) {
      const propsInfo = JSON.parse(JSON.stringify(props.rulesInfo))
      if (propsInfo.maxNum === 0) {
        minNum.value = 0
        ruleForm.value.normalProductNum = undefined
        ruleForm.value.consumeNum = 0
      }
      if (pageSource.value === 'createByImgText') {
        foolishNum.value = propsInfo.maxNum > 1000 ? 1000 : propsInfo.maxNum
        maxNum.value = 1000
      } else {
        maxNum.value = propsInfo.maxNum > 1000 ? 1000 : propsInfo.maxNum
      }
      ruleForm.value.creativeVersionInfo = propsInfo.creativeVersion
      resolve()
      return
    }
    const param = {
      creativeId:
        pageSource.value === 'createByImgText'
          ? chooseTemplateInfo.value?.creativeId
          : chooseTemplateInfo.value?.id,
      isDistinct: false,
      pipelineId: pipelineId.value
    }
    const numPromise =
      pageSource.value === 'createByImgText'
        ? guessNumImgText(param)
        : pageSource.value === 'createByFoolish'
        ? foolishGuessNum({
            pipelineId: pipelineId.value
          })
        : pageSource.value === 'createByTemplate'
        ? getProductNum(param)
        : guessNum(param)
    numPromise
      .then(res => {
        console.log('获取最大生产条数返回', res)
        if (res.code === 0) {
          let num = 0
          // if (pageSource.value === 'createByTemplate' || pageSource.value === 'createByImgText') {
          //   num = res.data?.num || 0
          // } else {
          num = res.data?.num || 0
          // }
          // 如果获取到的最大生产条数是0 那生产条数设置为0
          if (num === 0) {
            minNum.value = 0
            ruleForm.value.normalProductNum = undefined
            ruleForm.value.consumeNum = 0
          }
          // 一键成片、剧本式最大就是1000 它的预估条数使用在重写那
          if (pageSource.value === 'createByFoolish') {
            foolishNum.value = num > 1000 ? 1000 : num
            const limitNum = res.data?.limitNum || 0
            maxNum.value = limitNum > 1000 ? 1000 : limitNum
          } else if (
            pageSource.value === 'createByScript' ||
            pageSource.value === 'createByImgText'
          ) {
            foolishNum.value = num > 1000 ? 1000 : num
            maxNum.value = 1000
          } else {
            maxNum.value = num > 1000 ? 1000 : num
          }
          // 只有模板式生成需要自动填充任务名称
          if (!ruleForm.value.jobName && pageSource.value === 'createByTemplate') {
            ruleForm.value.jobName = res.data?.taskName.substring(0, 20)
          }
          // 剧本式生成需要将选择的音色回传
          if (pageSource.value === 'createByScript') {
            ruleForm.value.chooseVoice = res.data?.chooseVoice || {}
          }
          ruleForm.value.creativeVersionInfo = res.data?.creativeVersion
        }
        resolve()
      })
      .catch(() => {
        minNum.value = 0
        ruleForm.value.normalProductNum = undefined
        ruleForm.value.consumeNum = 0
        maxNum.value = 10
        resolve()
      })
  })
}
// 获取普通视频合成需要消耗的数量
function getPrice() {
  return new Promise(resolve => {
    getProductGoodsPrice()
      .then(res => {
        if (res.code === 0) {
          oneCouponNum.value =
            pageSource.value === 'createByImgText'
              ? res.data?.proudctConfig?.imageCost || 3
              : res.data?.proudctConfig?.videoCost || 1
          ruleForm.value.oneCouponNum = oneCouponNum.value
          console.log('获取到的消耗', res, oneCouponNum.value)
        }
      })
      .finally(() => {
        resolve()
      })
  })
}

// 获取剩余的合成券数量
function getRechargeNum() {
  return new Promise(resolve => {
    getProductUseInfoForServ({
      brandId: localStorage.getItem('brandInfo')
        ? JSON.parse(localStorage.getItem('brandInfo')).brandId
        : ''
    })
      .then(res => {
        if (res.code === 0) {
          emits('updateRechargeNum', res.data?.videoNumber || 0)
          console.log('获取剩余的合成券数量', res)
        }
      })
      .finally(() => {
        resolve()
      })
  })
}
//
watch(
  () => ruleForm.value,
  val => {
    if (initOver.value) {
      console.log('updateRules', val, ruleForm.value)
      emits('updateRules', ruleForm.value)
    }
  },
  {
    deep: true
    // immediate: true
  }
)

watch(
  () => ruleForm.value.normalProductNum,
  val => {
    if (initOver.value) {
      updateRewriteAside()
    }
  },
  {
    deep: true
    // immediate: true
  }
)
// 文本内容校验
function retEmit(e, val) {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  ruleForm.value[val] = e.target.value.trim().replace(reg, '')
}

// 跳转到AI智能包装
const toAIFun = throttle(() => {
  window.open('/sumwhy_video/AI_intelligent_packaging', '_blank')
}, 500)
</script>
<style lang="scss" scoped>
.rules_page {
  width: 100%;
  height: 100%;
  position: relative;

  .rule_box {
    padding-top: 20px;
    height: calc(100% - 64px);
    overflow-y: auto;
    .rule_box2 {
      min-height: 270px;
    }
  }
  .one_rule {
    padding: 0px 24px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-weight: 400;
    font-size: 14px;
    color: #303133;
    line-height: 20px;
    span {
      font-weight: 600;
      color: #364fcd;
    }
    .rule_name {
      height: 24px;
      background: #f2f3f5;
      border-radius: 4px;
      margin: 0 4px 0 8px;
      font-weight: 400;
      font-size: 14px;
      color: #303133;
      line-height: 24px;
      padding: 0 8px;
    }

    .content_btn {
      cursor: pointer;
      margin-left: 8px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      font-weight: 400;
      font-size: 12px;
      color: #364fcd;
      line-height: 18px;
      padding: 3px 8px;
      border: 1px solid #364fcd;
      border-radius: 4px;
      img {
        width: 12px;
        height: 12px;
        object-fit: contain;
        display: flex;
        margin-right: 3px;
      }
      &:hover {
        background: rgba(54, 79, 205, 0.1);
      }
    }
  }
  .one_rule_blue {
    width: max-content;
    padding: 0 12px;
    background: rgba(54, 79, 205, 0.1);
    border-radius: 4px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-weight: 400;
    font-size: 14px;
    color: #303133;
    line-height: 20px;
  }
  .tag_mark {
    color: #909399;
    margin-left: 12px;
    span {
      color: #364fcd;
    }
  }
  .one_rule + .one_rule {
    margin-top: 20px;
  }
  .num_info {
    display: flex;
    align-items: center;
    .xm_tooltipOfRight {
      margin-left: 4px;
    }
  }
  .consume_box {
    width: 100%;
    height: 44px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    position: absolute;
    bottom: 0px;
    left: 0;
    font-weight: 400;
    font-size: 14px;
    color: #909399;
    line-height: 20px;
    span {
      font-weight: 600;
      color: #364fcd;
      margin-right: 4px;
    }
  }
  .num_rule {
    .script_input_warp {
      div {
        box-sizing: border-box;
      }
      user-select: none;
      display: flex;
      align-items: center;
      width: 100px;
      margin: 0 16px 0 8px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      position: relative;
      transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
      &:hover {
        border-color: #c0c4cc;
      }

      :deep(.el-input__inner) {
        border-right: unset;
        padding-right: 42px;
        padding-left: 15px;
        text-align: center;
        border: unset;
      }
      .btn_warp {
        height: 32px;
        position: absolute;
        top: 0;
        right: 0;
        width: 34px;
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
        // border-right: 1px solid #dcdfe6;
        .btn_item {
          width: 100%;
          height: 50%;
          position: absolute;
          right: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f5f7fa;
          .icon_warp {
            height: 13px;
            width: 13px;
            line-height: 13px;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            position: relative;
            fill: currentColor;
            color: inherit;
            font-size: inherit;
            transform: scale(0.8);
            color: #606266;
            svg {
              height: 13px;
              width: 13px;
              &:hover {
                color: #364fcd;
              }
            }
          }
        }
        .add_btn {
          top: 0;
          border-left: 1px solid #dcdfe6;
          border-bottom: 1px solid #dcdfe6;
          border-top-right-radius: 5px;
        }
        .reduce_btn {
          bottom: 0;
          border-left: 1px solid #dcdfe6;
          border-bottom-right-radius: 5px;
        }

        .reduce_btn_disabled,
        .add_btn_disabled {
          cursor: not-allowed;
          .icon_warp {
            svg {
              color: #c0c4cc !important;
              &:hover {
                color: #c0c4cc !important;
              }
            }
          }
        }
      }
    }
    // 样式
    .script_input_warp_input {
      border-color: #364fcd !important;
    }
  }
  .rule_switch {
    font-weight: 400;
    font-size: 14px;
    color: #303133;
    line-height: 20px;
    .switch_switch {
      margin: 0 16px 0 12px;
      height: 20px;
    }
    .switch_icon1 {
      width: 20px;
      height: 20px;
      margin-right: 6px;
    }
    .switch_icon2 {
      width: 14px;
      height: 14px;
      margin-left: 4px;
    }
    .rule_link {
      font-weight: 400;
      font-size: 14px;
      color: #364fcd;
      line-height: 20px;
      cursor: pointer;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
    }
  }
}
</style>
