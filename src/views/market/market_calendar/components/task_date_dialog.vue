<template>
  <el-dialog
    ref="dialog"
    :close-on-click-modal="false"
    destroy-on-close
    v-model="show"
    :title="props.dateDialog.date"
    width="540px"
    custom-class="hide_footer_line choose_part_dialog"
  >
    <div class="dialog_content kos_page" v-loading="loading">
      <div v-for="(item, index) in taskList" :key="index" class="one_task" @click="toDetail(item)">
        <div class="task_left">
          <div
            :class="{
              one_icon: true,
              iconfont: true,
              'icon-zhibo': item.type === 1,
              'icon-live': item.type === 2,
              'icon-tuwenrenwu': item.type === 6,
              icon_gray:
                item.status === 1 ||
                item.status === 3 ||
                item.status === 5 ||
                item.status === 6 ||
                item.status === 7,
              icon_blue: item.status === 4,
              icon_orange: item.status === 0,
              icon_red: item.status === 2
            }"
          ></div>
          <!-- 企业版视频和图文任务 -->
          <span
            :class="item.taskGroup == 3 ? 'orange_score mark_text' : 'green_score mark_text'"
            v-if="systemVersion == 3"
          >
            {{ item.taskGroup == 3 ? 'KOC' : 'KOS' }}
          </span>
          <div class="one_title line-hidden1">
            {{ item.name }}
          </div>
        </div>
        <div class="task_right line-hidden1">{{ item.taskCreateUserName || '--' }}</div>
      </div>
    </div>
  </el-dialog>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'
import { useStore } from 'vuex'
const store = useStore()
const props = defineProps({
  dateDialog: {
    type: Object,
    default: () => {
      return {
        show: false, // 是否显示弹窗
        list: [],
        date: ''
      }
    },
    required: true
  }
})
const dialog = ref()
const show = toRef(props.dateDialog, 'show')
const loading = ref(true)
const taskList = ref([])

const systemVersion = computed(() => store.state.user.systemVersion)
function init() {
  if (props.dateDialog.list && props.dateDialog.list.length > 0) {
    taskList.value = JSON.parse(JSON.stringify(props.dateDialog.list))
  }

  loading.value = false
}
init()
const emits = defineEmits(['toDetail'])
const toDetail = throttle(function (e) {
  console.log(e)
  emits('toDetail', e, 'dateDialog')
  dialog.value.handleClose()
}, 500)
</script>
<style lang="scss" scoped>
@import '../common/color.scss';

.dialog_content {
  border-top: 1px solid #dcdee0;
  padding: 16px 16px 20px;
  max-height: 70vh;
  overflow-y: auto;
  .one_task {
    cursor: pointer;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .task_left {
      width: calc(100% - 150px);
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .iconfont {
        font-size: 16px;
        margin-right: 5px;
      }
      .one_title {
        width: calc(100% - 22px);
        font-size: 14px;
        font-weight: 400;
        color: #606266;
        line-height: 20px;
      }
    }
    .task_right {
      width: 150px;
      text-align: right;
      font-size: 14px;
      font-weight: 400;
      color: #606266;
      line-height: 20px;
    }
  }
  .one_task:hover {
    .one_title {
      color: #364fcd;
    }
  }
  .one_task + .one_task {
    margin-top: 12px;
  }
}
.mark_text {
  margin-right: 4px;
  display: inline-block;
  border-radius: 4px;
  padding: 2px 6px;
  font-weight: 600;
  font-size: 12px;
  line-height: 18px;
  font-family: PingFangSC, PingFang SC;
  display: block;
  width: max-content;
  flex-shrink: 0;
  height: fit-content;
}
</style>
