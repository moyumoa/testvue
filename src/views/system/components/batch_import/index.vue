<template>
  <el-dialog
    ref="dialog"
    v-model="show"
    :title="title"
    width="525px"
    custom-class="hide_footer_line"
  >
    <div class="step">
      <div class="step_item finish">
        <div class="step_num">1</div>
        <div class="step_text">下载模板</div>
        <el-link type="primary">{{ showModal.title }}模板列表</el-link>
      </div>
      <div class="step_item finish" style="flex-basis: 60%">
        <div class="step_num">2</div>
        <div class="step_text">填写后导入上传</div>
        <el-link type="primary">上传文件</el-link>
      </div>
      <div class="step_item">
        <div class="step_num">3</div>
        <div class="step_text" style="margin-top: 10px">完成</div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
export default {
  props: {
    /**
     * 弹窗信息
     * @param {boolean} show visible model
     * @param {String} title 标题
     */
    showModal: {
      type: Object,
      default: () => {
        return {
          show: false,
          title: ''
        }
      },
      required: true
    }
  },
  emits: ['getTableData'],
  setup(props, { emit }) {
    const show = toRef(props.showModal, 'show')
    const title = computed(() => `${props.showModal.title}批量导入`)
    return {
      show,
      title
    }
  },
  methods: {
    closeDialog() {
      this.$refs.dialog.handleClose()
    },
    handleConfirm() {}
  }
}
</script>

<style lang="scss" scoped>
.step {
  display: flex;
  justify-content: space-between;
  .step_item {
    flex-basis: 20%;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    &:first-child {
      &::before {
        content: ' ';
        position: absolute;
        width: 150px;
        height: 2px;
        background: #f2f3f5;
        left: 70%;
        top: 12px;
      }
    }
    &:last-child {
      &::before {
        content: ' ';
        position: absolute;
        width: 150px;
        height: 2px;
        background: #f2f3f5;
        right: 70%;
        top: 10px;
      }
    }

    .step_num {
      width: 24px;
      height: 24px;
      line-height: 24px;
      color: #fff;
      border-radius: 50%;
      background: #c8c9cc;
      text-align: center;
    }
    .step_text {
      color: #969799;
      margin: 8px 0 4px 0;
    }
    &.finish {
      .step_num {
        background: $theme_color;
      }
      .step_text {
        color: #323233;
        line-height: 20px;
        font-weight: 500;
      }
    }
    :deep(.el-link) {
      font-size: 12px;
    }
  }
}
</style>
