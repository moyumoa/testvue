<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    title="从链接新增灵感"
    width="467px"
    custom-class="rule_setting_dialog rule_setting_form_dialog hide_footer_line hide_header_line"
  >
    <div class="content_box">
      <div class="title">目前只支持抖音</div>
      <el-input
        class="input_textarea"
        :rows="2"
        type="textarea"
        v-model.trim="value"
        resize="none"
        placeholder="请使用浏览器打开抖音并将地址栏中的地址粘贴至此处"
      ></el-input>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { useRouter } from 'vue-router'
import { resolveDyLink } from '@/api/content_center/video_library.js'
import { throttle } from '@/utils/tools.js'
// import { useStore } from 'vuex'

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
const router = useRouter()
const message = inject('$message')
const dialog = ref()
const show = toRef(props.addDialog, 'show')
const value = ref('')
const loading = ref(false)
// const store = useStore()
// 基础版只显示矩阵号等级规则，其余版本显示完整
// const systemVersion = computed(() => store.state.user.systemVersion)

// const emits = defineEmits(['showErr'])
const handleConfirm = throttle(() => {
  loading.value = true
  if (!value.value) {
    loading.value = false

    message.warning('请粘贴灵感链接')
    return
  }
  if (value.value && value.value.indexOf('http') > -1) {
    const link = 'http' + value.value.split('http')[1]
    resolveDyLink({
      link: link
    })
      .then(res => {
        if (res.code === 0) {
          if (res.data.downloadStatus === 1) {
            message.success('获取灵感成功')

            sessionStorage.setItem('library_link', JSON.stringify(res.data))
            const path = '/sumwhy_video/inspiration_library/brandVideo_detail'
            // systemVersion.value === 1 || systemVersion.value === 4 || systemVersion.value === 3
            //   ? '/sumwhy_video/inspiration_library/brandVideo_detail'
            //   : '/content_center/inspiration_library/brandVideo_detail'
            router.push({
              path: path
            })
            dialog.value.handleClose()
          } else {
            // if (res.data.downloadUrl) {
            //   emits('showErr', res.data.downloadUrl)
            //   dialog.value.handleClose()
            // }
          }
        }
        loading.value = false
      })
      .catch(() => {
        loading.value = false
      })
  } else {
    loading.value = false

    message.warning('请粘贴正确的灵感链接')
  }
}, 700)
function closeDialog() {
  dialog.value.handleClose()
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.content_box {
  padding: 0 24px 16px;
  .title {
    width: 100%;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
    padding-bottom: 14px;
    border-bottom: 1px solid #d8d8d8;
    margin-bottom: 16px;
  }
}
</style>
