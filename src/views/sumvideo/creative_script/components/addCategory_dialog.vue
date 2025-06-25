refForm
<template>
  <el-dialog
    ref="dialog"
    destroy-on-close
    v-model="show"
    :title="props.addDialog.type == 'add' ? '新建分类' : '重命名'"
    custom-class="info_dialog"
    width="420px"
  >
    <div class="add_content">
      <el-form :model="form" :rules="rules" ref="refForm" label-width="0">
        <el-form-item label="" prop="parentId" v-if="props.addDialog.showSelect">
          <el-select style="width: 100%" v-model="form.parentId" placeholder="请选择分类组">
            <el-option
              v-for="item in props.categoryGroupList"
              :label="item.categoryName"
              :value="item.id"
              :key="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="" prop="name">
          <el-input
            clearable
            style="width: 100%"
            v-model.trim="form.name"
            maxlength="15"
            placeholder="请输入分类名称"
            @blur="retEmit($event)"
          />
        </el-form-item>
      </el-form>
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
// 新建/编辑分类的弹窗
import { saveCategory } from '@/api/sumvideo/category.js'
import { throttle } from '@/utils/tools.js'
const message = inject('$message')
const props = defineProps({
  addDialog: {
    type: Object,
    default: () => {
      return {
        show: true, // 是否显示弹窗
        type: 'add', // add是新建 edit是编辑
        showSelect: false // 是否显示选择分类组的弹窗
      }
    },
    required: true
  },
  categoryGroupList: {
    type: Array,
    default: () => {
      return []
    }
  }
})
const dialog = ref()
const refForm = ref(null)
const show = toRef(props.addDialog, 'show')
const loading = ref(false)
const form = reactive({
  parentId: null,
  name: ''
})
const rules = reactive({
  parentId: [{ required: true, message: '请选择分类组', trigger: 'blur' }],

  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
})

function init() {
  if (props.addDialog.type === 'edit') {
    const addInfo = JSON.parse(JSON.stringify(props.addDialog))
    form.name = addInfo.name
  }
  if (props.addDialog.parentId) {
    form.parentId = JSON.parse(JSON.stringify(props.addDialog.parentId))
  } else {
    form.parentId = null
  }
}
init()
const emits = defineEmits(['getAllCategory'])
const handleConfirm = throttle(() => {
  refForm.value.validate(valid => {
    if (valid) {
      loading.value = true

      saveCategory({
        id: props.addDialog.type === 'add' ? null : props.addDialog.id,
        categoryName: form.name,
        level: 2,
        parentId: form.parentId || null,
        type: 2
      })
        .then(res => {
          if (res.code === 0) {
            message({
              type: 'success',
              message: props.addDialog.type === 'add' ? '创建成功' : '重命名成功'
            })
            emits('getAllCategory', {
              type: props.addDialog.type
            })
            dialog.value.handleClose()
          }
          loading.value = false
        })
        .catch(() => {
          loading.value = false
        })
    }
  })
}, 700)
function closeDialog() {
  dialog.value.handleClose()
}
// 检查是否有表情包
function retEmit(e) {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  form.name = e.target.value.replace(reg, '')
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.add_content {
  width: 100%;
  padding: 16px;
}
</style>
