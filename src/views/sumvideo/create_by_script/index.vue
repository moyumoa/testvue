<template>
  <div class="by_script" v-loading="pageLoading || pageInitLoading">
    <productSteps :stepList="stepList" :currentSteps="currentSteps" v-if="currentSteps !== -1" />
    <div
      class="content"
      :style="{ marginTop: currentSteps == -1 ? 0 : '16px' }"
      v-if="!pageInitLoading"
    >
      <startPage v-if="currentSteps == -1" />
      <stepOne
        ref="stepOneRef"
        v-if="currentSteps == 0"
        :chooseTemplateInfo="ruleForm.chooseTemplateInfo || {}"
        @chooseTemplateFun="chooseTemplateFun"
      />
      <stepTwo
        ref="stepTwoRef"
        v-if="currentSteps == 1"
        :ruleForm="ruleForm"
        :pipelineId="pipelineId"
        @updateList="updateList"
        @changeStep="changeStep"
        @updateLoading="updateLoading($event, 2)"
      />
      <stepThree
        ref="stepThreeRef"
        v-if="currentSteps == 2"
        :ruleForm="ruleForm"
        :pipelineId="pipelineId"
        :stepThreeData="stepThreeData"
        @updateList="updateList"
        @changeStep="changeStep"
        @updateRules="updateRules"
        @updateLoading="updateLoading($event, 3)"
      />
      <stepFour
        ref="stepFourRef"
        v-if="currentSteps == 3"
        :pipelineId="pipelineId"
        @closeFn="closeFn"
      />
    </div>
    <div class="btn_warp">
      <el-button
        type="primary"
        class="btn_item_1"
        v-if="currentSteps == -1"
        @click="startCreate"
        :disabled="pageLoading"
        :loading="btnLoadingObj.createLoading"
      >
        开始创作
      </el-button>
      <el-button
        type="primary"
        class="btn_item_1"
        v-if="currentSteps == 0"
        :loading="btnLoadingObj.stepOneLoading"
        @click="nextStep(1)"
        :disabled="
          isEmpty(ruleForm.chooseTemplateInfo) || ruleForm.chooseTemplateInfo.replaceCnt === 0
        "
      >
        确定，下一步
      </el-button>

      <template v-if="currentSteps == 1">
        <el-button class="btn_item_2 back_btn_2" @click="backStep(0)">上一步</el-button>
        <el-button
          type="primary"
          class="btn_item_2 next_btn_2"
          @click="nextStep(2)"
          :loading="btnLoadingObj.stepTwoLoading"
          :disabled="btnDisabledStep2"
        >
          完成，下一步
        </el-button>
      </template>

      <template v-if="currentSteps == 2">
        <el-button class="btn_item_2 back_btn_2" @click="backStep(1)">上一步</el-button>
        <el-button
          type="primary"
          class="btn_item_2 next_btn_2"
          @click="nextStep(3)"
          :loading="btnLoadingObj.stepThreeLoading"
        >
          确认，立即合成
        </el-button>
      </template>
      <el-button type="primary" class="btn_item_1" v-if="currentSteps == 3" @click="chosePage">
        关闭页面
      </el-button>
    </div>
  </div>
</template>

<script setup>
import productSteps from '@/views/sumvideo/components/step/produce_steps.vue'
import { saveCreativeScriptClip } from '@/api/sumvideo/script_creative.js'
import startPage from './start_page/index.vue'
import stepOne from './step_1/index.vue'
import stepTwo from './step_2/index.vue'
import stepThree from './step_3/index.vue'
import stepFour from './step_4/index.vue'

import {
  // saveScriptClip,
  createScriptPipeline,
  getScriptPipelineDetail
  // removeScriptClipBatch
} from '@/api/sumvideo/create_by_script.js'
import { getQueryVariable, throttle, isNotEmpty, isEmpty } from '@/utils/tools'
import { updateStep } from '@/api/sumvideo/create_by_template.js'
import { resetPushState } from '@/utils/getRoute'

const message = inject('$message')
const stepList = ref([
  {
    name: '选择剧本',
    id: 1
  },
  {
    name: '导入原料',
    id: 2
  },
  {
    name: '制定规则',
    id: 3
  },
  {
    name: '完成',
    id: 4
  }
])
const pageLoading = ref(false)
const pageInitLoading = ref(false)
const currentSteps = ref(-1) // 当前步骤 -1是开始画面
const stepOneRef = ref(null)
const stepTwoRef = ref(null)
const stepThreeRef = ref(null)
const stepFourRef = ref(null)
const stepThreeData = ref({}) // 第三步的数据，存一下，返回上一步再回来回显出来
const btnDisabledStep2 = ref(false) // 请求中的时候上下按钮不能点
const btnLoadingObj = reactive({
  createLoading: false, // 开始创作loading
  stepOneLoading: false,
  stepTwoLoading: false,
  stepThreeLoading: false
})
// const replacingClips = ref(true)
// 验证不通过时隐藏按钮loading
function updateLoading(e, current) {
  hidePageLoading()
}

// 获取要合成的信息
function updateRules(e) {
  if (isNotEmpty(e)) {
    stepThreeData.value = e
  }
}

const ruleForm = reactive({
  chooseTemplateInfo: null, // 选择的剧本信息
  list: [], // 分镜列表
  extraConfig: {} // 第二步通用配置
})
const pipelineId = ref(null) // 流水线id

const chosePage = throttle(function () {
  nextTick(() => {
    stepFourRef && stepFourRef.value.closePage()
  })
}, 500)

// 关闭页面
function closeFn() {
  pageLoading.value = true
  ruleForm.list = []
  ruleForm.extraConfig = {}
  pipelineId.value = null
  // 清空第三步保存的信息
  stepThreeData.value = {}
  currentSteps.value = -1
  nextTick(() => {
    pageLoading.value = false
  })
}

// 更新列表
function updateList(type, init = false) {
  return new Promise((resolve, reject) => {
    btnDisabledStep2.value = true
    getScriptPipelineDetail({ pipelineId: pipelineId.value })
      .then(res => {
        const { scriptClipDetails: scriptClipDetailsList = [], extraConfig: extraConfigObj = {} } =
          res?.data
        ruleForm.list = initList(scriptClipDetailsList)

        if (extraConfigObj?.voices && extraConfigObj.voices.length > 0) {
          extraConfigObj.voices = extraConfigObj.voices.map(x => {
            return { ...x, isChoose: true }
          })
        }
        ruleForm.extraConfig = extraConfigObj || null
        // 更新列表
        nextTick(() => {
          if (stepOneRef.value) stepOneRef.value.getListEnd('success', type)
          if (stepTwoRef.value) stepTwoRef.value.getListEnd('success', type)
          if (stepThreeRef.value) stepThreeRef.value.getListEnd('success', type)
        })
        // 如果步骤大于第一步，就默认初始化规则里的任务名称和素材视频命名规则
        if (res.data?.step > 0) {
          if (isEmpty(stepThreeData.value)) {
            stepThreeData.value = {
              jobName: res?.data?.creativeName?.substring(0, 20) || '',
              videoNamePrefix: res?.data?.creativeName?.substring(0, 20) || '',
              normalProductNum: 1,
              consumeNum: 0
            }
          }
        }
        if (res.data?.step >= -1) {
          // 回显模板信息
          if (init) {
            ruleForm.chooseTemplateInfo = res.data?.creativeId
              ? {
                  id: res.data?.creativeId || '',
                  name: res.data?.creativeName || '',
                  replaceCnt: res.data?.replaceCnt || 0
                }
              : null
          }
          const step = res.data?.step === 3 && init ? -1 : res.data?.step
          currentSteps.value = step
        }
        hidePageLoading()
        resolve()
      })
      .catch(err => {
        nextTick(() => {
          if (stepOneRef.value) stepOneRef.value.getListEnd('error', type)
          if (stepTwoRef.value) stepTwoRef.value.getListEnd('error', type)
          if (stepThreeRef.value) stepThreeRef.value.getListEnd('error', type)
        })
        hidePageLoading()
        reject(err)
      })
  })
}
// 点击开始创作，调用接口创建流水线，会返回流水线id，整个创建过程都需要用到
function startCreate() {
  btnLoadingObj.createLoading = true
  createScriptPipeline({})
    .then(res => {
      if (res.code === 0) {
        pipelineId.value = res.data
        updateRouterQuery(res.data, 0)
        changeStep(0, true)
      } else {
        btnLoadingObj.createLoading = false
      }
    })
    .catch(() => {
      btnLoadingObj.createLoading = false
    })
}
// 更改路由参数
function updateRouterQuery(pipelineId) {
  const pipelineIdUrl = getQueryVariable('pipelineId')
  const id = pipelineId || pipelineIdUrl
  if (!id) return
  resetPushState(`?pipelineId=${id}`)
}
// 上一步
const backStep = throttle(function (val) {
  changeStep(val)
}, 500)
// 下一步
const nextStep = throttle(function (val) {
  // if (val === 0) {
  //   console.log('要进入第一步，loading加在创建')
  // }
  if (val === 1) {
    btnLoadingObj.stepOneLoading = true
    // 检验
    // if (stepOneRef.value) stepOneRef.value.nextStep()
    // 校验是否选择了剧本 并且剧本分镜数量大于0
    if (isNotEmpty(ruleForm.chooseTemplateInfo) && ruleForm.chooseTemplateInfo.replaceCnt) {
      // 选择剧本后，保存剧本ID到流水线里
      saveCreativeScriptClip({
        creativeId: ruleForm.chooseTemplateInfo.id,
        pipelineId: pipelineId.value,
        transformType: 1,
        step: 1,
        complete: true
      })
        .then(res => {
          if (res.code === 0) {
            // 初始化规则的任务名称和素材视频命名规则
            stepThreeData.value = {
              jobName: ruleForm?.chooseTemplateInfo?.name?.substring(0, 20) || '',
              videoNamePrefix: ruleForm?.chooseTemplateInfo?.name?.substring(0, 20) || '',
              normalProductNum: 1,
              consumeNum: 0
            }

            changeStep(1)
          } else {
            btnLoadingObj.stepOneLoading = false
          }
        })
        .catch(() => {
          btnLoadingObj.stepOneLoading = false
        })
    } else {
      message.warning('请先选择剧本')
      btnLoadingObj.stepOneLoading = false
    }

    return
  }
  if (val === 2) {
    btnLoadingObj.stepTwoLoading = true
    // 校验
    if (stepTwoRef.value) stepTwoRef.value.nextStep()
    return
  }
  if (val === 3) {
    btnLoadingObj.stepThreeLoading = true
    // 检验
    if (stepThreeRef.value) stepThreeRef.value.nextStep()
    return
  }
  changeStep(val)
}, 500)

// 给列表数据添加必要字段
function initList(list) {
  console.log('初始化数据', list)

  return list.map(item => {
    const result = { ...item }
    // 默认关闭声音
    if (isEmpty(result.isEnableMaterialSound)) {
      result.isEnableMaterialSound = 0
    }
    // 长原料处理方式默认随机选取
    if (isEmpty(result.replaceModel)) {
      result.replaceModel = 0
    }
    // 原料比例默认填充
    if (isEmpty(result.cropType)) {
      result.cropType = 2
    }

    if (isEmpty(result.transition)) {
      result.transition = {
        enable: true, // 转场默认开启
        duration: 1, // 默认转场时长 1秒
        subtype: 'fade' // 默认转场 渐隐
      }
    }
    console.log(
      '校验是否有全选相关的数据',
      Object.prototype.hasOwnProperty.call(result, 'checkStatus')
    )
    // 增加全选相关数据
    if (!Object.prototype.hasOwnProperty.call(result, 'checkStatus')) {
      result.checkStatus = null
      result.checkList = []
      result.unCheckList = []
      result.checkTotal = 0
      result.isAllCheck = false
    }
    return result

    // return {
    //   selectMaterialList: [] // 选择的原料列表
    // }
  })
}
// 更改步骤
function changeStep(val) {
  // pageLoading.value = true
  val = Number(val)
  if (!pipelineId.value) {
    nextTick(() => {
      currentSteps.value = val
      updateRouterQuery(null, val)
      hidePageLoading()
    })
  } else {
    // 调用更新步骤接口
    updateStep({
      pipelineId: pipelineId.value,
      step: val
    })
      .then(res => {
        nextTick(() => {
          currentSteps.value = val
          updateRouterQuery(null, val)
          hidePageLoading()
        })
      })
      .catch(() => {})
  }
}

function pageInit() {
  const id = getQueryVariable('pipelineId')
  pageInitLoading.value = true
  pipelineId.value = id ? Number(id) : null
  if (pipelineId.value) {
    updateList(null, true)
  } else {
    hidePageLoading()
  }
}
function hidePageLoading() {
  pageLoading.value = false
  pageInitLoading.value = false
  btnLoadingObj.createLoading = false // 隐藏按钮loading
  btnLoadingObj.stepOneLoading = false
  btnLoadingObj.stepTwoLoading = false
  btnLoadingObj.stepThreeLoading = false
  btnDisabledStep2.value = false
}
onMounted(() => {
  pageLoading.value = true
  pageInit()
})
// // 先移除旧的分镜 再加新分镜
// function addPipelineClip(creativeId) {
//   const scriptDetail = listCreativeScripts({
//     creativeId: creativeId
//   })

//   scriptDetail
//     .then(res => {
//       if (res.code === 0) {
//         /**
//          * 拿到的list要map映射为前端对象
//          * @type {[]|*|*[]}
//          */
//         let records = []
//         if (res.data != null) {
//           records = res.data.map((e, index) => {
//             return {
//               clipName: e.clipName,
//               clipDesc: e.clipDesc,
//               clipAside: e.clipAside,
//               order: index + 1,
//               pipelineId: pipelineId.value
//             }
//           })
//         }
//         // ruleForm.list=records
//         saveScriptClip(records).then(res => {
//           if (res.code === 0) {
//             replacingClips.value = false
//           }
//         })
//       } else {
//         // ruleForm.list=[]
//         console.log(1)
//       }
//     })
//     .catch(() => {})
// }

// 选择剧本触发的父组件更新事件  在这里拿分镜详情
function chooseTemplateFun(e) {
  console.log('选择剧本', e, ruleForm.chooseTemplateInfo)
  // replacingClips.value = true
  // const oldInfo = ruleForm.chooseTemplateInfo
  //   ? JSON.parse(JSON.stringify(ruleForm.chooseTemplateInfo))
  //   : {}
  // const oldId = oldInfo.creativeId || null
  ruleForm.chooseTemplateInfo = isNotEmpty(e) ? e : null
  // // 校验选中剧本ID和之前剧本ID比对，如果不一致，删除分镜
  // if (isNotEmpty(e) && isNotEmpty(oldId) && e.id === oldId) {
  //   return
  // }
  // // 在这里可以先删除所有的已存在的流水线分镜，然后再加一次新分镜
  // getScriptPipelineDetail({ pipelineId: pipelineId.value }).then(res => {
  //   if (res.code === 0) {
  //     if (res.data.scriptClipDetails !== null && res.data.scriptClipDetails !== []) {
  //       const removeParam = res.data.scriptClipDetails.map(e => {
  //         return {
  //           clipId: e.id
  //         }
  //       })

  //       removeScriptClipBatch(removeParam).then(res => {
  //         if (res.code === 0) {
  //           addPipelineClip(e.id)
  //         }
  //       })
  //     }
  //   }
  // })
}
</script>

<style lang="scss" scoped>
.by_script {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  .content {
    height: calc(100% - 80px);
    background: #fff;
    border-radius: 4px;
  }
  .btn_warp {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 80px;
    background: #ffffff;
    box-shadow: 0px -2px 8px 0px rgba(103, 103, 103, 0.15);
    border-radius: 0px 0px 4px 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 15;
    .btn_item_1 {
      width: 360px;
      height: 40px;
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 14px;
      color: #ffffff;
    }
    .btn_item_2 {
      width: 220px;
      height: 40px;
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 14px;
      color: #303133;
    }
    .back_btn_2 {
      border-color: rgba(153, 153, 153, 0.5);
    }
    .next_btn_2 {
      margin-left: 24px;
      color: #fff;
    }
  }
}
</style>
