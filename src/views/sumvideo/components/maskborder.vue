<template>
  <div :class="{ mask: true, envMaskLeft: isHideLeftMenu, envMaskTop: isHideTopMenu }">
    <div class="mask_left"></div>
    <div class="mask_top"></div>
    <div class="mask_right"></div>
    <div class="mask_bottom" :style="{ height: props.bottomHeight }"></div>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
const props = defineProps({
  bottomHeight: {
    type: String,
    default: '10px'
  }
})
const store = useStore()
const isHideLeftMenu = store.getters.isHideLeftMenu
const isHideTopMenu = store.getters.isHideTopMenu
</script>

<style scoped>
.mask {
}
.mask_left {
  position: fixed;
  top: 0;
  left: 0;
  width: 226px;
  height: 100vh;
  background: black;
  opacity: 0.5;
  z-index: 9999;
}
.mask_top {
  position: fixed;
  top: 0;
  left: 226px;
  width: calc(100vw - 226px);
  height: 110px;
  background: black;
  opacity: 0.5;
  z-index: 9999;
}
.mask_right {
  position: fixed;
  top: 110px;
  right: 0;
  width: 16px;
  height: calc(100vh - 110px);
  background: black;
  opacity: 0.5;
  z-index: 9999;
}
.mask_bottom {
  position: fixed;
  left: 226px;
  bottom: 0px;
  width: calc(100vw - 242px);
  height: 10px;
  background: black;
  opacity: 0.5;
  z-index: 10;
}
.envMaskLeft .mask_left {
  width: 16px;
}
.envMaskLeft .mask_top {
  left: 16px;
  width: calc(100vw - 16px);
}
.envMaskLeft .mask_bottom {
  left: 16px;
  width: calc(100vw - 32px);
}
.envMaskTop .mask_top {
  display: none;
}
.envMaskTop .mask_right {
  top: 0;
  height: calc(100vh);
}
</style>
