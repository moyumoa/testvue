<template>
  <div class="step_1" v-loading="stepLoading || stepLoadingDevelopRules">
    <div class="title_warp">
      <stepTitle :currentSteps="2" :title="'请定义本次合成的规则'"></stepTitle>
    </div>
    <div class="content_warp">
      <developRules
        v-if="pipelineIdInStep"
        pageSource="createByScript"
        :pipelineId="pipelineIdInStep"
        :rulesInfo="props.stepThreeData"
        :chooseTemplateInfo="props.ruleForm.chooseTemplateInfo"
        @updateRules="updateRules"
        @updateRechargeNum="updateRechargeNum"
        v-model:stepLoading="stepLoadingDevelopRules"
      />
    </div>
    <!-- 合成余额不足的弹窗 -->
    <compositeRechargeDOM v-if="rechargeDialog.show" :tipDialog="rechargeDialog" />
    <!--合成提示弹窗 -->
    <compositeTip v-if="tipDialog.show" :tipDialog="tipDialog" @handleConfirm="handleConfirm" />
    <!-- 预生成弹窗提示 -->
    <createPreviewDialog
      v-if="createDialog.show"
      :createDialog="createDialog"
      @submit="handleConfirm"
    />
  </div>
</template>

<script setup>
import stepTitle from '@/views/sumvideo/components/step/steps_content_title.vue'
import developRules from '../../components/step/develop_rules.vue'
import compositeRechargeDOM from '@/views/sumvideo/components/step/composite_recharge_dialog.vue'
import compositeTip from '../../components/step/composite_tip_dialog.vue'
import createPreviewDialog from '../../components/step/create_preview_dialog.vue'

import { getQueryVariable, isNotEmpty } from '@/utils/tools'
import { produce } from '@/api/sumvideo/create_by_script.js'

const props = defineProps({
  ruleForm: {
    type: Object,
    default: () => {
      return {
        list: []
      }
    }
  }, // 分镜列表
  pipelineId: {
    type: Number || String,
    default: null
  },
  stepThreeData: {
    type: Object,
    default: () => {
      return {} // 有信息时回显
    }
  }
})

const { pipelineId } = toRefs(props)
const emits = defineEmits(['updateList', 'changeStep', 'updateRules', 'updateLoading'])
const message = inject('$message')

const pipelineIdInStep = ref(null) // 流水线id
const stepLoading = ref(false)
const stepLoadingDevelopRules = ref(false)

const createDialog = reactive({
  show: false,
  title: '确认合成',
  createNum: null // 生产条数
})

// 表单信息
const rulesInfo = reactive({
  consumeNum: 0,
  jobName: '',
  normalProductNum: '',
  rewriteAside: '',
  videoNamePrefix: '',
  fileID: '',
  tags: [],
  chooseVoice: {}
})
const rechargeNum = ref() // 剩余的合成券数量
const rechargeDialog = ref({
  show: false,
  couponNum: 0
})
const tipDialog = ref({
  videoNum: null, // 视频数
  couponNum: null, // 生产券数
  show: false // 是否显示弹窗
})
// 剩余的合成券数量
function updateRechargeNum(e) {
  rechargeNum.value = e
}
// 获取要合成的信息
function updateRules(e) {
  if (isNotEmpty(e)) {
    rulesInfo.enableWrap = !!e.enableWrap
    rulesInfo.oneCouponNum = e.oneCouponNum || 10
    rulesInfo.consumeNum = e.consumeNum || 0
    rulesInfo.jobName = e.jobName // 任务名称
    rulesInfo.normalProductNum = e.normalProductNum // 生产条数
    rulesInfo.videoNamePrefix = e.videoNamePrefix // 成品视频命名规则前缀
    rulesInfo.fileID = e.fileID // 选中的文件夹ID
    rulesInfo.tags = e.tags // 成品标签列表
    rulesInfo.rewriteAside = e.rewriteAside // 是否自动重写文案
    rulesInfo.chooseVoice = e.chooseVoice
    rulesInfo.creativeVersionInfo = e.creativeVersionInfo // 模板版本
  }
  emits('updateRules', rulesInfo)
}
// 初始化第三步
function initPage() {
  if (pipelineId.value) {
    pipelineIdInStep.value = pipelineId.value
  } else {
    const id = getQueryVariable('pipelineId')
    pipelineIdInStep.value = Number(id)
  }
  emits('updateList')
}
function getListEnd() {
  stepLoading.value = false
}
// 效验
function nextStep() {
  if (!rulesInfo.jobName) {
    message.warning('任务名称不能为空！')
    emits('updateLoading', false)
    return
  }
  if (!rulesInfo.normalProductNum > 0) {
    message.warning('生产条数不能为空！')
    emits('updateLoading', false)
    return
  }
  if (!rulesInfo.videoNamePrefix) {
    message.warning('素材视频命名规则不能为空！')
    emits('updateLoading', false)
    return
  }

  if (rulesInfo.consumeNum > rechargeNum.value) {
    emits('updateLoading', false)
    rechargeDialog.value = {
      show: true,
      couponNum: rulesInfo.consumeNum
    }
    return
  }
  emits('updateLoading', false)
  if (rulesInfo.normalProductNum <= 3) {
    tipDialog.value = {
      videoNum: rulesInfo.normalProductNum,
      couponNum: rulesInfo.consumeNum,
      show: true
    }
  } else {
    createDialog.createNum = rulesInfo.normalProductNum
    createDialog.consumeNum = rulesInfo.consumeNum
    createDialog.oneCouponNum = rulesInfo.oneCouponNum || 10
    createDialog.show = true
  }
}
// 确定合成
function handleConfirm(dialog, loading, previewValue = null) {
  const params = {
    isDistinct: false,
    digitProductNum: 0,
    jobName: rulesInfo.jobName || '',
    normalProductNum: rulesInfo.normalProductNum || 0,
    rewriteAside: rulesInfo.rewriteAside,
    videoNamePrefix: rulesInfo.videoNamePrefix,
    folderIds: isNotEmpty(rulesInfo.fileID) ? [rulesInfo.fileID.id] : [],
    pipelineId: pipelineIdInStep.value,
    chooseVoice: rulesInfo.chooseVoice,
    enableWrap: !!rulesInfo.enableWrap,
    creativeVersions: rulesInfo.creativeVersionInfo ? [rulesInfo.creativeVersionInfo] : []
  }
  const tagIds = []
  rulesInfo.tags.forEach(x => {
    tagIds.push(x.id)
  })
  params.labelIds = tagIds
  // 1预览前3条，2生成全部
  if (previewValue && previewValue === 1) {
    params.previewNumber = 3
  }

  produce(params)
    .then(res => {
      if (res.code === 0) {
        dialog.handleClose()
        emits('changeStep', 3)
      }
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

onMounted(() => {
  stepLoading.value = true
  initPage()
})
defineExpose({
  getListEnd,
  nextStep
})
</script>

<style lang="scss" scoped>
.step_1 {
  border-radius: 4px;
  height: 100%;
  overflow-y: auto;
  position: relative;
  .title_warp {
    padding: 22px 24px 0 24px;
  }
  .content_warp {
    height: calc(100% - 73px);
    overflow-y: auto;
    padding: 0 24px 92px 24px;
    :deep(.one_rule) {
      padding-left: 0;
    }
    :deep(.one_rule_blue) {
      padding-left: 12px;
    }
  }
}
</style>
