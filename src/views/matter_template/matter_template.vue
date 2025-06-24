<template>
  <div class="home_wrapper">
    <div class="head_wrap">
      <h4 class="name">{{ userPhone }}</h4>
      <img class="logo" src="@/assets/imgs/video-icon.png" alt="" />
    </div>
    <!-- 主体区域 -->
    <div class="matter-container">
      <div class="matter-select">
        <div class="matter-select-top">
          <div class="matter-select-btn">
            <el-button class="matter-btn-item" type="primary"
              >选择素材</el-button
            >
            <el-button class="matter-btn-item" type="primary"
              >选择文件夹</el-button
            >
          </div>
          <div class="matter-select-right">
            <span>上传到</span>
            <div>11</div>
            <div>
              <el-switch
                v-model="tagSwitch"
              >
              </el-switch
              >
              <span>智能打标</span>
            </div>
          </div>
        </div>
        <div class="matter-select-btm">
          支持批量添加，图片支持：jpg/jpeg/png/gif，视频支持：mp4/mov，音频支持：mp3。
        </div>
      </div>
      <div class="matter-table">列表</div>
      <div class="matter-btn">按钮</div>
    </div>
  </div>
</template>
<script>
import electronStore from "electron-store";

const _store = new electronStore();
const { ipcRenderer } = window.require("electron");

export default {
  data() {
    return {
      tagSwitch: false, //打标开关
      userPhone: _store.get("USERPHONE"),
    };
  },
  mounted() {
    // 在组件加载完成后发送事件到主进程调整窗口大小
    ipcRenderer.send("resize-window", { width: 1000, height: 600 });
  },
  beforeDestroy() {
    // 组件销毁前恢复窗口大小
    ipcRenderer.send("resize-window", { width: 440, height: 460 });
  },
  methods: {},
};
</script>
<style lang="less" scoped>
@import "./matter_template.less";
</style>
