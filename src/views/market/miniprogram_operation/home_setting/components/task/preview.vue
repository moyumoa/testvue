<template>
  <div
    :class="[
      'one_preview',
      'task_preview',
      props.data.err ? 'err_preview' : '',
      props.chooseTab === 'task_recommend' ? 'choose_preview' : ''
    ]"
    v-if="props.data.switch === '1'"
  >
    <div class="preview_title">
      <img class="title_img" v-if="props.data.title" :src="props.data.title" alt="" />
    </div>
    <!-- 具体活动的样式 -->
    <!-- 引导视频式 -->
    <div class="video_task_box" v-if="props.data.view === '2'">
      <template v-if="props.data.list && props.data.list.length > 0">
        <div class="one_video_box" v-for="(item, index) in props.data.list" :key="index">
          <!-- 引导视频的封面 -->
          <img v-if="item.videoImgUrl" class="task_videoImg" :src="item.videoImgUrl" alt="" />

          <img
            v-else
            class="task_videoImg"
            src="https://tagvv-1256030678.file.myqcloud.com/202211288xxcm.png"
            alt=""
          />
          <!-- 任务信息 -->
          <div class="task_back">
            <div class="back_top">
              <img
                class="top_icon"
                src="https://tagvv-1256030678.file.myqcloud.com/20221121we1vx.png"
                alt=""
              />
            </div>
            <div class="back_bottom">
              <div class="task_name line-hidden2">
                {{ item.name || '' }}
              </div>
              <div class="task_mark line-hidden1">
                {{ item.taskInfo || '' }}
              </div>
            </div>
          </div>
        </div>
      </template>
      <div class="one_video_box" v-else>
        <!-- 引导视频的封面 -->
        <img
          class="task_videoImg"
          src="https://tagvv-1256030678.file.myqcloud.com/202211288xxcm.png"
          alt=""
        />
      </div>
    </div>
    <!-- 卡片列表式  -->
    <div class="card_task_box" v-else>
      <div class="active_task">
        <!-- 列表有数据 -->
        <template v-if="props.data.list && props.data.list.length > 0">
          <div class="one_task" v-for="(item, index) in props.data.list" :key="index">
            <previewTask :task="item"></previewTask>
            <div class="line_box" v-if="index != props.data.list.length - 1"></div>
          </div>
        </template>
        <!-- 列表没数据 -->
        <previewTask :task="defaultTask" v-else></previewTask>
      </div>
    </div>
  </div>
</template>
<script setup>
import previewTask from '@/views/market/miniprogram_operation/components/preview_task.vue'

import { formatDate } from '@/utils/tools.js'
const props = defineProps({
  data: {
    type: Object,
    data() {
      return {
        switch: '0'
      }
    }
  },
  chooseTab: {
    type: String
  }
})
const defaultTask = ref({
  type: 1,
  taskTags: ['发布视频', '一键转发'],
  name: '这里显示成员任务列表第一个任务',
  taskInfo: '这里显示成员任务列表第一个任务',
  status: 4,
  endTime: formatDate(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), 'YYYY-MM-DD HH:mm:ss')
})
</script>
<style lang="scss" scoped>
@import '../../../components/css/preview_page.scss';
.task_preview {
  // width: 351px;
  // height: 338px;
  background: #ffffff;
  border-radius: 12px;
}
.card_task_box {
  margin-top: 4px;
  margin-bottom: 16px;
  // padding: 0 12px;
  .active_task {
    // background: #ffffff;
    // box-shadow: 0px 2px 12px 0px rgba(54, 55, 59, 0.1);
    // border-radius: 12px;
    // padding: 12px 0;
  }
  .one_card_box {
    padding: 0 0px 0px 12px;
    .card_left {
      width: 64px;
      height: 64px;
      border-radius: 8px;
      .task_cover {
        width: 64px;
        height: 64px;
        border-radius: 8px;
        object-fit: cover;
      }
    }
    .card_center {
      width: calc(100% - 168px);
      margin: 0 4px 0 12px;
      .task_title {
        width: 100%;
        font-size: 15px;
        font-weight: 400;
        color: #1f2329;
        line-height: 22px;
      }
      .task_tag {
        margin: 6px 0;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        .one_tag {
          background: rgba(143, 149, 158, 0.1);
          padding: 0 4px;
          height: 16px;
          border-radius: 2px;
          font-size: 11px;
          font-weight: 400;
          color: #8f959e;
          line-height: 16px;
        }
        .one_tag + .one_tag {
          margin-left: 8px;
        }
      }
      .task_mark {
        font-size: 12px;
        font-weight: 400;
        color: #8f959e;
        line-height: 18px;
      }
    }
    .card_right {
      width: 86px;
      padding: 8px 8px 8px 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      .task_btn {
        width: 62px;
        height: 28px;
        background: #fe603f;
        border-radius: 14px;
        font-size: 13px;
        font-weight: 400;
        color: #ffffff;
        line-height: 28px;
        text-align: center;
      }
      .other_btn {
        width: 62px;
        height: 28px;
        border-radius: 14px;
        font-size: 13px;
        font-weight: 400;
        color: #bbbfc3;
        line-height: 28px;
        text-align: center;
      }
      .btn_time {
        margin-top: 6px;
        font-size: 10px;
        font-weight: 400;
        color: #bbbfc3;
        line-height: 14px;
      }
    }
  }
}

.video_task_box {
  margin-top: 4px;
  margin-bottom: 16px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0 12px;
  .one_video_box {
    width: calc(50% - 4.5px);
    position: relative;
    height: 264px;
    border-radius: 8px;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%);
    border-radius: 8px;
    .task_videoImg {
      width: 100%;
      height: 264px;
      object-fit: cover;
      border-radius: 8px;
    }
    .task_back {
      width: 100%;
      overflow: hidden;
      height: 264px;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%);
      border-radius: 8px;
      position: absolute;
      left: 0;
      top: 0;

      .back_top {
        position: absolute;
        right: 8px;
        top: 8px;
        width: 28px;
        height: 18px;
        background: rgba(0, 0, 0, 0.4);
        border-radius: 12px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        .top_icon {
          width: 16px;
          height: 16px;
          object-fit: cover;
        }
      }
      .back_bottom {
        position: absolute;
        left: 0;
        bottom: 0;
        padding: 12px;
        width: 100%;
        .task_name {
          width: 100%;
          font-size: 14px;
          font-weight: 500;
          color: #ffffff;
          line-height: 20px;
        }
        .task_mark {
          width: 100%;
          margin-top: 4px;
          font-size: 12px;
          font-weight: 400;
          color: #ffffff;
          line-height: 17px;
        }
      }
    }
  }
}
.line_box {
  width: 249px;
  border-top: 1px dashed rgba(31, 35, 41, 0.1);
  height: 0;
  margin: 12px 0 12px 78px;
}
</style>
