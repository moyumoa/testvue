<template>
  <div class="operation-activity">
    <title-wrapper title="活动设置" :subtitle="subtitle">
      <template #right>
        <el-switch v-model="switchValue" @change="onSwitch" />
      </template>
    </title-wrapper>
    <div class="container" v-if="switchValue">
      <div class="add-and-tips">
        <div class="add-icon" @click="addItem"></div>
        <div class="add" @click="addItem">添加主推任务（{{ list.length }}/2）</div>
        <div class="tips">
          系统会自动推荐任务列表的第一个任务在首页，支持品牌自定义主推任务，最多可设置2个
        </div>
      </div>
      <div class="title-and-icon" v-for="(item, index) in list" :key="item">
        <div class="task-type">
          <div class="icon" :class="[taskIconClass(item)]"></div>
          <div class="task-name">{{ TASK_TYPE.getCN(item.type) + '任务' }}</div>
        </div>
        <sort-icon :list="list" :index="index"></sort-icon>
        <div class="detail-wrapper">
          <div class="detail-title">{{ item.name || '请选择' }}</div>
          <div class="change-detail" @click="toDetail(item)">详情</div>
        </div>
      </div>
    </div>
    <task-dialog
      v-model:show="showTaskDialog"
      v-if="showTaskDialog"
      @confirm="onTaskConfirm"
    ></task-dialog>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import TitleWrapper from './components/title_wrapper.vue'
import TaskDialog from './components/task_dialog.vue'
import { TASK_TYPE } from '@/utils/dictionary/task.js'
import SortIcon from './components/sort_icon.vue'
import { operationConfig } from '@/views/market/miniprogram_operation/model.js'

const configKey = {
  CONFIG_GROUP: 'task_recommend',
  SWITCH_KEY: 'task_recommend_mini_display',
  LIST_KEY: 'recommend_task_list'
}
const subtitleObj = {
  open: '主推任务直接展示在首页，吸引更多员工参与',
  close: '开关关闭，全员营销小程序首页将隐藏“热门活动”'
}
const { switchValue, onSwitch, subtitle, list, getInfo, updateInfoByDebounce } = operationConfig(
  configKey,
  subtitleObj
)

getInfo()

const addItem = () => {
  if (list.value.length === 2) {
    return ElMessage.warning('最多可设置2个主推任务')
  }
  showTaskDialog.value = true
}
const taskIconClass = item => {
  return `${TASK_TYPE.getEN(item.type)}-icon`
}
const showTaskDialog = ref(false)
const onTaskConfirm = item => {
  list.value.push({
    name: item.name,
    taskId: item.id,
    type: item.type
  })
}
watch(
  () => list.value,
  value => {
    updateInfoByDebounce()
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
</script>

<style lang="scss" scoped>
.operation-activity {
  background-color: #fff;
  color: #909399;
  font-size: 14px;

  .container {
    padding: 0 24px;

    .add-and-tips {
      line-height: 62px;
      display: flex;
      align-items: center;

      .add-icon {
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
        margin: 0 12px 0 5px;
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

  :deep(.el-upload--picture) {
    width: 200px;
    height: 68px;
    border-radius: 2px;
    border: 1px dashed #dbdfe7;
    background: #fff;

    &:hover {
      border-color: $theme_color;
    }

    .uploader-icon {
      font-size: 24px;
      width: 200px;
      height: 68px;
    }
  }
}
</style>
