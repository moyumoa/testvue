<template>
  <div class="baiying_vedeo_table">
    <div class="one_box">
      <div class="title">短视频引流</div>
      <template v-if="haveBy">
        <xm_table
          class="pic_table"
          v-loading="tableForm.loading"
          :data="tableForm.listData"
          v-model:page="tableForm.page"
          @getTableData="getList"
          @sort-change="sortChange"
          :default-sort="{
            prop: 'showInLiveCnt',
            order: 'descending'
          }"
        >
          <el-table-column min-width="140" label="短视频">
            <template #default="scope">
              <div class="good_box" style="display: flex">
                <div class="good_content">
                  <div class="content1">
                    <div class="content_text row_overflow">{{ scope.row.title || '--' }}</div>

                    <el-popover
                      placement="bottom"
                      popper-class="qrcode_popper"
                      width="154px"
                      trigger="click"
                    >
                      <template #reference>
                        <img src="@/assets/images/content_center/qrcode.png" alt />
                      </template>
                      <div class="qrcode_box">
                        <qrcode-vue
                          v-if="scope.row.detail"
                          :value="scope.row.detail"
                          :size="126"
                          level="H"
                        />
                        <div class="qr_mark" v-if="scope.row.detail">
                          <img
                            src="https://tagvv-1256030678.cos.ap-shanghai.myqcloud.com/img/202111061652346e85b3672b.png"
                            alt
                          />
                          抖音扫码观看
                        </div>
                        <div class="qr_mark" v-else style="margin: 0">暂未找到相关地址</div>
                      </div>
                    </el-popover>
                  </div>
                  <!-- <div class="content2" style="margin-top: 14px">视频时长：12S</div> -->
                  <!-- <div class="content2">
                  发布时间：{{ scope.row.publishTime ? getDateDiff(scope.row.publishTime) : '--' }}
                </div> -->
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- sortable="custom" -->
          <el-table-column width="180" prop="1" label="投稿时间">
            <template #default="scope">{{ scope.row.publishTime || '--' }}</template>
          </el-table-column>
          <el-table-column
            min-width="140"
            sortable="custom"
            prop="showInLiveCnt"
            label="直播曝光人次"
          >
            <template #default="scope">{{ wanSliceFormat(scope.row.showInLiveCnt || 0) }}</template>
          </el-table-column>
          <el-table-column
            min-width="140"
            sortable="custom"
            prop="drainageInLiveCnt"
            label="直播点击人次"
          >
            <template #default="scope">
              {{ wanSliceFormat(scope.row.drainageInLiveCnt || 0) }}
            </template>
          </el-table-column>
          <el-table-column
            min-width="130"
            sortable="custom"
            prop="showToDrainageRate"
            label="直播点击率"
          >
            <template #default="scope">{{ scope.row.showToDrainageRate || 0 }}%</template>
          </el-table-column>
          <el-table-column
            label="操作"
            fixed="right"
            width="120"
            align="center"
            header-align="center"
          >
            <template #default="scope">
              <div class="table_btn">
                <!-- <el-link type="primary" class="one_btn" @click="toDetail(scope.row)">详情</el-link> -->
                <el-link type="warning" class="one_btn" @click="playVideo(scope.row)">播放</el-link>
              </div>
            </template>
          </el-table-column>
        </xm_table>
      </template>
      <template v-else>
        <div class="no_data">
          <img src="@/assets/images/content_center/no_data.png" alt="" />
          <p>授权百应查看更多数据</p>
        </div>
      </template>
    </div>
  </div>
</template>
<script setup>
// import { useRouter } from 'vue-router'
import qrcodeVue from 'qrcode.vue'
import { wanSliceFormat, throttle } from '@/utils/tools.js'
import { pageList } from '../../model/data_overview/get_by_video_table.js'
const props = defineProps({
  roomId: {
    type: String,
    default: '',
    required: true
  },
  haveBy: {
    type: Boolean,
    default: false
  }
})
// const router = useRouter()
// 订单详情
const { tableForm, getList, resetList, sortChange } = pageList(props.roomId)

watch(
  () => props.haveBy,
  val => val && resetList()
)
// 跳转详情
// const toDetail = throttle(e => {
//   router.push({
//     path: '/content_center/content_manage/manage_detail',
//     query: {
//       itemId: e.videoId
//     }
//   })
// }, 300)
// 播放视频
const playVideo = throttle(e => {
  window.open(e.detail, '_blank')
}, 300)
</script>
<style lang="scss" scoped>
@import '../../../components/css/qrcode.scss';
@import '../../../components/css/page.scss';
.baiying_vedeo_table {
  margin-bottom: 16px;
  width: 100%;
  border-radius: 4px;
  background: #fff;
}
.title {
  margin-bottom: 24px;
}
.content_text {
  max-width: 100%;
  width: max-content;
}
.good_box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  .good_cover {
    width: 60px;
    height: 80px;
    border-radius: 4px;
    object-fit: cover;
    margin-right: 10px;
  }
  .good_content {
    width: calc(100% - 0px);
    .content1 {
      max-width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      font-size: 14px;

      font-weight: 500;
      color: #303133;
      line-height: 32px;
      .content_text {
        max-width: calc(100% - 24px);
      }
      img {
        width: 18px;
        height: 18px;
        margin-left: 6px;
        cursor: pointer;
      }
    }
    .content2 {
      margin-top: 4px;
      font-size: 12px;
      font-weight: 400;
      color: #909399;
      line-height: 17px;
    }
  }
}
.one_box {
  background: #fff;
  border-radius: $content_radius;
  border-radius: 4px;
  padding: 22px 24px;
  margin-bottom: $content_margin;
  .title_box {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
.no_data {
  padding: 68px 0 46px 0;
  text-align: center;
  > img {
    width: 75px;
    height: 54px;
  }
  > p {
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    color: #303133;
    line-height: 20px;
  }
}
</style>
