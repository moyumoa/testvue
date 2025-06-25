<template>
  <div class="operation-video">
    <title-wrapper title="视频设置" :subtitle="subtitle">
      <template #right>
        <el-switch v-model="switchValue" :before-change="onBeforeChange" @change="onSwitch" />
      </template>
    </title-wrapper>
    <div class="container">
      <draggable
        v-model="list"
        group="page_view"
        @start="drag = true"
        @end="drag = false"
        item-key="id"
      >
        <template #item="{ element, index }">
          <div class="main">
            <video-wrapper :video-info="element"  :index="index" @deleteItem="deleteItem"></video-wrapper>
            <sort-icon :list="list" :index="index" :has-delete="false"></sort-icon>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup>
import TitleWrapper from './components/title_wrapper.vue'
import VideoWrapper from './components/video_wrapper.vue'
import { ElMessage } from 'element-plus'
import { debounce, isEmpty } from '@/utils/tools.js'
import SortIcon from './components/sort_icon.vue'
import { operationConfig } from '@/views/market/miniprogram_operation/model.js'
import draggable from 'vuedraggable'

const configKey = {
  CONFIG_GROUP: 'video_recommend',
  SWITCH_KEY: 'video_recommend_mini_display',
  LIST_KEY: 'video_list'
}
const subtitleObj = {
  open: '精彩视频重点推荐，激发员工荣誉感，推动良性竞争',
  close: '开关关闭，全员营销小程序首页将隐藏"精彩视频"'
}
const { switchValue, onSwitch, subtitle, list, getInfo, updateInfo } = operationConfig(
  configKey,
  subtitleObj
)
const onBeforeChange = () => {
  const value = list.value.some(item => isEmpty(item.videoPlayUrl))
  if (value) {
    ElMessage.warning('请添加3个推荐视频！')
    return false
  }
  return true
}


function initListItem() {
  return {
    uniqueId:parseInt(Math.random()*100000),
    videoDeliverId: '',
    userVideoId: '',
    userId: '',
    orgId: '',
    displayOptions: 'play_cnt',
    recommend_reason: '',
    videoCoverUrl: '',
    videoPlayUrl: '',
    videoTitle: '暂无'
  }
}
for (let i = 0; i < 3; i++) {
  list.value.push(initListItem() )
}
getInfo()

watch(
  () => list.value,
  value => {
    update(value)
  },
  { deep: true }
)
const update = debounce(() => {
  updateInfo(list.value)
}, 1000)

const deleteItem = (index ) => {
  list.value[index] = initListItem()
  if (switchValue.value) {
    onSwitch(false)
    switchValue.value = false
  }
}
const drag = ref(false)
</script>

<style lang="scss" scoped>
.operation-video {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }

  .container {
    padding: 0 24px;

    .add-and-tips {
      line-height: 62px;
      display: flex;
      align-items: center;

      .add-icon {
        color: $theme-color;
        font-size: 20px;
      }

      .add {
        color: $theme-color;
        font-size: 16px;
        margin: 0 12px;
      }
    }

    .video-info {
      width: 573px;
      //height: 140px;
      padding: 16px;
      box-sizing: border-box;
      background: #f6f7f8;
      border-radius: 4px;
      position: relative;
      margin-top: 16px;
      display: flex;

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

      .video-wrapper {
        margin-right: 16px;
        text-align: center;

        .video-cover {
          width: 102px;
          height: 136px;
          background: #ffffff;
          border: 1px solid #dcdee0;

          .icon-plus {
            margin-top: 41px;
            font-size: 20px;
          }

          .add-video {
            margin-top: 14px;
            font-size: 14px;
            color: #333333;
          }
        }

        .video-text {
          margin-top: 10px;
          text-align: center;
          font-size: 14px;
          color: $theme_color;
          line-height: 20px;
        }
      }

      .info-wrapper {
        flex: 1;
      }
    }

    .main {
      position: relative;
      width: 573px;
    }
  }
}
</style>
