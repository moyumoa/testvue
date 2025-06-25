<template>
  <el-dialog
    ref="dialog"
    v-model="isShow"
    :title="modalInfo.name"
    width="447px"
    destroy-on-close
    @closed="closeDialog"
  >
    <template v-if="auditInfo">
      <!-- 任务详情 -->
      <div class="material">
        <!-- 审核信息 -->
        <material v-if="auditType == 3" :auditInfo="auditInfo"></material>
        <collect-video v-if="auditType == 4" :auditInfo="auditInfo"></collect-video>
        <!-- 矩阵号模块 -->
        <div class="account" v-if="auditInfo.matrixName">
          <p class="title">矩阵号</p>
          <div style="display: flex; align-items: center">
            <img
              v-if="auditInfo.matrixHeadImg"
              :src="auditInfo.matrixHeadImg"
              style="width: 48px; height: 48px; border-radius: 50%"
              alt
            />
            <DefaultPhoto v-else :name="auditInfo.matrixName || '--'" />
            <div class="content">
              <p style="font-size: 14px; font-weight: 400; color: #303133">
                {{ auditInfo.matrixName || '--' }}
              </p>
              <p style="font-size: 12px; color: #909399">抖音号：{{ auditInfo.dyId || '--' }}</p>
            </div>
          </div>
        </div>
        <!-- 成员信息模块 -->
        <div class="account">
          <p class="title">成员信息</p>
          <div style="display: flex; align-items: center">
            <img
              v-if="auditInfo.userHead"
              :src="auditInfo.userHead"
              style="width: 48px; height: 48px; border-radius: 50%"
              alt
            />
            <DefaultPhoto v-else :name="auditInfo.userName || '--'" />
            <div class="content">
              <p style="font-size: 14px; font-weight: 400; color: #303133">
                {{ auditInfo.userName || '--' }}
              </p>
              <div
                style="font-size: 12px; color: #909399"
                v-if="auditInfo.userPhone !== null && auditInfo.userPhone.length !== 0"
              >
                <div v-if="auditInfo.showPhone">
                  <span class="ellipsis table_ellipsis">
                    {{ auditInfo.userPhone }}
                  </span>
                  <!-- <img
                    style="
                      width: 12px;
                      height: 13px;
                      margin-left: 8px;
                      cursor: pointer;
                      vertical-align: -10%;
                    "
                    src="@/assets/images/operate/yanjing_xianshi.png"
                    alt
                    @click="auditInfo.showPhone = false"
                  /> -->
                </div>
                <div v-else>
                  <span class="ellipsis table_ellipsis">
                    {{ auditInfo.userPhone.substring(0, 3) }}****{{
                      auditInfo.userPhone.substring(7)
                    }}
                  </span>
                  <!-- <img
                    style="
                      width: 12px;
                      height: 13px;
                      margin-left: 8px;
                      cursor: pointer;
                      vertical-align: -10%;
                    "
                    src="@/assets/images/operate/yanjing_yincang.png"
                    alt
                    @click="auditInfo.showPhone = true"
                  /> -->
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
            {{ auditInfo.linkTaskName }}
          </div>
        </div>
        <!-- 上传时间模块 -->
        <div class="taskTime">
          <p class="title">上传时间</p>
          <div class="content">
            {{ auditInfo.taskUserMaterial.gmtUpdate }}
          </div>
        </div>
      </div>
      <!-- 任务结果 -->
      <div class="taskResult">
        <div class="tasknormal" v-if="auditInfo.status === 1 || auditInfo.status === 2">
          <!-- 审核人 -->
          <div class="block">
            <p class="top">审核人</p>
            <div>
              <img
                v-if="auditInfo.auditorHead"
                :src="auditInfo.auditorHead"
                style="width: 24px; height: 24px; border-radius: 50%"
                alt
              />
              <DefaultPhoto v-else :name="auditInfo.auditorName || '--'" />
              <p style="max-width: calc(100% - 36px - 56px)">{{ auditInfo.auditorName }}</p>
              <div
                class="xm_depart"
                style="justify-content: center"
                v-if="auditInfo.staffStatus && auditInfo.staffStatus == 2"
              ></div>
            </div>
          </div>
          <!-- 审核结果 -->
          <div class="block">
            <p class="top">审核结果</p>

            <div class="content">
              <p>{{ auditInfo.status === 2 ? '审核不通过' : '审核通过' }}</p>
              <p style="margin-left: 40px">{{ auditInfo.remark }}</p>
            </div>
          </div>
          <!-- 上传时间 -->
          <div class="block">
            <p class="top">审核时间</p>
            <div class="content">
              <p>{{ auditInfo.auditTime }}</p>
            </div>
          </div>
        </div>
        <div class="taskerror" v-if="auditInfo.status === 4">
          <div class="block">
            <p class="top">审核已过期</p>
            <div class="content">
              <p>任务已结束</p>
            </div>
          </div>
        </div>
      </div>
      <!-- 任务审核 -->
      <div class="footer" v-if="auditInfo.status === 3">
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
      </div>
    </template>
    <template #footer v-if="auditInfo && auditInfo.status === 3">
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <async_button type="primary" :asyncFunc="updateTask">保存</async_button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { pageList } from '../video_audit/model/get_list'
import collectVideo from './collect_video.vue'
import material from './material.vue'

const props = defineProps({
  isShow: Boolean,
  auditInfo: Object,
  taskId: Array,
  auditType: [Number, String]
})
const { isShow, auditInfo, taskId, auditType } = toRefs(props)

const emits = defineEmits(['update:isShow', 'upData'])
const { query, updateTask } = pageList(emits)

const $data = reactive({
  typeEnums: {
    1: {
      name: '任务'
    },
    2: {
      name: '视频'
    },
    3: {
      name: '征集原料'
    },
    4: {
      name: '征集视频'
    }
  }
})

// 挂载信息
const modalInfo = computed(() => {
  return $data.typeEnums[auditType.value]
})

// 关闭整个弹窗
function closeDialog() {
  query.remark = ''
  query.auditResult = null
  emits('update:isShow', false)
}

watchEffect(() => {
  query.auditIds = taskId.value
})
</script>

<style lang="scss" scoped>
:deep(.el-dialog__body) {
  padding: 20px 16px 22px 16px;
}

.material {
  padding: 0px 0px 28px 0px;
  border-bottom: 1px solid #dcdee0;

  .title {
    height: 24px;
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    line-height: 24px;
    margin-bottom: 12px;
  }

  .info {
    display: flex;

    .material_cover {
      width: 60px;
      height: 80px;
      border-radius: 4px;
      margin-right: 12px;
    }

    .material_info {
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .material_info_header {
        .type {
          margin-right: 20px;
          font-size: 16px;
          color: #303133;
          font-weight: bold;
        }

        .label {
          display: inline-block;
          text-align: center;
          min-width: 70px;
          line-height: 26px;
          padding: 0 10px;
          border-radius: 16px;
          border: 1px solid #ccc;
          box-sizing: border-box;
        }
      }

      .label_remark {
        @include mult_line(2);
        line-height: 18px;
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
