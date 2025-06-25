<template>
  <div>
    <el-dialog
      ref="dialog"
      v-model="show"
      title="修改分组"
      width="400px"
      custom-class="hide_footer_line"
    >
      <div class="dialog_content">
        <div class="content_label">分组名称</div>
        <div class="content_content">
          <el-select style="width: 100%" v-model="modal.categoryId" placeholder="请选择分组名称">
            <el-option
              v-for="(item, index) in groupList"
              :key="index"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
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
import { saveOrUpdateAttachment, getAttachmentCategory } from '@/api/operation/library.js'
const props = defineProps({
  changeForm: {
    type: Object,
    default: () => {
      return {
        show: false, // 弹窗是否展示
        id: null
      }
    },
    required: true
  }
})
const message = inject('$message')
const show = toRef(props.changeForm, 'show') // 是否显示弹窗
const groupList = ref([])
const dialog = ref(null) // ==$refs.dialog
const modal = reactive({
  id: null,
  categoryId: null,
  loading: false
})
const emits = defineEmits(['updateImg'])
// // 打开弹窗并将获取已有的商品分组
function init() {
  console.log('设置分组弹窗打开')
  console.log(props)
  if (props.changeForm.data) {
    modal.id = props.changeForm.data.id
    modal.categoryId = props.changeForm.data.categoryId
  }
}
// 获取分组列表
function getList() {
  getAttachmentCategory()
    .then(res => {
      if (res.code === 0) {
        groupList.value = res.data || []
        // groupList.value.unshift({
        //   id: -1,
        //   name: '未分组'
        // })
      }
      init()
    })
    .catch(() => {
      init()
    })
}
getList()
// // 弹窗的取消事件
function closeDialog() {
  dialog.value.handleClose()
}
// // 弹窗的确定事件
const handleConfirm = throttle(() => {
  modal.loading = true
  saveOrUpdateAttachment({
    categoryId: modal.categoryId,
    id: modal.id
  })
    .then(res => {
      if (res.code === 0) {
        message.success('修改分组成功')
        emits('updateImg')
        dialog.value.handleClose()
      }
      modal.loading = false
    })
    .catch(() => {
      modal.loading = false
    })
}, 300)
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
