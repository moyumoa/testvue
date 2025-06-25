<template>
  <el-dialog
    ref="dialog"
    destroy-on-close
    v-model="show"
    :title="title"
    width="580px"
    custom-class="rule_setting_dialog hide_footer_line"
  >
    <div class="dialog_content">
      <p>选择生成条数</p>
      <el-radio-group v-model="form.radio" class="content_radio">
        <el-radio :label="1">
          <div class="radio_label">
            {{ `预生成 3 条视频，视频合成每分钟将消耗 ${oneCouponNum} AI智能合成星力值` }}
            <el-tooltip effect="dark" placement="top">
              <template #content>
                <div class="tip_content">
                  本次合成可以预览前3条视频，合成效果满意后可继续生成剩余视频
                </div>
              </template>
              <img
                class="tip_img"
                src="https://tagvv-1256030678.file.myqcloud.com/20230207c9zo0.png"
              />
            </el-tooltip>
          </div>
        </el-radio>
        <el-radio :label="2">
          直接生成 {{ createNum }} 条视频，视频合成每分钟将消耗 {{ oneCouponNum }} AI智能合成星力值
        </el-radio>
      </el-radio-group>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :disabled="loading">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  createDialog: {
    type: Object,
    default: () => {
      return {
        oneCouponNum: null, // 生产一条消耗的星力值数
        // consumeNum: null, // 生产消耗的星力值数
        createNum: null, // 生成条数
        title: '确认合成',
        show: false // 是否显示弹窗
      }
    },
    required: true
  }
})
const dialog = ref()
const loading = ref(false)
const show = toRef(props.createDialog, 'show')
const emits = defineEmits(['submit'])
const form = reactive({
  radio: 1 // 1预览前三条，2全部
})

const { title, createNum, oneCouponNum } = toRefs(props.createDialog)
// const oneVideoIntegral = ref(10)
// // 通过星力值合成条数反向计算每条视频消耗星力值数，就不用传过来了
// function init() {
//   if (createNum && createNum.value > 0) {
//     oneVideoIntegral.value = (consumeNum.value || 0) / createNum.value
//   } else {
//     oneVideoIntegral.value = 10
//   }
// }
// init()
const handleConfirm = throttle(() => {
  loading.value = true

  emits('submit', dialog.value, loading, form.radio)
}, 700)

function closeDialog() {
  dialog.value.handleClose()
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.dialog_content {
  width: 100%;
  padding: 16px 16px 0;
  font-weight: 400;
  font-size: 14px;
  color: #323233;
  line-height: 20px;
  :deep(.el-radio-group) {
    height: unset;
  }
  :deep(.el-radio) {
    margin-top: 8px;
    &:first-child {
      margin-top: 14px;
    }
  }
  .content_radio {
    .radio_label {
      display: flex;
      align-items: center;
    }
    .tip_img {
      width: 14px;
      height: 14px;
      margin-left: 8px;
    }
  }
}
</style>
