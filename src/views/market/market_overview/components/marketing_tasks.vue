<template>
  <div class="oneBox">
    <!-- 头部标签 -->
    <nav class="top">
      <p class="titleLeft">营销任务</p>
      <el-link type="primary" @click="toALlTask" class="allTask">全部任务 ></el-link>
    </nav>
    <div class="content" v-if="taskList.length">
      <template v-for="(item, index) in taskList" :key="index">
        <section>
          <div class="nav">
            <p class="state">
              <img :src="typeIconEnum[item.type]" />
              <span style>{{ TASK_TYPE.getCN(item.type) }}任务</span>
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
                  'status-0': item.status === 0,
                  'status-1': item.status === 1 || item.status === 5,
                  'status-2': item.status === 3 || item.status === 7,
                  'status-3': item.status === 4,
                  'status-4': item.status === 2 || item.status === 6
                }"
              ></span>
              <span :class="{ active: item.status === 4 }">
                {{ TASK_STATUS.getCN(item.status) }}
              </span>
            </p>
          </div>
          <div class="center">
            <div style="display: flex; justify-content: space-between">
              <p>{{ item.name }}</p>
              <el-link type="primary" @click="getDetails(item)" class="look">查看</el-link>
            </div>

            <p>{{ item.startTime.slice(0, 10) }}-{{ item.endTime.slice(0, 10) }}</p>
          </div>
        </section>
        <p class="boundary" v-if="index < taskList.length - 1"></p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { getVTaskList } from '@/api/market/task.js'
import { ref } from 'vue-demi'
import { useRouter } from 'vue-router'
import { TASK_TYPE, TASK_STATUS } from '@/utils/dictionary/task'

const router = useRouter()

const taskList = ref([])
const typeIconEnum = {
  1: 'https://tagvv-1256030678.file.myqcloud.com/img/20211229182233b51cf74a22.png',
  2: 'https://tagvv-1256030678.file.myqcloud.com/img/20211229144603f8e18e1209.png',
  3: 'https://tagvv-1256030678.file.myqcloud.com/20220328zjfg8.png',
  5: 'https://tagvv-1256030678.file.myqcloud.com/20220519he08l.png',
  6: 'https://tagvv-1256030678.file.myqcloud.com/20230926mhcjn.png'
}
// 获取任务列表
function getTaskList() {
  getVTaskList({}).then(res => {
    const list = res.data.records || []
    taskList.value = list.slice(0, 3) || []
  })
}
// 跳转任务数据详情
function getDetails(row) {
  const urlEnum = {
    1: 'video_task/video_task_details',
    2: 'live_task/live_task_details',
    3: 'collecting_task/detail',
    5: 'study_task/detail',
    6: 'imgText_task/imgText_task_details'
  }
  router.push({
    path: urlEnum[row.type],
    query: {
      itemId: row.id,
      type: row.type
    }
  })
}
// 全部任务
function toALlTask() {
  router.push({
    path: 'video_task'
  })
}
onMounted(() => {
  getTaskList()
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
      &::nth-of-type(1) {
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
              font-size: 14px;
              margin-right: 12px;
              margin-left: 8px;
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
          width: 70%;
          font-size: 16px;
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
