<template>
  <div class="diy_wrapper g_bg">
    <g-tabs :data="tabs" v-model:current="currentTab" underline :before-change="change" />
    <div style="height: calc(100% - 62px); margin-top: 16px">
      <component :is="tabs.find(i => i.value === currentTab).page" @edit="onEdit" />
    </div>
  </div>
</template>
<script setup>
import GTabs from '@/views/system/components/g_tabs/index.vue'
import { getAppAuth } from '@/api/system_setting/authorization.js'
import Home from './home.vue'
import Brand from './brand.vue'
import Nav from './nav.vue'
import Float from './float.vue'
import { ElMessageBox } from 'element-plus'
import router from '@/router/index.js'

const currentTab = ref('home')
const tabs = reactive([
  { label: '首页', value: 'home', page: markRaw(Home) },
  { label: '品牌号', value: 'brand', page: markRaw(Brand) },
  { label: '导航', value: 'menu', page: markRaw(Nav) },
  { label: '悬浮窗', value: 'float', page: markRaw(Float) }
])

// 是否修改
const isEdit = ref(false)
const onEdit = val => {
  isEdit.value = val
}
const change = next => {
  if (isEdit.value) {
    ElMessageBox.confirm('修改的内容未保存，是否离开?', '确认修改', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      isEdit.value = false
      next()
    })
  } else {
    next()
  }
}
router.beforeRouteLeave = (to, from, next) => {
  if (isEdit.value) {
    ElMessageBox.confirm('修改的内容未保存，是否离开?', '确认修改', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      next()
    })
  } else {
    next()
  }
}

// 是否授权
const isAuth = ref(false)
provide('auth', isAuth)
const getAuth = () => {
  getAppAuth({}).then(res => {
    isAuth.value = res.data.records.length > 0
  })
}
getAuth()
</script>

<style lang="scss" scoped>
* {
  box-sizing: border-box;
}
.diy_wrapper {
  padding: 22px 0 0 24px;
  height: 100%;
}
</style>
