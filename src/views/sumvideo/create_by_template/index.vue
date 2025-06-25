<template>
  <div class="create_by_template_page" v-loading="pageLoading">
    <!-- 默认页 -->
    <div class="default_page" v-if="currentStep === null">
      <div class="default_content">
        <div class="content_content">
          <img
            class="default_icon"
            src="https://tagvv-1256030678.file.myqcloud.com/20240402gzvx4.png"
            alt=""
          />
          <div class="default_tip">选择模板，快速生成海量视频</div>
        </div>
      </div>
      <div class="content_bottom">
        <el-button class="one_btn" type="primary" @click="currentStep = 0">开始合成</el-button>
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
            v-if="currentStep === 0"
            :chooseTemplateInfo="$data.chooseTemplateInfo || {}"
            @chooseTemplateFun="chooseTemplateFun"
          />
          <!-- 第二步 -->
          <step2
            ref="step2DOM"
            :errIdList="errIdList"
            :pipelineId="pipelineId"
            :choosematerialInfo="$data.choosematerialInfo || {}"
            :templateId="$data.chooseTemplateInfo.id"
            v-else-if="currentStep === 1"
            @choosematerialFun="choosematerialFun"
            v-model:stepLoading="stepLoading"
            v-model:btnDis="stepBtn2Disabled"
            @updateClipCntFun="updateClipCntFun"
            @updateErrIdFun="updateErrIdFun"
          />
          <!-- 第三步 -->
          <div class="third_page step_page" v-else-if="currentStep === 2">
            <div class="page_top">
              <stepsTitle :currentSteps="2" title="请定义本次合成的规则"></stepsTitle>
            </div>
            <div class="page_bottom" v-loading="stepLoading">
              <developRulesDOM
                v-if="step2InitOver"
                :pipelineId="pipelineId"
                :rulesInfo="$data.rulesInfo || {}"
                :chooseTemplateInfo="$data.chooseTemplateInfo"
                pageSource="createByTemplate"
                @updateRules="updateRules"
                @updateRechargeNum="updateRechargeNum"
                v-model:stepLoading="stepLoading"
              />
            </div>
          </div>
          <!-- 第四步 -->
          <step4 v-else-if="currentStep === 3" @closeFun="closeFun" @toRecords="toRecords" />
        </div>
        <div class="content_bottom" v-if="!stepLoading">
          <el-button
            :loading="step1BtnLoading"
            :class="{ one_btn: true, dis_btn: !$data.chooseTemplateInfo }"
            @click="saveStep1Fun"
            type="primary"
            v-if="currentStep === 0"
          >
            确定，下一步
          </el-button>
          <template v-else-if="currentStep === 1">
            <el-button :disabled="stepBtn2Disabled" class="one_btn half_btn" @click="goBack(1)">
              上一步
            </el-button>
            <el-button
              :disabled="stepBtn2Disabled"
              :loading="step2BtnLoading"
              class="one_btn half_btn"
              @click="saveStep2Fun"
              type="primary"
            >
              完成，下一步
            </el-button>
          </template>
          <template v-else-if="currentStep === 2">
            <el-button class="one_btn half_btn" @click="goBack(2)">上一步</el-button>
            <el-button class="one_btn half_btn" @click="saveStep3Fun" type="primary">
              立即合成
            </el-button>
          </template>
          <el-button class="one_btn" @click="closeFun" type="primary" v-else-if="currentStep === 3">
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
import { resetPushState } from '@/utils/getRoute'
import { useRoute, useRouter } from 'vue-router'
import {
  createTemplatePipeline,
  getTemplatePipelineDetail,
  produce,
  updateStep,
  importMaterialBatch
} from '@/api/sumvideo/create_by_template.js'
import compositeRechargeDOM from '@/views/sumvideo/components/step/composite_recharge_dialog.vue'
import compositeTipDOM from '@/views/sumvideo/components/step/composite_tip_dialog.vue'
import developRulesDOM from '@/views/sumvideo/components/step/develop_rules.vue'
import stepsTitle from '@/views/sumvideo/components/step/steps_content_title.vue'
import step1 from './step1.vue'
import step2 from './step2.vue'
import step4 from '@/views/sumvideo/components/step/fourth_step.vue'
import productStep from '@/views/sumvideo/components/step/produce_steps.vue'
import createPreviewDialog from '../components/step/create_preview_dialog.vue'

import { throttle, isNotEmpty, isEmpty } from '@/utils/tools'
// import { materialAction } from './components/js/material'

// const { getVideoStoryboardMethodType } = materialAction()

const message = inject('$message')
const stepList = reactive([
  {
    name: '选择模板',
    done: false
  },
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
const currentStep = ref(null) // 当前步骤 null 未开始 0步骤一 1步骤二 2步骤三 3步骤四

const stepLoading = ref(false)
const $data = ref({
  chooseTemplateInfo: null, // 选中的模板信息
  choosematerialInfo: null, // 导入的原料信息
  rulesInfo: {} // 制定的规则信息
})
const router = useRouter()

function toRecords() {
  sessionStorage.setItem('refresh', true)
  router.push(`/sumwhy_video/synthesis_task`)
}

const createDialog = reactive({
  show: false,
  title: '确认合成',
  createNum: null // 生产条数
})

// 步骤一：选择了模板
const step1BtnLoading = ref(false)
function chooseTemplateFun(e) {
  $data.value.chooseTemplateInfo = isNotEmpty(e) ? e : null
}
const saveStep1Fun = throttle(() => {
  if (isNotEmpty($data.value.chooseTemplateInfo)) {
    step1BtnLoading.value = true
    //  检测该模板是否创建过流水线 创建过就不生成新的了
    const info = chooseTemplatePipelineList.value.filter(
      x => x.creativeId === $data.value.chooseTemplateInfo.id
    )
    if (info && info.length > 0) {
      pipelineId.value = info[0].pipelineId
      // 调接口获取流水线详情并回显上次选择的数据
      // 如果选择的模板和上一次选择的数据一致，那就不获取数据直接跳转
      // if(chooseTemplatePipelineList.value[chooseTemplatePipelineList.value.length-1].creativeId===$data.value.chooseTemplateInfo.id){

      // }else{
      getPipelineDetail()
        .then(() => {
          step1SuccessAfter()
        })
        .catch(() => {
          const pipelineIndex = chooseTemplatePipelineList.value.findIndex(
            x => x.creativeId === $data.value.chooseTemplateInfo.id
          )
          if (pipelineIndex > -1) {
            chooseTemplatePipelineList.value.splice(pipelineIndex, 1)
          }
          step1BtnLoading.value = false
        })
      // }
    } else {
      createPipeline()
    }
  } else {
    message.warning('请先选择模板')
  }
}, 300)
// 获取流水线详情
function getPipelineDetail(init) {
  return new Promise((resolve, reject) => {
    getTemplatePipelineDetail({
      pipelineId: pipelineId.value
    })
      .then(res => {
        if (res.code === 0) {
          const data = res.data || {}
          if (init && data.step === 4) {
            if (init) {
              resolve()
            } else {
              reject(data)
            }

            return
          }
          const step = data.step ? parseInt(data.step) - 1 : 0
          const info = {}

          // 第一步 回显模板信息
          if (init) {
            $data.value.chooseTemplateInfo = data?.creativeId
              ? {
                  id: data?.creativeId || '',
                  name: data?.creativeName || ''
                }
              : null
          }

          // 第二步 回显导入的原料信息
          // 拿到所有的分镜信息 循环依次找到替换的信息
          // 拼凑成{
          //  分镜ID：{replaceModel 处理方式[音频和视频才有]，chooseVoiceList 文本+AI朗读的音色列表,chooseTextList 文本+AI朗读的文本列表  chooseList除了文本+AI以外的列表 }
          // }
          if (
            ((init && step > 0) || !init) &&
            data?.creativeReplaceClipList &&
            data?.creativeReplaceClipList.length > 0
          ) {
            data?.creativeReplaceClipList.forEach(x => {
              const materialInfo = {}
              if ([1, 2].includes(x.mediaType)) {
                // if (x.mediaType === 2) {
                //   x.isBackground = getVideoStoryboardMethodType(x)
                // }
                materialInfo.replaceModel = x.replaceModel || 0
              }
              const list2 = x.mediaList && x.mediaList.length > 0 ? x.mediaList : []
              if (x.mediaType === 2 && !x.isBackground && x.itemDuration >= 2000) {
                const list3 = []
                const list4 = []
                list2.forEach(x => {
                  if (x.mediaType === 4) {
                    list3.push(x)
                  } else {
                    x.id = parseInt(x.resourceId)
                    list4.push(x)
                  }
                })
                materialInfo.chooseVoiceList = list4 || []
                materialInfo.chooseTextList = list3 || []
              } else {
                materialInfo.chooseList = list2
              }

              materialInfo.listTotal = x.mediaListTotal || 0

              info[x.creativeReplaceId] = materialInfo
            })
          }
          $data.value.choosematerialInfo = info
          if (step > 1) {
            $data.value.rulesInfo.normalProductNum = 1
            $data.value.rulesInfo.consumeNum = 0
            if (!$data.value.rulesInfo.videoNamePrefix) {
              $data.value.rulesInfo.videoNamePrefix = data?.creativeName.substring(0, 20) || ''
            }

            step2InitOver.value = true
          }
          if (init) {
            chooseTemplatePipelineList.value = [
              {
                creativeId: data?.creativeId || '',
                pipelineId: pipelineId.value
              }
            ]
            nextTick(() => {
              currentStep.value = step
              console.log('steo', step)
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
// 步骤一完成
function step1SuccessAfter() {
  updateStepFun(2).then(() => {
    const newQuery = `?pipelineId=${pipelineId.value}`
    resetPushState(newQuery)
    stepLoading.value = true
    currentStep.value = 1
    step1BtnLoading.value = false
  })
}
// 创建流水线
function createPipeline() {
  createTemplatePipeline({
    creativeId: $data.value.chooseTemplateInfo.id
  })
    .then(res => {
      if (res.code === 0) {
        pipelineId.value = res.data
        chooseTemplatePipelineList.value.push({
          creativeId: $data.value.chooseTemplateInfo.id,
          pipelineId: res.data
        })
        step1SuccessAfter()
      }
    })
    .finally(() => {
      step1BtnLoading.value = false
    })
}
// 步骤二：导入原料的信息
function choosematerialFun(e) {
  $data.value.choosematerialInfo = isNotEmpty(e) ? e : null
}
const stepBtn2Disabled = ref(false)
const templateClipAllCnt = ref(null) // 模板的总分镜数量
const step2InitOver = ref(false) // 步骤二是否初始化完成
const step2BtnLoading = ref(false)
function updateClipCntFun(num) {
  templateClipAllCnt.value = num
}
const saveStep2Fun = throttle(() => {
  step2BtnLoading.value = true
  batchSaveVoiceFun()
    .then(() => {
      updateStepFun(3).then(() => {
        $data.value.rulesInfo.normalProductNum = 1
        $data.value.rulesInfo.consumeNum = 0
        if (!$data.value.rulesInfo.videoNamePrefix) {
          $data.value.rulesInfo.videoNamePrefix = $data.value?.chooseTemplateInfo?.name || ''
        }
        currentStep.value = 2
        step2InitOver.value = true
        step2BtnLoading.value = false
      })
    })
    .catch(() => {
      step2BtnLoading.value = false
    })
})
const step2DOM = ref()
const errIdList = ref([]) // 步骤二校验不符合条件的分镜ID列表
// 更新不符合条件的ID列表
function updateErrIdFun(id, isAdd) {
  const index = errIdList.value.findIndex(x => x === id)
  if (isAdd) {
    if (index === -1) {
      errIdList.value.push(id)
    }
  } else {
    if (index > -1) {
      errIdList.value.splice(index, 1)
    }
  }
}
// 批量保存文本+AI朗读的音色信息
function batchSaveVoiceFun(isBack) {
  return new Promise((resolve, reject) => {
    const param = []
    // 如果有文本+AI朗读的，检测是否同时选了文本+音色，否则就提示先去选择，否则会合成失败
    let setNum = 0 // 设置了原料的分镜数量
    let setNum1 = 0 // 设置了音色但是没有设置文本 或者设置了文本 但是没有设置音色
    const errIds = [] // 设置了音色但是没有设置文本 或者设置了文本 但是没有设置音色 的分镜ID列表
    for (const key in $data.value.choosematerialInfo) {
      // 有音色 就去保存
      if (
        $data.value.choosematerialInfo[key].chooseVoiceList &&
        $data.value.choosematerialInfo[key].chooseVoiceList.length > 0
      ) {
        // 有音色检测是否设置了文本
        if (
          $data.value.choosematerialInfo[key].chooseTextList &&
          $data.value.choosematerialInfo[key].chooseTextList.length > 0
        ) {
          setNum++
        } else {
          errIds.push(parseInt(key))
          setNum1++
        }
        // 获取音色ID 设置入参
        const list = []
        $data.value.choosematerialInfo[key].chooseVoiceList.forEach(x => {
          list.push(x.id)
        })
        param.push({
          isSelectAll: false,
          pipelineId: pipelineId.value,
          queryParam: {},
          resourceIds: list,
          resourceType: 3,
          scriptId: $data.value.chooseTemplateInfo.id,
          scriptReplaceId: key
        })
      } else if (
        $data.value.choosematerialInfo[key].chooseVoiceList &&
        $data.value.choosematerialInfo[key].chooseVoiceList.length === 0
      ) {
        // 没有音色 入参的音色ID为空
        param.push({
          isSelectAll: false,
          pipelineId: pipelineId.value,
          queryParam: {},
          resourceIds: [],
          resourceType: 3,
          scriptId: $data.value.chooseTemplateInfo.id,
          scriptReplaceId: key
        })
      }
      // 除了文本+AI朗读以外的分镜是否导入了原料
      if (
        $data.value.choosematerialInfo[key].chooseList &&
        $data.value.choosematerialInfo[key].chooseList.length > 0
      ) {
        setNum++
      }
      if (
        $data.value.choosematerialInfo[key].chooseTextList &&
        $data.value.choosematerialInfo[key].chooseTextList.length > 0
      ) {
        if (
          !(
            $data.value.choosematerialInfo[key].chooseVoiceList &&
            $data.value.choosematerialInfo[key].chooseVoiceList.length > 0
          )
        ) {
          errIds.push(parseInt(key))
          setNum1++
        }
      }
    }
    if (!isBack) {
      errIdList.value = errIds
    }
    console.log('setNum', setNum)

    // setNum < templateClipAllCnt.value // 导入的分镜数量<总分镜数量
    if (!isBack && setNum1 > 0) {
      message.warning('请先完善原料')
      if (errIds.length > 0) {
        step2DOM.value?.validToScrollFun(errIds)
      }
      reject(new Error())
    } else {
      importMaterialBatch(param).finally(() => {
        resolve()
      })
    }
  })
}

// 返回上一步
const goBack = throttle(step => {
  if (step === 1) {
    // 批量保存文本+AI朗读的音色信息 保存成功后，步骤二的返回上一步的同时 要清空所有信息
    batchSaveVoiceFun(true).then(() => {
      $data.value.choosematerialInfo = null // 导入的原料信息
      $data.value.rulesInfo = {} // 制定的规则信息
      step2BtnLoading.value = false
      errIdList.value = []
    })
  }

  updateStepFun(step).then(() => {
    currentStep.value = currentStep.value - 1
  })
}, 300)

// 步骤三：立即合成
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
    createDialog.couponNum = $data.value.rulesInfo.couponNum
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
  param.creativeVersions = param.creativeVersionInfo ? [param.creativeVersionInfo] : []
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
        updateStepFun(4)
          .then(() => {
            const pipelineIndex = chooseTemplatePipelineList.value.findIndex(
              x => x.creativeId === $data.value.chooseTemplateInfo.id
            )
            if (pipelineIndex > -1) {
              chooseTemplatePipelineList.value.splice(pipelineIndex, 1)
            }
            dialog.handleClose()
            currentStep.value = 3
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
    chooseTemplateInfo: null, // 选中的模板信息
    choosematerialInfo: null, // 导入的原料信息
    rulesInfo: {} // 制定的规则信息
  }
  errIdList.value = []
  currentStep.value = null
  pipelineId.value = null
  resetPushState()
}, 500)

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
const pipelineId = ref(null) // 流水线ID
const chooseTemplatePipelineList = ref([]) // 选择过的模板和对应的流水线信息列表 用于选择同一模板时回显上一次信息，而不是重新创建一个流水线
const pageLoading = ref(false)
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
// 如果处于步骤二，页面刷新时，需将音色保存
function handlePageRefresh() {
  if (currentStep.value === 1) {
    batchSaveVoiceFun(true).finally(() => {
      step2BtnLoading.value = false
    })
  }
}
onBeforeUnmount(() => {
  // 组件销毁前移除事件监听
  window.removeEventListener('beforeunload', handlePageRefresh)
})
</script>
<style lang="scss" scoped>
@import './components/scss/step.scss';
.create_by_template_page {
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
