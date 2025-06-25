<template>
  <div class="activity_detail" ref="actConDom" :style="{ height: actConHeight }">
    <div class="act_con">
      <div class="title_box">
        <p class="title">{{ activityDetailDate.title || '-' }}</p>
        <div class="title_r_box">
          <el-switch
            :model-value="activityDetailDate.isEnableNew"
            inline-prompt
            @click.stop="toggleSecKill"
          ></el-switch>
          <el-dropdown class="ml_16">
            <img src="@/assets/images/market/market_calendar/more.png" alt class="more_img" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="modification">编辑</el-dropdown-item>
                <el-dropdown-item @click="delGroup">删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <!-- 活动时间 -->
      <div class="act_box act_time">
        <div class="act_label">活动时间</div>
        <div class="act_value" v-if="activityDetailDate.showStartTime">
          <div>{{ activityDetailDate.showStartTime + '-' + activityDetailDate.showEndTime }}</div>
        </div>
        <div v-else class="act_value">-</div>
      </div>
      <!-- 活动简介 -->
      <div class="act_box">
        <div class="act_label">活动简介</div>
        <div class="act_value">
          <div class="act_desc_text" v-if="activityDetailDate.activityText">
            {{ activityDetailDate.activityText || '' }}
          </div>
          <div
            :style="!activityDetailDate.activityText ? 'margin-top:-8px' : ''"
            class="act_desc_img"
            v-if="
              activityDetailDate.activityPhotoList &&
              activityDetailDate.activityPhotoList.length > 0
            "
          >
            <el-image
              class="img_cover"
              :src="item"
              fit="cover"
              v-for="(item, index) in activityDetailDate.activityPhotoList"
              :key="index"
              :preview-src-list="activityDetailDate.activityPhotoList"
              :initial-index="index"
            ></el-image>
          </div>
        </div>
      </div>
      <!-- 活动封面 -->
      <div class="act_box">
        <div class="act_label">活动封面</div>
        <div class="act_value">
          <el-image
            class="act_cover_img"
            v-if="activityDetailDate.cover"
            :src="activityDetailDate.cover"
            fit="cover"
            :preview-src-list="[activityDetailDate.cover]"
          ></el-image>
        </div>
      </div>
      <!-- 活动目标 -->
      <div class="act_box target_box">
        <div class="act_label">活动目标</div>
        <div class="act_value">
          <!-- 这里是目标组件 -->
          <targetData :dataList="armData" />
          <div class="act_data" @click="goData">
            <span class="text">数据</span>
            <span class="right">
              <span class="right_con"></span>
            </span>
          </div>
        </div>
      </div>
      <!-- 活动规划 -->
      <div class="act_box">
        <div class="act_label">活动规划</div>
        <div
          class="act_value"
          style="width: calc(100% - 68px); padding-bottom: 24px"
          v-if="activityDetailDate.tasks && activityDetailDate.tasks.length > 0"
        >
          <div
            class="act_list_item"
            v-for="(item, index) in activityDetailDate.tasks"
            :key="index"
            @click="toDetail(item)"
          >
            <img :src="item.taskCover" alt="" class="item_img" v-if="item.taskCover" />
            <img class="item_img" v-else :src="taskImg[item.type]" alt />
            <div class="item_right">
              <p class="item_title">{{ item.name || '-' }}</p>
              <p class="item_time">
                {{
                  item.startTime.slice(0, 10).split('-').join('.') +
                  '-' +
                  item.endTime.slice(5, 10).split('-').join('.')
                }}
              </p>
            </div>
          </div>
        </div>
        <div v-else class="act_value">暂无任务</div>
      </div>
    </div>
    <!-- 返回 -->
    <div class="back_btn">
      <el-button type="primary" @click="back">返回</el-button>
    </div>
    <!-- 任务数据详情弹窗 -->
    <taskDetailDialog
      v-if="$data.detailDialog.show"
      :detailDialog="$data.detailDialog"
      @showTaskInitDialog="showTaskInitDialog"
      @updateList="updateList"
    />
    <!-- 新建任务-具体内容的弹窗 -->
    <taskInitDialog
      v-if="$data.initDialog.showOfDetail"
      :initDialog="$data.initDialog"
      @updateList="updateList"
      @showDetailDialog="showDetailDialog"
    />
    <!-- 富文本图片预览 -->
    <previewImg :dateDialog="previewImgData" />
  </div>
</template>

<script setup>
import targetData from './sComponents/dataProgress.vue'
import previewImg from './sComponents/preview_img.vue'
import { deleteActivity, activityDetail, switchEnable } from '@/api/market/calendar.js'
import taskDetailDialog from './task_detail_dialog.vue'
import taskInitDialog from './task_init_dialog.vue'
import { throttle } from '@/utils/tools.js'

const props = defineProps({
  id: {
    type: String,
    default: null
  }
})

const message = inject('$message')
const $confirm = inject('$confirm')

const emits = defineEmits(['showData', 'back', 'changeActivity'])

const taskImg = ref({
  1: 'https://tagvv-1256030678.file.myqcloud.com/202211218cq4m.png',
  2: 'https://tagvv-1256030678.file.myqcloud.com/20221121ph8j0.png',
  3: 'https://tagvv-1256030678.file.myqcloud.com/20221121a8efq.png',
  5: 'https://tagvv-1256030678.file.myqcloud.com/20221121y86f5.png',
  6: 'https://tagvv-1256030678.file.myqcloud.com/20230926bhqiz.png'
})
const { id } = toRefs(props)
const brandViewMode = ref(null)
brandViewMode.value = Number(localStorage.getItem('brandViewMode'))

const activityDetailDate = ref({}) // 一个活动
const armData = ref([]) // 活动目标数据
const actConDom = ref(null) // 组件DOM
const actConHeight = ref(null) // 组件高度，目前属于废弃状态，但是调用不影响
const $data = reactive({
  detailDialog: {
    show: false
  }, // 某个任务数据弹窗
  initDialog: {
    showOfType: false, // 是否显示选择类型的弹窗
    showOfDetail: false, // 是否显示具体内容的弹窗
    type: null, // 选择的任务类型
    startTime: '', // 哪个日期下点击的开始和结束时间就是那天
    endTime: '',
    id: null, // 如果是编辑的话就填对应的ID
    initInfo: {
      timeChoseDisabled: false,
      startTime: null,
      endTime: null
    }
  } // 新建任务的弹窗
})

// 图片预览
const previewImgData = reactive({
  show: false,
  imgUrl: ''
})

// 打开任务数据弹窗
const toDetail = throttle(function (x, y) {
  console.log('打开任务详情需要的参数', x, y)
  $data.detailDialog = {
    show: true,
    id: x.id,
    origin: y === 'dateDialog' ? 'dateDialog' : 'calendar'
  }
}, 500)
// 打开任务详情/新建任务的弹窗
function showTaskInitDialog(e) {
  console.log('任务,', e.copyId)
  $data.initDialog = {
    showOfType: false, // 是否显示选择类型的弹窗
    showOfDetail: true, // 是否显示具体内容的弹窗
    id: e.id || null,
    copyId: e.copyId || null,
    type: e.type,
    disEdit: e.disEdit || 0,
    origin: 'detailDialog',
    // 坑 复制与编辑都是这个方法，但是复制传过来的id叫copyId
    initInfo: {
      timeChoseDisabled: true,
      startTime: getInitTime(e.id || e.copyId)[0]?.startTime, // 任务的开始时间
      endTime: activityDetailDate.value.activityEndTime // 活动的结束时间
    }
  }
  // 复制的时候不限制任务结束时间
  if (e.copyId) {
    $data.initDialog.initInfo = {
      timeChoseDisabled: false,
      startTime: null,
      endTime: null
    }
  }
}

// 任务创建或者编辑成功
function updateList(action, date) {
  getDetail()
}
function showDetailDialog() {
  $data.detailDialog.show = true
}
function getInitTime(id) {
  if (!id) return []
  return activityDetailDate.value.tasks.filter(item => {
    return item.id === id
  })
}
// 获取显示的活动时间,传入yyyy-mm-dd hh:mm:ss 返回 yyyy年mm月dd日
function getShowDate(time) {
  if (!time) return '-'
  const y = new Date(time).getFullYear() || '-'
  const m = new Date(time).getMonth() + 1 || '-'
  const d = new Date(time).getDate() || '-'
  return `${y}年${m}月${d}日`
}

// 获取活动详情
function getDetail() {
  activityDetail({ id: id.value }).then(res => {
    console.log('获取活动详情的res', res)
    if (res.code === 0) {
      if (res.data.viewMode) {
        brandViewMode.value = res.data.viewMode
      }
      res.data.isEnableNew = res.data.isEnable === 1
      // 处理活动目
      if (brandViewMode.value === 1) {
        armData.value = [
          {
            key: 1,
            label: '曝光量',
            current: Number(res.data.exposure),
            target: Number(res.data.exposureTarget)
          },
          {
            key: 3,
            label: '销售额',
            current: Number(res.data.payment),
            target: Number(res.data.paymentTarget)
          }
        ]
      }
      if (brandViewMode.value === 2) {
        armData.value = [
          {
            key: 1,
            label: '曝光量',
            current: Number(res.data.exposure),
            target: Number(res.data.exposureTarget)
          },
          {
            key: 2,
            label: '线索数',
            current: Number(res.data.clue),
            target: Number(res.data.clueTarget)
          }
        ]
      }
      // 处理活动时间
      res.data.showStartTime = getShowDate(res.data.activityStartTime)
      res.data.showEndTime = getShowDate(res.data.activityEndTime)

      res.data.activityPhotoList = res.data.activityPhotos ? res.data.activityPhotos.split(',') : []

      activityDetailDate.value = res.data
      nextTick(() => {
        getHeight()
      })
    }
  })
}

// 是否开启
function toggleSecKill() {
  switchEnable({
    id: activityDetailDate.value.id,
    isEnable: !activityDetailDate.value.isEnableNew ? 1 : 0,
    priority: activityDetailDate.value.priority
  }).then(res => {
    if (res.code === 0) {
      getDetail()
      // 同步列表
    }
  })
}
// 修改
function modification() {
  // 开启的活动不能进入编辑
  if (activityDetailDate.value.isEnableNew || activityDetailDate.value.isEnableNew === 1) {
    return message.warning('活动开启时不允许编辑，请先关闭活动')
  }
  console.log('isEnable')
  console.log(activityDetailDate.value.isEnable)
  if (activityDetailDate.value.isEnable === -1) {
    return message.warning('活动已结束，无法编辑')
  }
  emits('changeActivity', activityDetailDate.value)
}

// 删除
function delGroup() {
  $confirm({
    title: '系统提醒',
    content: '确认删除？',
    success() {
      deleteActivity({ id: id.value }).then(res => {
        if (res.code === 0) {
          message.success('删除成功')
        }
        emits('back', 'true')
      })
    }
  })
}
// 返回
function back() {
  emits('back', 'true')
}
function goData() {
  emits('showData', id.value)
}
watch(
  () => id.value,
  value => {
    getDetail()
  },
  {
    immediate: true
  }
)

// 处理高度
function getHeight() {
  nextTick(() => {
    console.log('高度', actConDom.value?.clientHeight)
    actConHeight.value = actConDom.value?.clientHeight < 746 ? '100%' : '100%'
  })
}
</script>

<style lang="scss" scoped>
.activity_detail {
  width: 100%;
  background: #ffffff;
  position: relative;
  border-radius: 4px;
  .act_con {
    padding: 0 20px 64px;
    overflow-y: auto;
    height: 100%;
    .title_box,
    .title_r_box {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .title_box {
      padding: 17px 0;
      width: 100%;
      .title {
        font-size: 18px;
        font-family: PingFangSC-Semibold, PingFang SC;
        font-weight: 600;
        color: #303133;
        line-height: 26px;
        max-width: 271px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow-wrap: break-word;
        overflow: hidden;
      }
    }
    .title_r_box {
      .ml_16 {
        cursor: pointer;
        img {
          width: 24px;
          height: 24px;
          border-radius: 2px;
        }
        .more_img:hover {
          background: #e9e9e9;
        }
      }
    }
    // 活动时间
    .act_box {
      display: flex;
      align-items: flex-start;
      margin-top: 20px;
      .act_label {
        width: 56px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #606266;
        line-height: 20px;
        white-space: nowrap;
      }
      .act_value {
        font-size: 14px;
        width: calc(100% - 68px);
        font-weight: 400;
        color: #303133;
        line-height: 20px;
        margin-left: 12px;
        .act_img {
          width: 64px;
          height: 64px;
          background: #d8d8d8;
          border-radius: 2px;
          margin-left: 8px;
          margin-top: 4px;
          &:first-of-type,
          &:nth-of-type(4n + 1) {
            margin-left: unset;
          }
        }
        .act_cover_img {
          width: 307px;
          height: 107px;
          border-radius: 2px;
          object-fit: cover;
        }
        .act_list_item {
          cursor: pointer;
          display: flex;
          padding: 8px;
          background: #f6f7f8;
          border-radius: 4px;
          width: 100%;
          margin-top: 8px;

          &:first-of-type {
            margin-top: unset;
          }
          .item_img {
            width: 56px;
            height: 56px;
            border-radius: 4px;
          }
          .item_right {
            margin-left: 8px;
            margin-top: 4px;
            width: calc(100% - 64px);
            .item_title {
              font-size: 16px;
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
              color: #303133;
              line-height: 22px;
              text-overflow: ellipsis;
              white-space: nowrap;
              overflow-wrap: break-word;
              overflow: hidden;
            }
            .item_time {
              font-size: 14px;
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
              color: #606266;
              line-height: 20px;
              margin-top: 6px;
            }
          }
        }
        .act_data {
          width: 72px;
          height: 28px;
          background: rgba(54, 79, 205, 0.1);
          border-radius: 4px;
          margin-top: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          .text {
            font-size: 14px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #364fcd;
            line-height: 20px;
          }
          .right {
            width: 16px;
            height: 16px;
            background: rgba(54, 79, 205, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            margin-left: 4px;
            .right_con {
              display: inline-block;
              width: 5px;
              height: 5px;
              border-top: 1.5px solid;
              border-right: 1.5px solid;
              border-color: #364fcd;
              transform: rotate(45deg);
              margin-left: 4px;
            }
          }
        }
      }
    }
    .act_time {
      margin-top: unset;
    }
    .target_box {
      .act_value {
        width: calc(100% - 68px);
      }
    }
  }
  .back_btn {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 56px;
    background: #ffffff;
    box-shadow: 0px -2px 8px 0px rgba(103, 103, 103, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.act_desc_text {
  font-size: 14px;
  font-weight: 400;
  color: #303133;
  line-height: 20px;
  white-space: pre-wrap;
  word-break: break-word;
}
.act_desc_img {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  .img_cover {
    margin: 8px 8px 0 0;
    width: 64px;
    height: 64px;
    border-radius: 2px;
    object-fit: cover;
  }
}
</style>
