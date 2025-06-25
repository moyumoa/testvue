<template>
  <div class="clue_mode">
    <div class="clue_mode_left">
      <!--  数据总览    -->
      <DataOverview></DataOverview>
      <div class="clue_mode_left_container">
        <!--  视频排行榜     -->
        <VideoRank style="height: 531px; margin-right: 16px"></VideoRank>
        <!--  矩阵指数榜     -->
        <AccountIndex style="height: 531px"></AccountIndex>
      </div>
    </div>
    <div class="clue_mode_right">
      <!--  平台热词    -->
      <!--      <WordCloud></WordCloud>-->
      <!--  行业热点    -->
      <HotTrends type="industry" key="industry"></HotTrends>
      <!--  平台热点    -->
      <HotTrends></HotTrends>
    </div>
  </div>
</template>

<script setup>
// 数据概览
import DataOverview from '@/views/content_center/content_overview/components/data_overview.vue'
// 视频排行榜
import VideoRank from '@/views/content_center/content_overview/components/video_rank.vue'
// 矩阵指数
import AccountIndex from '@/views/content_center/content_overview/components/account_index.vue'
// 平台热词
// import WordCloud from '@/views/content_center/content_overview/components/word_cloud.vue'
// 平台热点
import HotTrends from '@/views/content_center/content_overview/components/hot_trends.vue'
</script>

<style lang="scss" scoped>
.clue_mode {
  display: flex;
  padding-bottom: 16px;

  .clue_mode_left {
    flex: 3.5;
    margin-right: 16px;

    .clue_mode_left_container {
      display: flex;
    }
  }

  .clue_mode_right {
    flex: 1;
  }
}
</style>
