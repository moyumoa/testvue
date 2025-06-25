<template>
  <div class="create_by_foolish_page" v-loading="pageLoading">
    <!-- 默认页 -->
    <div class="default_page" v-if="currentStep === null">
      <div class="default_content">
        <div class="content_content">
          <img
            class="default_icon"
            src="https://tagvv-1256030678.file.myqcloud.com/20240524i200h.png"
            alt=""
          />
          <div class="default_tip">视频智能混剪，快速高效裂变</div>
        </div>
      </div>
      <div class="content_bottom">
        <el-button :loading="createLoading" class="one_btn" type="primary" @click="createPipeline">
          开始创作
        </el-button>
      </div>
    </div>
    <div v-if="currentStep !== null && !pageLoading" class="steps_page">
      <!-- 步骤条 -->
      <productStep :currentSteps="currentStep" :stepList="stepList" />
      <!-- 主要的信息 -->
      <div class="page_content">
        <div class="content_top">
          <!-- 第一步 -->
          <step1
            ref="step1Ref"
            :durationList="durationList"
            :pipelineId="pipelineId"
            v-model:info="$data.fillInfo"
            v-model:btnDis="step1Dis"
            v-if="currentStep === 0"
            @changeType="stepChangeType"
          />
          <!-- 第二步 -->
          <div class="third_page step_page" v-else-if="currentStep === 1">
            <div class="page_top">
              <stepsTitle :currentSteps="1" title="请定义本次合成的规则"></stepsTitle>
            </div>
            <div class="page_bottom" v-loading="stepLoading">
              <!-- -->
              <developRulesDOM
                v-if="step2InitOver"
                :pipelineId="pipelineId"
                :rulesInfo="$data.rulesInfo || {}"
                pageSource="createByFoolish"
                :subPageSource="videoCteateType"
                @updateRules="updateRules"
                @updateRechargeNum="updateRechargeNum"
                v-model:stepLoading="stepLoading"
              />
            </div>
          </div>
          <!-- 第三步 -->
          <step3 v-else-if="currentStep === 2" @closeFun="closeFun" @toRecords="toRecords" />
        </div>
        <div class="content_bottom" v-if="!stepLoading">
          <el-button
            :disabled="step1Dis"
            :loading="step1BtnLoading"
            class="one_btn"
            @click="saveStep1Fun"
            type="primary"
            v-if="currentStep === 0"
          >
            确定，下一步
          </el-button>
          <template v-else-if="currentStep === 1">
            <el-button class="one_btn half_btn" @click="goBack(1)">上一步</el-button>
            <el-button class="one_btn half_btn" @click="saveStep3Fun" type="primary">
              立即合成
            </el-button>
          </template>
          <el-button class="one_btn" @click="closeFun" type="primary" v-else-if="currentStep === 2">
            关闭页面
          </el-button>
        </div>
      </div>
    </div>
    <!-- 合成弹窗 -->
    <compositeTipDOM
      v-if="tipDialog.show"
      :tipDialog="tipDialog"
      @handleConfirm="handleTipConfirm"
    />
    <!-- 预生成弹窗提示 -->
    <createPreviewDialog
      v-if="createDialog.show"
      :createDialog="createDialog"
      @submit="handleTipConfirm"
    />
    <!-- 合成余额不足的弹窗 -->
    <compositeRechargeDOM v-if="rechargeDialog.show" :tipDialog="rechargeDialog" />
  </div>
</template>
<script setup>
import { useRoute, useRouter } from 'vue-router'
import developRulesDOM from '@/views/sumvideo/components/step/develop_rules.vue'
import stepsTitle from '@/views/sumvideo/components/step/steps_content_title.vue'
import compositeTipDOM from '@/views/sumvideo/components/step/composite_tip_dialog.vue'
import compositeRechargeDOM from '@/views/sumvideo/components/step/composite_recharge_dialog.vue'
import step1 from './step1.vue'
import step3 from '@/views/sumvideo/components/step/fourth_step.vue'
import productStep from '@/views/sumvideo/components/step/produce_steps.vue'
import createPreviewDialog from '../components/step/create_preview_dialog.vue'

import { throttle, isNotEmpty, isEmpty } from '@/utils/tools'
import { resetPushState } from '@/utils/getRoute'
import {
  createFoolishPipeline,
  getFoolishPipelineDetail,
  savePipelineConfig,
  produce
} from '@/api/sumvideo/create_by_foolish.js'
import { updateStep } from '@/api/sumvideo/create_by_template.js'

const message = inject('$message')
const stepList = reactive([
  {
    name: '导入原料',
    done: false
  },
  {
    name: '制定规则',
    done: false
  },
  {
    name: '完成',
    done: false
  }
])
const currentStep = ref(null) // 当前步骤 null 未开始 0步骤一 1步骤二 2步骤三

const pageLoading = ref(false) // 页面loading
const stepLoading = ref(false) // 切换步骤的Loading
const pipelineId = ref(null) // 流水线ID
const $data = ref({
  fillInfo: null, // 填写的信息
  rulesInfo: {} // 制定的规则信息
})
const errIdList = ref([]) // 步骤一校验不符合条件的原料列表
const step1BtnLoading = ref(false) // 步骤一按钮的loading
const step1Dis = ref(true) // 步骤一是否禁用
const step1Ref = ref()
const router = useRouter()
const videoCteateType = ref(null)

function toRecords() {
  sessionStorage.setItem('refresh', true)
  router.push(`/sumwhy_video/synthesis_task`)
}
const durationList = reactive([
  {
    value: 1,
    label: '10-20s',
    min: 10,
    max: 20
  },
  {
    value: 2,
    label: '20-40s',
    min: 20,
    max: 40
  },
  {
    value: 3,
    label: '40-60s',
    min: 40,
    max: 60
  },
  {
    value: 4,
    label: '60s-90s',
    min: 60,
    max: 90
  }
]) // 视频时长列表
const createDialog = reactive({
  show: false,
  title: '确认合成',
  createNum: null // 生产条数
})

// 第一步，生成方变化
function stepChangeType(val) {
  videoCteateType.value = val
}

// 步骤一的确认，下一步
const saveStep1Fun = throttle(() => {
  step1BtnLoading.value = true
  // 校验输入的内容和已匹配的原料
  step1Ref.value
    ?.validFun()
    .then(() => {
      saveConfig().finally(() => {
        step1BtnLoading.value = false
      })
    })
    .catch(() => {
      step1BtnLoading.value = false
    })
})
// 保存填写信息
function saveConfig(noValid) {
  return new Promise((resolve, reject) => {
    const audioProcessMode = isNotEmpty($data.value.fillInfo)
      ? $data.value.fillInfo?.audioProcessMode
      : 2
    const keyWords =
      audioProcessMode === 2 && isNotEmpty($data.value.fillInfo)
        ? {
            category: $data.value.fillInfo.category || '',
            industry:
              $data.value.fillInfo.industry && $data.value.fillInfo.industry.length > 0
                ? $data.value.fillInfo.industry.join('、')
                : '',
            sellingPoint:
              $data.value.fillInfo.sellingPoint && $data.value.fillInfo.sellingPoint.length > 0
                ? $data.value.fillInfo.sellingPoint.join('、')
                : '',
            painPoint:
              $data.value.fillInfo.painPoint && $data.value.fillInfo.painPoint.length > 0
                ? $data.value.fillInfo.painPoint.join('、')
                : '',
            populationFeatures:
              $data.value.fillInfo.populationFeatures &&
              $data.value.fillInfo.populationFeatures.length > 0
                ? $data.value.fillInfo.populationFeatures.join('、')
                : '',
            sceneFeatures:
              $data.value.fillInfo.sceneFeatures && $data.value.fillInfo.sceneFeatures.length > 0
                ? $data.value.fillInfo.sceneFeatures.join('、')
                : '',
            scene: $data.value.fillInfo.scene || '',
            festival: $data.value.fillInfo.festival || '',
            activity:
              $data.value.fillInfo.activity && $data.value.fillInfo.activity.length > 0
                ? $data.value.fillInfo.activity.join('、')
                : ''
          }
        : {
            category: '',
            activity: '',
            festival: '',
            industry: '',
            painPoint: '',
            populationFeatures: '',
            scene: '',
            sceneFeatures: '',
            sellingPoint: ''
          }
    const durationInfo =
      isNotEmpty($data.value.fillInfo) &&
      $data.value.fillInfo?.composeMode &&
      $data.value.fillInfo?.composeMode === 1
        ? durationList.filter(x => x.value === ($data.value.fillInfo?.durationDesc || 1))
        : []
    console.log('$data.value.fillInfo', $data.value.fillInfo, durationList, durationInfo)
    savePipelineConfig({
      composeMode: isNotEmpty($data.value.fillInfo) ? $data.value.fillInfo?.composeMode || 2 : 2,
      numbers: isNotEmpty($data.value.fillInfo)
        ? $data.value.fillInfo?.composeMode && $data.value.fillInfo?.composeMode === 2
          ? $data.value.fillInfo?.videoNumList
          : []
        : [],
      minTime: isNotEmpty($data.value.fillInfo)
        ? $data.value.fillInfo?.composeMode && $data.value.fillInfo?.composeMode === 1
          ? durationInfo && durationInfo.length > 0
            ? durationInfo[0].min * 1000
            : null
          : null
        : null,
      maxTime: isNotEmpty($data.value.fillInfo)
        ? $data.value.fillInfo?.composeMode && $data.value.fillInfo?.composeMode === 1
          ? durationInfo && durationInfo.length > 0
            ? durationInfo[0].max * 1000
            : null
          : null
        : null,
      // bgmConfig:
      pipelineId: pipelineId.value,
      keyWords: keyWords,
      durationDesc: isNotEmpty($data.value.fillInfo) ? $data.value.fillInfo?.durationDesc : 1,
      enableVideoSound: isNotEmpty($data.value.fillInfo)
        ? $data.value.fillInfo?.enableVideoSound
        : true
    })
      .then(res => {
        if (res.code === 0) {
          if (!noValid) {
            updateStepFun(2)
              .then(() => {
                $data.value.rulesInfo.normalProductNum = 1
                $data.value.rulesInfo.consumeNum = 0

                currentStep.value = 1

                step2InitOver.value = true
                resolve()
              })
              .catch(err1 => {
                reject(err1)
              })
          }
        } else {
          resolve()
        }
      })
      .catch(err => {
        reject(err)
      })
  })
}

// 步骤二 ：立即合成
const step2InitOver = ref(false) // 步骤二是否初始化完成
const rechargeNum = ref() // 合成券的剩余张数
const rechargeDialog = ref({
  show: false
}) // 合成券余额不足的弹窗
const tipDialog = ref({
  show: false
}) // 合成的提示弹窗
function updateRechargeNum(e) {
  rechargeNum.value = e
}
// 获取要合成的信息
function updateRules(e) {
  if (isNotEmpty(e)) {
    $data.value.rulesInfo.enableWrap = !!e.enableWrap
    $data.value.rulesInfo.oneCouponNum = e.oneCouponNum || 10
    $data.value.rulesInfo.consumeNum = e.consumeNum || 0
    $data.value.rulesInfo.jobName = e.jobName // 任务名称
    $data.value.rulesInfo.normalProductNum = e.normalProductNum // 生产条数
    $data.value.rulesInfo.videoNamePrefix = e.videoNamePrefix // 成品视频命名规则前缀
    $data.value.rulesInfo.fileID = e.fileID // 选中的文件夹ID
    $data.value.rulesInfo.tags = e.tags // 成品标签列表
    $data.value.rulesInfo.rewriteAside = e.rewriteAside // 是否自动重写文案
    $data.value.rulesInfo.creativeVersionInfo = e.creativeVersionInfo // 模板版本
  }
}
// 立即合成
const saveStep3Fun = throttle(() => {
  if (isEmpty($data.value.rulesInfo.jobName)) {
    message.warning('任务名称不能为空！')
    return
  }
  if (!($data.value.rulesInfo.normalProductNum > 0)) {
    message.warning('生产条数不能为空！')
    return
  }
  if (isEmpty($data.value.rulesInfo.videoNamePrefix)) {
    message.warning('素材视频命名规则不能为空！')
    return
  }
  // 消耗的合成券数大于剩余的券数，就显示充值弹窗
  if ($data.value.rulesInfo.consumeNum > rechargeNum.value) {
    rechargeDialog.value = {
      show: true,
      couponNum: $data.value.rulesInfo.consumeNum
    }
    return
  }

  if ($data.value.rulesInfo.normalProductNum <= 3) {
    tipDialog.value = {
      videoNum: $data.value.rulesInfo.normalProductNum,
      couponNum: $data.value.rulesInfo.consumeNum,
      show: true
    }
  } else {
    createDialog.createNum = $data.value.rulesInfo.normalProductNum
    createDialog.consumeNum = $data.value.rulesInfo.consumeNum
    createDialog.oneCouponNum = $data.value.rulesInfo.oneCouponNum || 10
    createDialog.show = true
  }
}, 700)

function handleTipConfirm(dialog, loading, previewValue = null) {
  const param = JSON.parse(JSON.stringify($data.value.rulesInfo))
  param.folderIds = isNotEmpty(param.fileID) ? [param.fileID.id] : []
  param.pipelineId = pipelineId.value
  param.digitProductNum = 0
  param.isDistinct = false
  // param.creativeVersions = param.creativeVersionInfo ? [param.creativeVersionInfo] : []
  const tagIds = []
  param.tags.forEach(x => {
    tagIds.push(x.id)
  })
  param.labelIds = tagIds
  // 1预览前3条，2生成全部
  if (previewValue && previewValue === 1) {
    param.previewNumber = 3
  }
  produce(param)
    .then(res => {
      if (res.code === 0) {
        // 合成成功后，调用接口更新流水线步骤 把当前的模板ID和流水线ID从选择过的模板和对应的流水线信息列表
        updateStepFun(3)
          .then(() => {
            dialog.handleClose()
            currentStep.value = 2
          })
          .finally(() => {
            loading.value = false
          })
      } else {
        loading.value = false
      }
    })
    .catch(() => {
      loading.value = false
    })
}

// 关闭页面 清空所有初始数据
const closeFun = throttle(() => {
  $data.value = {
    fillInfo: null, // 填写的信息
    rulesInfo: {} // 制定的规则信息
  }
  errIdList.value = []
  currentStep.value = null
  pipelineId.value = null
  resetPushState()
}, 500)
const createLoading = ref(false) // 创建流水线的loading
// 创建流水线
const createPipeline = throttle(function () {
  createLoading.value = true
  createFoolishPipeline({})
    .then(res => {
      if (res.code === 0) {
        pipelineId.value = res.data
        currentStep.value = 0
        const newQuery = `?pipelineId=${pipelineId.value}`
        resetPushState(newQuery)
      }
      createLoading.value = false
    })
    .catch(() => {
      createLoading.value = false
    })
}, 500)
// 获取流水线详情
function getPipelineDetail(init) {
  return new Promise((resolve, reject) => {
    getFoolishPipelineDetail({
      pipelineId: pipelineId.value
    })
      .then(res => {
        if (res.code === 0) {
          const data = res.data || {}
          if (init && data.step === 3) {
            if (init) {
              resolve()
            } else {
              reject(data)
            }

            return
          }
          const step = data.step ? parseInt(data.step) - 1 : 0
          // 第一步，回显填写的信息
          if (isNotEmpty(data.extraConfig)) {
            const audioProcessMode = data.extraConfig?.audioProcessMode || 2
            $data.value.fillInfo = {
              category:
                audioProcessMode === 2 && data.extraConfig?.keyWords
                  ? data.extraConfig?.keyWords.category || ''
                  : '',
              industry:
                audioProcessMode === 2 && data.extraConfig?.keyWords
                  ? data.extraConfig?.keyWords.industry
                    ? data.extraConfig?.keyWords.industry.split('、')
                    : []
                  : [],
              sellingPoint:
                audioProcessMode === 2 && data.extraConfig?.keyWords
                  ? data.extraConfig?.keyWords.sellingPoint
                    ? data.extraConfig?.keyWords.sellingPoint.split('、')
                    : []
                  : [],
              painPoint:
                audioProcessMode === 2 && data.extraConfig?.keyWords
                  ? data.extraConfig?.keyWords.painPoint
                    ? data.extraConfig?.keyWords.painPoint.split('、')
                    : []
                  : [],
              populationFeatures:
                audioProcessMode === 2 && data.extraConfig?.keyWords
                  ? data.extraConfig?.keyWords.populationFeatures
                    ? data.extraConfig?.keyWords.populationFeatures.split('、')
                    : []
                  : [],
              sceneFeatures:
                audioProcessMode === 2 && data.extraConfig?.keyWords
                  ? data.extraConfig?.keyWords.sceneFeatures
                    ? data.extraConfig?.keyWords.sceneFeatures.split('、')
                    : []
                  : [],
              scene:
                audioProcessMode === 2 && data.extraConfig?.keyWords
                  ? data.extraConfig?.keyWords.scene || ''
                  : '', // 推广 单选
              festival:
                audioProcessMode === 2 && data.extraConfig?.keyWords
                  ? data.extraConfig?.keyWords.festival || ''
                  : '', // 特殊 单选
              activity:
                audioProcessMode === 2 && data.extraConfig?.keyWords
                  ? data.extraConfig?.keyWords.activity
                    ? data.extraConfig?.keyWords.activity.split('、')
                    : []
                  : [],
              durationDesc: data.extraConfig.durationDesc
                ? parseInt(data.extraConfig.durationDesc)
                : 1,
              enableVideoSound: !!data.extraConfig.enableVideoSound,
              resourcesIds: data.extraConfig.resourcesIds || [],
              bgmConfig: data.extraConfig.bgmConfig ? data.extraConfig.bgmConfig : {},
              audioProcessMode: audioProcessMode,
              composeMode: data.extraConfig.composeMode || 1,
              videoNumList: isNotEmpty(data.extraConfig.numbers) ? data.extraConfig.numbers : []
            }
          }
          if (init) {
            if (step > 0) {
              $data.value.rulesInfo.normalProductNum = 1
              $data.value.rulesInfo.consumeNum = 0

              step2InitOver.value = true
            }
            nextTick(() => {
              currentStep.value = step
            })
            resolve()
          } else {
            nextTick(() => {
              resolve()
            })
          }
        } else {
          if (init) {
            resolve()
          } else {
            reject(res)
          }
        }
      })
      .catch(err => {
        if (init) {
          resolve()
        } else {
          reject(err)
        }
      })
  })
}

// 调接口更新步骤
function updateStepFun(step) {
  return new Promise((resolve, reject) => {
    updateStep({
      pipelineId: pipelineId.value,
      step: step
    })
      .then(res => {
        if (res.code === 0) {
          resolve()
        } else {
          resolve()
        }
      })
      .catch(() => {
        resolve()
      })
  })
}
const route = useRoute()
onMounted(() => {
  if (route.query.pipelineId) {
    pageLoading.value = true
    pipelineId.value = parseInt(route.query.pipelineId)
    getPipelineDetail(true).finally(() => {
      pageLoading.value = false
    })
  }
  // 组件挂载后添加事件监听
  window.addEventListener('beforeunload', handlePageRefresh)
})
// 如果处于步骤一，页面刷新时，需将填写的信息保存
function handlePageRefresh() {
  if (currentStep.value === 0) {
    saveConfig(true)
    // batchSaveVoiceFun(true).finally(() => {
    //   step2BtnLoading.value = false
    // })
  }
}
onBeforeUnmount(() => {
  // 组件销毁前移除事件监听
  window.removeEventListener('beforeunload', handlePageRefresh)
})

// 返回上一步
const goBack = throttle(step => {
  updateStepFun(step).then(() => {
    currentStep.value = currentStep.value - 1
  })
}, 300)
</script>
<style lang="scss" scoped>
@import '../create_by_template/components/scss/step.scss';
.create_by_foolish_page {
  width: 100%;
  height: 100%;
  min-height: 500px;

  .content_bottom {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 80px;
    background: #ffffff;
    box-shadow: 0px -2px 8px 0px rgba(103, 103, 103, 0.15);
    border-radius: 0px 0px 4px 4px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    z-index: 13;
    .one_btn {
      width: 360px;
      height: 40px;
    }
    .half_btn {
      width: 220px;
    }
    .half_btn + .half_btn {
      margin-left: 24px;
    }
    .dis_btn {
      color: var(--el-button-disabled-text-color);
      cursor: not-allowed;
      background-image: none;
      background-color: rgb(155, 167, 230);
      border-color: rgb(155, 167, 230);
    }
  }
  .steps_page {
    width: 100%;
    height: 100%;
  }
  .page_content {
    position: relative;
    margin-top: 16px;
    height: calc(100% - 68px);
    background: #ffffff;
    border-radius: 4px;
    .content_top {
      width: 100%;
      height: calc(100% - 80px);
    }
  }

  .default_page {
    width: 100%;
    height: 100%;
    position: relative;
    background: #ffffff;
    border-radius: 4px;
    .default_content {
      width: 100%;
      height: calc(100% - 80px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      overflow-y: auto;
      .content_content {
        min-height: 550px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      .default_icon {
        width: 460px;
        height: 320px;
        object-fit: contain;
        display: flex;
      }
      .default_tip {
        margin-top: 20px;
        font-weight: 600;
        font-size: 16px;
        color: #303133;
        line-height: 28px;
      }
    }
    .default_bottom {
      width: 100%;
      height: 80px;
      background: #ffffff;
      box-shadow: 0px -2px 8px 0px rgba(103, 103, 103, 0.15);
      border-radius: 0px 0px 4px 4px;
    }
  }
}
</style>
