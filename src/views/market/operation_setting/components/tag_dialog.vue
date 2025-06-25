<template>
  <el-dialog
    custom-class="task_init_dialog"
    ref="dialog"
    destroy-on-close
    v-model="show"
    title="新建标签"
    width="440px"
  >
    <div style="padding: 16px">
      <el-form :model="$data.form" :rules="$data.rules" ref="ruleForm" label-width="100px">
        <el-form-item label="标签名称：" prop="tagName">
          <el-input
            v-model.trim="$data.form.tagName"
            @blur="retEmit($event)"
            placeholder="请输入标签名称"
            show-word-limit
            maxlength="4"
          ></el-input>
        </el-form-item>
        <el-form-item label="选择颜色：" prop="tagColor">
          <div class="color_list">
            <div
              :class="{ one_color: true, choose_color: $data.form.tagColor === item }"
              v-for="(item, index) in $data.colorList"
              :key="index"
              @click="$data.form.tagColor = item"
              :style="{
                borderColor: `rgb(${item})`
              }"
            >
              <div
                class="color_color"
                :style="{
                  background: `rgb(${item})`
                }"
              >
                <img
                  v-if="$data.form.tagColor === item"
                  src="https://tagvv-1256030678.file.myqcloud.com/20220901qt3ir.png"
                />
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="$data.btnLoading" @click="handleConfirm">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { saveTag } from '@/api/market/task_tag.js'
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
  }
})
const dialog = ref()
const show = toRef(props.addDialog, 'show')

const $data = reactive({
  colorList: [
    '235, 80, 80',
    '240, 136, 61',
    '43, 136, 255',
    '45, 166, 65',
    '104, 44, 185',
    '48, 49, 51'
  ],
  btnLoading: false,
  form: {
    tagName: '',
    tagColor: '235, 80, 80'
  },
  rules: {
    tagName: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
    tagColor: [{ required: true, message: '请选择颜色', trigger: 'blur' }]
  }
})

const message = inject('$message')
const emits = defineEmits(['updateList'])

const ruleForm = ref(null)
const handleConfirm = throttle(() => {
  ruleForm.value.validate(valid => {
    if (valid) {
      $data.btnLoading = true
      saveTag($data.form)
        .then(res => {
          if (res.code === 0) {
            message.success('保存成功')
            emits('updateList')
            dialog.value.handleClose()
          }
          $data.btnLoading = false
        })
        .catch(() => {
          $data.btnLoading = false
        })
    }
  })
}, 700)
function closeDialog() {
  dialog.value.handleClose()
}
// // 检查是否有表情包
function retEmit(e) {
  const reg =
    /[^a-zA-Z0-9_\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b/\s,.!！:()?/_""-——]/g
  $data.form.tagName = e.target.value.replace(reg, '')
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.color_list {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .one_color {
    border: 1px solid #fff;
    width: 32px;
    height: 32px;
    border-radius: 2px;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    .color_color {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
    img {
      width: 16px;
      height: 11px;
      object-fit: cover;
      display: flex;
    }
    &:hover {
      padding: 3px;
    }
  }
  .choose_color {
    padding: 3px;
  }
  .one_color + .one_color {
    margin-left: 20px;
  }
}
</style>
