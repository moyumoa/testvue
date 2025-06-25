<template>
  <div class="rankings-list" v-loading="loading">
    <div class="top-wrapper">
      <div class="title">获客排行榜</div>
      <div class="right_btn_group">
        <div
          :class="['btn_item', currentTabKey === item.key ? 'btn_item_active' : '']"
          v-for="item in tabList"
          :key="item.key"
          @click="switchTab(item)"
        >
          {{ item.label }}
        </div>
      </div>
    </div>
    <div class="container">
      <el-table :data="tableData" height="450px" v-if="tableData.length > 0">
        <el-table-column type="index" width="60" label="排名" />
        <el-table-column v-if="currentTabKey === 'account'" label="矩阵号" fit>
          <template v-slot="{ row }">
            <div class="table_column_container" style="height: 56px">
              <div class="table_head">
                <el-image :src="row.dyHeadUrl" class="user_img"></el-image>
                <div :class="[`xm_platformIcon_${row.platform}`]"></div>
              </div>
              <div class="title_box">
                {{ row.dyNickname || '--' }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column v-else-if="currentTabKey === 'live'" label="直播" fit>
          <template v-slot="{ row }">
            <div class="table_column_container" @click="toLiveDetail(row)">
              <div class="table_live">
                <img v-if="row.cover" class="live_cover_img" :src="row.cover" alt />
                <img v-else class="live_cover_img" src="@/assets/images/default_img.png" alt />

                <div :class="[`xm_platformIcon_${row.platform}`]"></div>
              </div>
              <div class="title_box">
                {{ row.title || '--' }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column v-else label="视频" fit>
          <template v-slot="{ row }">
            <div class="table_column_container" @click="toVideoDetail(row)">
              <div class="table_video">
                <el-image v-if="row.cover" class="video_cover_img" :src="row.cover" alt fit="cover">
                  <template #error>
                    <div class="video_cover_img errImg_box"></div>
                  </template>
                </el-image>
                <img
                  v-else
                  class="video_cover_img"
                  src="@/assets/images/content_center/default_cover.png"
                  alt
                />

                <div :class="[`xm_platformIcon_${row.platform}`]"></div>
              </div>
              <div class="title_box">{{ row.title || '--' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="clientCount" width="110" label="获客数" align="right" />
      </el-table>
      <el-empty description="暂无数据" style="margin-top: 100px" :image-size="120" v-else>
        <template #image>
          <img src="@/assets/images/content_center/no_data.png" alt="无" />
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import {
  clientRankingsByLiveRoom,
  clientRankingsByVideo,
  getCustomerRanking
} from '@/api/scrm/operation.js'
import { useRouter } from 'vue-router'

const props = defineProps({
  params: {
    type: Object,
    default: () => {
      return {
        deptIds: '',
        endTime: '',
        startTime: ''
      }
    }
  }
})
const { params } = toRefs(props)

const tabList = [
  {
    key: 'account',
    label: '矩阵'
  },
  {
    key: 'live',
    label: '直播'
  },
  {
    key: 'video',
    label: '视频'
  }
]
const currentTabKey = ref('account')
const switchTab = item => {
  currentTabKey.value = item.key
  getList()
}

const tableData = ref([])
const loading = ref(false)
const getList = () => {
  loading.value = true
  tableData.value = []
  let promise = null
  if (currentTabKey.value === 'account') {
    promise = getCustomerRanking
  } else if (currentTabKey.value === 'live') {
    promise = clientRankingsByLiveRoom
  } else {
    promise = clientRankingsByVideo
  }
  promise(params.value)
    .then(res => {
      loading.value = false
      if (res.code === 0) {
        tableData.value = res.data || []
      }
    })
    .catch(err => {
      console.error(err)
      loading.value = false
    })
}
getList()

watch(
  () => params.value,
  value => {
    getList()
  }
)
const router = useRouter()
// 直播详情
const toLiveDetail = item => {
  if (item.roomId) {
    router.push({
      path: '/content_center/live_center/detail',
      query: {
        roomId: item.roomId,
        dyOpenId: item.dyOpenId
      }
    })
  }
}
// 视频详情
const toVideoDetail = item => {
  if (item.itemId) {
    router.push({
      path: '/content_center/content_manage/manage_detail',
      query: {
        itemId: item.itemId
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.rankings-list {
  height: 530px;
  background: #ffffff;
  border-radius: 4px;
  box-sizing: border-box;
  overflow: hidden;

  .top-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;

    .title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
    .right_btn_group {
      display: flex;
      align-items: center;
      .btn_item {
        padding: 0 8px;
        height: 20px;
        font-size: 14px;
        font-weight: 400;
        color: #909399;
        line-height: 20px;
        cursor: pointer;
      }
      .btn_item + .btn_item {
        border-left: 1px solid #e8e8e8;
      }
      .btn_item_active {
        color: #364fcd;
        font-weight: bold;
      }
    }
  }
  .container {
    //height:calc(100% - 30px);
    overflow-y: scroll;
  }
  .table_column_container {
    display: flex;
    align-items: center;
    width: 100%;
    height: 80px;
    .user_img {
      flex-shrink: 0;
      border-radius: 50%;
      width: 40px;
      height: 40px;
    }
    .table_head {
      position: relative;
      flex-shrink: 0;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      margin-right: 12px;
    }
    .table_live {
      position: relative;
      flex-shrink: 0;
      width: 60px;
      height: 60px;
      margin-right: 10px;
    }
    .live_cover_img {
      flex-shrink: 0;
      width: 60px;
      height: 60px;
      border-radius: 4px;
      object-fit: cover;
    }
    .table_video {
      position: relative;
      flex-shrink: 0;
      width: 48px;
      height: 64px;
      margin-right: 10px;
    }
    .video_cover_img {
      flex-shrink: 0;
      width: 48px;
      height: 64px;
      border-radius: 4px;
      object-fit: cover;
    }
    .title_box {
      @include mult_line(2);
    }
  }
}
</style>
