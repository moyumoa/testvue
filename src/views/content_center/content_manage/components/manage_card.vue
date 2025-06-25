<template>
  <div
    class="card"
    v-loading="tableForm.page.loading"
    v-if="videoData.records && videoData.records.length"
    @getTableData="getList"
    ref="myCard"
  >
    <div v-for="(item, index) in videoData.records" :key="index" class="card_list">
      <div class="card_item">
        <div
          class="card_item_top"
          :style="{
            background: `url(${item.cover}) no-repeat`,
            backgroundSize: '100% 100%'
          }"
          @click="toDetail(item)"
        >
          <div class="content">
            <div class="content_top">
              <div class="inner" v-if="item.isDelete === 1">
                <img src="@/assets/images/content_center/delete.png" alt />
                <span>已删除</span>
              </div>
              <el-popover
                v-if="item.shareUrl && item.platform == 1"
                placement="bottom-start"
                popper-class="qrcode_popper"
                width="144px"
                trigger="click"
              >
                <template #reference>
                  <img
                    src="@/assets/images/content_center/qrcode2.png"
                    alt
                    @click.stop="
                      () => {
                        return {}
                      }
                    "
                  />
                </template>
                <div class="qrcode_box">
                  <qrcode-vue :value="item.shareUrl" :size="126" level="H" />
                  <div class="border_one"></div>
                  <div class="border_two"></div>
                </div>
                <div class="qr_mark">
                  <img
                    src="https://tagvv-1256030678.cos.ap-shanghai.myqcloud.com/img/202111061652346e85b3672b.png"
                    alt
                  />
                  抖音扫码观看
                </div>
              </el-popover>
              <div v-else></div>
              <!-- 图集没有时长。 -->
              <div class="imgTextBox" v-if="item.mediaType == 2">
                <imgTextTask_ICON :info="item" :useClick="false" class="imgText_one" />
              </div>
              <div v-else class="time">
                <img src="@/assets/images/content_center/time.png" alt />
                <div class="during">
                  {{ item.videoDuration ? (item.videoDuration / 1000).toFixed(2) + ' s' : '--' }}
                </div>
              </div>
            </div>
            <!-- 点赞等信息 -->
            <div class="content_bottom">
              <div class="one_num">
                <img src="@/assets/images/content_center/play.png" alt />
                <div>{{ wanSliceFormat(item.playCount || 0) }}</div>
              </div>
              <div class="one_num">
                <img src="@/assets/images/content_center/like.png" alt />
                <div>{{ wanSliceFormat(item.diggCount || 0) }}</div>
              </div>
              <div class="one_num">
                <img src="@/assets/images/content_center/msg.png" alt />
                <div>{{ wanSliceFormat(item.commentCount || 0) }}</div>
              </div>
              <div class="one_num" style="margin-bottom: 8px">
                <img src="@/assets/images/content_center/forward.png" alt />
                <div>{{ wanSliceFormat(item.shareCount || 0) }}</div>
              </div>
              <div class="video_title line-hidden3">{{ item.title || '--' }}</div>
            </div>
          </div>
        </div>
        <div class="card_item_bottom">
          <div class="left">
            <img v-if="item.avatar" :src="item.avatar" class="user_head" alt />
            <img
              v-else
              src="@/assets/images/content_center/default_user.png"
              class="user_head"
              alt
            />
          </div>
          <div class="middle">
            <div class="name">
              <!-- <el-tooltip
                v-if="item.nickname"
                class="item"
                effect="dark"
                :content="item.nickname"
                placement="top"
              >
              </el-tooltip> -->
              <div>{{ item.nickname || '--' }}</div>
              <div class="platform_icon_box">
                <div :class="[`xm_platformIcon_${item.platform}`]"></div>
              </div>

              <template v-if="item.xuserType && item.xuserType > 1">
                <el-tooltip effect="dark" placement="top">
                  <template #content>
                    <div style="max-width: 300px">
                      {{ matrixTypeICON.getCN(item.xuserType).name }}
                    </div>
                  </template>
                  <img :src="matrixTypeICON.getCN(item.xuserType).img" alt="" />
                </el-tooltip>
              </template>
              <!-- 矩阵号被删除 -->
              <div class="xm_delClass" v-if="item.xuserIsDel && item.xuserIsDel == 1"></div>
            </div>
            <div class="time">{{ item.createTime ? formatDate(item.createTime) : '--' }}</div>
          </div>
          <div class="right"></div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="noData">暂无数据</div>
  <div class="xm_table_page">
    <el-pagination
      v-model:current-page="pageIndex"
      background
      :layout="props.pageLayout"
      :total="props.page.total"
      :page-size="props.page.size"
      :page-sizes="props.pageSizes"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    ></el-pagination>
  </div>
</template>
<script setup>
import { matrixTypeICON } from '@/utils/dictionary/content-center.js'

import { wanSliceFormat, formatDate } from '@/utils/tools.js'
import qrcodeVue from 'qrcode.vue'
import router from '@/router/index.js'
import { defineProps, defineEmits } from 'vue'
const emit = defineEmits(['getList'])
const props = defineProps({
  videoData: {
    type: Object,
    default: () => {}
  },
  page: {
    // 分页参数
    type: Object,
    default: () => {
      return { index: 1, size: 10, total: 0 }
    }
  },
  pageLayout: { type: String, default: 'sizes, prev, pager, next , jumper' }, // 分页需要显示的东西，默认全部
  pageSizes: { type: Array, default: () => [10, 20, 50, 100] }
})
const myCard = ref(null)
watch(
  () => props.videoData,
  (newVal, oldVal) => {
    if (newVal) {
      tableForm.isLoading = false
    }
  }
)
const tableForm = reactive({
  isLoading: true,
  page: {}
})
tableForm.page = toRef(props, 'page')
const pageIndex = toRef(props.page, 'index')
const handleCurrentChange = val => {
  document.querySelector('.el-main').scrollTo(0, 0)
  tableForm.page.index = val
  emit('getList')
}
// 分页相关：监听单页显示数量切换事件
const handleSizeChange = val => {
  tableForm.page.size = val
  emit('getList')
}
// 去详情
function toDetail(e) {
  router.push({
    path: '/content_center/content_manage/manage_detail',
    query: {
      itemId: e.itemId
    }
  })
}
</script>

<style lang="scss" scoped>
@import url('@/styles/layout.scss');
.noData {
  text-align: center;
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #909399;
}
.xm_table_page {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
:deep(.qrcode_popper) {
  border-radius: 8px;
}
.qrcode_box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  top: 9px;
  .border_one {
    width: 126px;
    height: 126px;
    border-left: 2px solid #22ffff;
    border-top: 2px solid #22ffff;
    position: absolute;
    top: -3px;
    left: 9px;
  }
  .border_two {
    width: 126px;
    height: 126px;
    border-right: 2px solid #ff0073;
    border-bottom: 2px solid #ff0073;
    position: absolute;
    top: 1px;
    left: 13px;
  }
  .qr_code {
    width: 120px;
    height: 120px;

    img {
      width: 100%;
      height: 100%;
    }
  }
}

.qr_mark {
  margin-top: 20px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding-bottom: 10px;
  img {
    width: 20px;
    height: 20px;
    margin-right: 6px;
  }
}

.card {
  display: flex;
  flex-wrap: wrap;
  justify-content: start;
  @media screen and (min-width: 0px) {
    .card_item {
      width: 297px;
    }
  }
  .card_list {
    .card_item {
      height: 400px;
      border-radius: 8px;
      margin-right: 24px;
      margin-bottom: 24px;
      overflow: hidden;
      box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.1);

      .card_item_top {
        height: 348px;
        width: 100%;
        position: relative;

        .cover {
          width: 206px;
          height: 348px;
          position: absolute;
          top: 0;
          left: 0;
          img {
            width: 100%;
            height: 100%;
            opacity: 0.8;
          }
        }
        .content {
          width: 100%;
          height: 100%;
          position: relative;

          .content_top {
            padding: 14px 19px;
            padding-left: 12px;
            display: flex;
            cursor: pointer;
            justify-content: space-between;
            .inner {
              font-size: 11px;
              position: absolute;
              text-align: center;
              display: flex;
              flex-direction: column;
              justify-content: center;
              z-index: 99;
              top: 0;
              left: 0;
              background: #000000;
              opacity: 0.5;
              width: 100%;
              height: 100%;
              img {
                width: 16px;
                height: 16px;
                position: absolute;
                left: 14px;
                right: 0;
                top: -20px;
                bottom: 0;
                transform: translate(-50%, -50%);
                margin: auto;
              }
              span {
                margin-top: 10px;
                color: #fff;
              }
            }
            > img {
              width: 24px;
              height: 24px;
              transform: scale(1.3);
            }
            .time {
              height: 24px;
              background: #000000;
              border-radius: 12px;
              opacity: 0.2;
              color: #fff;
              display: flex;
              padding-right: 6px;
              transform: scale(1.3);
              img {
                width: 16px;
                height: 16px;
                margin: 4px 1px;
                margin-left: 6px;
                vertical-align: sub;
              }
              .during {
                line-height: 24px;
              }
            }
          }
          .content_bottom {
            transition: all 0.3s;
            cursor: pointer;
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: flex-end;
            cursor: pointer;
            height: calc(100% - 52px);
            &:hover {
              .video_title {
                width: 100%;
                height: 58px;
                padding: 0 20px;
                padding: 0;
                text-align: center;
                font-weight: 400;
                font-size: 14px;
                color: #ffffff;
                line-height: 20px;
                opacity: 1;
              }
            }
            .video_title {
              transition: all 0.4s;
              padding: 0 20px;
              width: 100%;
              height: 20px;
              opacity: 0;
              margin-top: 0px;
              background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%);
              font-size: 14px;
              font-weight: 400;
              color: #ffffff;
              line-height: 20px;
              text-align: center;
              padding: 4px 10px;
            }
            .one_num {
              text-align: center;
              font-size: 12px;
              color: #ffffff;
              line-height: 22px;
              position: relative;
              min-width: 60px;
              height: 42px;
              margin-right: 4px;
              margin-bottom: 20px;
              > div {
                margin-top: 30px;
                margin-right: 7px;
                transform: scale(1.3);
              }
              img {
                transform: scale(1.3);
                width: 24px;
                height: 24px;
                position: absolute;
                right: 22px;
                top: 0;
              }
            }
          }
        }
      }
      .card_item_bottom {
        height: calc(100% - 348px);
        width: 100%;
        background: #ffffff;
        display: flex;
        padding-top: 8px;
        .left {
          width: 32px;
          height: 32px;
          border: 1px solid #979797;
          margin-left: 10px;
          margin-right: 6px;
          border-radius: 50%;
          overflow: hidden;
          img {
            width: 100%;
            height: 100%;
          }
        }
        .middle {
          .name {
            display: flex;
            > div {
              font-size: 13px;
              font-weight: 400;
              color: #303133;
              line-height: 18px;
              margin-bottom: 2px;
              overflow: hidden;
              white-space: normal;
              max-height: 18px;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 1;
              max-width: 160px;
              margin-right: 6px;
            }
            .platform_icon_box {
              position: relative;
              width: 14px;
              height: 14px;
              vertical-align: middle;
              margin-right: 5px;
              margin-top: 1px;
              div {
                width: 100%;
                height: 100%;
              }
            }
            img {
              width: 13px;
              height: 13px;
              vertical-align: middle;
              margin-right: 6px;
              margin-top: 2px;
            }
          }
          .time {
            font-size: 12px;
            font-weight: 400;
            color: #999999;
            line-height: 17px;
          }
        }
      }
    }
  }
}
:deep(.imgTextBox) {
  width: 24px;
  position: relative;
  height: 24px;
}
:deep(.imgText_ICON) {
  .icon_box {
    .icon_icon {
      padding: 4px;
      img {
        width: 16px;
        height: 16px;
      }
    }
  }
}
</style>
