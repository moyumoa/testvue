<template>
  <div class="oneBox">
    <!-- 头部标签 -->
    <nav class="top">
      <p class="titleLeft">营销活动</p>
      <el-link type="primary" @click="toALlActivity" class="allTask">全部活动 ></el-link>
    </nav>
    <div class="content" v-if="activityList.length">
      <template v-for="(item, index) in activityList" :key="index">
        <section>
          <div class="nav">
            <p class="state">
              <span style>{{ item.title }}</span>
              <span
                style="
                  font-size: 5px;
                  margin-right: 4px;
                  display: inline-block;
                  width: 4px;
                  height: 4px;
                  border-radius: 50%;
                "
                :class="{
                  'status-2': item.isEnable === -2 || item.isEnable === 0,
                  'status-3': item.isEnable === 1
                }"
              ></span>
              <span>
                {{ item.isEnable === -2 ? '已结束' : item.isEnable === 1 ? '进行中' : '未开始' }}
              </span>
            </p>
          </div>
          <div class="center">
            <div style="display: flex">
              <p>
                曝光数：{{ wanSliceFormat(item.exposure) }}/{{
                  wanSliceFormat(item.exposureTarget)
                }}
              </p>
              <p v-if="brandViewMode == 1" style="flex: 1; margin-left: 8px">
                销售额：{{ wanSliceFormat(item.payment / 100) }}/{{wanSliceFormat(item.paymentTarget / 100) }}
              </p>
              <p v-if="brandViewMode == 2" style="flex: 1; margin-left: 8px">
                线索数：{{ wanSliceFormat(item.clue) }}/{{ wanSliceFormat(item.clueTarget) }}
              </p>
              <el-link type="primary" @click="getDetails(item)" class="look">查看</el-link>
            </div>
            <p>{{ item.activityStartTime.slice(0, 10) }}—{{ item.activityEndTime.slice(0, 10) }}</p>
          </div>
        </section>
        <p class="boundary" v-if="index < activityList.length - 1"></p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue-demi'
import { useRouter } from 'vue-router'
import { listActivity } from '@/api/market/activity'
import { wanSliceFormat } from '@/utils/tools'
import { useStore } from 'vuex'

const router = useRouter()
const store = useStore()
// 留资模式 1是兼容 2是留资
const brandViewMode = computed(() => store.state.user.brandViewMode)
const activityList = ref([])

// 获取任务列表
function getActivityList() {
  listActivity({}).then(res => {
    const list = res.data.records || []
    activityList.value = list.slice(0, 3) || []
  })
}

// 跳转任务数据详情
function getDetails(row) {
  router.push({
    path: '/content_market/market_calendar',
    query: {
      activityId: row.id,
      activityStartTime: row.activityStartTime
    }
  })
}

// 全部任务
function toALlActivity() {
  router.push({
    path: '/content_market/market_calendar/activityList'
  })
}

onMounted(() => {
  getActivityList()
})
</script>

<style lang="scss" scoped>
.active {
  color: rgba(209, 71, 71, 1);
}

.status-0 {
  background-color: rgba(54, 79, 205, 1);
}

.active {
  color: rgba(209, 71, 71, 1);
}

.status-0 {
  background-color: rgba(54, 79, 205, 1);
}

.status-1 {
  background-color: rgba(255, 172, 109, 1);
}

.status-2 {
  background-color: rgba(144, 147, 153, 1);
}

.status-3 {
  background-color: rgba(81, 248, 139, 1);
}

.status-4 {
  background-color: rgba(248, 81, 81, 1);
}

.oneBox {
  border-radius: 4px;
  margin: 16px 0;
  padding: 0 14px;
  // margin-bottom: 10px;
  background: #fff;

  // 营销任务标题
  .top {
    padding: 22px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .titleLeft {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .allTask {
      font-size: 14px;
      font-weight: 400;
    }
  }

  // 任务列表
  .content {
    // margin-top: 24px;
    display: flex;
    align-items: center;
    width: 100%;

    .boundary {
      display: inline-block;
      background: #e8e8e8;
      height: 40px;
      width: 1px;
    }

    section {
      padding-right: 2%;
      padding-left: 2%;
      box-sizing: border-box;
      width: 33%;

      &:nth-of-type {
        padding-left: 0px;
      }

      .nav {
        margin-bottom: 8px;
        display: flex;
        justify-content: space-between;
        // box-sizing: border-box;
        // padding-right: 70px;
        align-items: center;

        // 进行中
        .state {
          display: flex;
          align-items: center;

          img {
            width: 20px;
            height: 20px;
          }

          span {
            &:nth-of-type(1) {
              color: #303133;
              font-size: 16px;
              margin-right: 12px;
              //margin-left: 8px;
            }

            &:nth-of-type(2) {
              margin-right: 5px;
            }

            &:nth-of-type(3) {
              font-size: 14px;
              color: rgb(0, 0, 0);
            }
          }
        }

        // 查看
        .look {
          font-size: 14px;
        }
      }

      .center {
        margin-bottom: 24px;
        margin-top: 10px;

        div > p {
          margin-bottom: 8px;
          font-size: 14px;
          color: #303133;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        p {
          margin-top: 4px;
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}
</style>
