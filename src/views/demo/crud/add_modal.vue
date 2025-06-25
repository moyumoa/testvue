<template>
  <el-dialog ref="dialog" v-model="show" :title="editModal.title" width="30%">
    <el-form :model="form" :rules="rules" ref="ruleForm" label-width="100px">
      <el-form-item label="填写名称：" prop="name">
        <el-input v-model="form.name" placeholder="请输入名称"></el-input>
      </el-form-item>
      <el-form-item label="数字：" prop="num">
        <el-input
          v-model="form.num"
          oninput="value=value.replace(/[^\d]/g,'')"
          placeholder="只能输入正整数"
        ></el-input>
      </el-form-item>
      <el-form-item label="选择器：" prop="choose">
        <el-select v-model="form.choose" placeholder="请选择" clearable>
          <el-option
            v-for="item in selectData"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="单选框：" prop="radio">
        <el-radio-group v-model="form.radio">
          <el-radio v-for="item in radioData" :key="item.value" :label="item.value">
            {{ item.label }}
          </el-radio>
        </el-radio-group>
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
    }
  },
  emits: ['getTableData', 'close'],
  setup(props, { emit }) {
    const form = ref({
      name: '1',
      num: '',
      choose: '',
      radio: ''
    })
    const rules = {
      name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
      num: [{ required: true, message: '请输入数字', trigger: 'blur' }],
      choose: [{ required: true, message: '请选择', trigger: 'blur' }],
      radio: [{ required: true, message: '请选择', trigger: 'blur' }]
    }
    const selectData = ref([
      {
        label: '选项',
        value: 1
      }
    ])
    const radioData = ref([
      {
        label: '单选1',
        value: 1
      },
      {
        label: '单选2',
        value: 2
      }
    ])
    init()
    function init() {
      if (props.editModal.row) {
        form.value = JSON.parse(JSON.stringify(props.editModal.row)) // 数量量少的直接使用这个转
      }
    }
    const show = toRef(props.editModal, 'show')
    const message = inject('$message')
    return {
      form,
      rules,
      selectData,
      radioData,
      show,
      message
    }
  },
  methods: {
    closeDialog() {
      this.$refs.dialog.handleClose()
    },
    handleConfirm() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          if (this.props.row) {
            this.addForm()
          } else {
            this.updateForm()
          }
        }
      })
    },
    // 新增提交事件
    addForm(params) {
      // add(params)
      // .then(res => {
      //   this.message({
      //     type: 'success',
      //     message: '新增成功'
      //   })
      //   this.$emit('getTableData', true)
      // })
    },
    // 编辑提交事件
    updateForm(params) {
      // update(params)
      // .then(res => {
      //   this.message({
      //     type: 'success',
      //     message: '编辑成功'
      //   })
      //   this.$emit('getTableData', false)
      // })
    }
  }
}
</script>

<style lang="scss"></style>
