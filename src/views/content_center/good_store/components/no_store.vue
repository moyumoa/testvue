<template>
  <div class="no_store">
    <img class="img1" src="@/assets/images/content_center/shop.png" alt="" />
    <div class="mark">当前未授权抖店需授权抖店才能使用该模块</div>
    <div class="btn_box">
      <img class="img2" src="@/assets/images/content_center/dd.png" alt="" />
      <el-link type="primary" class="" @click="toAuth">
        去授权
        <img src="@/assets/images/content_center/right_blue.png" alt="" />
      </el-link>
    </div>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'
import { useRouter } from 'vue-router'
const router = useRouter()
// 是否在飞书客户端
const isFlyBook = ref(true)
const isWeChat = ref(true)
isFlyBook.value = localStorage.getItem('isFlyBook') === '1'
isWeChat.value = localStorage.getItem('isWeChat') === '1'

const isBrowser = localStorage.getItem('is_browser') === '1'
// 授权管理
const toAuth = throttle(() => {
  if (isBrowser) {
    router.push('/system_manage/tripartitlePlatform_auth?type=dy')
  } else {
    window.open(`${location.origin}/system_manage/tripartitlePlatform_auth?type=dy`)
  }
}, 300)
</script>
<style lang="scss" scoped>
.no_store {
  background: #fff;
  border-radius: 4px;
  padding: 164px 0 148px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .img1 {
    width: 72px;
    height: 64px;
    object-fit: cover;
    display: flex;
  }
  .mark {
    font-size: 16px;
    font-weight: 400;
    color: #909399;
    line-height: 22px;
    margin: 24px 0 48px;
  }
  .btn_box {
    width: 100%;

    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    .img2 {
      width: 69px;
      height: 24px;
      object-fit: cover;
      display: flex;
      margin-right: 24px;
    }

    :deep(.el-link--inner) {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      font-size: 14px;
      font-weight: 400;
      color: #364fcd;
      line-height: 20px;
      img {
        width: 12px;
        height: 12px;
        margin-left: 2px;
        display: flex;
      }
    }
  }
}
</style>
