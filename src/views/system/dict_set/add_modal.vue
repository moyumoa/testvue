<template>
  <el-dialog
    ref="dialog"
    v-model="show"
    :title="editModal.title"
    width="541px"
    custom-class="hide_footer_line"
  >
    <el-form :model="form" :rules="rules" ref="ruleForm">
      <el-form-item label="类别">{{ choiceTypeName }}</el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" placeholder="请填写"></el-input>
      </el-form-item>
      <el-form-item label="值" prop="code">
        <el-input v-model="form.code" placeholder="请填写"></el-input>
      </el-form-item>
      <el-form-item label="排序" prop="nextId" v-if="editModal.title === '编辑类别'">
        <el-input
          v-model="form.nextId"
          width="150px"
          oninput="value=value.replace(/[^\d]/g,'')"
          placeholder="请填写"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { addDictChild, updateDictChild } from '@/api/system_setting/dict'
export default {
  props: {
    /**
     * 弹窗信息
     * @param {boolean} show visible model
     * @param {String} title 标题
     * @param {Object} row 编辑数据
     */
    editModal: {
      type: Object,
      default: () => {
        return {
          show: false,
          title: '',
          row: null
        }
      },
      required: true
    },
    brandId: {
      type: Number
    },
    dimType: {
      type: String
    },
    choiceTypeName: {
      type: String
    },
    dictList: {
      type: Array
    }
  },
  emits: ['getTableData', 'close'],
  setup(props, { emit }) {
    const form = ref({
      name: '',
      code: '',
      nextId: ''
    })
    const rules = {
      name: [{ required: true, message: '请填写', trigger: 'blur' }],
      code: [{ required: true, message: '请填写', trigger: 'blur' }]
    }
    if (props.editModal.title === '编辑类别') {
      rules.nextId = [{ required: true, message: '请填写', trigger: 'blur' }]
    }
    init()
    function init() {
      if (props.editModal.row) {
        const obj = JSON.parse(JSON.stringify(props.editModal.row)) // 数量量少的直接使用这个转
        obj.dimId = obj.id
        delete obj.next
        delete obj.id
        form.value = obj
      }
    }
    const show = toRef(props.editModal, 'show')
    const message = inject('$message')

    // 部门选择
    const sectionShow = reactive({
      show: false,
      data: null
    })
    return {
      form,
      rules,
      show,
      message,
      sectionShow
    }
  },
  methods: {
    closeDialog() {
      this.$refs.dialog.handleClose()
    },
    handleConfirm() {
      this.$refs.ruleForm.validate(valid => {
        console.log(valid)
        if (valid) {
          if (this.editModal.row) {
            this.updateForm()
          } else {
            this.addForm()
          }
        }
      })
    },
    // 新增提交事件
    addForm() {
      const params = { ...this.form }
      params.brandId = this.brandId
      const next = this.dictList.filter(item => +params.nextId === item.id)
      if (next.length > 0) {
        params.nextId = next.id
      }
      addDictChild(params, this.dimType).then(res => {
        this.closeDialog()
        this.message({
          type: 'success',
          message: '新增成功'
        })
        this.$emit('getTableData', true)
      })
    },
    // 编辑提交事件
    updateForm() {
      const params = { ...this.form }
      params.brandId = this.brandId

      updateDictChild(params, this.dimType).then(res => {
        this.closeDialog()
        this.message({
          type: 'success',
          message: '操作成功'
        })
        this.$emit('getTableData', true)
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
