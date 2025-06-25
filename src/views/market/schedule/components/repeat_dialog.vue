<template>
  <el-dialog
    :modelValue="visible"
    width="422px"
    :before-close="cancel"
    :close-on-click-modal="false"
    custom-class="hide_footer_line"
  >
    <template #title>
      <div>
        <span style="font-size: 16px">{{ (title === 0 ? '删除' : '编辑') + '重复性排班' }}</span>
        <span style="margin-left: 4px; color: #999; font-size: 12px">已确认排班无法操作</span>
      </div>
    </template>
    <div class="main">
      <el-radio-group class="radio_group" v-model="type">
        <el-radio :label="0">仅该排班</el-radio>
        <el-radio :label="1">该排班及后续排班</el-radio>
        <!-- <el-radio :label="2">未确认的所有排班</el-radio> -->
      </el-radio-group>
    </div>
    <template #footer>
      <el-button @click="cancel">取消</el-button>
      <el-button :type="title === 0 ? 'danger' : 'primary'" @click="handleOk">
        {{ title === 0 ? '删除' : '确认' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'RepeatSchModal',
  props: {
    // 是否显示
    visible: {
      type: Boolean,
      required: true
    },
    // 标题 0删除 1编辑
    title: {
      type: Number,
      default: 0
    }
  },
  emits: ['delScheduling', 'editScheduling', 'update:visible', 'update'],
  data() {
    return {
      type: 0
    }
  },
  methods: {
    // 是否重复排班
    handleOk() {
      if (this.title === 0) {
        this.$emit('delScheduling', this.type)
      } else {
        this.$emit('editScheduling', this.type)
      }
      this.cancel()
    },
    cancel() {
      this.$emit('update:visible', false)
      this.$emit('update')
      this.type = 0
    }
  }
}
</script>

<style lang="scss" scoped>
.main {
  height: 80px;
  .el-radio-group {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: flex-start;
    > .el-radio {
      margin-top: 10px;
    }
  }
}
</style>
