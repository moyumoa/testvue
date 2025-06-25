<template>
  <div class="good_store" v-loading="loading">
    <haveStore v-if="shopList.length > 1 && !loading" :shopList="shopList"></haveStore>
    <noStore v-if="shopList.length <= 1 && !loading"></noStore>
  </div>
</template>
<script setup>
import { queryAllShop } from '@/api/content_center/good_store.js'
import haveStore from './components/have_store.vue'
import noStore from './components/no_store.vue'
defineComponent(haveStore, noStore)
const shopList = ref([]) // 店铺列表
const loading = ref(true) // 加载动画
// 获取是否授权抖店
function getHaveStore() {
  queryAllShop()
    .then(res => {
      if (res.code === 0) {
        const list = res.data || []

        list.unshift({
          shopName: '全部',
          shopId: -1
        })
        shopList.value = list
      }
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}
getHaveStore()
</script>
<style lang="scss" scoped>
@import '../components/css/page.scss';
.good_store {
  min-height: 100px;
}
</style>
