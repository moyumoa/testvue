<template>
  <div class="one_card_box">
    <div class="card_left">
      <!-- 设置了封面 -->
      <img class="task_cover" v-if="props.task.taskCover" :src="props.task.taskCover" alt="" />
      <!-- 为设置封面 -->
      <img class="task_cover" v-else :src="taskImg[props.task.type]" alt="" />
    </div>
    <div class="card_center">
      <div class="task_title line-hidden2">{{ props.task.name }}</div>
      <div class="task_tag">
        <div class="one_tag" v-for="(x, y) in props.task.taskTags" :key="y">{{ x }}</div>
      </div>
      <div class="task_mark line-hidden1">{{ props.task.taskInfo || '' }}</div>
    </div>
    <div class="card_right">
      <div :class="props.task.status === 4 ? 'task_btn' : 'other_btn'">
        {{ props.task.status === 4 ? '去参与' : TASK_STATUS.getCN(props.task.status) }}
      </div>
      <div class="btn_time" v-if="props.task.status === 4">
        {{
          countDownForamt(
            props.task.endTime.indexOf('T') > -1
              ? props.task.endTime.replace(/T/g, ' ')
              : props.task.endTime
          )
        }}后结束
      </div>
    </div>
  </div>
</template>
<script setup>
import { TASK_STATUS } from '@/utils/dictionary/task'
import { countDownForamt } from '@/utils/tools.js'
const props = defineProps({
  task: {
    type: Object,
    data() {
      return {}
    }
  }
})
const taskImg = ref({
  1: 'https://tagvv-1256030678.file.myqcloud.com/202211218cq4m.png',
  2: 'https://tagvv-1256030678.file.myqcloud.com/20221121ph8j0.png',
  3: 'https://tagvv-1256030678.file.myqcloud.com/20221121a8efq.png',
  5: 'https://tagvv-1256030678.file.myqcloud.com/20221121y86f5.png',
  6: 'https://tagvv-1256030678.file.myqcloud.com/20230926bhqiz.png'
})
</script>
<style lang="scss" scoped>
.one_card_box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
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
    min-height: 64px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
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
        white-space: nowrap;
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
      width: 100%;
    }
  }
  .card_right {
    width: 86px;
    padding: 0px 8px 0px 0;
    min-height: 64px;
    display: flex;
    flex-direction: column;
    justify-content: center;
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
</style>
