<template>
  <div>
    <el-dialog
      ref="dialog"
      custom-class="matrxi_dialog "
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      :title="type2MiddleName()"
      width="560px"
    >
      <div class="content_box">
        <el-radio-group v-model="chooseRecord">
          <el-radio :label="1">开启{{ type2ShortName() }}获取</el-radio>
          <el-radio :label="0">关闭{{ type2ShortName() }}获取</el-radio>
        </el-radio-group>
        <div class="mark_box">
          {{ type2LongName() }}{{ chooseRecord == 1 ? '开启' : '关闭' }}状态！
        </div>
      </div>
      <template #footer>
        <div class="footer_box">
          <div class="footer_left">
            已选择抖音号
            <span>{{ props.addDialog.chooseLength || 0 }}</span>
            个
          </div>
          <span class="dialog-footer">
            <el-button @click="closeDialog">取消</el-button>
            <el-button type="primary" :loading="loading" @click="handleConfirm">确定</el-button>
          </span>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import api from '@/api/content_center/content_matrix.js'
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  addDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  },
  opType: {
    type: Object,
    required: true
  }
})
const dialog = ref()
const show = toRef(props.addDialog, 'show')
const loading = ref(false)
const form = ref(null) // 选中的筛选条件
const chooseUserList = ref([]) // 选中的抖音号
const isAll = ref(false) // 抖音号是否全选
const chooseRecord = ref(1)
function init() {
  if (props.addDialog.chooseList) {
    chooseUserList.value = JSON.parse(JSON.stringify(props.addDialog.chooseList))
  } else {
    chooseUserList.value = []
  }
  form.value = props.addDialog.form
  isAll.value = props.addDialog.isAll
}
init()
const emits = defineEmits(['updateList', 'errFun'])
const message = inject('$message')
// 弹窗的确定事件
const handleConfirm = throttle(() => {
  loading.value = true
  api
    .liveCommentControl({
      form: form.value,
      type: props.opType,
      isOpen: chooseRecord.value === 1,
      isOpenAll: isAll.value,
      openIds: chooseUserList.value
    })
    .then(res => {
      if (res.code === 0) {
        emits('updateList')
        message.success('操作成功')
        dialog.value.handleClose()
      }
    })
    .catch(err => {
      if (err && err.msg) {
        emits('errFun', {
          title: '开启失败',
          msg: err.msg
        })
        dialog.value.handleClose()
      }
      loading.value = false
    })
}, 700)
function closeDialog() {
  console.log(dialog.value)
  dialog.value.handleClose()
}
const type2ShortName = function type2ShortName() {
  if (props.opType === 1) {
    return '弹幕'
  }
  if (props.opType === 2) {
    return '评论'
  }
  if (props.opType === 3) {
    return '私信'
  }
}
const type2MiddleName = function type2MiddleName() {
  if (props.opType === 1) {
    return '直播弹幕关键词获取开关'
  }
  if (props.opType === 2) {
    return '视频评论获取开关'
  }
  if (props.opType === 3) {
    return '私信获取开关'
  }
}
const type2LongName = function type2LongName() {
  if (props.opType === 1) {
    return '将已选抖音号的直播弹幕关键词获取全部设置为'
  }
  if (props.opType === 2) {
    return '将已选抖音号的视频评论获取开关全部设置为'
  }
  if (props.opType === 3) {
    return '将已选抖音号的私信消息获取开关全部设置为'
  }
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.content_box {
  padding: 16px 16px 24px;
  .mark_box {
    margin-top: 12px;
    background: rgba(54, 79, 205, 0.1);
    padding: 6px 12px;
    font-size: 14px;
    font-weight: 400;
    color: #606266;
    line-height: 20px;
    .live-tips {
      display: flex;
      align-items: center;
      color: #909399;
      font-size: 12px;
      //line-height: 22px;
      //margin-left: 15px;
    }
  }
}
.footer_box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0 0px 4px;
  .footer_left {
    font-size: 14px;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
    span {
      color: #364fcd;
    }
  }
  .dialog-footer {
  }
}
</style>
