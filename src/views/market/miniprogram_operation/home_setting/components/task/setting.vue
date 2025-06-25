<template>
  <div class="operation-activity">
    <title-wrapper title="" :subtitle="subtitleObj[taskInfo.switch]">
      <template #right>
        <el-switch
          @change="validConfigFun"
          v-model="taskInfo.switch"
          active-value="1"
          inactive-value="0"
        />
      </template>
    </title-wrapper>
    <div class="container" v-loading="uploadLoading">
      <navSetting
        :title="taskInfo.title"
        :defaultTitle="taskInfo.defaultTitle"
        @updateTitle="updateTitle"
      />
      <div class="container_title">视图设置</div>
      <el-radio-group v-model="taskInfo.view" style="margin-bottom: 20px" @change="validConfigFun">
        <el-radio label="1">卡片列表式</el-radio>
        <el-radio label="2">引导视频式</el-radio>
      </el-radio-group>
      <div class="container_title">内容设置</div>
      <div class="add-and-tips">
        <div class="add-icon" @click="addItem"></div>
        <div class="add" @click="addItem">添加主推任务（{{ list.length || 0 }}/2）</div>
        <div class="tips" style="margin-bottom: 11px">
          {{
            taskInfo.view === '2'
              ? '该视图下建议设置两个视频及任务，视频大小不超过200M'
              : '系统会自动推荐任务列表的第一个任务在首页，支持品牌自定义主推任务，最多可设置2个'
          }}
        </div>
      </div>
      <!-- 引导视频式 -->
      <template v-if="taskInfo.view === '2'">
        <draggable
          v-model="list"
          group="task_setting_video"
          @start="drag = true"
          @end="drag = false"
          item-key="taskId"
          handle=".icon-tuodongweizhi"
          :animation="300"
        >
          <template #item="{ element, index }">
            <div class="one_video_task">
              <!-- 上传视频和封面 -->
              <div class="left_box">
                <div class="left_top">
                  <!-- 已上传视频 -->
                  <div class="top_imgbox" v-if="element.videoPlayUrl">
                    <!-- 封面 -->
                    <img class="video_cover" :src="element.videoImgUrl" alt="" />
                    <!-- 播放+删除 -->
                    <div class="video_back" @click="playVideo(element)">
                      <div class="del_box" @click.stop="delVideo(element, index)">
                        <img
                          src="https://tagvv-1256030678.file.myqcloud.com/20221119hj21g.png"
                          alt=""
                          class="del_icon"
                        />
                      </div>
                      <img
                        src="https://tagvv-1256030678.file.myqcloud.com/20221019xwjl7.png"
                        alt=""
                        class="play_icon"
                      />
                    </div>
                  </div>
                  <!-- 未上传视频 -->
                  <uploadVideo
                    v-else
                    :maxSize="204800"
                    v-model:uploadLoading="uploadLoading"
                    :index="index"
                    @success="uploadVideoSuccess"
                  >
                    <div class="upload_box">
                      <el-icon class="icon-plus">
                        <i-plus />
                      </el-icon>
                      <div class="upload_text">添加视频</div>
                    </div>
                  </uploadVideo>
                </div>
                <uploadImg v-if="element.videoPlayUrl" :index="index" @success="uploadImgSuccess">
                  <div class="img_upload_text">修改封面</div>
                </uploadImg>
              </div>
              <!-- 任务信息 -->
              <div class="right_box">
                <div class="right_title">关联任务：</div>
                <div class="right_task">
                  <div
                    class="name_box line-hidden1"
                    :style="element.taskId ? 'color: #606266' : 'color: #bfc4cd'"
                  >
                    {{ element.taskId ? element.name || '' : '请选择需要关联的任务' }}
                  </div>
                  <div class="task_btn">
                    <div
                      :class="{ default_btn: true }"
                      style="padding-right: 12px"
                      @click="updateItem(index)"
                    >
                      {{ element.taskId ? '更换' : '选择' }}
                    </div>
                    <div
                      :class="{ default_btn: true, disabled_btn: !element.taskId }"
                      @click="toDetail(element)"
                    >
                      详情
                    </div>
                  </div>
                </div>
              </div>
              <sort-icon :list="list" :index="index" :hasMove="true"></sort-icon>
            </div>
          </template>
        </draggable>
      </template>
      <!-- 卡片列表式 -->
      <template v-else>
        <draggable
          v-model="list"
          group="task_setting_card"
          @start="drag = true"
          @end="drag = false"
          item-key="taskId"
          handle=".icon-tuodongweizhi"
          :animation="300"
        >
          <template #item="{ element, index }">
            <div class="title-and-icon">
              <div class="task-type">
                <div class="icon" :class="[taskIconClass(element)]"></div>
                <div class="task-name">{{ TASK_TYPE.getCN(element.type) + '任务' }}</div>
              </div>
              <sort-icon :list="list" :index="index" :hasMove="true"></sort-icon>
              <div class="detail-wrapper">
                <div class="detail-title">{{ element.name || '请选择' }}</div>
                <div class="change-detail" @click="toDetail(element)">详情</div>
              </div>
            </div>
          </template>
        </draggable>
      </template>
    </div>
    <task-dialog
      v-model:show="showTaskDialog"
      v-if="showTaskDialog"
      @confirm="onTaskConfirm"
    ></task-dialog>
    <video-play v-model:show="playForm.show" :info="{ videoUrl: playForm.url }"></video-play>
  </div>
</template>

<script setup>
import draggable from 'vuedraggable'
import VideoPlay from '@/views/market/miniprogram_operation/components/videoPlay.vue'

import uploadVideo from '@/views/market/miniprogram_operation/components/upload_video.vue'
import uploadImg from '@/views/market/miniprogram_operation/components/upload_image.vue'
import navSetting from '../../../components/nav_setting.vue'
import { ElMessage } from 'element-plus'
import TitleWrapper from '../../../components/title_wrapper.vue'
import TaskDialog from '../../../components/task_dialog.vue'
import { TASK_TYPE } from '@/utils/dictionary/task.js'
import SortIcon from '../../../components/sort_icon.vue'
import { throttle } from '../../../../../../utils/tools'
const props = defineProps({
  data: {
    type: Object,
    default() {
      return {
        taskInfo: {
          switch: '1'
        }
      }
    }
  }
})
const drag = ref(false)
const { taskInfo } = toRefs(props.data)
const uploadLoading = ref(false)
const subtitleObj = {
  1: '主推任务直接展示在首页，吸引更多员工参与',
  0: '开关关闭，全员营销小程序首页将隐藏“热门活动”'
}
const list = ref([])
function init() {
  if (props.data.taskInfo && props.data.taskInfo.list && props.data.taskInfo.list.length > 0) {
    list.value = JSON.parse(JSON.stringify(props.data.taskInfo.list))
  } else {
    list.value = []
  }

  console.log('获取到的热门活动信息', list.value, props.data.taskInfo, taskInfo.value)
}
init()

const addItem = () => {
  chooseUpdateIndex.value = null
  if (list.value.length === 2) {
    return ElMessage.warning('最多可设置2个主推任务')
  }
  showTaskDialog.value = true
}
const taskIconClass = item => {
  return `${TASK_TYPE.getEN(item.type)}-icon`
}
const showTaskDialog = ref(false)
// 添加或更新任务
const onTaskConfirm = item => {
  if (chooseUpdateIndex.value === null) {
    list.value.push({
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
  } else {
    list.value[chooseUpdateIndex.value].name = item.name
    list.value[chooseUpdateIndex.value].taskId = item.id
    list.value[chooseUpdateIndex.value].type = item.type
    list.value[chooseUpdateIndex.value].endTime = item.endTime
    list.value[chooseUpdateIndex.value].startTime = item.startTime
    list.value[chooseUpdateIndex.value].status = item.status
    list.value[chooseUpdateIndex.value].taskTags = item.taskTags || []
    list.value[chooseUpdateIndex.value].taskCover = item.taskCover
    list.value[chooseUpdateIndex.value].taskInfo = item.taskInfo
  }
}
const emits = defineEmits(['updateSetting', 'validConfig'])
function validConfigFun() {
  emits('validConfig', 'task_recommend')
}
watch(
  () => list.value,
  value => {
    emits('updateSetting', 'task_recommend', value)
  },
  { deep: true }
)

const toDetail = item => {
  const temp = {
    1: 'video_task/video_task_details',
    2: 'live_task/live_task_details',
    3: 'collecting_task/detail',
    5: 'study_task/detail'
  }
  window.open(`${temp[item.type]}?itemId=${item.taskId}&type=${item.type}`)
}

// 更新标题栏
function updateTitle(e) {
  taskInfo.value.title = e
}

// 视频上传成功
function uploadVideoSuccess(data, index) {
  list.value[index].videoImgUrl = data.url + '?x-oss-process=video/snapshot,t_1000,m_fast'
  list.value[index].videoPlayUrl = data.url
}
// 封面上传成功
function uploadImgSuccess(data, index) {
  list.value[index].videoImgUrl = data
}
// 播放视频的信息
const playForm = ref({
  show: false,
  url: ''
})
// 播放视频
const playVideo = throttle(e => {
  playForm.value = {
    show: true,
    url: e.videoPlayUrl
  }
}, 700)
// 删除视频
const delVideo = throttle((e, i) => {
  list.value[i].videoImgUrl = ''
  list.value[i].videoPlayUrl = ''
})

// 修改任务
const chooseUpdateIndex = ref(null)
const updateItem = throttle(i => {
  chooseUpdateIndex.value = i
  showTaskDialog.value = true
}, 700)
</script>

<style lang="scss" scoped>
@import '../../../components/css/setting_page.scss';
.operation-activity {
  background-color: #fff;
  color: #909399;
  font-size: 14px;

  .container {
    .add-and-tips {
      line-height: 22px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 10px;
      .add-icon {
        margin-bottom: 11px;
        cursor: pointer;
        width: 20px;
        height: 20px;
        background-image: url('https://tagvv-1256030678.file.myqcloud.com/202210212istj.png');
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
      }

      .add {
        cursor: pointer;
        color: $theme-color;
        font-size: 16px;
        margin: 0 12px 11px 5px;
      }
    }

    .title-and-icon {
      width: 468px;
      //height: 140px;
      padding: 16px;
      box-sizing: border-box;
      background: #f6f7f8;
      border-radius: 4px;
      position: relative;

      .task-type {
        display: flex;
        align-items: center;
        margin-bottom: 14px;
        font-size: 16px;
        font-weight: 500;
        color: #303133;
        line-height: 22px;

        .icon {
          width: 20px;
          height: 20px;
          margin-right: 8px;
          background-image: url('https://tagvv-1256030678.file.myqcloud.com/202210190mpe4.png');
          background-repeat: no-repeat;
          background-position: center;
          background-size: cover;
        }

        .video-icon {
          background-image: url('https://tagvv-1256030678.file.myqcloud.com/202210190mpe4.png');
        }

        .live-icon {
          background-image: url('https://tagvv-1256030678.file.myqcloud.com/202210198bn2o.png');
        }

        .study-icon {
          background-image: url('https://tagvv-1256030678.file.myqcloud.com/20221019qjtyz.png');
        }

        .collection-icon {
          background-image: url('https://tagvv-1256030678.file.myqcloud.com/20220328zjfg8.png');
        }
        .imgText-icon {
          background-image: url('https://tagvv-1256030678.file.myqcloud.com/20231009p9630.png');
        }
      }

      .right-icon {
        position: absolute;
        top: 16px;
        right: 16px;
        font-size: 20px;

        .move-icon {
          margin-left: 4px;
        }

        .delete-icon {
          margin-left: 12px;
        }

        .hover:hover {
          color: $theme-color;
        }
      }
    }

    .title-and-icon + .title-and-icon {
      margin-top: 16px;
    }

    .type-radio {
      margin: 16px 0;

      :deep(.el-form-item__label) {
        color: #333333;
      }

      :deep(.el-radio) {
        color: #323233;
      }
    }

    .detail-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .detail-title {
        flex: 1;
        @include mult_line(1);
        line-height: 32px;
        padding: 0 12px;
        background: #ffffff;
        border-radius: 2px;
      }

      .change-detail {
        cursor: pointer;
        margin-left: 12px;
        color: $theme-color;
      }
    }
  }
}
// 单个引导视频式的样式
.one_video_task + .one_video_task {
  margin-top: 12px;
}
.one_video_task {
  width: 573px;
  position: relative;
  height: 192px;
  background: #f6f7f8;
  border-radius: 4px;
  padding: 16px 0 16px 16px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  .left_box {
    width: 102px;
    height: 136px;
    .top_imgbox {
      position: relative;
      width: 102px;
      height: 136px;
    }
    .left_top {
      width: 102px;
      height: 136px;
      border-radius: 2px;
      .video_cover {
        width: 102px;
        height: 136px;
        border-radius: 2px;
        object-fit: cover;
      }
      .video_back {
        cursor: pointer;
        position: absolute;
        left: 0;
        top: 0;
        width: 102px;
        height: 136px;
        border-radius: 2px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        .play_icon {
          width: 32px;
          height: 32px;
          object-fit: cover;
        }
        .del_box {
          position: absolute;
          right: 0;
          top: 0;
          width: 36px;
          height: 36px;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          opacity: 0;
          .del_icon {
            width: 20px;
            height: 20px;
          }
        }
      }
    }
    .video_back:hover {
      .del_box {
        opacity: 1;
      }
    }
    .upload_box {
      width: 100px;
      height: 134px;
      background: #ffffff;
      border: 1px dashed #dcdee0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .upload_text {
        margin-top: 8px;
        font-size: 14px;
        font-weight: 400;
        color: #333333;
        line-height: 20px;
      }
    }
    .img_upload_text {
      padding: 10px 0;
      width: 102px;
      text-align: center;
      font-size: 14px;
      font-weight: 400;
      color: #364fcd;
      line-height: 20px;
    }
  }
  .right_box {
    width: calc(100% - 118px);
    height: 136px;

    margin-left: 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    .right_title {
      font-size: 14px;
      font-weight: 400;
      color: #333333;
      line-height: 20px;
      margin-bottom: 12px;
    }
    .right_task {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .name_box {
        width: 343px;
        height: 32px;
        background: #ffffff;
        border-radius: 2px;
        padding: 6px 12px;
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
      }
      .task_btn {
        width: calc(100% - 343px);
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
      }
    }
  }
}
</style>
