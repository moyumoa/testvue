<template>
  <div class="template_select">
    <div class="head_wrap">
      <h4 class="name">{{ userPhone }}</h4>
      <img class="logo" src="@/assets/imgs/video-icon.png" alt="" />
    </div>
    <div class="template-contains">
      <div
        class="template-item"
        @click="matterTemplate()"
        @mouseenter="isHover = true"
        @mouseleave="isHover = false"
      >
        <img
          :src="
            isHover
              ? require('@/assets/imgs/matter_active.png')
              : require('@/assets/imgs/matter.png')
          "
          alt=""
        />
        <div>传素材</div>
      </div>
      <div
        class="template-item"
        @click="videoTemplate()"
        @mouseenter="videoHover = true"
        @mouseleave="videoHover = false"
      >
        <img :src="videoHover ? require('@/assets/imgs/video_active.png'):require('@/assets/imgs/video.png')" alt="" />
        <div>传视频模板</div>
      </div>
    </div>
  </div>
</template>
<script>
import electronStore from "electron-store";
const { ipcRenderer } = window.require ? window.require("electron") : require("electron");
const _store = new electronStore();

export default {
  data() {
    return {
      videoHover:false,
      isHover: false,
      userPhone: _store.get("USERPHONE"),
    };
  },
  mounted() {
    ipcRenderer.send("resize-window", { width: 1000, height: 600 });
  },
  beforeDestroy() {
    ipcRenderer.send("resize-window", { width: 440, height: 460 });
  },
  methods: {
    matterTemplate() {
      this.$router.push({ name: "matter_template" });
    },
    // 传视频模板
    videoTemplate() {
      this.$router.push({ name: "home" });
    },
  },
};
</script>
<style lang="less" scoped>
@import "./template_select.less";
</style>
