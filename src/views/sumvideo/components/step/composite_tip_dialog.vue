<template>
  <el-dialog
    ref="dialog"
    destroy-on-close
    v-model="show"
    title="提示"
    width="500px"
    custom-class="rule_setting_dialog hide_footer_line"
  >
    <div class="dialog_content">
      <div
        v-if="createType == 'img_text'"
        v-html="
          `本次任务共合成
      <span>${videoNum || 0}</span>
      ${createType == 'img_text' ? '个素材' : '条视频'} ，预计消耗
      <span>${couponNum || 0}</span>
      星力值，是否确认合成？`
        "
      ></div>
      <div v-else>
        本次任务合成每分钟将消耗
        <span>10</span>
        AI智能合成星力值，是否确认合成？
        <br />
        <span style="color: #8f939a">（扣减数额稍后查看“套餐使用记录”）</span>
      </div>
      <!-- 注 -->
      <div class="zhu" v-if="createType == 'img_text'">
        注：共计
        <span>{{ imgInfo.total }}</span>
        张图片，其中AI生成图片
        <span>{{ imgInfo.aiImgNum }}</span>
        张（
        <span>{{ imgPrice || 3 }}</span>
        星力值/张），不可替换图片
        <span>{{ imgInfo.imgNum }}</span>
        张
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  tipDialog: {
    type: Object,
    default: () => {
      return {
        videoNum: null, // 视频数
        imgPrice: 3, // 图片消耗星力值数
        couponNum: null, // 生产券数
        type: null, // 提示类型 img_text 图文生成
        show: true, // 是否显示弹窗
        imgInfo: {
          total: 0, // 图片总数量
          imgNum: 0, // 不可替换图片数
          aiImgNum: 0 // AI生成图片数量
        }
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.tipDialog, 'show')
const loading = ref(false)
const {
  videoNum,
  couponNum,
  imgPrice,
  type: createType = null,
  imgInfo = {}
} = toRefs(props.tipDialog)

const emits = defineEmits(['handleConfirm'])
const handleConfirm = throttle(() => {
  loading.value = true

  emits('handleConfirm', dialog.value, loading)
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
  padding: 16px 16px 12px;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 14px;
  color: #303133;
  line-height: 20px;
  :deep(span) {
    color: #364fcd;
  }
  .zhu {
    font-family: PingFangSC, PingFang SC;
    font-weight: 400;
    font-size: 12px;
    color: #909399;
    line-height: 18px;
    margin-top: 8px;
    span {
      color: #364fcd;
    }
  }
}
</style>
