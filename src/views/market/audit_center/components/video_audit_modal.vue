<template>
  <div>
    <el-dialog
      ref="dialog"
      :model-value="isShow"
      title="视频审核"
      width="447px"
      destroy-on-close
      @closed="closeDialog"
      v-if="videoData"
    >
      <!-- 任务详情 -->
      <section class="video">
        <!-- 视频信息模块 -->
        <div class="info">
          <p class="title">视频信息</p>
          <div class="content">
            <!-- 视频图片 -->
            <div
              v-if="videoData.videoPlayUrl"
              style="position: relative; width: 60px; height: 88px"
              @click="playVideo(videoData)"
            >
              <img :src="videoData.videoImgUrl" style="width: 60px; height: 88px" alt />
              <img
                src="@/assets/images/operate/forPlay.png"
                style="
                  background: rgba(0, 0, 0, 0);
                  cursor: pointer;
                  position: absolute;
                  left: 18px;
                  top: 30px;
                  width: 30px;
                  height: 30px;
                "
                alt
              />
            </div>
            <div v-else>
              <img src="@/assets/images/operate/delete.png" style="width: 60px; height: 88px" alt />
            </div>
            <div class="video-info">
              <!-- <p class="video-title">{{ videoData.videoTitle }}</p> -->
              <div>发布平台：{{ platformFormatter(videoData) }}</div>
              <div>上传时间： {{ videoData.uploadTime || '-' }}</div>
            </div>
          </div>
        </div>
        <!-- 标题 -->
        <div class="title_info">
          <template v-for="(item, index) in videoData.publishedPlatform" :key="index">
            <el-tooltip placement="bottom">
              <template #content>
                <div class="title_item" style="max-width: 380px">
                  {{ `${platformCN(item) || ''}标题：${showTitle(videoData, item) || '-'}` }}
                </div>
              </template>
              <div class="title_item title_item_warp">
                {{ `${platformCN(item) || ''}标题：${showTitle(videoData, item) || '-'}` }}
              </div>
            </el-tooltip>
          </template>
        </div>
        <!-- 成员信息模块 -->
        <div class="other-info">
          <div class="account">
            <p class="title">成员信息</p>
            <div style="display: flex; align-items: center">
              <img
                v-if="videoData.headImg"
                :src="videoData.headImg"
                style="width: 48px; height: 48px; border-radius: 50%"
                alt
              />
              <DefaultPhoto v-else :name="videoData.name || '--'" />
              <div class="content">
                <p style="font-size: 14px; font-weight: 400; color: #303133">
                  {{ videoData.name || '--' }}
                  <span
                    class="xm_depart"
                    style="display: inline-block"
                    v-if="videoData.staffStatus && videoData.staffStatus == 2"
                  ></span>
                </p>
                <div
                  style="font-size: 12px; color: #909399"
                  v-if="videoData.phone !== null && videoData.phone.length !== 0"
                >
                  <div v-if="videoData.showPhone">
                    <span class="ellipsis table_ellipsis">
                      {{ videoData.phone }}
                    </span>
                  </div>
                  <div v-else>
                    <span class="ellipsis table_ellipsis">
                      {{ videoData.phone.substring(0, 3) }}****{{ videoData.phone.substring(7) }}
                    </span>
                  </div>
                </div>
                <div v-else style="font-size: 12px; color: #909399">--</div>
              </div>
            </div>
          </div>
          <!-- 关联任务模块 -->
          <div class="taskConnect">
            <p class="title">关联任务</p>
            <div class="content">
              {{ videoData.taskName }}
            </div>
          </div>
        </div>
      </section>
      <!-- 任务结果 -->
      <section class="taskResult">
        <div class="tasknormal" v-if="videoData.status === 1 || videoData.status === 2">
          <!-- 审核人 -->
          <div class="block">
            <p class="top">审核人</p>
            <div>
              <img
                v-if="videoData.auditorHead"
                :src="videoData.auditorHead"
                style="width: 24px; height: 24px; border-radius: 50%"
                alt
              />
              <DefaultPhoto v-else :name="videoData.auditorName || '--'" />
              <p>
                {{ videoData.auditorName }}
                <span
                  class="xm_depart"
                  style="display: inline-block"
                  v-if="videoData.auditorStaffStatus && videoData.auditorStaffStatus == 2"
                ></span>
              </p>
            </div>
          </div>
          <!-- 审核结果 -->
          <div class="block">
            <p class="top">审核结果</p>

            <div class="content" style="align-items: flex-start">
              <p>{{ videoData.status === 2 ? '审核不通过' : '审核通过' }}</p>
              <p style="margin-left: 40px; width: calc(100% - 120px); height: max-content">
                {{ videoData.remark }}
              </p>
            </div>
          </div>
          <!-- 上传时间 -->
          <div class="block">
            <p class="top">审核时间</p>
            <div class="content">
              <p>{{ videoData.auditTime }}</p>
            </div>
          </div>
        </div>
        <div class="taskerror" v-if="videoData.status === 4">
          <div class="block">
            <p class="top">审核已过期</p>
            <div class="content">
              <p>任务已结束</p>
            </div>
          </div>
        </div>
      </section>
      <section class="footer" v-if="videoData.status === 3">
        <!-- 审核模块 -->
        <div style="display: flex; align-items: center">
          <p style="margin-right: 40px">审核</p>
          <el-radio-group v-model="query.auditResult">
            <el-radio :label="1">审核通过</el-radio>
            <el-radio :label="2">审核不通过</el-radio>
          </el-radio-group>
        </div>
        <div style="margin-top: 16px">
          <template v-if="query.auditResult == 2">
            <el-form>
              <el-form-item prop="reason">
                <el-input
                  v-model="query.remark"
                  :rows="4"
                  type="textarea"
                  resize="none"
                  placeholder="请输入审核不通过理由，最多100字"
                  style="font-size: 14px"
                  :maxlength="100"
                  show-word-limit
                />
              </el-form-item>
            </el-form>
          </template>
        </div>
      </section>

      <template #footer v-if="videoData.status === 3">
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <async_button type="primary" :asyncFunc="updateTask">保存</async_button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { pageList } from '../video_audit/model/get_list'
import DefaultPhoto from '../default_photo/index.vue'
import { PLATFORM } from '@/utils/dictionary/company.js'
import { isEmpty } from '@/utils/tools.js'

const props = defineProps({
  isShow: {
    type: Boolean
  },
  videoData: {
    type: Object
  },
  taskId: {
    type: Array
  }
})
const { isShow, videoData, taskId } = toRefs(props)
const emits = defineEmits(['update:isShow', 'upData'])
// console.log('外部emit', emits)
const { query, updateTask, playVideo } = pageList(emits)

// 关闭整个弹窗
function closeDialog() {
  query.remark = ''
  query.auditResult = null
  emits('update:isShow', false)
}

watchEffect(() => {
  query.auditIds = taskId.value
  // console.log(query.auditIds)
})
const platformCN = item => {
  const obj = {
    1: '抖音',
    2: '视频号',
    3: '小红书',
    4: '快手'
  }
  return obj[item] || '-'
}
const platformFormatter = item => {
  if (isEmpty(item?.publishedPlatform) || !Array.isArray(item?.publishedPlatform)) return '暂无'
  const resultList = []
  // 排序 抖音 小红书 快手 视频号
  const sortList = {
    1: 1,
    2: 4,
    3: 2,
    4: 3
  }
  item.publishedPlatform.sort((a, b) => sortList[a] - sortList[b])
  item.publishedPlatform.forEach(item => {
    resultList.push(PLATFORM.getCN(item) || '未知')
  })
  return resultList.join('/')
}
function showTitle(data, plat) {
  let title = ''
  if (isEmpty(data?.platformVideoCopyMap)) {
    title = data.videoTitle || ''
  } else {
    title = data.platformVideoCopyMap[plat]
  }
  return title || '-'
}
</script>

<style lang="scss" scoped>
:deep(.el-dialog__body) {
  padding: 20px 16px 22px 16px;
}

.video {
  padding: 0px 0px 28px 0px;
  border-bottom: 1px solid #dcdee0;

  .title {
    height: 24px;
    font-size: 16px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #303133;
    line-height: 24px;
    margin-bottom: 12px;
  }

  .info {
    .content {
      display: flex;
      align-items: flex-start;

      .video-info {
        margin-left: 12px;
        width: 300px;
        font-size: 14px;
        font-weight: 400;
        color: #606266;
        line-height: 28px;

        .video-title {
          color: #303133;
          @include mult_line(1);
        }
      }
    }
  }
  .title_info {
    padding-top: 4px;
    font-family: PingFangSC, PingFang SC;
    font-weight: 400;
    font-size: 12px;
    color: #606266;
    line-height: 18px;
    .title_item {
      margin-top: 4px;
    }
    .title_item_warp {
      @include mult_line(1);
      width: max-content;
      max-width: 100%;
    }
  }

  .other-info {
    display: flex;

    .account {
      flex: 1;
      margin-top: 16px;

      .content {
        margin-left: 12px;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        height: 48px;
      }
    }

    .taskConnect {
      flex: 1;
      margin-top: 16px;

      .content {
        font-size: 14px;
        font-weight: 400;
        color: #606266;
        line-height: 20px;
      }
    }
  }
}

.taskResult {
  .tasknormal,
  .taskerror {
    .block {
      margin-top: 20px;

      .top {
        height: 24px;
        font-size: 16px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #303133;
        line-height: 24px;
        margin-bottom: 12px;
      }

      div {
        display: flex;
        align-items: center;

        .default_photo {
          margin-right: 12px;
          width: 24px;
          height: 24px;
        }

        img {
          margin-right: 12px;
          width: 24px;
          height: 24px;
        }

        p {
          height: 20px;
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #909399;
          line-height: 20px;
        }
      }
    }
  }
}

.footer {
  padding: 20px 0px 0px 0px;
}

.platform_img {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 18px;
  height: 18px;
}
</style>
