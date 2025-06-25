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
              style="position: relative"
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
            <!-- 视频标题 -->
            <p class="title">
              {{ videoData.videoTitle }}
            </p>
          </div>
        </div>
        <!-- 矩阵号模块 -->
        <div class="account">
          <p class="title">矩阵号</p>
          <div style="display: flex; align-items: center">
            <img
              v-if="videoData.matrixHeadImg"
              :src="videoData.matrixHeadImg"
              style="width: 48px; height: 48px; border-radius: 50%"
              alt
            />
            <DefaultPhoto v-else :name="videoData.matrixName || '--'" />
            <div class="content">
              <p style="font-size: 14px; font-weight: 400; color: #303133">
                {{ videoData.matrixName || '--' }}
              </p>
              <p style="font-size: 12px; color: #909399">抖音号：{{ videoData.dyId || '--' }}</p>
            </div>
          </div>
        </div>
        <!-- 成员信息模块 -->
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
              </p>
              <div
                style="font-size: 12px; color: #909399"
                v-if="videoData.phone !== null && videoData.phone.length !== 0"
              >
                <div v-if="videoData.showPhone">
                  <span class="ellipsis table_ellipsis">
                    {{ videoData.phone }}
                  </span>
                  <img
                    style="
                      width: 12px;
                      height: 13px;
                      margin-left: 8px;
                      cursor: pointer;
                      vertical-align: -10%;
                    "
                    src="@/assets/images/operate/yanjing_xianshi.png"
                    alt
                    @click="showPhoneFun(videoData)"
                  />
                </div>
                <div v-else>
                  <span class="ellipsis table_ellipsis">
                    {{ videoData.phone.substring(0, 3) }}****{{ videoData.phone.substring(7) }}
                  </span>
                  <img
                    style="
                      width: 12px;
                      height: 13px;
                      margin-left: 8px;
                      cursor: pointer;
                      vertical-align: -10%;
                    "
                    src="@/assets/images/operate/yanjing_yincang.png"
                    alt
                    @click="showPhoneFun(videoData)"
                  />
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
        <!-- 上传时间模块 -->
        <div class="taskTime">
          <p class="title">上传时间</p>
          <div class="content">
            {{ videoData.uploadTime }}
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
              <p>{{ videoData.auditorName }}</p>
            </div>
          </div>
          <!-- 审核结果 -->
          <div class="block">
            <p class="top">审核结果</p>

            <div class="content">
              <p>{{ videoData.status === 2 ? '审核不通过' : '审核通过' }}</p>
              <p style="margin-left: 40px">{{ videoData.remark }}</p>
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
            <el-form :rules="rules">
              <el-form-item prop="reason">
                <el-input
                  v-model="query.remark"
                  :rows="1"
                  type="textarea"
                  resize="none"
                  placeholder="请输入审核不通过理由，最多15字"
                  style="font-size: 14px"
                  :maxlength="15"
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
          <el-button type="primary" @click="updateTask()">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { pageList } from './model/get_list'
import DefaultPhoto from '../default_photo/index.vue'

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
const { query, updateTask, playVideo, showPhoneFun } = pageList(emits)
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
      align-items: center;
      .title {
        margin-left: 16px;
        height: 20px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #303133;
        line-height: 20px;
      }
    }
  }
  .account {
    margin-top: 20px;
    .content {
      margin-left: 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      height: 48px;
    }
  }
  .taskConnect {
    margin-top: 20px;
    .content {
      height: 20px;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #909399;
      line-height: 20px;
      height: 100%;
    }
  }
  .taskTime {
    margin-top: 20px;
    .content {
      height: 20px;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #909399;
      line-height: 20px;
      height: 100%;
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
</style>
