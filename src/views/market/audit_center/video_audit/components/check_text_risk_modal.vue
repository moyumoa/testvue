<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="查看文本风险"
      width="820px"
      custom-class="rule_setting_dialog hide_footer_line"
    >
      <div class="dialog_container kos_page">
        <div class="container_left">
          <!-- 标题文案 -->
          <div
            class="copywriting_container"
            v-if="
              (isNotEmpty(info.dyTitleTextResult) && info.dyTitleTextResult.text) ||
              (isNotEmpty(info.xhsTitleTextResult) &&
                info.xhsTitleTextResult.text &&
                info.platformList &&
                info.platformList.includes('3'))
            "
          >
            <div class="container_top">
              <div class="top_left">标题文案</div>
            </div>

            <div class="container_content">
              <div
                class="one_container"
                v-if="isNotEmpty(info.dyTitleTextResult) && info.dyTitleTextResult.text"
              >
                <!-- 如果是多平台文案，就显示平台标识 -->
                <template v-if="info.platformList && info.platformList.length > 1">
                  <template v-for="(a, b) in info.platformList" :key="b">
                    <div
                      class="platform_icon"
                      v-if="a != 3"
                      :style="{
                        marginLeft: b === 0 ? '0' : '-15px',
                        zIndex: 3 - b
                      }"
                    >
                      <div :class="[`xm_platformIcon_${a}`]"></div>
                    </div>
                  </template>
                </template>
                <div
                  @click="textClickFun($event, 1)"
                  v-html="
                    textAnalysisFun(
                      1,
                      info.dyTitleTextResult.text,
                      info.dyTitleTextResult.results,
                      false,
                      true
                    )
                  "
                ></div>
              </div>
              <div
                class="one_container"
                v-if="
                  isNotEmpty(info.xhsTitleTextResult) &&
                  info.xhsTitleTextResult.text &&
                  info.platformList &&
                  info.platformList.includes('3')
                "
              >
                <!-- 如果是多平台文案，就显示平台标识 -->
                <div
                  class="platform_icon"
                  :style="{
                    marginLeft:
                      isNotEmpty(info.dyTitleTextResult) && info.dyTitleTextResult.text
                        ? info.dyOtherPlatfrom
                          ? info.dyOtherPlatfrom.length > 2
                            ? '18px'
                            : info.dyOtherPlatfrom.length > 1
                            ? '9px'
                            : '0'
                          : '0'
                        : '0'
                  }"
                  v-if="
                    info.platformList &&
                    info.platformList.length > 1 &&
                    info.platformList.includes('3')
                  "
                >
                  <div :class="['xm_platformIcon_3']"></div>
                </div>
                <div
                  @click="textClickFun($event, 1)"
                  v-html="
                    textAnalysisFun(
                      1,
                      info.xhsTitleTextResult.text,
                      info.xhsTitleTextResult.results,
                      false,
                      true
                    )
                  "
                ></div>
              </div>
            </div>
          </div>
          <!-- 口播文案 只有视频才有 -->
          <div
            class="copywriting_container"
            v-if="isNotEmpty(info.videoTextResult) && info.videoTextResult.text"
          >
            <div class="container_top">
              <div class="top_left">口播文案</div>
            </div>
            <div
              :style="{
                paddingLeft:
                  info.dyOtherPlatfrom &&
                  isNotEmpty(info.dyTitleTextResult) &&
                  info.dyTitleTextResult.text
                    ? info.dyOtherPlatfrom.length > 2
                      ? '40px'
                      : info.dyOtherPlatfrom.length > 1
                      ? '32px'
                      : info.platformList &&
                        info.platformList.length > 1 &&
                        info.platformList.includes('3') &&
                        info.platformList.includes('1')
                      ? '24px'
                      : '0'
                    : '0'
              }"
              class="container_content"
              @click="textClickFun($event, 2)"
              v-html="
                textAnalysisFun(
                  2,
                  info.videoTextResult.text,
                  info.videoTextResult.results,
                  false,
                  true
                )
              "
            ></div>
          </div>
        </div>
        <div class="container_right" v-if="isNotEmpty(chooseInfo)">
          <div class="one_right">
            <div class="right_label">风险分析</div>
            <div :class="[`${riskLevelMap[chooseInfo.score].color}_back_color`]">
              {{ riskLevelMap[chooseInfo.score].label }}
            </div>
          </div>

          <div class="one_right one_right2">
            <div class="right_label">问题说明</div>
            <div class="rigth_content">
              <el-input
                :disabled="chooseInfo.isMark || status != 1"
                :rows="4"
                type="textarea"
                maxlength="90"
                v-model="remark"
                show-word-limit
                resize="none"
                placeholder=""
                @blur="retEmitEmj($event)"
              ></el-input>
            </div>
          </div>
          <!-- 待审核下才显示 -->
          <div class="right_btn" v-if="status == 1">
            <el-button @click="closeDialog">取消</el-button>
            <el-button
              :disabled="chooseInfo.isMark"
              type="primary"
              style="padding: 6px 12px"
              @click="handleConfirm"
            >
              {{ chooseInfo.isMark ? '已' : '' }}标记为修改意见
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import { textAnalysisFun, riskLevelMap } from '../model/tool'
import { isNotEmpty, throttle, isEmpty } from '@/utils/tools'

const props = defineProps({
  status: Number,
  riskDetectionResultList: Array,
  reasonList: Array,
  info: Object,
  checkDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const message = inject('$message')
const dialog = ref()
const { show } = toRefs(props.checkDialog)
const { info, riskDetectionResultList, status } = toRefs(props)
const lastId = ref(null) // 上一次点击的Id
const newId = ref(null) // 目前点击的Id
const chooseType = ref(null) // 目前点击的文案类型 1:标题文案 2:口播文案
const chooseInfo = ref({}) // 目前点击的文案信息
const remark = ref('') // 问题说明
const emits = defineEmits(['markFun'])
// 根据id找到对应的信息
function findInfoById(type) {
  chooseType.value = type
  if (newId.value) {
    const newElementList = document.querySelectorAll(`.dialog_container [data-id="${newId.value}"]`)
    if (isNotEmpty(newElementList)) {
      console.log('新的', newElementList) // 现在你可以使用这个元素了

      newElementList.forEach(a => {
        a.classList.add('mark_text')
      })
    }
  }

  // 在Info里找到这条对应的数据 回显风险分析和风险说明
  let tempInfo = {}
  console.log('videoDetectionResult', riskDetectionResultList.value, newId.value)
  tempInfo = riskDetectionResultList.value.find(item => item.id === parseInt(newId.value))

  console.log('找到的Index', tempInfo)
  chooseInfo.value = tempInfo
  remark.value = tempInfo.markDesc
}
// 点击文案里的文字
const textClickFun = throttle((e, type) => {
  console.log('点击文案里的文字', e, type, e.target.dataset.id, newId.value)
  // 如果没有点击到标记过的文字 不算
  if (!e.target.dataset.id) {
    return
  }
  // 如果点击的都是同一个文字 不算
  if (newId.value === e.target.dataset.id) {
    return
  }
  console.log('点击文案里的文字', e, e.target.dataset.id, type)
  lastId.value = newId.value
  newId.value = e.target.dataset.id
  console.log('点击文案里的文字', newId.value, lastId.value)
  // 给新点击的文字添加样式 并且给上一次点击的文字删除样式
  if (lastId.value) {
    const lastElementList = document.querySelectorAll(
      `.dialog_container [data-id="${lastId.value}"]`
    )
    if (isNotEmpty(lastElementList)) {
      console.log('旧的', lastElementList) // 现在你可以使用这个元素了
      lastElementList.forEach(a => {
        a.classList.remove('mark_text')
      })
    }
  }
  findInfoById(type)
}, 300)
// 检查是否有表情包
function retEmitEmj(e) {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi

  remark.value = e.target.value.replace(reg, '')
}
// 取消
function closeDialog() {
  console.log(dialog.value)
  dialog.value.handleClose()
}
// 标记为修改意见
const handleConfirm = throttle(() => {
  if (chooseInfo.value.isMark) {
    return
  }
  if (isEmpty(remark.value)) {
    message.warning('请先输入问题说明')
    return
  }
  if (remark.value.length > 90) {
    message.warning('问题说明不超过90字')
    return
  }
  console.log('props.reasonList', props.reasonList.length)
  if (props.reasonList && props.reasonList.length < 30) {
    chooseInfo.value.isMark = true

    chooseInfo.value.markDesc = remark.value
    console.log('handleConfirm', `标题中“${chooseInfo.value.auditText}”${remark.value}`)
    // 校验是否为空
    emits(
      'markFun',
      chooseInfo.value.markType,
      newId.value,
      chooseInfo.value.auditText,
      chooseInfo.value.score,
      `${parseInt(chooseType.value) === 1 ? '标题中' : '口播文案中'}“${
        chooseInfo.value.auditText
      }”${remark.value}`
    )
  } else {
    message.warning('最多支持添加30条修改意见')
  }
}, 500)

onMounted(() => {
  // 默认展示第一个文字对应的风险分析和问题说明
  if (isNotEmpty(info.value)) {
    // 检查是否有标题文案是否有风险问题
    // 有的话，就展示第一个文案的风险分析和问题说明
    // 没有再检查口播文案是否有风险问题
    // 有的话，就展示第一个文案的风险分析和问题说明
    setTimeout(() => {
      // 寻找第一个有data-id的
      const firstElement = document.querySelector('.dialog_container [data-id]')
      if (firstElement) {
        console.log('寻找', firstElement, firstElement?.dataset?.id)
        newId.value = firstElement.dataset.id
        findInfoById(firstElement.dataset.type)
      }
    }, 0)
  }
})
</script>
<style lang="scss" scoped>
.red_back_color {
  font-weight: 600;
  font-size: 12px;
  line-height: 18px;
  width: max-content;
  padding: 2px 6px;
  border-radius: 4px;
  color: #d40000;
  background: rgba(212, 0, 0, 0.1);
}
.orange_back_color {
  font-weight: 600;
  font-size: 12px;
  line-height: 18px;
  width: max-content;
  padding: 2px 6px;
  border-radius: 4px;
  color: #ed6a0c;
  background: rgba(237, 106, 12, 0.1);
}
.green_back_color {
  font-weight: 600;
  font-size: 12px;
  line-height: 18px;
  width: max-content;
  padding: 2px 6px;
  border-radius: 4px;
  color: #2da641;
  background: rgba(45, 166, 65, 0.1);
}
.dialog_container {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  .container_left {
    width: 410px;
    border-right: 1px solid #e3e4e6;
    height: 348px;
    overflow-y: auto;
    padding: 14px 16px;
    font-weight: 400;
    font-size: 14px;
    color: #606266;
    line-height: 24px;
    .copywriting_container + .copywriting_container {
      margin-top: 12px;
    }
    .copywriting_container {
      .container_top {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;

        .top_left {
          font-weight: 600;
          font-size: 16px;
          color: #303133;
          line-height: 22px;
        }
        .top_right {
          font-weight: 400;
          font-size: 14px;
          color: #364fcd;
          line-height: 20px;
          cursor: pointer;
        }
      }
      .container_content {
        margin-top: 4px;
        font-weight: 400;
        font-size: 14px;
        color: #606266;
        line-height: 24px;
        .one_container {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: flex-start;
          font-weight: 400;
          font-size: 14px;
          color: #606266;
          line-height: 24px;
          white-space: pre-wrap;
          .platform_icon {
            flex-shrink: 0;
            margin-top: 2px;
            margin-right: 4px;
            width: 20px;
            height: 20px;
            position: relative;
          }
        }
      }
    }
  }
  .container_right {
    padding: 16px;
    width: calc(100% - 411px);
    .one_right {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .right_label {
        flex-shrink: 0;
        margin-right: 8px;
        font-weight: 600;
        font-size: 14px;
        color: #303133;
        line-height: 20px;
      }
      .rigth_content {
        width: 100%;
        margin-top: 8px;
      }
      :deep(.el-textarea__inner) {
        height: 163px;
      }
    }
    .one_right2 {
      flex-direction: column;
      align-items: flex-start;
    }
    .one_right + .one_right {
      margin-top: 12px;
    }
    .right_btn {
      margin-top: 60px;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
    }
  }
}
:deep(.el-textarea.is-disabled .el-textarea__inner) {
  background-color: transparent;
  color: #606266;
}
</style>
