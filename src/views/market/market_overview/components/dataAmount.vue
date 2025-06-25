<template>
  <div class="oneBox" style="padding-bottom: 24px">
    <!-- <div class="titleBox"> -->
    <!-- 头部标签 -->
    <nav class="top">
      <p class="titleLeft">数据总计</p>
      <p class="upDateTime">更新时间：{{ dataTime }}</p>
    </nav>

    <!-- 内容 -->
    <div class="content">
      <section class="list">
        <div class="title">
          <span>全员营销成员总数</span>

          <el-tooltip
            class="item"
            effect="dark"
            content="参与过全员营销任务的员工总数"
            placement="top"
          >
            <img
              style="width: 14px; height: 14px; margin-left: 8px"
              src="\src\assets\images\operate\tip_line.png"
              alt
            />
          </el-tooltip>
        </div>
        <div class="taskNum">{{ wanSliceFormat(count.taskDeliverJoinCount) }}</div>
      </section>

      <section class="list">
        <div class="title">
          <span>任务总数</span>

          <el-tooltip
            class="item"
            effect="dark"
            content="成功创建的任务数，含已删除任务数"
            placement="top"
          >
            <img
              style="width: 14px; height: 14px; margin-left: 8px"
              src="\src\assets\images\operate\tip_line.png"
              alt
            />
          </el-tooltip>
        </div>
        <div class="taskNum">{{ wanSliceFormat(count.taskCount) }}</div>
      </section>

      <section class="list">
        <div class="title">
          <span>短视频总数</span>

          <el-tooltip
            class="item"
            effect="dark"
            content="参与全员营销任务的视频数（已发到线上，含已删除的视频）"
            placement="top"
          >
            <img
              style="width: 14px; height: 14px; margin-left: 8px"
              src="\src\assets\images\operate\tip_line.png"
              alt
            />
          </el-tooltip>
        </div>
        <div class="taskNum">{{ wanSliceFormat(count.taskVideoCount) }}</div>
      </section>

      <section class="list" v-if="systemVersion == 3">
        <div class="title">
          <span>直播场次总数</span>

          <el-tooltip
            class="item"
            effect="dark"
            content="营销任务直播场次数，含质检不合格直播"
            placement="top"
          >
            <img
              style="width: 14px; height: 14px; margin-left: 8px"
              src="\src\assets\images\operate\tip_line.png"
              alt
            />
          </el-tooltip>
        </div>
        <div class="taskNum">{{ wanSliceFormat(count.taskLiveCount) }}</div>
      </section>

      <section class="list">
        <div class="title">
          <span>品牌曝光总数</span>

          <el-tooltip
            class="item"
            effect="dark"
            :content="
              systemVersion === 4
                ? '营销任务的视频曝光数（视频数据每12小时更新一次）'
                : '营销任务的视频曝光数加上营销任务的直播观看人次总和（视频数据每12小时更新一次）'
            "
            placement="top"
          >
            <img
              style="width: 14px; height: 14px; margin-left: 8px"
              src="\src\assets\images\operate\tip_line.png"
              alt
            />
          </el-tooltip>
        </div>
        <div class="taskNum">{{ wanSliceFormat(count.taskTotalPlayCount) }}</div>
      </section>

      <section class="list">
        <div class="title">
          <span>单条视频最高播放数</span>
          <el-tooltip
            class="item"
            effect="dark"
            content="营销任务单条视频的最高播放数"
            placement="top"
          >
            <img
              style="width: 14px; height: 14px; margin-left: 8px"
              src="\src\assets\images\operate\tip_line.png"
              alt
            />
          </el-tooltip>
        </div>
        <div class="taskNum">{{ wanSliceFormat(count.taskVideoMaxPlayCount) }}</div>
      </section>

      <section class="list" v-if="systemVersion == 3">
        <div class="title">
          <span>单场直播最高观看人数</span>
          <el-tooltip
            class="item"
            effect="dark"
            content="营销任务单场直播的最高观看人数"
            placement="top"
          >
            <img
              style="width: 14px; height: 14px; margin-left: 8px"
              src="\src\assets\images\operate\tip_line.png"
              alt
            />
          </el-tooltip>
        </div>
        <div class="taskNum">{{ wanSliceFormat(count.taskLiveMaxViewCount) }}</div>
      </section>

      <section class="list" v-if="brandViewMode === 1">
        <div class="title">
          <span>任务销售总额</span>

          <el-tooltip
            class="item"
            effect="dark"
            content="通过全员营销任务挂载小黄车产生的付款订单总额"
            placement="top"
          >
            <img
              style="width: 14px; height: 14px; margin-left: 8px"
              src="\src\assets\images\operate\tip_line.png"
              alt
            />
          </el-tooltip>
        </div>
        <div class="taskNum">
          {{ count.taskOrderAmountCount ? wanSliceFormat(count.taskOrderAmountCount / 100) : '' }}
        </div>
      </section>

      <section class="list" v-if="systemVersion == 3">
        <div class="title">
          <span>活动线索数</span>

          <el-tooltip
            class="item"
            effect="dark"
            content="通过小程序和任务挂载抖音小风车产生的线索数"
            placement="top"
          >
            <img
              style="width: 14px; height: 14px; margin-left: 8px"
              src="\src\assets\images\operate\tip_line.png"
              alt
            />
          </el-tooltip>
        </div>
        <div class="taskNum">
          {{ count.activityLeaveOrderCount ? wanSliceFormat(count.activityLeaveOrderCount) : '' }}
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { getTotalDetail } from '@/api/market/overview.js'
import { dateFormat, wanSliceFormat } from '@/utils/tools.js'
import { useStore } from 'vuex'
const store = useStore()
const brandViewMode = computed(() => store.state.user.brandViewMode)
const systemVersion = computed(() => store.state.user.systemVersion)

const count = ref('')
const dataTime = ref('')
dataTime.value = dateFormat(new Date(), 'YYYY-MM-DD hh:mm:ss')
const getTotal = () => {
  getTotalDetail({}).then(res => {
    console.log(res)
    count.value = res.data
  })
}

function initStyle() {
  document.querySelectorAll('.list').forEach((item, index) => {
    if (index % 4 === 0) {
      item.classList.add('list_first_lines')
    }
  })
}

getTotal()
onMounted(() => {
  initStyle()
})
</script>

<style lang="scss" scoped>
.oneBox {
  border-radius: 4px;
  padding: 0 14px;
  background: #fff;
  .top {
    padding-top: 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .titleLeft {
      font-size: 18px;
      font-family: PingFangSC-Semibold, PingFang SC;
      font-weight: 600;
      color: #303133;
    }
    .upDateTime {
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #909399;
    }
  }

  .content {
    margin-top: 24px;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    .placeholder {
      width: 24%;
      height: 85px;
      // background: #f6f7f8;
      border-radius: 4px;
      margin-bottom: 8px;
      padding: 12px 0 0 14px;
      box-sizing: border-box;
    }

    .list {
      width: 24%;
      height: 85px;
      background: #f6f7f8;
      border-radius: 4px;
      margin-bottom: 8px;
      padding: 20px 0 0 12px;
      box-sizing: border-box;
      margin-left: calc(4% / 3);
      .title {
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #303133;
        margin-bottom: 4px;
        display: flex;
        align-items: center;
      }
      .taskNum {
        padding-top: 5px;
        margin-top: 5px;
        font-size: 24px;
        font-family: PingFangSC-Semibold, PingFang SC;
        font-weight: 600;
        color: #303133;
      }
    }
    .list_first_lines {
      margin-left: 0;
    }
  }
}
</style>
