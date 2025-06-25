<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="开启线索权限"
      width="420px"
      custom-class="rule_setting_dialog show_header_line "
      :before-close="handleClose"
    >
      <div class="dialog_content" v-loading="$data.loading">
        <!-- 正常授权界面 -->
        <template v-if="showStatus == 1">
          <!-- tab -->
          <div class="tab_box" v-if="false">
            <div
              @click="changeTab(item.value)"
              :class="{ one_tab: true, choose_tab: $data.chooseTab === item.value }"
              v-for="(item, index) in $data.tabList"
              :key="index"
              :style="disabled ? 'cursor: no-drop;' : ''"
            >
              {{ item.label || '' }}
            </div>
          </div>
          <div class="tab_tip">
            {{
              $data.chooseTab === 1
                ? '请在下方输入线索版企业号绑定的手机号'
                : '请使用线索版企业号抖音APP扫码'
            }}
          </div>
          <!-- 手机号验证码 -->
          <phoneCode
            :info="info"
            v-model:disabled="disabled"
            @updateStatus="updateStatus"
            v-if="$data.chooseTab === 1"
          />
          <!-- 二维码 -->
          <qrCode :info="info" v-model:disabled="disabled" @updateStatus="updateStatus" v-else />
        </template>
        <!-- 授权成功 -->
        <div class="authSuccess_box" v-if="showStatus == 2">
          <img src="https://tagvv-1256030678.file.myqcloud.com/202308285x4mf.png" alt="" />

          <div class="title">恭喜你！开启成功</div>
        </div>
        <!-- 没有UID -->
        <authNoUID :info="info" @updateStatus="updateStatus" v-if="showStatus == 3" />
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import authNoUID from './authClue_components/authClue_NoUID.vue'
import qrCode from './authClue_components/authClue_qrCode.vue'
import phoneCode from './authClue_components/authClue_phoneCode.vue'
import { throttle } from '@/utils/tools'

const props = defineProps({
  authDialog: {
    type: Object,
    default: () => {
      return {
        info: {},
        show: true // 是否显示弹窗
      }
    },
    required: true
  }
})
const disabled = ref(false) // 是否授权中
const info = ref({})
const dialog = ref()
const show = toRef(props.authDialog, 'show')
const useRefresh = ref(null) // 是否需要刷新页面
const showStatus = ref(null) // 1 正常授权界面[手机号验证码和二维码] 2 授权成功 3没有UID
// 授权弹窗关闭时，清空定时器
function handleClose(done) {
  if (useRefresh.value) {
    emits('updateFun')
  }
  done()
}
const $data = reactive({
  loading: true,
  tabList: [
    {
      label: '手机号验证码',
      value: 1
    },
    {
      label: '二维码',
      value: 2
    }
  ],
  chooseTab: 2
})
// 选择类型
const changeTab = throttle(e => {
  // 如果授权中，就禁止切换
  if (disabled.value) {
    return
  }
  $data.chooseTab = e
})

const emits = defineEmits(['updateFun'])
// 更新页面状态
function updateStatus(e, uid) {
  showStatus.value = e
  if (e === 2 || e === 1) {
    useRefresh.value = e
  }
  if (uid) {
    info.value.originUid = uid
  }
}
onMounted(() => {
  if (props.authDialog.info) {
    info.value = JSON.parse(JSON.stringify(props.authDialog.info))
    if (info.value.originUid) {
      showStatus.value = 1
    } else {
      showStatus.value = 3
    }
  }
  nextTick(() => {
    $data.loading = false
  })
})
</script>
<style lang="scss" scoped>
.dialog_content {
  width: 100%;
  padding: 16px;
  min-height: 321px;
}
.tab_box {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  .one_tab {
    width: 104px;
    height: 32px;
    background: #eaebed;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    color: #8f959e;
  }
  .one_tab:first-child {
    border-radius: 8px 0px 0px 8px;
  }
  .one_tab:last-child {
    border-radius: 0px 8px 8px 0px;
  }
  .choose_tab {
    background: #393b45;
    font-size: 12px;
    font-weight: 600;
    color: #ffffff;
  }
}
.tab_tip {
  font-size: 12px;
  font-weight: 400;
  color: #8f959e;
  line-height: 17px;
  width: 100%;
  text-align: center;
  margin: 20px 0 28px;
}
.authSuccess_box {
  width: 100%;
  height: 289px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  img {
    width: 56px;
    height: 56px;
    object-fit: contain;
  }

  .title {
    width: 100%;
    text-align: center;
    margin-top: 16px;
    margin-bottom: 80px;
    font-size: 16px;
    font-weight: 400;
    color: #1f2329;
    line-height: 24px;
  }
}
</style>
