<template>
  <div>
    <el-dialog
      ref="dialog"
      v-model="show"
      :title="title"
      width="400px"
      custom-class="hide_footer_line"
    >
      <div class="dialog_content">
        <div class="content_label">分组名称</div>
        <div class="content_content">
          <el-input
            v-model.trim="modal.text"
            maxlength="20"
            @blur="retEmit($event)"
            placeholder="请输入分组名称"
            type="text"
          ></el-input>
          <div class="error_text">{{ modal.errorText || ' ' }}</div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" :loading="modal.loading" @click="handleConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'
import { saveOrUpdateAttachmentCategory } from '@/api/operation/library.js'
const props = defineProps({
  addForm: {
    type: Object,
    default: () => {
      return {
        title: '',
        show: false, // 弹窗是否展示
        data: {
          id: null,
          name: ''
        } // 商品分组信息
      }
    },
    required: true
  }
})
const message = inject('$message')
const show = toRef(props.addForm, 'show') // 是否显示弹窗
const title = toRef(props.addForm, 'title') // 是否显示弹窗

const dialog = ref(null) // ==$refs.dialog
const modal = reactive({
  show: false,
  text: '',
  errorText: '',
  id: null,
  loading: false
})
const emits = defineEmits(['updateGroup'])
// // 打开弹窗并将获取已有的商品分组
function init() {
  console.log('设置分组弹窗打开')
  console.log(props)
  if (props.addForm.data) {
    modal.id = props.addForm.data.id
    modal.text = props.addForm.data.name
    modal.type = props.addForm.data.type
  }
}
init()
// // 弹窗的取消事件
function closeDialog() {
  dialog.value.handleClose()
}
// // 弹窗的确定事件
const handleConfirm = throttle(() => {
  if (modal.text.length > 0) {
    modal.errorText = ''
    modal.loading = true
    saveOrUpdateAttachmentCategory({
      id: modal.id,
      name: modal.text,
      type: modal.type || 1
    })
      .then(res => {
        if (res.code === 0) {
          message.success('添加分组成功')
          emits('updateGroup')
          modal.text = ''
          dialog.value.handleClose()
        }
        modal.loading = false
      })
      .catch(() => {
        modal.loading = false
      })
  } else {
    modal.errorText = '请输入分组名称'
  }
}, 300)

// // 检查是否有表情包
function retEmit(e) {
  const val = e.target.value
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  modal.text = val.replace(reg, '')

  if (modal.text.length > 0) {
    modal.errorText = ''
  } else {
    modal.errorText = '请输入分组名称'
  }
}
</script>
<style scoped lang="scss">
div {
  box-sizing: border-box;
}
.dialog_content {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  .content_label {
    width: 76px;
    padding-right: 14px;
    text-align: right;
    line-height: 32px;
    color: #303133;
  }
  .content_content {
    width: 292px;
    .error_text {
      color: var(--el-color-danger);
      font-size: 12px;
      line-height: 1;
      padding-top: 4px;
    }
  }
}
</style>
