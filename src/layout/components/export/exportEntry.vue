<template>
  <div>
    <div class="down_entry" :style="exportEntryDis ? 'pointer-events: none;' : ''" @click="showDia">
      <p>下载中心</p>

      <img src="https://tagvv-1256030678.file.myqcloud.com/20231213ozknc.png" />
    </div>
    <!-- type: 1代表除中台外 2代表在中台 （为了初始定位） -->
    <exportCenter :showExport="showExport" @closeDia="closeDia" @status="status"></exportCenter>
  </div>
</template>
<script setup>
import exportCenter from './exportCenter.vue'
import { selectUserInfo } from '@/api/system_setting/personal.js'

import { useStore } from 'vuex'
import { throttle } from '@/utils/tools'
const store = useStore()
const exportEntryDis = computed(() => store.state.page.exportEntryDis)

const sta = ref(false)
const userId = computed(() => {
  const userInfo = localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null
  return userInfo ? userInfo.userId : null
})
const showExport = ref(false)
// 打开下载中心弹窗
const showDia = throttle(() => {
  selectUserInfo({
    userId: userId.value
  })
    .then(res => {
      localStorage.setItem('userInfo', JSON.stringify(res.data))
    })
    .finally(() => {
      showExport.value = true
    })
}, 500)
// 关闭下载中心弹窗
function closeDia(val) {
  showExport.value = val
}

function status(val) {
  sta.value = val
}
</script>
<style lang="scss" scoped>
.down_entry {
  z-index: 99;
  position: fixed;
  right: 0;
  bottom: 196px;
  width: 32px;
  height: 106px;
  background: rgba(54, 79, 205, 0.1);
  border-radius: 12px 0px 0px 12px;
  font-size: 14px;
  font-weight: 400;
  color: #364fcd;
  line-height: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  p {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    width: 18px;
  }
  img {
    margin-top: 6px;
    width: 16px;
    height: 16px;
    object-fit: contain;
    display: flex;
  }
}
</style>
