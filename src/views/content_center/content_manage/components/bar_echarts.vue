<template>
  <div class="top_box">
    <div class="title">高意向评论关键词TOP10</div>
    <div class="content_box" v-loading="loading">
      <div class="table_box" v-if="isNotEmpty(list)">
        <div class="table_head td_box">
          <div class="one_head first_td">排名</div>
          <div class="one_head second_td">关键词名称</div>
          <div class="one_head third_td">命中次数</div>
        </div>
        <div class="scroll_box">
          <div
            :class="{
              table_tr: true,
              td_box: true,
              one_tr: index == 0,
              two_tr: index == 1,
              three_tr: index == 2
            }"
            v-for="(item, index) in list"
            :key="index"
          >
            <div class="first_td">{{ index + 1 }}.</div>
            <div class="second_td">{{ item.keyword }}</div>
            <div class="third_td">{{ wanSliceFormat(item.hitCounts) }}</div>
          </div>
        </div>
      </div>
      <div class="xm_noneData" v-if="!loading && isEmpty(list)">
        <img src="@/assets/images/content_center/no_activity.png" alt />
        暂无数据
      </div>
    </div>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { keywordRanking } from '@/api/content_center/content_manage.js'
import { wanSliceFormat, isEmpty, isNotEmpty } from '@/utils/tools.js'
const loading = ref(true)
const list = ref(null)

const route = useRoute()
function getList() {
  keywordRanking({
    brandId: localStorage.getItem('brandInfo')
      ? JSON.parse(localStorage.getItem('brandInfo')).brandId
      : '',
    itemId: route.query.itemId || '',
    pageNo: 1,
    pageSize: 10
  })
    .then(res => {
      if (res.code === 0) {
        list.value = res.data || []
      }
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}
getList()
</script>
<style lang="scss" scoped>
.top_box {
  padding-top: 6px;
  .title {
    font-size: 14px;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
    margin-bottom: 16px;
  }
  .content_box {
    width: 100%;
    height: 394px;
    border-right: 1px solid #e8e8e8;

    padding-right: 12px;
    .scroll_box {
      width: 100%;
      height: calc(100% - 36px);
      overflow-y: overlay;
      overflow-x: hidden;
      padding-right: 12px;
    }
    .table_box {
      width: 100%;
      height: 100%;
      .td_box {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        .first_td {
          width: 16%;
          min-width: 92px;
          padding-left: 16px;
        }
        .second_td {
          width: 64%;
        }
        .third_td {
          width: 20%;
          min-width: 92px;
          padding-right: 16px;
          text-align: right;
        }
      }
      .table_head {
        padding-right: 12px;
        padding-bottom: 16px;
        font-size: 14px;
        font-weight: 400;
        color: #303133;
        line-height: 20px;
      }
      .table_tr {
        width: 100%;
        min-height: 48px;
        background: #f6f8fa;
        border-radius: 4px;
        padding: 14px 0;
        .first_td {
          font-size: 16px;
          font-weight: 600;
          color: #8f939a;
          line-height: 22px;
        }
        .second_td,
        .third_td {
          font-size: 14px;
          font-weight: 400;
          color: #303133;
          line-height: 20px;
        }
      }
      .table_tr + .table_tr {
        margin-top: 12px;
      }
      .one_tr {
        background: #fff8ed;
        .first_td {
          color: #d4a211;
        }
      }
      .two_tr {
        background: #f0f9ff;
        .first_td {
          color: #6b98b5;
        }
      }
      .three_tr {
        background: #fff4f0;
        .first_td {
          color: #ee9314;
        }
      }
    }
    .xm_noneData {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
