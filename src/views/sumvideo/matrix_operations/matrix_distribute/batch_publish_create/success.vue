<template>
  <div class="create_batch_success">
    <fourthStep :title="title" :canClick="false" @closeFun="closePage" />
    <div class="close_btn_warp">
      <el-button type="primary" @click="closePage">关闭页面</el-button>
    </div>
  </div>
</template>

<script setup>
import fourthStep from '@/views/sumvideo/components/step/fourth_step.vue'

import { throttle } from '@/utils/tools.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const title = `发布任务已提交，请至<span style="font-weight: 600;">【批量发布】</span>列表查看发布任务进度`

const closePage = throttle(function () {
  router.go(-2)
}, 700)
</script>

<style lang="scss" scoped>
.create_batch_success {
  height: 100%;
  background: #fff;
  border-radius: 4px;
  position: relative;
  .close_btn_warp {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 80px;
    background: #ffffff;
    box-shadow: 0px -2px 8px 0px rgba(103, 103, 103, 0.15);
    border-radius: 0px 0px 4px 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 12;
  }
}
</style>
