<template>
  <div class="limit_dialog">
    <el-dialog ref="dialog" v-model="limitModal.show" top="8vh" width="720px">
      <template #title>
        <div class="title">
          {{ limitModal.title }}
          <el-tooltip class="item" effect="dark" placement="right-start">
            <template #content>
              <div class="tooltip_wrap">在规定时间内，对用户的兑换次数进行限制</div>
            </template>
            <img
              src="@/assets/images/content_center/tip_line.png"
              style="width: 14px; height: 14px; margin-left: 8px"
              alt
            />
          </el-tooltip>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="ruleForm">
        <el-form-item label="限购时间" prop="limitTime">
          <el-date-picker
            v-model="form.limitTime"
            style="width: 360px"
            type="datetimerange"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            range-separator="至"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :editable="false"
            :clearable="false"
            :disabled="limitSwitch.isOpen"
            :default-time="DefaultSetting.defaultTime"
            :disabled-date="
              time => {
                return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
              }
            "
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="限购商品" prop="limitGoods">
          <el-input-number
            v-model="form.limitGoods"
            controls-position="right"
            style="width: 120px; margin-right: 4px"
            placeholder="请输入"
            :min="1"
            :max="99"
            :disabled="limitSwitch.isOpen"
          />
          <span class="ge">次</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button
            type="primary"
            :loading="loading"
            :disabled="limitSwitch.isOpen"
            @click="openLimit"
          >
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { pageSwitch } from '../modal/get_switch'
import { throttle } from '@/utils/tools.js'
const { rules, form, changeLimitData, limitSwitch } = pageSwitch()
const props = defineProps({
  limitModal: {
    type: Object,
    default: function () {
      return {
        show: false,
        title: '',
        value: false
      }
    }
  }
})
const limitModal = toRef(props, 'limitModal')
const dialog = ref(null) // ==$refs.dialog
const loading = ref(false) // 弹窗的Loading
const ruleForm = ref(null) // 表单验证
// 默认时间
const DefaultSetting = reactive({
  defaultTime: [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)]
})

// 提交表单
const openLimit = throttle(() => {
  ruleForm.value.validate(valid => {
    if (valid) {
      changeLimitData()
      closeDialog()
    }
  })
}, 500)

// 关闭整个弹窗
function closeDialog() {
  dialog.value.handleClose()
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}

.limit_dialog {
  .title {
    color: #303133;
    font-size: 18px;
    display: flex;
    align-items: center;
    .tooltip_wrap {
      max-width: 400px;
      font-size: 12px;
      font-weight: 400;
      color: #ffffff;
    }
  }
  .ge {
    margin-left: 4px;
  }
}
</style>
