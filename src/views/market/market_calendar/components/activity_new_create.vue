<template>
  <div class="new_activity" ref="actConDom" :style="{ height: actConHeight }">
    <div class="act_con">
      <!-- <div class="act_name">
        <div class="inputStyle">
          <el-input
            ref="inputDom"
            v-model="newObj.activityName"
            :maxlength="15"
            placeholder="请输入活动名称"
            :disabled="!canInput"
            :style="{ width: newObj.spanWidth }"
          ></el-input>
          <span class="spanText">{{ newObj.spanText }}</span>
        </div>
        <img
          src="https://tagvv-1256030678.file.myqcloud.com/20230209v54xr.png"
          alt
          @click.prevent="canInput = !canInput"
          class="input_img"
        />
      </div> -->

      <div class="act_item">
        <div class="act_label">活动名称</div>
        <el-input
          ref="inputDom"
          v-model.trim="newObj.activityName"
          :maxlength="15"
          show-word-limit
          placeholder="请输入活动名称"
        ></el-input>
      </div>
      <!-- 活动时间 -->
      <div class="act_item">
        <div class="act_label">活动时间</div>
        <el-date-picker
          v-model="newObj.time"
          type="daterange"
          range-separator="至"
          start-placeholder="请选择"
          end-placeholder="请选择"
          :default-value="activityChoseValue"
          :disabled-date="
            time => {
              ONE_DAY = 24 * 60 * 60 * 1000

              return time.getTime() < Date.now() - ONE_DAY
            }
          "
          @change="choseTime"
        />
      </div>
      <!-- 活动简介 -->
      <div class="act_item">
        <div class="act_label">活动简介</div>
        <div class="rich_text">
          <el-input
            v-model="newObj.activityText"
            maxlength="300"
            placeholder=" "
            show-word-limit
            type="textarea"
            :rows="4"
            @blur="retEmit($event)"
          />
        </div>
        <div class="upload_img_box">
          <template v-if="newObj.activityPhotoList && newObj.activityPhotoList.length > 0">
            <div class="one_img" v-for="(item, index) in newObj.activityPhotoList" :key="index">
              <el-image
                class="img_cover"
                :src="item"
                fit="cover"
                :preview-src-list="newObj.activityPhotoList"
                :initial-index="index"
              ></el-image>

              <img
                @click="delActPhoto(index)"
                class="upload_del"
                src="https://tagvv-1256030678.file.myqcloud.com/20230228q7yhp.png"
                alt
              />
            </div>
          </template>
          <uploadImage
            v-if="newObj.activityPhotoList && newObj.activityPhotoList.length < 5"
            :maxSize="2048"
            :index="0"
            @success="uploadImgSuccess"
            :showLoading="true"
          >
            <div class="upload_box">
              <el-icon class="icon-plus">
                <i-plus />
              </el-icon>
              <div class="text1">添加图片</div>
            </div>
          </uploadImage>
        </div>
        <div class="upload_tips" style="margin-top: 0">
          图片最多5张，单个不超过2M，支持png、jpg、jpeg格式
        </div>
      </div>
      <!-- 活动封面 -->
      <div class="act_item">
        <div class="act_label need_flex">
          <span>活动封面</span>
          <el-tooltip :content="'展示在小程序活动页面'" placement="top">
            <img
              style="width: 16px; height: 16px; margin-left: 12px"
              src="\src\assets\images\operate\tip_line.png"
              alt
            />
          </el-tooltip>
        </div>
        <div class="file_box">
          <div class="one_file" v-if="newObj.activityCover">
            <el-image
              class="file_cover"
              :src="newObj.activityCover"
              fit="cover"
              :preview-src-list="[newObj.activityCover]"
            ></el-image>
            <img
              class="del_icon"
              @click="newObj.activityCover = ''"
              src="https://tagvv-1256030678.file.myqcloud.com/2023022839692.png"
              alt
            />
          </div>
          <el-upload
            v-loading="imgLoading"
            v-if="!newObj.activityCover"
            :show-file-list="false"
            accept="image/jpeg, image/jpg, image/png"
            :action="action"
            list-type="picture"
            :on-success="handleSuccess"
            :on-error="handleError"
            :before-upload="beforeUploadFile"
          >
            <div class="upload_text">
              <img src="@/assets/images/operate/inspection_add.png" alt />
              添加Banner
            </div>
          </el-upload>
        </div>
        <div class="upload_tips">建议尺寸为750*256px，不超过2M，支持png、jpg、jpeg</div>
      </div>
      <!-- 活动目标 -->
      <div class="act_item">
        <div class="act_label">活动目标</div>
        <div class="need_flex">
          <div class="need_flex">
            <span style="white-space: nowrap">曝光量：</span>
            <el-tooltip :content="'视频播放量与直播观看人次之和'" placement="top">
              <img
                style="width: 16px; height: 16px; margin-right: 8px"
                src="\src\assets\images\operate\tip_line.png"
                alt
              />
            </el-tooltip>
            <div class="number_input">
              <el-input
                type="number"
                v-model="newObj.exposureNumber"
                placeholder="请输入"
                @input="numberChange('exposureNumber')"
                :disabled="type == 'edit'"
              ></el-input>
              <div class="but" v-if="type == 'create'">
                <div class="num_add" @click="newObj.exposureNumber++"></div>
                <div class="num_dec" @click="newObj.exposureNumber--"></div>
              </div>
              <div class="but" v-else>
                <div class="num_add"></div>
                <div class="num_dec"></div>
              </div>
            </div>
          </div>
          <div class="need_flex" style="margin-left: 32px" v-if="brandViewMode == 2">
            <span style="white-space: nowrap">线索数：</span>
            <div class="number_input" style="margin-left: 8px">
              <el-input
                type="number"
                @input="numberChange('cluesNumber')"
                v-model="newObj.cluesNumber"
                placeholder="请输入"
                :disabled="type == 'edit'"
              ></el-input>
              <div class="but" v-if="type == 'create'">
                <div class="num_add" @click="newObj.cluesNumber++"></div>
                <div class="num_dec" @click="newObj.cluesNumber--"></div>
              </div>
              <div class="but" v-else>
                <div class="num_add"></div>
                <div class="num_dec"></div>
              </div>
            </div>
          </div>
          <div class="need_flex number_input" style="margin-left: 32px" v-if="brandViewMode == 1">
            <span style="white-space: nowrap">销售额：</span>
            <!-- -->
            <div class="number_input" style="margin-left: 8px">
              <el-input
                type="number"
                v-model="newObj.salesNumber"
                @input="numberChange('salesNumber')"
                placeholder="请输入"
                :disabled="type == 'edit'"
              ></el-input>
              <div class="but" v-if="type == 'create'">
                <div class="num_add" @click="newObj.salesNumber++"></div>
                <div class="num_dec" @click="newObj.salesNumber--"></div>
              </div>
              <div class="but" v-else>
                <div class="num_add"></div>
                <div class="num_dec"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 活动规划 -->
      <div class="act_item">
        <div class="act_label" style="margin-bottom: 6px">活动规划</div>
        <div class="tabs_fun need_flex">
          <div class="create_btn">
            <el-button type="text" :icon="Plus" @click="showDialogRules(1)">添加任务</el-button>
            <el-button type="text" style="margin-left: 24px" @click="showDialogRules(2)">
              立即创建
            </el-button>
          </div>
          <div class="r_tips">
            共
            <span class="t_num">{{ newObj.taskList.length || 0 }}</span>
            个
          </div>
        </div>
        <draggable
          v-model="newObj.taskList"
          @start="drag = true"
          @end="dragEnd"
          item-key="taskId"
          handle=".move_btn"
          :animation="700"
        >
          <template #item="{ element, index }">
            <div class="task_list">
              <div class="task_item" @click="toDetail(element)">
                <img :src="element.taskCover" v-if="element.taskCover" alt class="task_img" />
                <img class="task_img" v-else :src="taskImg[element.type]" alt />
                <div class="task_info">
                  <p class="title">{{ element.name || '-' }}</p>
                  <p class="time">
                    {{
                      element.startTime.slice(0, 10).split('-').join('.') +
                      '-' +
                      element.endTime.slice(5, 10).split('-').join('.')
                    }}
                  </p>
                </div>
                <div class="btn_box">
                  <img
                    src="https://tagvv-1256030678.file.myqcloud.com/202302066x4i2.png"
                    alt
                    class="move_btn"
                  />
                  <img
                    src="https://tagvv-1256030678.file.myqcloud.com/202302065vu22.png"
                    alt
                    class="delete_btn"
                    @click.stop="delTask(element, index)"
                  />
                </div>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>
    <!-- 返回 -->
    <div class="back_btn">
      <el-button @click="back">返回</el-button>
      <el-button type="primary" :loading="saveLoading" @click="save">
        {{ type == 'create' ? '创建' : type == 'edit' ? '保存' : '' }}
      </el-button>
    </div>
    <!-- 添加任务弹窗 -->
    <addActivityDialog
      v-if="addData.show"
      v-model:show="addData.show"
      :queryInfo="{ startTime: addData.startTime, endTime: addData.endTime }"
      :hasSearch="true"
      @closeDialog="closeDialog"
      @confirm="confirm"
    />
    <!-- 新建任务-选择类型的弹窗 -->
    <taskTypeDialog
      v-if="$createTaskData.initDialog.showOfType"
      :initDialog="$createTaskData.initDialog"
      @updateType="updateType"
    />
    <!-- 新建任务-具体内容的弹窗 -->
    <taskInitDialog
      v-if="$createTaskData.initDialog.showOfDetail"
      :initDialog="$createTaskData.initDialog"
      @updateList="updateList"
      @newTaskSuccess="newTaskSuccess"
      @showDetailDialog="showDetailDialog"
      pageSource="ActCalendar"
    />
    <!-- 任务数据详情弹窗 -->
    <taskDetailDialog
      v-if="$taskDetail.detailDialog.show"
      :detailDialog="$taskDetail.detailDialog"
      @showTaskInitDialog="showTaskInitDialog"
      @updateList="updateList"
    />
  </div>
</template>

<script setup>
import uploadImage from '@/views/market/miniprogram_operation/components/upload_image.vue'

import { Plus } from '@element-plus/icons'
// import { useStore } from 'vuex'
import addActivityDialog from './sComponents/add_activity_dialog.vue'
import draggable from 'vuedraggable'
import { saveActivity, activityTaskSort } from '@/api/market/calendar.js'
import taskTypeDialog from './task_type_dialog.vue'
import taskInitDialog from './task_init_dialog.vue'
import { debounce, throttle } from '@/utils/tools.js'
import taskDetailDialog from './task_detail_dialog.vue'

const props = defineProps({
  time: {
    type: Array,
    default: () => {
      return []
    }
  },
  // 创建还是编辑 create-创建 edit-编辑
  type: {
    type: String,
    default: ''
  },
  // 如果是修改，就接收要修改的任务
  activityItem: {
    type: Object,
    default: () => {
      return {}
    }
  },
  // nowMouth 点击上个月 下个月 创建活动时活动时间的显示
  nowMouth: {
    type: String,
    default: ''
  }
})

const emits = defineEmits(['back', 'createSuccess', 'choseTime'])
// const store = useStore()
const message = inject('$message')
const { time, activityItem, type, nowMouth } = toRefs(props)
const brandViewMode = ref(null)
brandViewMode.value = Number(localStorage.getItem('brandViewMode'))

const action = '/api/mission/file/upload'
const taskImg = ref({
  1: 'https://tagvv-1256030678.file.myqcloud.com/202211218cq4m.png',
  2: 'https://tagvv-1256030678.file.myqcloud.com/20221121ph8j0.png',
  3: 'https://tagvv-1256030678.file.myqcloud.com/20221121a8efq.png',
  5: 'https://tagvv-1256030678.file.myqcloud.com/20221121y86f5.png',
  6: 'https://tagvv-1256030678.file.myqcloud.com/20230926bhqiz.png'
})

// 活动相关数据
const newObj = reactive({
  activityName: '', // 活动名称
  time: [], // 时间
  activityText: null, // 简介的文本框
  activityPhotos: null, // 简介的图片列表字符串
  activityPhotoList: [], // 简介的图片列表
  activityCover: null, // 活动封面
  exposureNumber: 0, // 曝光量
  cluesNumber: 0, // 线索数
  salesNumber: 0, // 销售额 单位 分
  taskList: ref([]),
  spanWidth: 160 + 'px',
  spanText: ''
})
// 打开选择任务弹窗
const addData = reactive({
  title: null,
  show: false,
  startTime: null,
  endTime: null
})
// 任务有关弹窗
const $createTaskData = reactive({
  initDialog: {
    showOfType: false, // 是否显示选择类型的弹窗
    showOfDetail: false, // 是否显示具体内容的弹窗
    type: 1, // 选择的任务类型
    startTime: '', // 哪个日期下点击的开始和结束时间就是那天
    endTime: '',
    origin: 'detailDialog',
    id: null, // 如果是编辑的话就填对应的ID
    initInfo: {
      // 如果是新建任务就让他无法选择时间返回，默认时间范围是活动的时间返回
      timeChoseDisabled: false,
      startTime: null,
      endTime: null
    }
  } // 新建任务的弹窗
})
// 点击任务，进入任务详情
const $taskDetail = reactive({
  detailDialog: {
    show: false
  }
})

// 活动名称是否可输入
// const canInput = ref(false)
const inputDom = ref(null) // 活动名称DOM
const activityChoseValue = ref([]) // 活动选择的时间
const imgLoading = ref(false) // 上传图片loading
const actConDom = ref(null) // 组件DOM
const actConHeight = ref(null) // 组件高度，目前不使用也可以，属于废弃状态

const drag = ref(false) // 拖拽

// 打开任务数据弹窗
const toDetail = throttle(function (x, y) {
  // console.log('打开任务详情需要的参数', x, y)
  $taskDetail.detailDialog = {
    show: true,
    id: x.taskId,
    origin: y === 'dateDialog' ? 'dateDialog' : 'calendar',
    showButs: 'onlyDetail' // 从这里进只显示详情
  }
}, 500)
// 点击编辑
function showTaskInitDialog(e) {
  $createTaskData.initDialog = {
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
      startTime: getInitTime(e.id || e.copyId)[0]?.startTime,
      endTime: getInitTime(e.id || e.copyId)[0]?.endTime
    }
  }
  // 复制的时候不限制任务结束时间
  if (e.copyId) {
    $createTaskData.initDialog.initInfo = {
      timeChoseDisabled: false,
      startTime: null,
      endTime: null
    }
  }
}
function getInitTime(id) {
  if (!id) return []
  return newObj.taskList.filter(item => {
    return item.taskId === id
  })
}

watch(
  () => time.value,
  value => {
    newObj.time = value
    // 创建任务时，禁止时间
    // console.log('接收的时间', value)
    // newObj.time
    // 有时间就禁止 没时间就用组件的
    $createTaskData.initDialog.initInfo.timeChoseDisabled = !(newObj.time.length === 0)
    $createTaskData.initDialog.initInfo.startTime = newObj.time[0] || null
    $createTaskData.initDialog.initInfo.endTime = newObj.time[1] || null
    // 选择任务弹窗时间需要同步
    addData.startTime = newObj.time[0] || null
    addData.endTime = newObj.time[1] || null
    // console.log('初始化创建时候的禁止时间', $createTaskData.initDialog.initInfo)
  },
  {
    immediate: true
  }
)

// watch(
//   () => canInput.value,
//   value => {
//     if (value) {
//       nextTick(() => {
//         inputDom.value.focus()
//       })
//     }
//   },
//   {
//     immediate: true
//   }
// )

// watch(
//   () => newObj.salesNumber,
//   value => {
//     // numberChange('salesNumber')
//     console.log('监听销售额', value)

//     value = Number(value)
//     if (value !== 0) {
//       newObj.salesNumber = value / 100
//     }
//     console.log('监听销售额', newObj.salesNumber)
//   },
//   {
//     immediate: true
//   }
// )

watch(
  () => nowMouth.value,
  value => {
    activityChoseValue.value = getDatePackerTime(value)
  },
  {
    immediate: true
  }
)
// 页面初始化一下
function pageInit() {
  // console.log('创建/编辑：', type.value)
  if (type.value === 'edit') {
    // console.log('activityItem.value.tasks', activityItem.value.tasks)
    newObj.activityName = activityItem.value.title
    // newObj.introduce = activityItem.value.activityDesc
    newObj.activityText = activityItem.value.activityText || null
    newObj.activityPhotoList = activityItem.value.activityPhotos
      ? activityItem.value.activityPhotos.split(',')
      : []
    if (activityItem.value.viewMode) {
      brandViewMode.value = activityItem.value.viewMode
    }
    newObj.taskList = activityItem.value.tasks.map((item, index) => {
      const result = {
        taskCover: item.taskCover,
        startTime: item.startTime,
        endTime: item.endTime,
        name: item.name,
        taskId: item.id,
        type: item.type,
        // 优先级，小的排在前
        priority: index + 1 - newObj.taskList.length,
        activityTaskBindId: item.activityTaskBindId
      }
      return result
    })
    newObj.activityCover = activityItem.value.cover
    newObj.exposureNumber = activityItem.value.exposureTarget
    newObj.cluesNumber = activityItem.value.clueTarget
    newObj.salesNumber = Number(activityItem.value.paymentTarget) / 100 // 单位转化 分-->元
    newObj.time = [activityItem.value.activityStartTime, activityItem.value.activityEndTime]
    // 打开弹窗
    addData.title = '添加任务'
    addData.startTime = newObj.time[0] || null
    addData.endTime = newObj.time[1] || null
    // console.log('编辑时 添加任务的时间', addData.startTime, addData.endTime)
    // 任务
    $createTaskData.initDialog.initInfo.timeChoseDisabled = true
    $createTaskData.initDialog.initInfo.startTime = activityItem.value.activityStartTime
    $createTaskData.initDialog.initInfo.endTime = activityItem.value.activityEndTime
  }
  if (type.value === 'create') {
    // 打开弹窗
    // console.log('创建任务打开弹窗时的时间', newObj.time)
    addData.title = '添加任务'
    // console.log('创建时 添加任务的时间', addData.startTime, addData.endTime)
  }
  nextTick(() => {
    inputDom.value.focus()
  })
}

// 活动时间的选择时间区间
function getDatePackerTime(time) {
  const year = new Date(time).getFullYear()
  const mouth = new Date(time).getMonth() + 1
  const startTimeFrom = `${year}-${mouth}-01`
  const endTimeFrom = `${year}-${mouth + 1}-01`
  return [new Date(startTimeFrom), new Date(endTimeFrom)]
}

// 选择时间触发
function choseTime(e) {
  // newObj.time 赋值 沿用父组件传入时间
  emits('choseTime', e)
}
// 文件上传之前
function beforeUploadFile(file) {
  const typeList = ['image/jpeg', 'image/jpg', 'image/png']
  if (typeList.indexOf(file.type) === -1) {
    message.warning('仅支持png、jpg、jpeg格式的图片')
    return false
  }
  const size = file.size
  if (size > 2048000) {
    message.warning('上传图片大小不能超过2M')
    return false
  }
  imgLoading.value = true
}
// 文件上传成功
function handleSuccess(res, file) {
  if (res.code === 0) {
    // 添加到文件上传列表中
    newObj.activityCover = res.data
  } else {
    // message.warning('图片上传失败')
  }
  imgLoading.value = false
}
// 文件上传失败
function handleError() {
  imgLoading.value = false
}
// 曝光量，线索数，销售额限制输入最大值
// exposureNumber: 0, // 曝光量
// cluesNumber: 0, // 线索数
// salesNumber: 0, // 销售额
function numberChange(type) {
  // console.log('正在输入', newObj[type])
  if (newObj[type] > 2147483647) {
    newObj[type] = 2147483647
  }
}
// 返回
function back() {
  emits('back')
}

// 新建返回入参需要的任务列表
function getQuery(taskList) {
  const arr = []
  taskList.forEach((item, index) => {
    const payLoadItem = {
      priority: index + 1,
      taskId: item.taskId
    }
    arr.push(payLoadItem)
  })
  return arr
}
// 修改返回入参需要参数
function getQueryEdit(taskList) {
  return taskList.map((item, index) => {
    const query = {
      activityId: activityItem.value.id, // 活动id
      id: item.activityTaskBindId, // 任务与活动绑定的id
      taskId: item.taskId, // 活动本身的id
      priority: index + 1 // 新顺序优先级
    }
    return query
  })
}
const saveLoading = ref(false)
// 创建/ 保存
const save = debounce(() => {
  saveLoading.value = true
  saveFun()
}, 1000)

function saveFun() {
  if (!newObj.activityName) {
    message({
      type: 'warning',
      message: '请填写活动名称'
    })
    saveLoading.value = false
    return
  }
  if (!newObj.time || (newObj.time && newObj.time.length === 0)) {
    message({
      type: 'warning',
      message: '请填写活动时间'
    })
    saveLoading.value = false
    return
  }
  if (!(newObj.activityText || (newObj.activityPhotoList && newObj.activityPhotoList.length > 0))) {
    message({
      type: 'warning',
      message: '请填写活动简介'
    })
    saveLoading.value = false
    return
  }
  if (!newObj.activityCover) {
    message({
      type: 'warning',
      message: '请上传活动封面'
    })
    saveLoading.value = false
    return
  }
  if (newObj.exposureNumber === 0 || newObj.exposureNumber <= 0) {
    message({
      type: 'warning',
      message: '请正确填写曝光量'
    })
    saveLoading.value = false
    return
  }
  if ((newObj.cluesNumber === 0 || newObj.cluesNumber <= 0) && brandViewMode.value === 2) {
    message({
      type: 'warning',
      message: '请正确填写线索数'
    })
    saveLoading.value = false
    return
  }
  if ((newObj.salesNumber === 0 || newObj.salesNumber <= 0) && brandViewMode.value === 1) {
    message({
      type: 'warning',
      message: '请正确填写销售额'
    })
    saveLoading.value = false
    return
  }
  const query = {
    title: newObj.activityName,
    activityText: newObj.activityText,
    activityPhotos:
      newObj.activityPhotoList && newObj.activityPhotoList.length > 0
        ? newObj.activityPhotoList.join(',')
        : null,
    cover: newObj.activityCover,
    exposureTarget: newObj.exposureNumber,
    activityStartTime: newObj?.time[0] || null,
    activityEndTime: newObj?.time[1] || null,
    isEnable: 0 // 活动创建默认关闭，开启的无法编辑所以也是关闭
  }
  if (brandViewMode.value === 2) {
    query.clueTarget = newObj.cluesNumber
  }
  // console.log('brandViewMode --', brandViewMode)
  if (brandViewMode.value === 1) {
    query.paymentTarget = Number(newObj.salesNumber) * 100
  }
  // 判断下是新建还是修改
  if (type.value === 'create') {
    query.activityTask = getQuery(newObj.taskList)
    query.priority = 0 // 活动优先级 新建传0可
  }
  if (type.value === 'edit') {
    // console.log('编辑时的活动列表', newObj.taskList)
    query.id = activityItem.value.id
    query.activityTask = getQueryEdit(newObj.taskList)
    // query.isEnable = activityItem.value.isEnable ? 1 : 0
    query.priority = activityItem.value.priority
  }

  // console.log('保存入参 query', query)
  // if (query) {
  //   return false
  // }
  saveActivity(query)
    .then(res => {
      // console.log('创建活动成功的返回res', res)
      if (res.code === 0 && res.msg === '成功') {
        let tipMsg = ''
        if (type.value === 'create') {
          tipMsg = '创建成功'
        }
        if (type.value === 'edit') {
          tipMsg = '修改成功'
        }
        message({
          type: 'success',
          message: tipMsg
        })
        emits('createSuccess')
      }

      saveLoading.value = false
    })
    .catch(() => {
      saveLoading.value = false
    })
}

// 打开添加任务弹窗 addData.startTime, addData.endTime
function showDialogRules(type) {
  if (!newObj.time || (newObj.time && newObj.time.length === 0)) {
    message.warning('请选择活动时间')
  } else {
    if (type === 1) {
      addData.show = true
    }
    if (type === 2) {
      $createTaskData.initDialog.showOfType = true
    }
  }
}

// 添加成功
function confirm(choseItem) {
  // console.log('choseItem', choseItem)
  // 去重
  const isIn = newObj.taskList.some(x => {
    return x.taskId === choseItem.id
  })
  if (isIn) {
    message.warning('任务已存在')
    return
  }
  const midTaskList = newObj.taskList.reverse()
  midTaskList.push({
    taskCover: choseItem.taskCover,
    startTime: choseItem.startTime,
    endTime: choseItem.endTime,
    name: choseItem.name,
    taskId: choseItem.id, // 大坑，在newObj.taskList内，taskId就是id
    type: choseItem.type,
    // 优先级，小的排在前
    priority: newObj.taskList.length
  })
  newObj.taskList = midTaskList.reverse()
  addData.show = false
  // 获取下高度
  getHeight()
}
// 取消添加
function closeDialog() {
  addData.show = false
}
// 删除一个任务
function delTask(item) {
  newObj.taskList = newObj.taskList.filter(x => {
    return x.taskId !== item.taskId
  })
  getHeight()
}

// 任务列表排序
function dragEnd() {
  if (type.value === 'create') {
    drag.value = false
  }
  if (type.value === 'edit') {
    const queryTaskList = newObj.taskList.map((item, index) => {
      const query = {
        activityId: activityItem.value.id, // 活动id
        id: item.activityTaskBindId, // 任务与活动绑定的id
        taskId: item.taskId, // 任务本身的id
        priority: index + 1 // 新顺序优先级
      }
      return query
    })
    // console.log('处理任务排序入参', queryTaskList)
    activityTaskSort({ activityTaskPriority: queryTaskList }).then(res => {
      // console.log('任务列表排序res', res)
      if (res.code === 0) {
        drag.value = false
      }
    })
  }
}

// 新建任务-选择完类型，出现填写具体内容的弹窗
function updateType(e) {
  $createTaskData.initDialog.showOfType = false
  $createTaskData.initDialog.showOfDetail = true
  $createTaskData.initDialog.type = e
}

// 创建任务成功自动添加 判断是否是需要审核的任务，如果是，就不添加
function newTaskSuccess(oneTask) {
  // console.log('刚刚创建成功的任务', oneTask)
  if (
    oneTask.status === 3 ||
    oneTask.status === 4 ||
    oneTask.status === 5 ||
    oneTask.status === 7
  ) {
    confirm(oneTask)
  } else {
    return message.warning('绑定失败，请先检查任务状态')
  }
}
// 任务创建或者编辑成功
function updateList(action, date) {
  // console.log('新建任务成功/修改成功 updateList,', action, date)
  // showDialogRules(1)
  // console.log('addData', addData)
  // console.log('newObj', newObj)
}

// 处理高度
function getHeight() {
  nextTick(() => {
    // console.log('高度', actConDom.value?.clientHeight)
    actConHeight.value = actConDom.value?.clientHeight < 746 ? '746px' : '100%'
  })
}
onMounted(() => {
  pageInit()
  getHeight()
})
// 活动简介的图片上传成功
function uploadImgSuccess(e, i, name) {
  newObj.activityPhotoList.push(e)
}
// 活动简介的图片删除
function delActPhoto(i) {
  newObj.activityPhotoList.splice(i, 1)
}
// 检查是否有空格
function retEmit() {
  if (newObj.activityText) {
    newObj.activityText = newObj.activityText.trim()
  }
}
</script>

<style lang="scss" scoped>
.new_activity {
  position: relative;
  width: 100%;
  background: #ffffff;
  border-radius: 4px;
  // overflow-y: auto;
  .act_con {
    height: 100%;
    overflow-y: auto;
    padding: 0 20px 64px;
    .act_name {
      display: flex;
      align-items: center;
      margin-top: 14px;
      :deep(.el-input) {
        // width: unset !important;
        // min-width: none;
        // max-width: calc(100% - 60px);
      }
      :deep(.el-input__inner) {
        &::placeholder {
          font-weight: normal !important;
          font-size: 14px !important;
          font-family: PingFangSC-Regular, PingFang SC !important;
          font-weight: 400 !important;
          color: #bfc4cd !important;
        }
      }
      :deep(.el-input__inner) {
        font-size: 18px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #364fcd;
        // padding: unset;
        // border: unset;
        display: flex;
        align-items: center;
        justify-content: space-between;
        &::placeholder {
          font-weight: normal;
        }
      }
      .input_img {
        width: 20px;
        height: 20px;
        margin-left: 8px;
        cursor: pointer;
      }
      .spanText {
        font-size: 12px;
        position: absolute;
        left: 0;
        padding: 0 15px;
        white-space: nowrap;
        visibility: hidden;
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
  .need_flex {
    display: flex;
    align-items: center;
  }
  .act_item {
    margin-top: 20px;
    .act_label {
      font-size: 16px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #303133;
      line-height: 22px;
      margin-bottom: 12px;
    }

    :deep(.el-textarea__inner) {
      min-height: 108px !important;
    }
    .upload_tips {
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #909399;
      line-height: 20px;
      margin-top: 12px;
    }
    .tabs_fun {
      justify-content: space-between;
      :deep(.el-button) {
        margin-left: unset;
        padding: unset !important;
        color: #364fcd;
      }
      .r_tips {
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #909399;
        line-height: 20px;
        .t_num {
          color: #364fcd;
        }
      }
      .create_btn {
        :deep(.el-icon) {
          font-weight: 500;
        }
      }
    }
    .task_list {
      &:last-child {
        padding-bottom: 24px;
      }
      .task_item {
        position: relative;
        display: flex;
        align-items: center;
        margin-top: 8px;
        background: #f6f7f8;
        border-radius: 4px;
        padding: 8px;
        cursor: pointer;
        &:first-of-type {
          margin-top: 6px;
        }
        .task_img {
          width: 56px;
          height: 56px;
          border-radius: 4px;
        }
        .task_info {
          margin-left: 8px;
          height: 56px;
          .title {
            max-width: 240px;
            font-size: 16px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #303133;
            line-height: 22px;
            margin-top: 4px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow-wrap: break-word;
            overflow: hidden;
          }
          .time {
            font-size: 14px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #606266;
            line-height: 20px;
            margin-top: 6px;
          }
        }
        .btn_box {
          position: absolute;
          top: 12px;
          right: 12px;
          .move_btn {
            margin-right: 12px;
          }
          .move_btn,
          .delete_btn {
            width: 20px;
            height: 20px;
            cursor: pointer;
          }
          .delete_btn:hover {
            color: #364fcd;
          }
        }
      }
    }
    .rich_text {
      flex: 1;
      background: #ffffff;
      width: 100%;
      #class_rich_text {
        word-break: break-all;
        word-wrap: break-word;
        :deep(.w-e-toolbar) {
          border-radius: 4px 4px 0 0;
          border-color: #dcdee0;
        }
        :deep(.w-e-text-container) {
          border-radius: 0 0 4px 4px;
          border-color: #dcdee0;
        }
      }
    }
    // 数字输入框按钮样式
    .number_input {
      display: flex;
      align-items: center;
      :deep(.el-input) {
        width: 75px;
        --el-input-border-radius: 4px 0px 0px 4px;
      }
      .but {
        width: 25px;
        height: 32px;
        border-radius: 0px 4px 4px 0px;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        box-sizing: border-box;
        border: 1px solid #dcdee0;
        border-left: unset;
        .num_add {
          box-sizing: border-box;
          border-bottom: 1px solid #dcdee0;
          width: 100%;
          height: 50%;
          position: relative;
        }
        .num_add::after {
          content: '';
          width: 6px;
          height: 6px;
          border-top: 2px solid;
          border-left: 2px solid;
          border-color: #dcdee0;
          position: absolute;
          right: 8px;
          top: 5px;
          transform: rotate(45deg);
        }

        .num_dec {
          box-sizing: border-box;
          width: 100%;
          height: 50%;
          position: relative;
        }
        .num_dec::after {
          content: '';
          width: 6px;
          height: 6px;
          border-right: 2px solid;
          border-bottom: 2px solid;
          border-color: #dcdee0;
          position: absolute;
          right: 8px;
          top: 2px;
          transform: rotate(45deg);
        }
      }
    }
    :deep(.el-input__inner) {
      border-color: #dcdee0 !important;
    }
  }
  // 新建商品
  .file_box {
    margin-top: 8px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    .one_file {
      width: 200px;
      height: 68px;
      margin-right: 14px;
      position: relative;
      cursor: pointer;
      border-radius: 4px;
      overflow: hidden;
      .file_cover {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
      }

      .del_icon {
        position: absolute;
        opacity: 0;
        right: 8px;
        top: 8px;
        width: 20px;
        height: 20px;
      }
    }
    .one_file:hover {
      .del_icon {
        opacity: 1;
      }
    }

    .upload_text {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-size: 14px;
      font-weight: 400;
      color: #303133;
      line-height: 20px;
      img {
        width: 20px;
        height: 20px;
        margin-bottom: 4px;
      }
    }
  }
  .file_box {
    :deep(.el-upload--picture) {
      width: 200px;
      height: 68px;
      border-radius: 0;
      border: 1px dashed #dbdfe7;
      background: #fff;
      &:hover {
        border-color: $theme_color;
      }
    }
  }

  /* 取消input的上下箭头 */
  :deep(input::-webkit-inner-spin-button) {
    -webkit-appearance: none !important;
  }

  :deep(input::-webkit-outer-spin-button) {
    -webkit-appearance: none !important;
  }

  :deep(input[type='number']) {
    -moz-appearance: textfield;
  }

  //   :deep #class_rich_text {
  //     .w-e-toolbar,
  //     .w-e-text,
  //     .w-e-text-container {
  //       border: none !important;
  //     }
  //     .w-e-text-container {
  //       height: 100% !important;
  //     }
  //   }
  //   :deep .upload_item_wrapper {
  //     width: auto !important;
  //     height: auto !important;
  //     margin: 0 !important;
  //   }
  //   :deep #class_rich_text {
  //     p {
  //       line-height: 1;
  //       margin: 0;
  //     }
  //     .w-e-panel-container {
  //       left: auto;
  //     }
  //   }
  //   :deep(img) {
  //     display: block;
  //   }
}
:deep(.el-textarea__inner) {
  height: 96px;
  resize: none;
}
.upload_img_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  padding-top: 12px;
  position: relative;
  .upload_del {
    cursor: pointer;
    position: absolute;
    right: -8px;
    top: -8px;
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
}
.upload_box {
  width: 68px;
  height: 68px;
  background: #ffffff;
  border-radius: 2px;
  border: 1px dashed #dcdee0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &:hover {
    border-color: $theme_color;
  }
  .icon-plus {
    color: #909399;
    font-size: 20px;
  }
  .text1 {
    margin-top: 4px;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #333333;
    line-height: 20px;
  }
}
.one_img {
  margin-bottom: 12px;
  width: 68px;
  height: 68px;
  border-radius: 2px;
  margin-right: 12px;
  position: relative;
  .img_cover {
    object-fit: cover;
    border-radius: 2px;
    width: 68px;
    height: 68px;
  }
}
:deep(.upload_image) {
  margin-bottom: 12px;
}
</style>
