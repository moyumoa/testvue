<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="新增账号等级和指数规则"
    width="820px"
    custom-class="choose_part_dialog"
  >
    <div class="dialog_content" v-loading="$data.loading">
      <!-- 规则名称 -->
      <div class="line_box">
        <div class="line_label">规则名称：</div>
        <div class="line_input">
          <el-input
            maxlength="20"
            style="width: 310px"
            @blur="retEmitEmj($event, 'ruleName')"
            v-model.trim="$data.form.ruleName"
            placeholder="请输入规则名称"
          ></el-input>
        </div>
      </div>
      <div class="error_text" v-if="$data.rules.ruleName">{{ $data.rules.ruleName }}</div>
      <!-- 账号等级规则 -->
      <div class="level_box">
        <div class="title_box">
          <div>账号等级规则</div>
          <el-link type="primary" class="blue_btn" @click="addLevel">添加</el-link>
        </div>
        <div class="border_box">
          <div class="level_content" v-for="(item, index) in $data.form.accountGrade" :key="index">
            <div class="line_box">
              <p>等级 {{ $data.form.accountGrade.length - index }}</p>
              <el-input
                style="width: 136px; margin-left: 12px"
                @blur="retEmitEmj($event, 'gradeName', item)"
                v-model.trim="item.gradeName"
                placeholder="等级名称"
                maxlength="5"
              ></el-input>
              <template v-if="index < $data.form.accountGrade.length - 1">
                <p style="margin: 0 8px 0 24px">达成条件：账号指数 ></p>
                <!-- 本期只做账号指数 -->
                <!-- <el-select v-model="item.target" placeholder="账号指数">
                  <el-option
                    v-for="select in $data.levelTargetList"
                    :key="select.value"
                    :label="select.label"
                    :value="select.value"
                  />
                </el-select>
                <el-select v-model="item.compare" placeholder="大于">
                  <el-option
                    v-for="select in $data.levelCompareList"
                    :key="select.value"
                    :label="select.label"
                    :value="select.value"
                  />
                </el-select> -->
                <el-input
                  @input="checkInt($event, item, 'gradeValue', 'level')"
                  @blur="checkLevel"
                  v-model.trim="item.gradeValue"
                  placeholder="数值"
                ></el-input>
              </template>
            </div>
            <div class="line_mark" v-if="item.isDefaule">默认等级</div>
            <el-link type="primary" class="blue_btn" v-else @click="delRule(index)">删除</el-link>
          </div>
        </div>
        <div class="error_text" v-if="$data.rules.level">{{ $data.rules.level }}</div>
      </div>
      <!-- 账号指数规则 -->
      <div class="target_box">
        <div class="title_box">
          <div>账号指数规则</div>
        </div>
        <div class="border_box">
          <div class="level_content" v-for="(item, index) in $data.form.exponentRule" :key="index">
            <div class="line_box">
              <el-checkbox
                @change="checkTarget"
                v-model="item.isOpen"
                :true-label="1"
                :false-label="0"
              />
              <p>
                <span style="min-width: 100px; display: block">{{ item.exponentName }}</span>
                <span class="calc_span chu_span">÷</span>
              </p>

              <el-input
                @input="checkInt($event, item, 'factor', 'target')"
                @blur="checkTarget"
                v-model.trim="item.factor"
                placeholder="量级参数"
              ></el-input>
              <p class="calc_span" style="margin-top: 10px">*</p>
              <el-input
                @input="checkInt($event, item, 'exponentValue', 'target')"
                @blur="checkTarget"
                v-model.trim="item.exponentValue"
                placeholder="权重值"
              ></el-input>
            </div>
          </div>
        </div>
        <div class="error_text" v-if="$data.rules.target">{{ $data.rules.target }}</div>
        <div class="target_mark">* 账号指数 = 所选各项维度得分之和</div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button :disabled="$data.btnDis" @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="$data.btnDis" @click="handleConfirm">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { saveGradeRules, getGradeRuleConfig } from '@/api/system_setting/setting.js'
import { throttle } from '@/utils/tools.js'
const props = defineProps({
  ruleDialog: {
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
const show = toRef(props.ruleDialog, 'show')

const $data = reactive({
  loading: false,
  btnDis: false,
  form: {},

  rules: {
    ruleName: '',
    level: '',
    target: ''
  },
  levelTargetList: [
    {
      value: 1,
      label: '账号指数'
    }
  ],
  levelCompareList: [
    {
      value: 1,
      label: '大于'
    }
  ]
})
function init() {
  $data.loading = true
  if (props.ruleDialog.type === 'add') {
    getInit()
  } else {
    $data.form = sessionStorage.getItem('levelRule')
      ? JSON.parse(sessionStorage.getItem('levelRule'))
      : {}

    $data.loading = false
  }
}
init()
function getInit() {
  getGradeRuleConfig({
    brandId: localStorage.getItem('brandInfo')
      ? JSON.parse(localStorage.getItem('brandInfo')).brandId
      : ''
  })
    .then(res => {
      console.log(res)
      if (res.code === 0) {
        const data = res.data
        $data.form = {
          ruleName: '',
          exponentRule: data.exponentRuleConfig.defaultExponentRule,
          accountGrade: [data.levelConfig.defaultAccountGrade]
        }
      }
    })
    .finally(() => {
      $data.loading = false
    })
}
// 检查是否有表情包
function retEmitEmj(e, type, item) {
  console.log(e, type, item)
  const reg = /[^\u4e00-\u9fa5a-zA-Z0-9/,]/gi
  const value = e.target.value.replace(reg, '')
  if (type === 'ruleName') {
    $data.form.ruleName = value
    $data.rules.ruleName = value ? '' : '请输入规则名称'
  } else {
    item[type] = value
    checkLevel()
  }
}
// 输入框转为正整数
function checkInt(value, item, key, type) {
  const MAX_NUM = 99999999
  const MIN_NUM = 1
  const _value =
    parseInt(value) > MAX_NUM ? MAX_NUM : parseInt(value) < MIN_NUM ? '' : parseInt(value)
  item[key] = isNaN(_value) ? '' : _value
}
// 验证等级
function checkLevel() {
  let stu = 1
  let firstValue = null
  $data.form.accountGrade.forEach((x, i) => {
    if (i === $data.form.accountGrade.length - 1) {
      if (!x.gradeName) {
        stu = 2
      }
    } else {
      if (!(x.gradeName && x.gradeValue)) {
        stu = 2
      } else {
        if (i > 0) {
          if (firstValue <= x.gradeValue) {
            stu = 3
          }
          firstValue = x.gradeValue
        } else {
          firstValue = x.gradeValue
        }
      }
    }
  })
  $data.rules.level =
    stu === 1 ? '' : stu === 2 ? '请将账号等级规则填写完整' : '达成条件的账号指数要依次增加哦'
}
// 验证指数
function checkTarget() {
  const list = $data.form.exponentRule.filter(x => x.isOpen)
  if (list.length > 0) {
    let stu = true
    list.forEach(x => {
      if (x.isOpen) {
        if (!(x.factor && x.exponentValue)) {
          stu = false
        }
      }
    })
    $data.rules.target = stu ? '' : '请将账号指数规则填写完整'
  } else {
    $data.rules.target = '请选择一个账号指数规则'
  }
}
const message = inject('$message')
// 添加等级
const addLevel = throttle(() => {
  if ($data.form.accountGrade.length > 9) {
    message.warning('最多只能设置10个等级规则哦')
    return
  }
  $data.form.accountGrade.unshift({
    gradeId: null,
    gradeName: '',
    gradeType: 1,
    gradeValue: null,
    isDefaule: 0,
    judge: 1,
    level: $data.form.accountGrade.length + 1
  })
}, 500)
// 删除等级
const delRule = throttle(index => {
  $data.form.accountGrade.splice(index, 1)
}, 500)
const emits = defineEmits(['updateList'])
// // 弹窗的确定事件
const handleConfirm = throttle(() => {
  $data.btnDis = true
  console.log($data.form)
  $data.rules.ruleName = $data.form.ruleName ? '' : '请输入规则名称'
  checkLevel()
  checkTarget()
  if ($data.rules.ruleName || $data.rules.level || $data.rules.target) {
    message.warning('请将内容填写完整')
    $data.btnDis = false
    return
  }
  const form = JSON.parse(JSON.stringify($data.form))
  form.accountGrade.forEach((x, i) => {
    x.level = form.accountGrade.length - i
  })
  form.exponentRule.forEach(x => {
    if (!x.isOpen) {
      x.exponentValue = null
      x.factor = null
    }
  })
  console.log(1, form)
  saveGradeRules(form)
    .then(res => {
      if (res.code === 0) {
        console.log(1)
        message.success('保存成功')
        emits('updateList')
        closeDialog()
      } else {
        $data.btnDis = false
      }
    })
    .catch(() => {
      $data.btnDis = false
    })
}, 700)
function closeDialog() {
  console.log(dialog.value)
  dialog.value.handleClose()
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.error_text {
  color: #ff0000;
  margin-top: 8px;
  padding-left: 20px;
}

.dialog_content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 20px 16px 8px;
  .line_box {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-size: 14px;
    font-weight: 400;
    color: #323233;
    line-height: 24px;
    .line_label {
      padding-left: 16px;
      // width: 7px;
      padding-right: 3px;
      text-align: right;
    }
    :deep(.el-input, .el-select) {
      width: 120px;
      margin-right: 8px;
    }
    :deep(.el-checkbox) {
      margin-right: 12px;
      height: 16px;
      margin-top: 2px;
    }
  }
  .title_box {
    margin-top: 20px;
    width: 100%;
    height: 56px;
    background: #f6f8fa;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0 17px 0 16px;
    font-size: 16px;
    font-weight: 600;
    color: #323233;
    line-height: 24px;
    .blue_btn {
      font-size: 14px;
      font-weight: 400;
      color: #304cd5;
      line-height: 24px;
    }
    .line_mark {
      font-size: 14px;
      font-weight: 400;
      color: #303133;
      line-height: 24px;
    }
  }
  .border_box {
    padding: 12px 16px;

    border: 1px solid #dcdee0;
    border-top: none;
  }

  .level_content {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .line_box {
      width: calc(100% - 100px);
      > p {
        display: flex;
        line-height: 1;
      }
    }
  }
  .level_content + .level_content {
    margin-top: 12px;
  }

  .target_box {
    font-size: 14px;
    font-weight: 400;
    color: #323233;
    line-height: 24px;
    p {
      margin-right: 8px;
      line-height: 1.5;
      margin-top: 4px;
    }
    .calc_span {
      font-size: 18px;
      line-height: 14px;
    }
    .chu_span {
      font-size: 16px;
      font-family: PingFangSC-Regular, PingFang SC;
    }
  }
  .target_mark {
    margin: 20px 2px 0px;
    font-size: 14px;
    font-weight: 400;
    color: #606266;
    line-height: 20px;
  }
}
</style>
