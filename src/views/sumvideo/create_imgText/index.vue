<template>
  <div class="create_image_text" v-loading="pageLoading">
    <!-- 默认页 -->
    <div class="default_page" v-if="currentStep === null">
      <div class="default_content">
        <div class="content_content">
          <img
            class="default_icon"
            src="https://tagvv-1256030678.file.myqcloud.com/20240524i200h.png"
            alt=""
          />
          <div class="default_tip">换脸换背景，批量生成图文素材</div>
        </div>
      </div>
      <div class="content_bottom">
        <el-button class="one_btn" type="primary" @click="createFun">开始创作</el-button>
      </div>
    </div>
    <!-- 主要内容 -->
    <div v-if="currentStep !== null && !pageLoading" class="steps_page">
      <!-- 步骤条 -->
      <productStep
        :currentSteps="currentStep > 0 ? currentStep - 1 : currentStep"
        :stepList="stepList"
      />
      <!-- 主要的信息 -->
      <div class="page_content">
        <div class="content_top">
          <div class="third_page step_page" v-if="currentStep === 1">
            <div class="page_top">
              <stepsTitle :currentSteps="0" title="请选择内容"></stepsTitle>
            </div>
            <div class="page_bottom">
              <!-- 第一步 -->
              <step1
                v-model:btnDisabled="step1BtnDisabled"
                ref="step1Ref"
                :templateId="$data.templateInfo.creativeId"
                :pipelineId="pipelineId"
                :templateInfo="$data.templateInfo"
                @updateInfo="updateTemplateInfo"
              />
            </div>
          </div>
          <!-- 第二步 -->
          <div class="third_page step_page" v-else-if="currentStep === 2">
            <div class="page_top">
              <stepsTitle :currentSteps="1" title="请定义本次合成的规则"></stepsTitle>
            </div>
            <div class="page_bottom" v-loading="stepLoading">
              <developRulesDOM
                v-if="step2InitOver"
                :pipelineId="pipelineId"
                :rulesInfo="$data.rulesInfo || {}"
                :chooseTemplateInfo="$data.templateInfo"
                pageSource="createByImgText"
                @updateRules="updateRules"
                @updateRechargeNum="updateRechargeNum"
                v-model:stepLoading="stepLoading"
              />
            </div>
          </div>
          <!-- 第三步 -->
          <step3 v-else-if="currentStep === 3" @closeFun="closeFun" @toRecords="toRecords" />
        </div>
        <div class="content_bottom" v-if="!stepLoading">
          <!-- 第一步 -->
          <el-button
            :loading="step1BtnLoading"
            :class="{ one_btn: true, dis_btn: !$data.templateInfo }"
            @click="step1SaveFun"
            type="primary"
            v-if="currentStep === 1"
          >
            确定，下一步
          </el-button>
          <!-- 第二步 -->
          <template v-else-if="currentStep === 2">
            <el-button class="one_btn half_btn" @click="goBack(2)">上一步</el-button>
            <el-button class="one_btn half_btn" @click="saveStep3Fun" type="primary">
              立即合成
            </el-button>
          </template>
        </div>
      </div>
    </div>
    <!-- 图文生成弹窗 -->
    <createDOM
      origin="batchCreate"
      v-if="createDialog.show"
      :addDialog="createDialog"
      @updateFun="updateCreateFun"
    />
    <!-- 合成弹窗 -->
    <compositeTipDOM
      v-if="tipDialog.show"
      :tipDialog="tipDialog"
      @handleConfirm="handleTipConfirm"
    />
    <!-- 合成余额不足的弹窗 -->
    <compositeRechargeDOM v-if="rechargeDialog.show" :tipDialog="rechargeDialog" />
  </div>
</template>
<script setup>
import productStep from '@/views/sumvideo/components/step/produce_steps.vue'
import step1 from './step1.vue'
import step3 from '@/views/sumvideo/components/step/fourth_step.vue'
import developRulesDOM from '@/views/sumvideo/components/step/develop_rules.vue'
import stepsTitle from '@/views/sumvideo/components/step/steps_content_title.vue'
import compositeRechargeDOM from '@/views/sumvideo/components/step/composite_recharge_dialog.vue'
import compositeTipDOM from '@/views/sumvideo/components/step/composite_tip_dialog.vue'
import createDOM from '@/views/sumvideo/template_imgText/components/create_imgText_dialog.vue'
import { throttle, isNotEmpty, isEmpty } from '@/utils/tools'
import { updateStep } from '@/api/sumvideo/create_by_template.js'
import {
  createImagePipeline,
  getImageTextPipelineDetail,
  produceImgText,
  guessNumImgText
} from '@/api/sumvideo/create_by_imgtext.js'
import { useRoute, useRouter } from 'vue-router'
import { resetPushState } from '@/utils/getRoute'

const route = useRoute()
const router = useRouter()
const message = inject('$message')
const stepLoading = ref(false)
const pageLoading = ref(false) // 页面加载loading
const currentStep = ref(null) // 当前步骤 null默认页 2策略设置 3规则 4完成

const stepList = reactive([
  {
    name: '选择内容',
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
const pipelineId = ref(null) // 当前流水线id
const $data = ref({
  templateInfo: {}, // 创建的模板信息
  rulesInfo: {} // 制定的规则信息
})
// --创作图文生成任务
const createDialog = reactive({
  show: false
})
const createFun = throttle(() => {
  createDialog.show = true
})
// 创建成功
function updateCreateFun(form, btnLoading, dialog) {
  console.log('创建的任务', form, btnLoading, dialog)
  createImagePipeline({
    ...form.value,
    backgroundPhotoRule: {
      selectMode: 1
    },
    shootPhotoRule: {
      selectMode: 0
    },
    mannequinRule: {
      selectMode: 1
    }
  })
    .then(res => {
      if (res.code === 0) {
        pipelineId.value = res.data.pipelineId
        dialog.value.handleClose()
        step1SuccessAfter()
      }
      btnLoading.value = false
    })
    .catch(() => {
      btnLoading.value = false
    })
}
// 步骤一完成
function step1SuccessAfter() {
  updateStepFun(2).then(() => {
    getPipelineDetail(true).finally(() => {
      pageLoading.value = false
      stepLoading.value = false
    })
    const newQuery = `?pipelineId=${pipelineId.value}`
    resetPushState(newQuery)
  })
}
// --创作图文生成任务 end

// --第一步完成
const step1Ref = ref()
const step1BtnDisabled = ref(false)
const step1BtnLoading = ref(false)
function updateTemplateInfo(val) {}
const step1SaveFun = throttle(() => {
  step1BtnLoading.value = true
  step1Ref.value
    ?.saveFun()
    .then(val => {
      console.log('res', val)
      $data.value.templateInfo = isNotEmpty(val) ? val : {}

      step2SuccessAfter()
    })
    .catch(err => {
      console.log('err', err)
      step1BtnLoading.value = false
    })
})
function step2SuccessAfter() {
  // 需要验证 调用获取数量的接口进行校验
  guessNumImgText({
    creativeId: 5697,
    isDistinct: false,
    pipelineId: pipelineId.value
  })
    .then(res => {
      if (res.code === 0) {
        const maxNum = res.data?.num || 0
        updateStepFun(3)
          .then(() => {
            // $data.value.rulesInfo.jobName = isNotEmpty(res.data?.taskName)
            //   ? res.data?.taskName.substring(0, 20)
            //   : ''
            $data.value.rulesInfo.creativeVersion = res.data?.creativeVersion
            $data.value.rulesInfo.maxNum = maxNum
            $data.value.rulesInfo.normalProductNum = 1
            $data.value.rulesInfo.consumeNum = 0
            // if (!$data.value.rulesInfo.videoNamePrefix) {
            //   $data.value.rulesInfo.videoNamePrefix = $data.value?.templateInfo?.creativeName || ''
            // }
            currentStep.value = 2
            step2InitOver.value = true
            step1BtnLoading.value = false
          })
          .catch(() => {
            step2InitOver.value = false
            step1BtnLoading.value = false
          })
      } else {
        step2InitOver.value = false
        step1BtnLoading.value = false
      }
    })
    .catch(() => {
      step1BtnLoading.value = false
      step2InitOver.value = false
    })
}
// --第一步完成 end
// --返回上一步
const goBack = throttle(step => {
  updateStepFun(step).then(() => {
    currentStep.value = currentStep.value - 1
  })
}, 300)
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
// --返回上一步 end

// 第二步 --start

const step2InitOver = ref(false) // 规则页初始化完成
const rechargeNum = ref() // 合成券的剩余张数
const rechargeDialog = ref({
  show: false
}) // 合成券余额不足的弹窗
const tipDialog = ref({
  show: false,
  imgPrice: 3,
  imgInfo: {
    total: 0, // 图片总数量
    imgNum: 0, // 不可替换图片数
    aiImgNum: 0 // AI生成图片数量
  }
}) // 合成的提示弹窗
function updateRechargeNum(e) {
  rechargeNum.value = e
}
// 获取要合成的信息
function updateRules(e) {
  console.log('要合成的信息', e)
  if (isNotEmpty(e)) {
    $data.value.rulesInfo.enableWrap = !!e.enableWrap
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
  console.log('$data.value.templateInfo.imageCnt', $data.value.templateInfo)
  tipDialog.value = {
    videoNum: $data.value.rulesInfo.normalProductNum,
    couponNum: $data.value.rulesInfo.consumeNum,
    type: 'img_text', // 图文类型提示
    imgInfo: {
      total: $data.value.templateInfo.imageCnt, // 图片总数量
      imgNum: $data.value.templateInfo.nonReplaceable.length, // 不可替换图片数
      aiImgNum: $data.value.templateInfo.imageCnt - $data.value.templateInfo.nonReplaceable.length // AI生成图片数量
    },
    show: true
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

  produceImgText(param)
    .then(res => {
      if (res.code === 0) {
        // 合成成功后，调用接口更新流水线步骤
        updateStepFun(3)
          .then(() => {
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

// 第二步 --end

// --第三步

function toRecords() {
  router.push(`/sumwhy_video/synthesis_task`)
}

function closeFun() {
  $data.value = {
    templateInfo: null, // 选中的模板信息
    rulesInfo: {} // 制定的规则信息
  }
  currentStep.value = null
  pipelineId.value = null
  resetPushState()
}
// --第三步 end
// 获取流水线详情
function getPipelineDetail(init) {
  return new Promise((resolve, reject) => {
    getImageTextPipelineDetail({
      pipelineId: pipelineId.value
    })
      .then(res => {
        console.log('获取流水线详情返回', res)
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
          const step = data.step ? (data.step === 1 ? 1 : parseInt(data.step) - 1) : 0

          // 第一步 回显设置的信息
          if (init) {
            if (data?.creativeId) {
              //  创作文案转换
              if (isNotEmpty(data.titleGenconfig)) {
                // 有关键词转成数组
                if (isNotEmpty(data.titleGenconfig.keyWords)) {
                  data.titleGenconfig.keyword = data.titleGenconfig.keyWords.split('、')
                }
              } else {
                // 没有创作文案 给他赋默认值
                data.titleGenconfig = {
                  titleDescType: 2, // 文案类型
                  keyword: [], // 关键词
                  creationType: 1 // 当前选中的适用平台
                }
              }
              // 挂载项转换
              if (isNotEmpty(data.mount)) {
                // 目前抖音话题组件回显只支持['a','b'] 但接口返回是[{id:null,name:'a'},{id:null,name:'b'}]
                if (isNotEmpty(data.mount.dyTopic)) {
                  data.mount.dyTopic = data.mount.dyTopic.map(x => x.name)
                }
              } else {
                data.mount = {
                  dyTopic: [], // 抖音话题列表
                  xhsTopic: [], // 小红书话题列表
                  xhsAt: [] // 小红书@列表
                }
              }
              // 设置实拍图、场景图、虚拟模特的总数
              data.realShootMax = data.realShootIds.length || 0
              data.sceneMax = data.sceneIds.length || 0
              data.mannequinMax = data.mannequinIds.length || 0
              // 设置实拍图和虚拟模特的处理方式
              if (isNotEmpty(data.extraConfig)) {
                const { shootPhotoRule, mannequinRule } = data.extraConfig
                if (shootPhotoRule) {
                  const mode = shootPhotoRule?.selectMode ? shootPhotoRule?.selectMode : 0
                  if (mode === 0) {
                    data.realShootSelectMode = [0]
                  } else {
                    const firstType = mode > 3 ? 'realImgSelectSp' : 'realImgSelectMt'
                    data.realShootSelectMode = [firstType, shootPhotoRule.selectMode]
                  }
                }
                if (mannequinRule) {
                  data.mannequinSelectMode = mannequinRule?.selectMode || 1
                }
              }
              $data.value.templateInfo = data
            } else {
              $data.value.templateInfo = {}
            }
          }
          if (step > 1) {
            $data.value.rulesInfo.normalProductNum = 1
            $data.value.rulesInfo.consumeNum = 0
            nextTick(() => {
              step2InitOver.value = true
            })
          }
          if (init) {
            currentStep.value = step
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
onMounted(() => {
  if (route.query.pipelineId) {
    pageLoading.value = true
    pipelineId.value = parseInt(route.query.pipelineId)
    getPipelineDetail(true).finally(() => {
      pageLoading.value = false
    })
  }
})
</script>
<style lang="scss" scoped>
@import '../create_by_template/components/scss/step.scss';
.create_image_text {
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
}
</style>
