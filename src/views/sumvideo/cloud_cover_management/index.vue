<template>
  <div class="sumvideo_cover_page sumvideo_page_xmy">
    <!-- 客户端 -->
    <!-- <down-load-client></down-load-client> -->
    <!-- 页面 -->
    <div>
      <xm_search
        :searchComponents="searchComponents"
        @getData="searchList"
        :useOwnReset="true"
        @reset="resetSearch"
      />
      <div class="page_bottom">
        <div class="bottom_btn">
          <el-button type="primary" @click="createCoverFun">制作云封面</el-button>
        </div>
        <coverCard
          :tableForm="tableForm"
          @loadSwiperFun="loadSwiperFun"
          @resetList="searchList"
          @updateOneInfo="updateOneInfo"
          origin="cloud_cover_management"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
// import downLoadClient from '@/views/sumvideo/components/downloadClient.vue'
import coverCard from './components/cover_card.vue'
import queryCoverList from './js/cover_page.js'
const {
  searchComponents,
  tableForm,
  searchList,
  resetSearch,
  loadSwiperFun,
  updateOneInfo,
  createCoverFun
} = queryCoverList('cloud_cover_management')
resetSearch()
</script>
<style lang="scss" scoped>
@import './scss/cover_page.scss';
</style>
