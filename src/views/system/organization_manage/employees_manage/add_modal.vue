<template>
  <el-dialog
    ref="dialog"
    v-model="show"
    :title="editModal.title"
    width="541px"
    custom-class="hide_footer_line"
  >
    <el-form :model="form" :rules="rules" ref="ruleForm">
      <el-form-item label="员工姓名" prop="name">
        <el-input v-model="form.name" placeholder="请输入员工姓名"></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="num">
        <el-input
          v-model="form.num"
          oninput="value=value.replace(/[^\d]/g,'')"
          placeholder="请输入抖音绑定的手机号"
          maxlength="11"
        ></el-input>
      </el-form-item>
      <el-form-item label="部门" prop="section">
        <input type="text" v-model="form.section" style="display: none" />
        <div @click="alertSection" class="section_select">
          <div class="section_list" v-if="form.section.length > 0">
            <div class="section" v-for="(item, index) in form.section" :key="item.id">
              <span class="section_name">{{ item.label }}</span>
              <el-icon
                @click.stop="unchoiceSection(index)"
                color="#364FCD"
                :size="12"
                style="cursor: pointer"
              >
                <i-close />
              </el-icon>
            </div>
          </div>
          <div v-else>请选择部门</div>
          <i class="icon iconfont icon-edit"></i>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
  <sectionChoice :showModal="sectionShow" v-if="sectionShow.show" @setResult="setSection" />
</template>

<script>
import sectionChoice from '../../components/section_choice/index.vue'
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
  components: {
    sectionChoice
  },
  emits: ['getTableData', 'close'],
  setup(props, { emit }) {
    const form = ref({
      name: '',
      num: '',
      section: [],
      radio: ''
    })
    const rules = {
      name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
      num: [{ required: true, message: '请输入数字', trigger: 'blur' }],
      section: [{ required: true, message: '请选择部门', trigger: 'blur' }]
    }
    init()
    function init() {
      if (props.editModal.row) {
        form.value = JSON.parse(JSON.stringify(props.editModal.row)) // 数量量少的直接使用这个转
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
    alertSection() {
      this.sectionShow.data = this.form.section
      this.sectionShow.show = true
    },
    setSection(res) {
      this.form.section = res
    },
    unchoiceSection(index) {
      this.form.section.splice(index, 1)
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
      //   this.$message({
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
      //   this.$message({
      //     type: 'success',
      //     message: '编辑成功'
      //   })
      //   this.$emit('getTableData', false)
      // })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/views/system/components/css/common.scss';
</style>
