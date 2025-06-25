<template>
  <div class="oneBox" style="padding-bottom: 14px">
    <!-- <div class="titleBox"> -->
    <!-- 头部标签 -->
    <nav class="top">
      <div class="titleLeft">运营数据</div>
      <div class="topRight">
        <el-date-picker
          style="width: 240px"
          type="daterange"
          v-model="dataTime"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          unlink-panels
          :disabled-date="
            time => {
              return time.getTime() > Date.now()
            }
          "
          :clearable="false"
          :editable="false"
          @change="timeChange"
        ></el-date-picker>
        <!-- 筛选 -->
        <search_popover
          :hasBusiness="true"
          :searchQuery="searchComponents"
          :searchParams="otherComponents"
          @updateQuery="updateQuery"
        ></search_popover>
      </div>
    </nav>

    <!-- 内容 -->
    <div class="content">
      <template v-for="(item, index) of block" :key="item.id">
        <section class="list" v-if="!isShowAll && index < minShowNum && item.show">
          <div class="title">
            {{ item.title }}
            <el-tooltip class="item" effect="dark" :content="item.tip" placement="top">
              <img
                style="width: 14px; height: 14px; margin-left: 8px"
                src="\src\assets\images\operate\tip_line.png"
                alt
              />
            </el-tooltip>
          </div>
          <div class="taskNum">{{ wanSliceFormat(item.num) }}</div>
        </section>
        <section class="list" v-if="isShowAll && item.show">
          <div class="title">
            {{ item.title }}
            <el-tooltip class="item" effect="dark" :content="item.tip" placement="top-start">
              <img
                style="width: 14px; height: 14px; margin-left: 8px"
                src="\src\assets\images\operate\tip_line.png"
                alt
              />
            </el-tooltip>
          </div>
          <div class="taskNum">{{ wanSliceFormat(item.num) }}</div>
        </section>
      </template>
      <!--   留资模式的占位   -->
      <template v-if="brandViewMode !== 1">
        <section class="list" style="background: #fff" v-if="isShowAll"></section>
        <section class="list" style="background: #fff" v-if="isShowAll"></section>
      </template>
      <template v-else>
        <section class="list" style="background: #fff" v-if="isShowAll"></section>
      </template>
    </div>
    <template v-if="!isShowAll">
      <a @click="showAll" style="text-align: center; display: block">
        更多
        <el-icon>
          <i-arrow-down-bold />
        </el-icon>
      </a>
    </template>
    <template v-if="isShowAll">
      <a @click="hideAll" style="text-align: center; display: block">
        收起
        <el-icon>
          <i-arrow-up-bold />
        </el-icon>
      </a>
    </template>
  </div>
</template>

<script setup>
import { getTaskData } from '@/api/market/overview.js'
import { dateFormat, wanSliceFormat, isNotEmpty } from '@/utils/tools.js'
import { useStore } from 'vuex'
const store = useStore()
const isShowAll = ref(false)
const minShowNum = ref(4)
const dataTime = ref([new Date() - 6 * 24 * 60 * 60 * 1000, new Date()])
const dataList = reactive({
  startTime: '',
  endTime: ''
})
const searchComponents = ref([
  {
    type: 'chooseDept',
    label: '部门',
    val: [],
    defaultVal: [],
    filed: 'areaIds',
    multiple: true,
    isUsePermission: true
  }
])
const otherParams = ref()
const otherComponents = ref([])
// 修改 datePicker
const timeChange = v => {
  dataList.startTime = dateFormat(v[0]) + ' 00:00:00'
  dataList.endTime = dateFormat(v[1]) + ' 23:59:59'
  TaskData()
}
// 筛选组件获取到的值
function updateQuery(e, searchComponents) {
  otherParams.value = isNotEmpty(e) ? e : null
  otherComponents.value = isNotEmpty(searchComponents)
    ? JSON.parse(JSON.stringify(searchComponents))
    : null

  TaskData()
}
const brandViewMode = computed(() => store.state.user.brandViewMode)
const systemVersion = computed(() => store.state.user.systemVersion)

// dataTime.value = dateFormat(new Date(), 'YYYY-MM-DD hh:mm:ss')
// dateFormat(new Date(e[0].name), 'YYYY-MM-DD hh:mm:ss')
const block = reactive([
  {
    title: '新增任务数',
    num: 0,
    tip: '成功创建的任务数，含已删除任务',
    id: 0,
    show: true
  },
  {
    title: '新增任务分发数',
    num: 0,
    tip: '营销任务分发到员工的次数，每人每接收一次任务记为1',
    id: 1,
    show: true
  },
  {
    title: '参与任务人数',
    num: 0,
    tip: '参与全员营销任务的人数',
    id: 2,
    show: true
  },
  {
    title: '参与成功人数',
    num: 0,
    tip: '参与成功全员营销任务的人数',
    id: 11,
    show: true
  },
  {
    title: '完成任务人数',
    num: 0,
    tip: '完成全员营销任务的人数',
    id: 3,
    show: true
  },
  {
    title: '任务视频数',
    num: 0,
    tip: '参与全员营销任务的视频数（已发到线上，含已删除的视频）',
    id: 4,
    show: true
  },
  {
    title: '视频播放数',
    num: 0,
    tip: '任务视频新增播放数',
    id: 5,
    show: false
  },
  {
    title: '任务直播场次数',
    num: 0,
    tip: '营销任务直播场次数，含质检不合格直播',
    id: 6,
    show: systemVersion.value !== 4
  },
  {
    title: '直播观看人次',
    num: 0,
    tip: '任务直播新增观看人次',
    id: 7,
    show: systemVersion.value !== 4
  },
  {
    title: '任务订单数',
    num: 0,
    tip: '任务产生的抖店订单数（挂载小黄车）',
    id: 8,
    show: brandViewMode.value === 1
  },
  {
    title: '任务销售额',
    num: 0,
    tip: '任务产生的销售额（挂载小黄车），只统计付款额',
    id: 9,
    show: brandViewMode.value === 1
  },
  {
    title: '活动线索数',
    num: 0,
    tip: '通过小程序和任务挂载抖音小风车产生的线索数',
    id: 10,
    show: systemVersion.value !== 4
  }
])
const showAll = () => {
  isShowAll.value = true
  minShowNum.value = block.length
}
const hideAll = () => {
  isShowAll.value = false
  minShowNum.value = 4
}

const TaskData = () => {
  let params = {
    startTime: dataList.startTime || dateFormat(new Date(dataTime.value[0])) + ' 00:00:00', // 开始时间
    endTime: dataList.endTime || dateFormat(dataTime.value[1]) + ' 23:59:59' // 结束时间}
  }
  params = { ...params, ...otherParams.value }
  getTaskData(params).then(res => {
    // debugger
    block.forEach(e => {
      switch (e.title) {
        case '新增任务数':
          e.num = res.data.taskCount
          break
        case '新增任务分发数':
          e.num = res.data.taskDeliverCount
          break
        case '参与任务人数':
          e.num = res.data.taskDeliverJoinCount
          break
        case '参与成功人数':
          e.num = res.data.taskDeliverSucceedJoinCount
          break
        case '完成任务人数':
          e.num = res.data.taskDeliverFinishCount
          break
        case '任务视频数':
          e.num = res.data.taskVideoCount
          break
        case '视频播放数':
          e.num = res.data.taskPlayCount
          break
        case '任务直播场次数':
          e.num = res.data.taskLiveCount
          break
        case '直播观看人次':
          e.num = res.data.taskLiveViewCount
          break
        case '任务订单数':
          e.num = res.data.taskOrderCount
          break
        case '任务销售额':
          e.num = res.data.taskOrderAmountCount ? res.data.taskOrderAmountCount / 100 : 0
          break
        case '活动线索数':
          e.num = res.data.activityLeaveOrderCount
          break
      }
    })

    console.log(res)
  })
}
TaskData()
</script>

<style lang="scss" scoped>
.oneBox {
  border-radius: 4px;
  padding: 0 14px;
  // margin-bottom: 10px;
  background: #fff;
  a {
    color: #909399;
    font-size: 14px;
  }
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
    .topRight {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
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
    justify-content: space-between;

    .list {
      width: 24%;
      height: 85px;
      background: #f6f7f8;
      border-radius: 4px;
      margin-bottom: 8px;
      padding: 20px 0 0 12px;
      box-sizing: border-box;
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
        font-size: 24px;
        font-family: PingFangSC-Semibold, PingFang SC;
        font-weight: 600;
        color: #303133;
      }
    }
  }
}
</style>
