<template>
  <div class="operation-banner">
    <title-wrapper title="" :subtitle="subtitleObj[squareInfo.switch]">
      <template #right>
        <el-switch
          @change="validConfigFun"
          :before-change="beoreOpenChange.bind(this, squareInfo.switch)"
          v-model="squareInfo.switch"
          active-value="1"
          inactive-value="0"
        />
      </template>
    </title-wrapper>
    <div class="container">
      <div class="container_title">内容设置</div>
      <!-- 添加活动的按钮 -->
      <el-button type="primary" :icon="transElIconName('Plus')" @click="addActFun">
        添加活动专区
      </el-button>
      <template v-if="componentList && componentList.length > 0">
        <draggable
          v-model="componentList"
          group="square_setting"
          @start="drag = true"
          @end="drag = false"
          item-key="index"
          handle=".icon-tuodongweizhi"
          :animation="300"
        >
          <template #item="{ element, index }">
            <div class="one_compontent">
              <!-- 添加Banner图 -->
              <div class="banner_box" v-if="element.type === 'banner'">
                <banner-dialog
                  :info="element.banner"
                  :routeType="[1, 2]"
                  addText="添加Banner"
                  type="activity_square"
                ></banner-dialog>
                <!-- <sort-icon :list="componentList" :index="index" :hasDelete="false" :hasMove="true"> -->
                <div class="top_btn">
                  <el-switch v-model="element.banner.switch" active-value="1" inactive-value="0" />
                  <el-tooltip
                    class="top_tip"
                    effect="dark"
                    content="开关控制活动banner图是否显示"
                    placement="top"
                  >
                    <img
                      style="width: 16px; height: 16px; object-fit: contain; margin-left: 11px"
                      class="tip_icon"
                      src="https://tagvv-1256030678.file.myqcloud.com/20221124bu1uq.png"
                      alt=""
                    />
                  </el-tooltip>
                </div>
                <!-- </sort-icon> -->
              </div>
              <!-- 活动专区 -->
              <template v-else>
                <div class="one_active">
                  <!-- 专区标题 -->

                  <div class="active_title">专区标题</div>
                  <div class="title_input_box">
                    <el-input
                      v-model.trim="element.title"
                      class="title_input"
                      clearable
                      placeholder="请输入专区标题"
                      maxlength="15"
                    />
                    <div class="word_num">{{ element.title ? element.title.length : 0 }} / 15</div>
                  </div>

                  <!-- 关联任务 -->
                  <div class="active_title">
                    关联任务
                    <div class="add_title" @click="addTaskFun(index)">
                      <img
                        src="https://tagvv-1256030678.file.myqcloud.com/20221124a0n9c.png"
                        alt=""
                      />
                      添加
                    </div>
                  </div>
                  <div class="active_task" v-if="element.tasks && element.tasks.length > 0">
                    <div class="one_task" v-for="(x, y) in element.tasks" :key="y">
                      <div class="task_name line-hidden1">{{ x.name || '请选择任务' }}</div>
                      <div class="task_del" @click="delTaskFun(y, index)">删除</div>
                    </div>
                  </div>
                  <sort-icon
                    :list="componentList"
                    :index="index"
                    :hasDelete="showActDel(element, index)"
                    :hasMove="true"
                  ></sort-icon>
                </div>
              </template>
            </div>
          </template>
        </draggable>
      </template>
    </div>
    <task-dialog
      v-model:show="addTaskForm.show"
      v-if="addTaskForm.show"
      @confirm="onTaskConfirm"
    ></task-dialog>
  </div>
</template>
<script setup>
import { beforeOpenSwitchChange } from '../config.js'
import SortIcon from '../../../components/sort_icon.vue'

import TaskDialog from '../../../components/task_dialog.vue'

import draggable from 'vuedraggable'
import BannerDialog from '../../../components/banner_dialog.vue'
// import uploadImg from '@/views/market/miniprogram_operation/components/upload_image.vue'
import { throttle, transElIconName } from '@/utils/tools.js'
import TitleWrapper from '../../../components/title_wrapper.vue'
const props = defineProps({
  switchOpenNumber: Number, // 开关打开的个数
  data: {
    type: Object,
    default() {
      return {
        squareInfo: {}
      }
    }
  }
})
const drag = ref(false)
const { squareInfo } = toRefs(props.data)
const subtitleObj = {
  1: '根据阶段性活动周期定制活动广场，运营重点更突出！',
  0: '开关关闭，全员营销小程序活动页将隐藏“活动广场”'
}
const componentList = ref([])
// 添加活动专区
const addActFun = throttle(() => {
  componentList.value.push({
    id: new Date().getTime(),
    type: 'task',
    tasks: [],
    title: ''
  })
}, 500)
// 是否显示活动专区的删除按钮
function showActDel(e, i) {
  let id = null
  let index = null
  componentList.value.forEach((x, y) => {
    if (x.type === 'task' && id == null) {
      id = x.id
      index = y
    }
  })

  return index !== i
}
// 添加任务的弹窗信息
const addTaskForm = reactive({
  show: false, // 是否显示添加任务的弹窗
  index: null // 往第几个专区里添加任务
})
// 添加专区任务
const addTaskFun = throttle(i => {
  addTaskForm.index = i
  addTaskForm.show = true
}, 500)
// 从弹窗里选定了任务
function onTaskConfirm(item) {
  componentList.value[addTaskForm.index].tasks.push({
    name: item.name,
    taskId: item.id,
    type: item.type,
    endTime: item.endTime,
    startTime: item.startTime,
    status: item.status,
    taskTags: item.taskTags || [],
    taskCover: item.taskCover,
    taskInfo: item.taskInfo
  })
}
// 删除活动专区任务
const delTaskFun = throttle((x, i) => {
  componentList.value[i].tasks.splice(x, 1)
}, 700)
const emits = defineEmits(['updateSetting', 'validConfig', 'beforeOpenSwitchChange'])
function validConfigFun() {
  emits('validConfig', 'activity_square')
}
function beoreOpenChange(e) {
  console.log('squareInfo.switch', e, props.switchOpenNumber)
  return new Promise(resolve => {
    if (e === '1') {
      resolve(true)
    } else {
      resolve(beforeOpenSwitchChange(props.switchOpenNumber))
    }
  })
}
watch(
  () => componentList.value,
  value => {
    emits('updateSetting', 'activity_square', value)
  },
  { deep: true }
)
const defaultBannerInfo = ref({
  id: 1,
  type: 'banner',
  banner: {
    switch: '1',
    coverUrl: '',
    type: 1, // 1 不跳转， 2, 任务 3 课程 4,子课程
    radio: 1,
    jump: {}
  }
})
// 初始化
function init() {
  if (
    props.data.squareInfo &&
    props.data.squareInfo.list &&
    props.data.squareInfo.list.length > 0
  ) {
    const list = JSON.parse(JSON.stringify(props.data.squareInfo.list))
    // 如果之前保存的数据没有id,就自动给加上id 如果保存信息里没有banner给加上banner
    let hasBanner = false
    list.forEach((x, i) => {
      if (!x.id) {
        x.id = list.length + i
      }
      if (x.type === 'banner') {
        hasBanner = true
      }
    })
    if (!hasBanner) {
      const addInfo = JSON.parse(JSON.stringify(defaultBannerInfo.value))
      addInfo.id = list.length * 3 + 1
      list.unshift(addInfo)
    }
    componentList.value = list
  } else {
    const addInfo = JSON.parse(JSON.stringify(defaultBannerInfo.value))
    componentList.value = [addInfo]
  }
  console.log('获取到的活动广场信息', componentList.value)
}
init()
</script>
<style lang="scss" scoped>
@import '../../../components/css/setting_page.scss';
.one_compontent {
  margin-top: 20px;
}
.banner_box {
  width: 468px;
  min-height: 140px;
  background: #f6f7f8;
  border-radius: 4px;
  position: relative;
  .top_btn {
    position: absolute;
    right: 16px;
    top: 16px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    .top_tip {
      width: 22px;
      height: 22px;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
  }
}
.one_active {
  width: 468px;
  padding: 16px;
  background: #f6f7f8;
  border-radius: 4px;
  position: relative;
  .del_btn {
    font-size: 16px;
    position: absolute;
    right: 16px;
    top: 16px;
    color: #909399;
    cursor: pointer;
    .iconfont:hover {
      color: $theme-color;
    }
  }
  .active_title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    line-height: 22px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .add_title {
      margin-left: 12px;
      cursor: pointer;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      font-size: 14px;
      font-weight: 400;
      color: #364fcd;
      line-height: 20px;
      img {
        margin-top: -1px;
        margin-right: 4px;
        width: 16px;
        height: 16px;
        object-fit: cover;
      }
    }
  }
  .title_input_box {
    margin: 12px 0 16px;
    width: 396px;
    height: 32px;
    border-radius: 2px;
    background: #ffff;
    position: relative;
    .word_num {
      position: absolute;
      right: 12px;
      top: 6px;
      font-size: 14px;
      font-weight: 400;
      color: #bfc4cd;
      line-height: 20px;
    }
  }
  .title_input {
    width: 350px;
    height: 32px;
    font-size: 14px;
    font-weight: 400;
    color: #303133;
    line-height: 20px;
    :deep(.el-input__inner) {
      border: none;
      padding-left: 12px;
      border-radius: 2px;
    }
    :deep(.el-input__count) {
      color: #bfc4cd;
      font-size: 14px;
    }
    :deep(.el-input__count .el-input__count-inner) {
      padding: 0 !important;
    }
  }
  .active_task {
    width: 100%;
    .one_task {
      margin-top: 12px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .task_name {
        padding: 6px 12px;
        width: 396px;
        height: 32px;
        background: #ffffff;
        border-radius: 2px;
        font-size: 14px;
        font-weight: 400;
        color: #606266;
        line-height: 20px;
      }
      .task_del {
        margin-left: 12px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 400;
        color: #364fcd;
        line-height: 20px;
      }
    }
  }
}
</style>
