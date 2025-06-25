<template>
  <div class="loading_page">
    <div class="loading">
      <img src="/public/loading.gif" alt="" />
    </div>
  </div>
</template>
<script setup>
import { useRouter } from 'vue-router'
import { getRoute } from '@/utils/getRoute'
const router = useRouter()

const judgeHWork = inject('$judgeHWork')
onMounted(() => {
  if (
    localStorage.getItem('brandInfo') &&
    localStorage.getItem('token') &&
    localStorage.getItem('userInfo')
  ) {
    getRoute()
  } else {
    if (judgeHWork()) {
      router.push({
        path: '/loginTip',
        query: {
          type: 2,
          envSource: localStorage.getItem('envSource') || 'hwork'
        }
      })
    } else {
      router.push('/login')
    }
  }
})
</script>
<style lang="scss" scoped>
.loading_page {
  width: 100vw;
  height: 100vh;

  .loading {
    position: absolute;
    font-size: 50px;
    line-height: 50px;
    top: 50%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%);

    img {
      width: 60px;
      height: 60px;
    }
  }
}
</style>
