<template>
  <div class="no_activity">
    <img src="@/assets/images/content_center/no_activity.png" alt="" class="no_img" />
    <p class="tips1">本月暂无活动规划</p>
    <p class="tips2">点击日历上方按钮创建活动</p>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.no_activity {
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border-radius: 4px;
  background: #fff;
  .no_img {
    width: 70px;
    height: 70px;
  }
  .tips1 {
    font-size: 16px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #303133;
    line-height: 22px;
    margin-top: 16px;
    margin-bottom: 12px;
  }
  .tips2 {
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
  }
}
</style>
