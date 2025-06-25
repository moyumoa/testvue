<template>
  <div class="setting">
    <el-form label-width="80px">
      <el-form-item label="直播录屏">
        <el-switch
          v-model="isOpen"
          :before-change="beforeLiveRecordSettingChange"
          @change="saveSetting"
          active-text="开"
          inactive-text="关"
          inline-prompt
        ></el-switch>
        <div class="live-tips">
          <el-icon style="margin-right: 5px"><i-warning /></el-icon>
          支持查看近30天内的直播回放
        </div>
      </el-form-item>
    </el-form>
    <!--    <el-form label-width="108px">-->
    <!--      <el-form-item label="直播弹幕获取">-->
    <!--        <el-switch v-model="isSaveLiveComment" active-text="开" inactive-text="关" inline-prompt-->
    <!--                   :before-change="beforeChange"-->
    <!--                   @change="saveLiveCommentSetting(1)"></el-switch>-->
    <!--        <div class="live-tips">-->
    <!--          <el-icon style="margin-right: 5px"><i-warning /></el-icon>-->
    <!--          开启后将实时抓取直播间发送高意向关键词弹幕的用户，收录在用户运营中心-潜客管理中-->
    <!--        </div>-->
    <!--      </el-form-item>-->
    <!--    </el-form>-->
    <!--    <el-form label-width="108px">-->
    <!--      <el-form-item label="视频评论获取">-->
    <!--        <el-switch v-model="isSaveVideoComment" active-text="开" inactive-text="关" inline-prompt-->
    <!--                   :before-change="beforeChangeVideo"-->
    <!--                   @change="saveLiveCommentSetting(2)"></el-switch>-->
    <!--        <div class="live-tips">-->
    <!--          <el-icon style="margin-right: 5px"><i-warning /></el-icon>-->
    <!--          开启后将实时获取视频评论中发送高意向关键词的用户，收录在用户运营中心-潜客管理中-->
    <!--        </div>-->
    <!--      </el-form-item>-->
    <!--    </el-form>-->
    <!--    <el-form label-width="108px">-->
    <!--      <el-form-item label="私信获取">-->
    <!--        <el-switch v-model="isSaveIm" active-text="开" inactive-text="关" inline-prompt-->
    <!--                   :before-change="beforeChangeIm"-->
    <!--                   @change="saveLiveCommentSetting(3)"></el-switch>-->
    <!--        <div class="live-tips">-->
    <!--          <el-icon style="margin-right: 5px"><i-warning /></el-icon>-->
    <!--          开启后将实时获取抖音号的私信消息-->
    <!--        </div>-->
    <!--      </el-form-item>-->
    <!--    </el-form>-->
  </div>
  <err_dialog v-if="actionDialog.show" :actionDialog="actionDialog"></err_dialog>
</template>

<script setup>
import api from '@/api/content_center/content_matrix.js'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { isEmpty, isNotEmpty } from '@/utils/tools'
const route = useRoute()
const router = useRouter()
const message = inject('$message')
// 操作失败的弹窗
const actionDialog = reactive({
  show: false,
  info: {}
})
// 录屏失败的操作
function recordErrFun(info) {
  actionDialog.info = info
  actionDialog.show = true
}
const isOpen = ref(false)
/**
 * 2023-01-30 16:04:26 新增直播弹幕控制
 * @type {Ref<UnwrapRef<boolean>>}
 */
const isSaveLiveComment = ref(false)
const isSaveVideoComment = ref(false)
const isSaveIm = ref(false)
const beforeLiveRecordSettingChange = () => {
  return ElMessageBox.confirm(`确定${isOpen.value ? '关闭' : '开启'}？`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
}
// const beforeChange = () => {
//   return ElMessageBox.confirm(`确定${isSaveLiveComment.value ? '关闭' : '开启'}？`, {
//     confirmButtonText: '确定',
//     cancelButtonText: '取消',
//     type: 'warning'
//   })
// }
// const beforeChangeVideo = () => {
//   return ElMessageBox.confirm(`确定${isSaveVideoComment.value ? '关闭' : '开启'}？`, {
//     confirmButtonText: '确定',
//     cancelButtonText: '取消',
//     type: 'warning'
//   })
// }
// const beforeChangeIm = () => {
//   return ElMessageBox.confirm(`确定${isSaveIm.value ? '关闭' : '开启'}？`, {
//     confirmButtonText: '确定',
//     cancelButtonText: '取消',
//     type: 'warning'
//   })
// }
function saveSetting() {
  return new Promise(resolve => {
    api
      .liveRecordControl({
        isOpen: isOpen.value,
        isOpenAll: false,
        openIds: [route.query.openId]
      })
      .then(res => {
        if (res.code === 0) {
          if (isEmpty(res.data.errorMsg) && isEmpty(res.data.unAuthList)) {
            message.success('设置成功')
          } else {
            isOpen.value = !isOpen.value
            if (isNotEmpty(res.data.unAuthList)) {
              ElMessageBox.confirm('请先授权抖音发布能力，才能开启录制', '开启失败', {
                confirmButtonText: '去授权',
                cancelButtonText: '取消',
                type: '',
                customClass: 'drawer_systemBox4'
              })
                .then(res1 => {
                  //  去授权页面
                  console.log('去授权', res1)
                  const isBrowser = localStorage.getItem('is_browser') === '1'

                  if (isBrowser) {
                    router.push({
                      path: '/system_manage/matrixNumber_auth',
                      query: { type: 'account', id: res.data.unAuthList[0] || '' }
                    })
                  } else {
                    window.open(
                      `${location.origin}/system_manage/matrixNumber_auth?type=account&id=${
                        res.data.unAuthList[0] || ''
                      }`
                    )
                  }
                })
                .catch(err1 => {
                  console.log('err', err1)
                })
            } else {
              recordErrFun({
                title: '开启失败',
                msg: res.data.errorMsg
              })
            }
          }
        } else {
          message.error('设置失败')
          isOpen.value = !isOpen.value
        }
        resolve()
      })
      .catch(err => {
        if (err && err.msg) {
          recordErrFun({
            title: '开启失败',
            msg: err.msg
          })
          isOpen.value = !isOpen.value
        }
        resolve()
      })
  })
}
// eslint-disable-next-line no-unused-vars
function saveLiveCommentSetting(type) {
  let val = null
  if (type === 1) {
    val = isSaveLiveComment
  }
  if (type === 2) {
    val = isSaveVideoComment
  }
  if (type === 3) {
    val = isSaveIm
  }
  return new Promise(resolve => {
    api
      .liveCommentControl({
        type: type,
        isOpen: val.value,
        isOpenAll: false,
        openIds: [route.query.openId]
      })
      .then(res => {
        if (res.code === 0) {
          if (val.value) {
            message.success('开启成功')
          }
        } else {
          // message.error('开启失败')
          val.value = !val.value
        }
        resolve()
      })
      .catch(err => {
        if (err && err.msg) {
          // message.error(err.msg)
          recordErrFun({
            title: '开启失败',
            msg: err.msg
          })
        }
        val.value = !val.value
        resolve()
      })
  })
}
function getSetting() {
  api
    .getMatrixInfo({
      openId: route.query.openId
    })
    .then(res => {
      isOpen.value = res.data.isRecord === 1
      isSaveLiveComment.value = res.data.isSaveLiveComment === 1
      isSaveVideoComment.value = res.data.isSaveVideoComment === 1
      isSaveIm.value = res.data.isSaveIm === 1
    })
}

onMounted(() => {
  getSetting()
})
</script>

<style lang="scss" scoped>
.setting {
  background: #fff;
  border-radius: 5px;
  padding: 24px;
  .live-tips {
    display: flex;
    align-items: center;
    color: #909399;
    margin-left: 15px;
  }
}
</style>
