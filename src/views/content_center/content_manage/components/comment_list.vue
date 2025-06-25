<template>
  <div class="comment_list">
    <div class="tips">评论列表（{{ wanSliceFormat(commentForm.page.total) || 0 }}）</div>
    <div class="comment_box" v-loading="commentForm.loading && commentForm.page.pageNo == 1">
      <div class="has_box" v-if="commentForm.commentslist.length">
        <div
          class="all_box"
          :infinite-scroll-delay="500"
          v-infinite-scroll="loadFun"
          :infinite-scroll-distance="50"
          :infinite-scroll-immediate="false"
          :infinite-scroll-disabled="commentForm.commentslist.length >= commentForm.page.total"
        >
          <div v-for="(item, index) in commentForm.commentslist" :key="index" class="one_box">
            <div class="content">
              <div class="content_tip" v-if="item.keyword">{{ item.keyword }}</div>
              {{ item.content || '--' }}
            </div>
            <div class="time">{{ item.commentTime || '--' }}</div>
          </div>
          <div class="xm_pullUpToLoadMore">
            <img
              src="/public/loading.gif"
              v-if="commentForm.loading && commentForm.page.pageNo > 1"
              alt=""
            />
            {{
              commentForm.loading
                ? commentForm.page.pageNo === 1
                  ? ''
                  : '加载中...'
                : commentForm.commentslist.length >= commentForm.page.total
                ? commentForm.commentslist.length > 10
                  ? '已经到底了~'
                  : ''
                : '上拉加载更多~'
            }}
          </div>
        </div>
      </div>
      <div
        class="xm_noneData"
        v-if="
          !commentForm.loading && !(commentForm.commentslist && commentForm.commentslist.length > 0)
        "
      >
        <img src="@/assets/images/content_center/no_activity.png" alt />
        暂无数据
      </div>
    </div>
  </div>
</template>

<script>
import { videoCommentListByItemId } from '@/api/content_center/content_manage.js'
import { wanSliceFormat, dateFormat } from '@/utils/tools.js'
import { useRoute } from 'vue-router'
export default {
  name: 'comment_list',
  setup(props) {
    const commentForm = reactive({
      loading: false,
      commentslist: [],
      page: {
        pageNo: 1,
        pageSize: 20,
        total: 0
      }
    })
    onMounted(() => {
      getVideoAnalysis()
    })
    const route = useRoute()

    function loadFun() {
      commentForm.loading = true
      commentForm.page.pageNo++
      getVideoAnalysis()
    }
    //  视频评论列表
    function getVideoAnalysis() {
      commentForm.loading = true
      videoCommentListByItemId({
        brandId: localStorage.getItem('brandInfo')
          ? JSON.parse(localStorage.getItem('brandInfo')).brandId
          : '',
        itemId: route.query.itemId || '',
        orderSetting: '',
        pageNo: commentForm.page.pageNo, // 页码
        pageSize: commentForm.page.pageSize, // 每页条数
        searchCount: true
      })
        .then(res => {
          if (res.code === 0) {
            if (commentForm.page.pageNo === 1) {
              commentForm.commentslist = res.data.records || []
              commentForm.page.total = res.data.total || 0
            } else {
              commentForm.newListData = res.data.records || []
              commentForm.commentslist = commentForm.commentslist.concat(commentForm.newListData)
            }
          } else {
            if (commentForm.page.pageNo === 1) {
              commentForm.commentslist = []
              commentForm.page.total = 0
            }
          }
          commentForm.loading = false
        })
        .catch(() => {
          commentForm.loading = false
        })
    }
    return {
      commentForm,
      loadFun,
      wanSliceFormat,
      dateFormat
    }
  }
}
</script>

<style lang="scss" scoped>
@import url(@/styles/layout.scss);
.comment_list {
  width: 50%;
  padding-left: 24px;
  .tips {
    font-size: 14px;
    font-weight: 400;
    color: #909399;
    line-height: 20px;
    margin-bottom: 16px;
  }

  .xm_noneData {
    width: 100%;
    height: 100%;
  }
  .comment_box {
    width: 100%;
    height: 394px;
  }
  .has_box {
    width: 100%;
    height: 100%;
    overflow-y: overlay;
    overflow-x: hidden;
    padding-right: 12px;
    .all_box {
      width: 100%;
      .one_box {
        border-bottom: 1px solid #e8e8e8;
        width: 100%;
        padding-bottom: 10px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        .content {
          width: calc(100% - 120px);

          font-size: 14px;
          font-weight: 400;
          color: #303133;
          line-height: 20px;
          .content_tip {
            max-width: 100%;
            width: max-content;
            background: rgba(54, 79, 205, 0.1);
            border-radius: 2px;
            border: 1px solid #364fcd;
            display: inline-block;
            font-size: 12px;
            font-weight: 400;
            color: #364fcd;
            line-height: 16px;
            padding: 0 4px;
          }
        }
        .time {
          width: 120px;
          text-align: right;
          font-size: 12px;
          font-weight: 400;
          color: #909399;
          line-height: 20px;
        }
      }
      .one_box + .one_box {
        margin-top: 10px;
      }
    }
  }
}
</style>
