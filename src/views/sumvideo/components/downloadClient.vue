<template>
  <div v-if="!judgeHWork()" @click="downloadClient" class="top_right">
    <div class="top_right_img">
      <img
        src="https://tagvvcloud-material-center-prod.oss-cn-hangzhou.aliyuncs.com/sumvideo_web/client_icon.png"
      />
    </div>
    <div class="top_right_text">客户端</div>
  </div>
</template>

<script setup>
import { ElMessageBox, ElMessage } from 'element-plus'
import { useStore } from 'vuex'
const store = useStore()
const sumvideoDownloadUrl = computed(() => store.state.user.sumvideoDownloadUrl)

const judgeHWork = inject('$judgeHWork')

// 下载客户端
function downloadClient() {
  console.log('下载地址', sumvideoDownloadUrl.value)
  if (sumvideoDownloadUrl.value) {
    ElMessageBox.confirm('确认下载客户端?', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'drawer_systemBox'
    }).then(async () => {
      const a = document.createElement('a')
      a.download = 'SumVideo.exe'
      a.href = sumvideoDownloadUrl.value
      a.click()
      a.remove()
    })
  } else {
    ElMessage.warning('暂未找到客户端地址，请联系管理员')
  }
}
</script>

<style lang="scss" scoped>
.top_right {
  position: absolute;
  top: 10px;
  right: 16px;
  min-width: 70px;
  height: 28px;
  cursor: pointer;
  z-index: 1;
  display: flex;
  vertical-align: middle;
  align-items: center;
  padding: 0px 8px;

  .top_right_img {
    img {
      width: 20px;
      height: 20px;
    }
  }

  .top_right_text {
    line-height: 20px;
    font-weight: 400;
    color: #303133;
    margin-left: 4px;
    cursor: pointer;
  }
}

.top_right:hover {
  background: #ebecee;
  border-radius: 4px;
}
</style>
