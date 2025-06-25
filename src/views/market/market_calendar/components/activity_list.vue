<template>
  <div class="activity_list">
    <!-- 活动列表 -->
    <div class="act_con">
      <transition-group class="transition-wrapper" name="sort">
        <div
          class="list_item"
          v-for="(item, index) in activityList"
          :key="item.id"
          :draggable="true"
          @dragstart="dragstart(item)"
          @dragenter="dragenter(item, $event)"
          @dragend="dragend(item, $event)"
          @dragover="dragover($event)"
          @click="showDetail(item.id)"
        >
          <div class="title_box">
            <p class="title">{{ item.title || '-' }}</p>
            <div class="title_r_box">
              <el-switch
                :model-value="item.isEnable"
                inline-prompt
                @click.stop="toggleSecKill(index, item)"
              ></el-switch>
              <el-tooltip :content="'开启后，员工可在小程序上看到活动入口'" placement="top">
                <img
                  style="width: 16px; height: 16px; margin-left: 12px"
                  src="\src\assets\images\operate\tip_line.png"
                  alt
                />
              </el-tooltip>
            </div>
          </div>
          <div class="text_box">
            {{ item.activityText || '' }}
          </div>
          <div class="img_box">
            <img :src="item.cover" alt />
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  activityList: {
    type: Array,
    default: () => {
      return []
    }
  }
})
const emits = defineEmits(['showDetail', 'drag', 'changeSwitch'])
const { activityList } = toRefs(props)
const oldData = ref(null) // 开始排序时按住的旧数据
const newData = ref(null) // 拖拽过程的数据

// 排序
function dragstart(value) {
  oldData.value = value
}

// 记录移动过程中信息
function dragenter(value, e) {
  newData.value = value
  e.preventDefault()
}

// 拖拽最终操作
function dragend() {
  if (oldData.value !== newData.value) {
    const oldIndex = activityList.value.indexOf(oldData.value)
    const newIndex = activityList.value.indexOf(newData.value)
    const newItems = [...activityList.value]
    // 删除老的节点
    newItems.splice(oldIndex, 1)
    // 在列表中目标位置增加新的节点
    newItems.splice(newIndex, 0, oldData.value)
    // console.log('调整顺序之后', newItems)
    // dataList.value = [...newItems]
    // 调用方法，存储顺序
    emits('drag', newItems)
  }
}

// 拖动事件（主要是为了拖动时鼠标光标不变为禁止）
function dragover(e) {
  e.preventDefault()
}
// 开关的开启与关闭
function toggleSecKill(index, item) {
  emits('changeSwitch', index, item)
}
// 显示详情
function showDetail(id) {
  emits('showDetail', id)
}
</script>

<style lang="scss" scoped>
.activity_list {
  border-radius: 4px;
  width: 100%;
  height: 100%;
  padding: 20px;
  background: #fff;
  .act_con {
    height: 100%;
    overflow-y: auto;
    .list_item {
      width: 100%;
      padding-bottom: 16px;
      background: #f6f7f8;
      border-radius: 4px;
      box-sizing: border-box;
      margin-top: 12px;
      transition: transform 0.3s;
      cursor: pointer;
      &:first-child {
        margin-top: unset;
      }
      :deep(.el-switch) {
        height: unset;
      }
      .title_box,
      .title_r_box {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .title_box {
        padding: 16px 16px 12px;
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
      .text_box {
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #606266;
        line-height: 20px;
        margin-bottom: 12px;
        padding: 0 16px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow-wrap: break-word;
        overflow: hidden;
        width: calc(100% - 43px);
        :deep(.reach_p) {
          p {
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow-wrap: break-word;
            overflow: hidden;
            img {
              width: 64px;
              height: 64px;
            }
          }
        }
      }
      .img_box {
        padding: 0 16px;
        img {
          width: calc(100% - 43px);
          height: 107px;
          box-sizing: border-box;
          border-radius: 2px;
          overflow: hidden;
          object-fit: cover;
        }
      }
    }
  }
}
</style>
