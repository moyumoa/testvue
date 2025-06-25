<template>
  <div class="page_layout">
    <img
      class="none_menu_icon"
      src="https://tagvv-1256030678.file.myqcloud.com/202212228idzm.png"
      alt
    />
    {{ tip }}
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const tip = ref('暂无菜单权限，请联系管理员进行开通') // 默认是无菜单权限 2 登录失败
if (route.query.type) {
  const type = route.query.type
  switch (type) {
    case '2':
      tip.value = '登录过期，请重新进入'
      break
  }
}
const tip1 = route.query.tip
if (tip1) {
  nextTick(() => {
    tip.value = decodeURIComponent(tip1)
  })
}
</script>

<style lang="scss" scoped>
.page_layout {
  position: relative;
  color: #303133;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  font-weight: 400;
  color: #8f939a;
  line-height: 22px;
  .none_menu_icon {
    width: 180px;
    height: 180px;
    object-fit: contain;
    margin-bottom: 8px;
  }
}
</style>
