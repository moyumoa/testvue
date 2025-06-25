<template>
  <div class="content_box">
    <div class="content1">
      系统暂未获取到“{{ info.authAccountName || '' }}”的抖音号，无法开启{{
        origin == 'authPublish' ? '发布能力权限' : '线索权限'
      }}
    </div>
    <div class="content2">
      <div style="font-weight: bold; color: rgba(48, 49, 51, 1)">【解决方法】</div>
      <p>1、请打开抖音APP，发布一条新的视频</p>

      <p>
        2、视频发布成功后，请等待1分钟再点击下方“我已发布”按钮，系统将进行抖音号获取（24小时内2次机会）
      </p>
      <p>3、未获取到之前，请勿删除或隐藏视频</p>
      <p>此外，你可以等待系统自动定时获取（每日0点、12点、20点）</p>
    </div>
    <el-button :loading="loading" class="content_btn" @click="showRemindFun" type="primary">
      我已发布
    </el-button>
  </div>
</template>
<script setup>
import { ElMessageBox } from 'element-plus'
import { initUidByOpenId } from '@/api/system_setting/authorization'
import { throttle } from '@/utils/tools'

const props = defineProps({
  origin: {
    type: String,
    default: 'authClue'
  }, // 来源 默认是线索授权 authPublish 发布能力授权
  info: {
    type: Object,
    default: () => {
      return {
        authAccountName: ''
      }
    }
  }
})
const { info, origin } = toRefs(props)
const loading = ref(false)
const message = inject('$message')
const emits = defineEmits(['updateStatus'])
const showRemindFun = throttle(() => {
  ElMessageBox.confirm('确认已发布视频？', '开启线索权限', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
    customClass: 'drawer_systemBox drawer_systemBox_dialog'
  })
    .then(() => {
      loading.value = true
      initUidByOpenId({ dyOpenId: info.value.openId })
        .then(res => {
          if (res.code === 0) {
            if (res.data) {
              emits('updateStatus', 1, res.data)
              message.success('获取成功')
            }
          } else {
            loading.value = false
          }
        })
        .catch(() => {
          loading.value = false
        })
    })
    .catch(() => {})
}, 500)
</script>
<style lang="scss" scoped>
.content_box {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  .content1 {
    padding-top: 6px;
    width: 100%;
    font-size: 14px;
    font-weight: 400;
    color: #fd2d54;
    line-height: 20px;
  }
  .content2 {
    width: 100%;
    margin-top: 16px;
    font-size: 14px;
    font-weight: 400;
    color: #606266;
    line-height: 20px;
    p {
      margin-top: 6px;
    }
  }
  .content_btn {
    margin-top: 28px;
    width: 180px;
  }
}
</style>
