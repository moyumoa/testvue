<template>
  <div class="page_layout">
    <div class="content">
      <img class="img" src="@/assets/images/404.png" />
      <div class="tips">页面找不到了</div>
      <el-button @click="reload">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { getRoute } from '@/utils/getRoute'
function reload() {
  // location.href = '/'
  getRoute()
}
</script>

<style lang="scss" scoped>
.page_layout {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  background: #fff;
  .content {
    width: 200px;
    text-align: center;
  }
  .img {
    width: 161px;
    height: 154px;
  }
  .tips {
    font-size: 20px;
    line-height: 28px;
    color: #999;
    margin: 24px 0;
  }
}
</style>
