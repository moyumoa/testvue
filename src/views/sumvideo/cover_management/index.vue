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
          <el-button type="primary" @click="createCoverFun">制作企业封面</el-button>
        </div>
        <coverCard
          :tableForm="tableForm"
          @loadSwiperFun="loadSwiperFun"
          @resetList="searchList"
          @updateOneInfo="updateOneInfo"
          origin="cover_management"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
// import downLoadClient from '@/views/sumvideo/components/downloadClient.vue'
import coverCard from '../cloud_cover_management/components/cover_card.vue'
import queryCoverList from '../cloud_cover_management/js/cover_page.js'
const {
  searchComponents,
  tableForm,
  searchList,
  resetSearch,
  loadSwiperFun,
  updateOneInfo,
  createCoverFun
} = queryCoverList('cover_management')
resetSearch()
</script>
<style lang="scss" scoped>
@import '../cloud_cover_management/scss/cover_page.scss';
</style>
