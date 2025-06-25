<template>
  <div class="login_tip_dom">
    <div class="login_tip_dialog" v-if="showTip">
      <div class="content">
        为保障使用体验，请及时
        <span @click="editPsw">设置登录密码</span>
        <el-icon @click="closeTipFun" class="close_icon"><i-close /></el-icon>
      </div>
    </div>
    <el-dialog
      v-model="tVisible"
      title="身份验证"
      width="400px"
      :before-close="tClose"
      :close-on-click-modal="false"
      append-to-body
    >
      <p>手机号码：{{ info.userPhone }}</p>
      <div class="code_input mt_16">
        <el-input
          v-model="code"
          placeholder="请输入验证码"
          style="width: 217px; margin-right: 12px"
        ></el-input>
        <el-button type="primary" @click="getCode" :disabled="!!timer">
          <span style="display: inline-block; width: 70px">
            {{ !timer ? '获取验证码' : second + 's' }}
          </span>
        </el-button>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="tClose">取消</el-button>
          <el-button type="primary" @click="next" :disabled="!code">下一步</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog
      v-model="cVisible"
      title="修改密码"
      width="460px"
      :before-close="cClose"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form :model="form" :rules="rules" ref="refForm" label-width="120px">
        <el-form-item label="新密码" prop="password">
          <el-input v-model="form.password" placeholder="请输入新密码" type="password" />
        </el-form-item>
        <el-form-item label="确认密码" prop="password2">
          <el-input v-model="form.password2" placeholder="请输入新密码" type="password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cClose">取消</el-button>
          <el-button type="primary" @click="editP">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
import { throttle } from '@/utils/tools.js'
import { updatePasswordByPhone, updateInitPwdStatus } from '@/api/system_setting/personal.js'
import { sendCode } from '@/api/main/home.js'

import md5 from 'md5'
const store = useStore()

const showTip = ref(true)

const validatePwd = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('密码不能为空'))
  } else if (value.length < 8) {
    callback(new Error('密码长度最少8位'))
  } else {
    callback()
  }
}
const validateRepeatPwd = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('确认密码不能为空'))
  } else if (value.length < 8) {
    callback(new Error('密码长度最少8位'))
  } else if (value !== form.value.password) {
    callback(new Error('两次密码不相同'))
  } else {
    callback()
  }
}

const refForm = ref(null)
const form = ref({
  password: '',
  password2: ''
})
const rules = {
  password: [{ required: true, validator: validatePwd, trigger: 'blur' }],
  password2: [{ required: true, validator: validateRepeatPwd, trigger: 'blur' }]
}
const cVisible = ref(false)
const tVisible = ref(false)
const code = ref('')
const $message = inject('$message')

const info = computed(() => {
  return store.getters.userInfo
    ? store.getters.userInfo
    : localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null
})
const timer = ref(null)
const second = ref(60)
// 倒计时
const countDown = () => {
  timer.value = setInterval(() => {
    console.log('倒计时', second.value)
    second.value--
    if (second.value === 0) {
      clearInterval(timer.value)
      timer.value = null
      second.value = 60
    }
  }, 1000)
}

const editPsw = () => {
  code.value = ''
  tVisible.value = true
}
const tClose = () => {
  clearInterval(timer.value)
  timer.value = null
  second.value = 60
  tVisible.value = false
}
const next = () => {
  tClose()
  cVisible.value = true
}
const cClose = () => {
  form.value = {
    password: '',
    password2: ''
  }
  cVisible.value = false
}
const getCode = () => {
  sendCode({ phone: info.value.userPhone }).then(res => {
    if (!timer.value) {
      countDown()
    }
  })
}
const editP = throttle(() => {
  refForm.value.validate(valid => {
    if (valid) {
      updatePasswordByPhone({
        checkCode: code.value,
        phone: info.value.userPhone,
        password: md5(form.value.password)
      }).then(res => {
        $message.success('修改成功')
        showTip.value = false
        store.commit('user/setIsInitPwd', 0)
        cClose()
      })
    }
  })
}, 500)

// 关闭提示
const closeTipFun = throttle(() => {
  showTip.value = false
  updateInitPwdStatus().then(res => {
    if (res.code === 0) {
      store.commit('user/setIsInitPwd', 0)
    }
  })
}, 500)
</script>

<style lang="scss" scoped>
.info_bottom {
  width: 100%;
  max-height: calc(70vh - 120px);
  overflow-y: auto;
  padding: 20px 32px 4px;
}
.info_title {
  font-size: 16px;
  color: #606266;
  line-height: 22px;
  margin-bottom: 12px;
  font-weight: 500;
}
.info_header {
  width: 100%;
  padding: 28px 32px 0;
  margin-bottom: 0px;
  .info_item {
    width: 100%;
    border-bottom: 1px solid #f7f8fa;
    padding-bottom: 20px;
    max-width: 100%;
    margin: 0;
  }
}
.info_content {
  display: flex;
  flex-direction: column;
  .info_column {
    margin-bottom: 24px;
    display: flex;
  }
}
.info_item {
  margin-right: 58px;
  position: relative;
  max-width: 33%;
  .info_item_top {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
  }
  .edit_icon {
    display: none;
    position: absolute;
    top: 40px;
    left: 40px;
    justify-content: center;
    align-items: center;
    transform: translate(-50%, -50%);
    color: #fff;
    width: 80px;
    height: 80px;
    background-color: rgba($color: #666, $alpha: 0.3);
    border-radius: 50%;
    pointer-events: none;
  }
  .wc_icon {
    font-size: 12px;
    color: #7fe2a1;
    margin-right: 8px;
  }
  .img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-right: 16px;
    object-fit: cover;
    &:hover {
      + .edit_icon {
        display: flex;
      }
    }
  }
  .default_img {
    margin-right: 16px;
    &:hover + .edit_icon {
      display: flex !important;
    }
  }
  &.flex {
    display: flex;
    align-items: center;
  }
  &_top {
    color: #909399;
    line-height: 20px;
    margin-bottom: 6px;
    .edit_button {
      font-size: 14px;
      color: #364fcd;
      line-height: 20px;
      margin-left: 16px;
      cursor: pointer;
    }
  }
  &_bottom {
    font-size: 16px;
    color: #303133;
    line-height: 20px;
  }
}
.info_item:last-child {
  margin-right: 0;
}

.fs_img {
  width: 20px;
  height: 20px;
  margin-left: 4px;
}
.info_item_bottom {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  font-size: 18px;
  font-weight: 500;
  color: #323233;
  line-height: 26px;
}
.edit_icon1_box {
  width: 36px;
  height: 26px;
  padding: 3px 8px;
  cursor: pointer;
  .edit_icon1 {
    display: flex;
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
}
.login_tip_dom {
  position: absolute;
  right: 8px;
  top: 66px;
}
.login_tip_dialog {
  .content {
    border-radius: 8px;
    box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
    background: #fff;
    width: max-content;
    padding: 16px;
    color: #606266;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    span {
      color: #364fcd;

      cursor: pointer;
    }
    .close_icon {
      cursor: pointer;
      margin-left: 10px;
      font-size: 18px;
      color: #646566;
    }
  }
}
</style>
