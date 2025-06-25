<template>
  <div class="auth_guest_batch">
    <div class="label">方法1</div>
    <div>访问链接，按提示使用抖音APP扫码授权</div>
    <div class="link_warp">
      链接
      <el-input v-model="linkUrl" disabled style="margin-left: 14px">
        <template #append>
          <span class="input_copy" v-copy="linkUrl">复制</span>
        </template>
      </el-input>
    </div>
    <div class="label label_2">方法2</div>
    <div>微信扫码，按提示使用抖音APP扫码授权</div>
    <div class="code_warp" v-loading="codeUrl ? false : true">
      <img v-if="codeUrl" :src="codeUrl" alt="" class="join_img" />
    </div>
  </div>
</template>

<script setup>
import { getBatchLifeAuthLink } from '@/api/content_center/content_guest_data.js'

import vCopy from '@/directive/copy'
const codeUrl = ref(null)
const linkUrl = ref(null)

function getBatchLifeAuthLinkFn() {
  getBatchLifeAuthLink({ height: 240, width: 240 }).then(res => {
    if (res.code === 0) {
      linkUrl.value = res.data.url
      codeUrl.value = res.data.qrCode
    }
  })
}
getBatchLifeAuthLinkFn()
</script>

<style lang="scss" scoped>
:deep(.el-input__inner) {
  color: #282c38 !important;
  border-right: unset !important;
}
.auth_guest_batch {
  font-size: 14px;
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  color: #323233;
  line-height: 20px;
  .label {
    font-size: 16px;
    font-family: PingFangSC, PingFang SC;
    font-weight: 500;
    color: #323233;
    margin-bottom: 8px;
    margin-top: 20px;
  }
  .link_warp {
    margin-top: 12px;
    display: flex;
    white-space: nowrap;
    align-items: center;
    .input_copy {
      display: inline-block;
      width: 100%;
      height: 100%;
      color: #364fcd;
      cursor: pointer;
    }
  }
  .code_warp {
    width: max-content;
    height: max-content;
    margin-top: 12px;
    box-sizing: border-box;
    width: 120px;
    background: #d8d8d8;
    height: 120px;
  }
  .join_img {
    width: 100%;
    height: 100%;
  }
}
</style>
