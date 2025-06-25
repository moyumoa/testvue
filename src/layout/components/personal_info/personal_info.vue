<template>
  <div class="">
    <el-dialog
      v-model="show"
      ref="dialog"
      destroy-on-close
      append-to-body
      width="820px"
      custom-class="hide_header_line addTaskToLevelDialog"
    >
      <div class="info_dialog_content" v-loading="loading">
        <div class="info_header">
          <div class="info_item flex">
            <el-upload
              :action="uploadUrl"
              :headers="headers"
              accept="image/jpeg, image/jpg, image/png"
              :on-success="handleSuccess"
              :show-file-list="false"
            >
              <img
                class="img"
                v-if="info.userPhoto || (info.fsAccount && info.fsAccount.photo)"
                :src="info.userPhoto || info.fsAccount.photo"
                alt
              />
              <div v-else class="default_img">
                <default-photo
                  :name="info.userBrandName"
                  style="font-size: 22px; width: 80px; height: 80px"
                />
              </div>
              <i class="iconfont icon-edit edit_icon"></i>
            </el-upload>
            <div>
              <div class="info_item_top">姓名</div>
              <div class="info_item_bottom">
                {{ info.userBrandName }}
                <div class="edit_icon1_box" v-if="info.isMain != 1">
                  <img
                    class="edit_icon1"
                    @click="editName"
                    src="https://tagvv-1256030678.file.myqcloud.com/20221222x230a.png"
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="info_bottom">
          <div class="info_title">个人信息</div>
          <div class="info_content">
            <div class="info_column">
              <div class="info_item">
                <div class="info_item_top">角色</div>
                <div class="info_item_bottom">
                  <template v-for="(item, index) in info.role" :key="item.roleId">
                    {{ item.roleName }}
                    <template v-if="index !== info.role.length - 1">/</template>
                  </template>
                </div>
              </div>
              <div class="info_item" v-if="info.fsAccount">
                <div class="info_item_top">
                  员工

                  <img
                    class="fs_img"
                    v-if="info.fsAccount.iconType === 2"
                    src="@/assets/images/user/weChat.png"
                    alt
                  />
                  <img
                    class="fs_img"
                    v-if="info.fsAccount.iconType === 1"
                    src="@/assets/images/user/feishu.png"
                  />
                  <img
                    class="fs_img"
                    v-if="info.fsAccount.iconType === 3"
                    src="@/assets/images/user/wx.png"
                  />
                </div>
                <div class="info_item_bottom">{{ info.fsAccount.name || '-' }}</div>
              </div>
              <div class="info_item">
                <div class="info_item_top">部门</div>
                <div class="info_item_bottom">
                  {{ info.depList && info.depList.length > 0 ? info.depList.join('/') : '-' }}
                </div>
              </div>
            </div>
          </div>
          <div class="info_title">账号信息</div>
          <div class="info_content">
            <div class="info_column">
              <div class="info_item">
                <div class="info_item_top">手机号</div>
                <div class="info_item_bottom">
                  <template v-if="info.userPhone">
                    {{ info.userPhone }}
                    <!-- {{ info.userPhone.substring(0, 3) }}****{{ info.userPhone.substring(7) }} -->
                  </template>
                  <template v-else>-</template>
                </div>
              </div>
              <div class="info_item">
                <div class="info_item_top">登陆密码</div>
                <div class="info_item_bottom">
                  <el-icon style="margin-right: 9px">
                    <i-circle-check-filled :size="16" color="#00AA2F" />
                  </el-icon>

                  已设置
                  <div class="edit_icon1_box">
                    <img
                      class="edit_icon1"
                      @click="editPsw"
                      src="https://tagvv-1256030678.file.myqcloud.com/20221222x230a.png"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
    <el-dialog
      :close-on-click-modal="false"
      v-model="visible"
      title="修改名称"
      width="400px"
      :before-close="close"
      append-to-body
    >
      <el-input v-model.trim="name" maxlength="10" placeholder="请输入名称"></el-input>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="close">取消</el-button>
          <el-button type="primary" @click="confirm" :disabled="!name">确定</el-button>
        </span>
      </template>
    </el-dialog>

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
import { throttle } from '@/utils/tools'
import {
  selectUserInfo,
  uptUserBrandName,
  updatePasswordByPhone,
  uptUserPhoto
} from '@/api/system_setting/personal.js'
import { sendCode } from '@/api/main/home.js'
import DefaultPhoto from '@/views/system/components/default_photo/index.vue'

import md5 from 'md5'
const props = defineProps({
  infoDialog: {
    type: Object,
    default: () => {
      return {
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})

const emits = defineEmits('updateUserName')
const dialog = ref()
const show = toRef(props.infoDialog, 'show')
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
const userId = computed(() => {
  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null
  return userInfo ? userInfo.userId : null
})
const uploadUrl = ref('')
uploadUrl.value = '/api/v1/system/account/uploadImage'
const headers = ref({
  'X-Requested-With': 'XMLHttpRequest',
  token: localStorage.getItem('token')
})
const handleSuccess = res => {
  uptUserPhoto({
    userPhoto: res.data,
    userId: userId.value
  }).then(res => {
    fetchInfo()
  })
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
const visible = ref(false)
const name = ref('')
const info = ref({
  userPhoto: '',
  userBrandName: '',
  role: [],
  isPasLogin: 0,
  phone: '',
  depList: []
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
const loading = ref(false)
const fetchInfo = () => {
  loading.value = true
  selectUserInfo({
    userId: userId.value
  })
    .then(res => {
      info.value = res.data
    })
    .finally(() => {
      loading.value = false
    })
}
const editName = () => {
  name.value = info.value.userBrandName
  console.log(name.value)
  visible.value = true
}
const confirm = throttle(() => {
  uptUserBrandName({
    userId: userId.value,
    userBrandName: name.value
  }).then(res => {
    $message.success('修改成功')
    emits('updateUserName', name.value)
    localStorage.setItem('userName', name.value)
    fetchInfo()
    visible.value = false
  })
}, 700)
const close = () => {
  name.value = ''
  visible.value = false
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
const editP = () => {
  refForm.value.validate(valid => {
    if (valid) {
      updatePasswordByPhone({
        checkCode: code.value,
        phone: info.value.userPhone,
        password: md5(form.value.password)
      }).then(res => {
        $message.success('修改成功')
        cClose()
      })
    }
  })
}

const isWeChat = ref(true)
isWeChat.value = localStorage.getItem('isWeChat') === '1'
onMounted(fetchInfo)
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
</style>
