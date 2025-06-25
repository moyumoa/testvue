<template>
  <div class="activity_setting">
    <!-- 经营工具参与设置 -->
    <div class="setting_block" v-if="showDYAPP">
      <div class="setting_title">经营工具参与设置</div>
      <div class="setting_main">
        <el-form ref="managementForm" label-width="240px">
          <!-- 手机号防重设置 -->
          <el-form-item label="手机号防重设置：">
            <el-switch
              @change="changeManagementSwitch"
              v-model="data.managementForm.switchState"
              :inline-prompt="true"
              active-text="开"
              inactive-text="关"
              :active-value="1"
              :inactive-value="0"
            ></el-switch>
          </el-form-item>
          <!-- 防重范围 -->
          <el-form-item label="防重范围：">
            <el-radio-group
              v-model="data.managementForm.type"
              :disabled="data.managementFormDisabled"
            >
              <el-radio :label="0">全局限制</el-radio>
              <el-radio :label="1">单活动限制</el-radio>
            </el-radio-group>
          </el-form-item>
          <!-- 限制天数 -->
          <el-form-item>
            <div>
              <el-input-number
                v-model="data.managementForm.coolDownDays"
                :disabled="data.managementFormDisabled"
                placeholder="请输入天数"
                :min="1"
                :precision="0"
                class="coolDownDays"
                controls-position="right"
                style="width: 150px"
              />
              <span style="margin-left: 12px">天</span>
              <div class="instructions">同一手机号在该周期内只能参与一次活动</div>
            </div>
          </el-form-item>
          <!-- 解决输入框回车刷新页面问题 -->
          <el-input v-show="false"></el-input>
          <!-- 友情提示 -->
          <el-form-item label="友情提示：">
            <div class="prompt">平台员工不能参与活动</div>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <!-- 小程序弹窗设置 -->
    <div class="setting_block">
      <div class="setting_title">小程序弹窗</div>
      <div class="setting_main">
        <el-form ref="remindForm" :rules="remindRules" :model="data.remindForm" label-width="240px">
          <!-- 弹窗开关开关设置 -->
          <el-form-item label="弹窗开关：">
            <div>
              <el-switch
                @change="changeRemindSwitch"
                v-model="data.remindForm.switchState"
                :inline-prompt="true"
                active-text="开"
                inactive-text="关"
                :active-value="1"
                :inactive-value="0"
              ></el-switch>
              <div class="instructions">
                {{
                  `开启后，弹窗每日会在员工进入中心自动弹出一次${
                    systemVersion == 1 ? '' : '，点击弹窗跳转到金币商城页'
                  }`
                }}
              </div>
            </div>
          </el-form-item>
          <!-- 弹窗类型 -->
          <el-form-item label="弹窗类型：">
            <el-radio-group v-model="data.remindForm.type" :disabled="data.remindFormDisabled">
              <el-radio :label="0">正常模式</el-radio>
              <el-radio :label="1">全图模式</el-radio>
            </el-radio-group>
          </el-form-item>
          <!-- 活动弹窗图片 -->
          <el-form-item label="活动弹窗图片：" prop="popUpPic">
            <div>
              <div class="mark" style="line-height: 32px">
                上传后不再展示活动信息，请将标题、内容直接做到图上，大小500K以内png、jpg格式，建议尺寸
                316*456
              </div>
              <div class="file_box">
                <div class="upload_item_wrapper" v-for="(url, index) in data.imgList" :key="index">
                  <el-image
                    style="width: 100%; height: 100%"
                    :src="url"
                    fit="cover"
                    :preview-src-list="data.imgList"
                    :initial-index="index"
                  ></el-image>
                  <div
                    class="close"
                    @click="deleteImageDemo(index)"
                    v-if="!data.remindFormDisabled"
                  >
                    <el-icon>
                      <i-circle-close-filled />
                    </el-icon>
                  </div>
                </div>
                <el-upload
                  :disabled="data.remindFormDisabled"
                  v-loading="data.imgLoading"
                  v-if="!data.remindForm.popUpPic"
                  :show-file-list="false"
                  accept="image/jpeg, image/jpg, image/png"
                  :action="data.uploadImgUrl"
                  list-type="picture"
                  :on-success="handleImgSuccess"
                  :on-error="handleImgError"
                  :before-upload="beforeImgUploadFile"
                >
                  <div class="upload_text">
                    <img src="@/assets/images/operate/inspection_add.png" alt />
                  </div>
                </el-upload>
              </div>
            </div>
          </el-form-item>
          <template v-if="data.remindForm.type === 0">
            <!-- 弹窗标题 -->
            <el-form-item label="弹窗标题：" prop="popUpTitle">
              <el-input
                :disabled="data.remindFormDisabled"
                v-model="data.remindForm.popUpTitle"
                maxlength="12"
                placeholder="请输入弹窗标题，最多12字"
                style="width: 518px"
              />
            </el-form-item>
            <!-- 解决输入框回车刷新页面问题 -->
            <el-input v-show="false"></el-input>
            <!-- 详细说明 -->
            <el-form-item label="详细说明：">
              <el-input
                :disabled="data.remindFormDisabled"
                v-model="data.remindForm.detail"
                :rows="2"
                resize="none"
                show-word-limit
                maxlength="45"
                type="textarea"
                placeholder="请输入详细说明"
                style="width: 518px"
              />
            </el-form-item>
          </template>
        </el-form>
      </div>
    </div>
    <!-- 线索开放功能设置 - 暂时隐藏 -->
    <div class="setting_block" v-if="false">
      <div class="setting_title">线索开放能力</div>
      <div class="setting_main">
        <el-form ref="cluesForm" :rules="cluesRules" :model="data.cluesForm" label-width="240px">
          <!-- 线索推送开关设置 -->
          <el-form-item label="线索推送：">
            <div>
              <el-switch
                v-model="data.cluesForm.switchState"
                :active-value="1"
                :inactive-value="0"
                @change="changeCluesSwitch"
                :inline-prompt="true"
                active-text="开"
                inactive-text="关"
              ></el-switch>
              <div class="instructions">
                支持线索信息与品牌零售系统打通，对接后线索将实现自动化推送，若需开启对接，请先联系您的专属顾问。
              </div>
            </div>
          </el-form-item>
          <!-- 接口地址 -->
          <el-form-item label="接口地址：" prop="pushUrl">
            <el-input
              :disabled="data.cluesFormDisabled"
              v-model="data.cluesForm.pushUrl"
              placeholder="请输入接口地址"
              style="width: 518px"
            />
          </el-form-item>
          <!-- 解决输入框回车刷新页面问题 -->
          <el-input v-show="false"></el-input>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getAllConfiguration, updateConfig } from '@/api/market/operation_setting.js'
import { hasDyPro } from '@/utils/tools.js'
import { useStore } from 'vuex'

const store = useStore()
const systemVersion = computed(() => store.state.user.systemVersion)
const message = inject('$message')
const remindForm = ref(null)
const cluesForm = ref(null)
const showDYAPP = computed(() => hasDyPro())
const data = reactive({
  managementFormDisabled: false, // 经营工具参与设置表单是否可以编写
  remindFormDisabled: false, // 小程序弹窗设置的表单是否可以编写
  cluesFormDisabled: false, // 线索开放功能设置表单是否可以编写
  imgLoading: false, // 图片上传时的loading状态
  imgList: [],
  uploadImgUrl: '/api/mission/file/upload', // 图片上传地址
  // 经营工具参与设置表单
  managementForm: {
    switchState: 0, // 防重设置开关
    type: 0, // 防重范围类型 (0: 全局设置  1: 单品设置)
    coolDownDays: 1 // 限制天数
  },
  // 小程序弹窗设置的表单
  remindForm: {
    switchState: 0, // 小程序弹窗开关
    type: 0, // 弹窗类型 (0: 正常模式    1: 全图模式)
    popUpUrl: '/pages-task/gold-mall/gold-mall', // 弹窗跳转地址
    popUpPic: '', // 活动弹窗图片
    popUpTitle: '', // 弹窗标题
    detail: '' // 详细说明
  },
  // 线索开放功能设置表单
  cluesForm: {
    switchState: 0, // 线索推送开关
    pushUrl: '' // 接口地址
  },
  // 配置对应的key
  keyList: [
    'anti_duplicate_config',
    'notify_pop_up_window_config',
    'appointment_push_order_config'
  ],
  // 对应配置的id
  managementToolId: null,
  remindPopupId: null,
  cluesOpenId: null
})
// 弹窗图片的校验
const validateImg = (rule, value, callback) => {
  if (data.imgList.length > 0) {
    callback()
  } else {
    callback(new Error('请上传活动弹窗图片'))
  }
}
const remindRules = {
  popUpPic: [{ required: true, validator: validateImg, trigger: 'change' }],
  popUpTitle: [{ required: true, message: '请输入弹窗标题', trigger: 'blur' }]
}
// 接口地址的校验
const validateUrl = (rule, value, callback) => {
  if (data.cluesForm.pushUrl) {
    const regE = /http[s]{0,1}:\S*/
    if (regE.test(data.cluesForm.pushUrl)) {
      callback()
    } else {
      return callback(new Error('请输入正确的接口地址'))
    }
  } else {
    return callback(new Error('请输入接口地址'))
  }
}
const cluesRules = {
  pushUrl: [{ required: true, validator: validateUrl, trigger: 'blur' }]
}
// 弹窗设置图片上传前的回调
function beforeImgUploadFile(file) {
  const isLimit = file.size / 1024 / 1024 < 0.5
  if (!isLimit) {
    message.error('图片大小不能超过500K')
  }
  data.imgLoading = isLimit
  return isLimit
}
// 弹窗设置图片上传成功的回调
function handleImgSuccess(res) {
  data.imgLoading = false
  data.remindForm.popUpPic = res.data
  data.imgList.push(res.data)
  nextTick(() => {
    remindForm?.value?.validateField('popUpPic')
  })
}
// 弹窗设置图片上传失败的回调
function handleImgError() {}
// 删除图片的回调
function deleteImageDemo(index) {
  data.remindForm.popUpPic = ''
  data.imgList.splice(index, 1)
}
// 更改手机防重设置开关的回调
function changeManagementSwitch(val) {
  if (val) {
    data.managementFormDisabled = true
  } else {
    data.managementFormDisabled = false
  }
  const id = data.managementToolId
  const value = JSON.stringify(data.managementForm)
  update('anti_duplicate_config', value, id)
}
// 更改弹窗提醒开关的回调
function changeRemindSwitch(val) {
  if (val) {
    remindForm.value.validate(valid => {
      if (valid) {
        data.remindFormDisabled = true
        const id = data.remindPopupId
        const value = JSON.stringify(data.remindForm)
        update('notify_pop_up_window_config', value, id)
      } else {
        data.remindForm.switchState = 0
      }
    })
  } else {
    data.remindFormDisabled = false
    const id = data.remindPopupId
    const value = JSON.stringify(data.remindForm)
    update('notify_pop_up_window_config', value, id)
  }
}
// 更改线索推送开关的回调
function changeCluesSwitch(val) {
  if (val) {
    cluesForm.value.validate(valid => {
      if (valid) {
        data.cluesFormDisabled = true
        const id = data.cluesOpenId
        const value = JSON.stringify(data.cluesForm)
        update('appointment_push_order_config', value, id)
      } else {
        data.cluesForm.switchState = 0
      }
    })
  } else {
    data.cluesFormDisabled = false
    const id = data.cluesOpenId
    const value = JSON.stringify(data.cluesForm)
    update('appointment_push_order_config', value, id)
  }
}
// 获取全部配置的设置
function getConfig() {
  getAllConfiguration().then(res => {
    if (res.data && res.data.length) {
      res.data.forEach(item => {
        transformStatus(item)
      })
    }
  })
}
// 确定对应配置的设置
function transformStatus(item) {
  switch (item.key) {
    case 'anti_duplicate_config':
      data.managementForm = JSON.parse(item.value)
      data.managementFormDisabled = JSON.parse(item.value).switchState === 1
      data.managementToolId = item.id
      break
    case 'notify_pop_up_window_config':
      data.remindForm = JSON.parse(item.value)
      data.remindFormDisabled = JSON.parse(item.value).switchState === 1
      data.imgList.push(JSON.parse(item.value).popUpPic)
      data.remindPopupId = item.id
      break
    case 'appointment_push_order_config':
      data.cluesForm = JSON.parse(item.value)
      data.cluesFormDisabled = JSON.parse(item.value).switchState === 1
      data.cluesOpenId = item.id
      break
  }
}
// 更新对应的配置设置
function update(configKey, configValue, id) {
  const params = id
    ? {
        configKey,
        configValue,
        id
      }
    : {
        configKey,
        configValue
      }
  updateConfig(params).then(res => {
    console.log(res)
  })
}
// 监听选择的是正常模式还是全图模式
watch(
  () => data.remindForm.type,
  (newVal, oldVal) => {
    if (newVal === 1) {
      data.remindForm.popUpTitle = '' // 弹窗标题
      data.remindForm.detail = '' // 详细说明
    }
  }
)
// 页面挂载完成时的回调
onMounted(() => {
  getConfig()
})
</script>

<style lang="scss" scoped>
.setting_block {
  background: #ffffff;
  border-radius: 4px;
  margin-bottom: 16px;
  .setting_title {
    padding-left: 24px;
    line-height: 50px;
    font-weight: 400;
    border-bottom: 1px solid #e8e8e8;
    font-size: 18px;
    color: #323233;
  }
  .setting_main {
    padding: 32px 0;
  }
  .tip {
    color: #c0c4cc;
    font-size: 14px;
  }
  .bottom_tip {
    color: #c0c4cc;
    font-size: 14px;
    line-height: 20px;
    margin-top: 4px;
  }
  .upload_list {
    display: flex;
    flex-wrap: wrap;
    .upload_item_wrapper {
      position: relative;
      flex-shrink: 0;
      width: 120px;
      height: 120px;
      margin-right: 12px;
      margin-bottom: 12px;
      .upload_item {
        cursor: pointer;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .close {
        cursor: pointer;
        position: absolute;
        top: -10px;
        right: -10px;
        font-size: 20px;
        color: #f56c6c;
      }
    }
  }
}
.instructions {
  height: 20px;
  margin-top: 8px;
  font-size: 14px;
  font-weight: 400;
  color: #c0c4cc;
  line-height: 20px;
}
.prompt {
  line-height: 32px;
  font-size: 14px;
  font-weight: 400;
  color: #303133;
}
.mark {
  font-size: 14px;
  font-weight: 400;
  color: #909399;
  line-height: 20px;
}
.file_box {
  margin-top: 8px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  .one_file {
    width: 120px;
    height: 120px;
    margin-right: 14px;
    position: relative;

    border-radius: 4px;
    overflow: hidden;
    .file_cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
    }
    .file_action {
      opacity: 0;
      width: 120px;
      height: 120px;
      position: absolute;
      left: 0;
      top: 0;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      // padding: 0 8px 8px 0;
      background: rgba(0, 0, 0, 0.4);
      font-size: 14px;
      font-weight: 400;
      color: #ffffff;
      line-height: 20px;
      .check_icon {
        width: 120px;
        height: 40px;
        padding: 8px;
        cursor: pointer;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
      }
      .del_icon {
        position: absolute;
        bottom: 0px;
        right: 0px;
        width: 120px;
        height: 40px;
        padding: 0 8px 8px 0;
        cursor: pointer;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: flex-end;
        img {
          width: 16px;
          height: 16px;
          display: flex;
        }
      }
      &:hover {
        opacity: 1;
      }
    }
  }
  .upload_text {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-weight: 400;
    color: #303133;
    line-height: 20px;
    img {
      width: 20px;
      height: 20px;
      margin-bottom: 16px;
    }
  }
  display: flex;
  flex-wrap: wrap;
  .upload_item_wrapper {
    position: relative;
    flex-shrink: 0;
    width: 120px;
    height: 120px;
    margin-right: 12px;
    margin-bottom: 12px;
    .upload_item {
      cursor: pointer;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .close {
      cursor: pointer;
      position: absolute;
      top: -10px;
      right: -10px;
      font-size: 20px;
      color: #f56c6c;
    }
  }
}
:deep(.el-upload--picture) {
  width: 118px;
  height: 118px;
  border-radius: 0;
  border: 1px dashed #dbdfe7;
  background: #fff;
  &:hover {
    border-color: $theme_color;
  }
}
:deep(.coolDownDays .el-input__inner) {
  height: 32px;
  line-height: 32px;
}
</style>
