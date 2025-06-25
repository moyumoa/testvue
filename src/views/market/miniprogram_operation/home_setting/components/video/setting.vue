<template>
  <div class="operation-video">
    <title-wrapper title="" :subtitle="subtitleObj[videoInfo.switch]">
      <template #right>
        <el-switch
          @change="validConfigFun"
          v-model="videoInfo.switch"
          active-value="1"
          inactive-value="0"
        />
      </template>
    </title-wrapper>
    <div class="container">
      <navSetting
        :title="videoInfo.title"
        :defaultTitle="videoInfo.defaultTitle"
        @updateTitle="updateTitle"
      />
      <div class="container_title">内容设置</div>
      <draggable
        v-model="list"
        group="video_setting"
        @start="drag = true"
        @end="drag = false"
        item-key="id"
        handle=".icon-tuodongweizhi"
        :animation="300"
      >
        <template #item="{ element, index }">
          <div class="main">
            <video-wrapper
              :video-info="element"
              :index="index"
              @deleteItem="deleteItem"
            ></video-wrapper>
            <sort-icon :list="list" :index="index" :hasMove="true" :has-delete="false"></sort-icon>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup>
import navSetting from '../../../components/nav_setting.vue'
import TitleWrapper from '../../../components/title_wrapper.vue'
import VideoWrapper from '../../../components/video_wrapper.vue'
import SortIcon from '../../../components/sort_icon.vue'
import draggable from 'vuedraggable'
const props = defineProps({
  data: {
    type: Object,
    default() {
      return {
        videoInfo: {
          switch: '0'
        }
      }
    }
  }
})
const { videoInfo } = toRefs(props.data)

const subtitleObj = {
  1: '精彩视频重点推荐，激发员工荣誉感，推动良性竞争',
  0: '开关关闭，全员营销小程序首页将隐藏"精彩视频"'
}
const list = ref([])
function init() {
  if (props.data.videoInfo && props.data.videoInfo.list && props.data.videoInfo.list.length > 0) {
    list.value = JSON.parse(JSON.stringify(props.data.videoInfo.list))
  } else {
    for (let i = 0; i < 3; i++) {
      list.value.push(initListItem())
    }
  }

  console.log('获取到的精彩视频信息', list.value, props.data.videoInfo, videoInfo.value)
}
init()

function initListItem() {
  return {
    uniqueId: parseInt(Math.random() * 100000),
    videoDeliverId: '',
    userVideoId: '',
    userId: '',
    orgId: '',
    displayOptions: 'none',
    recommendReason: '',
    videoImgUrl: '',
    videoPlayUrl: '',
    videoTitle: '暂无',
    extra: ''
  }
}
// 更新标题栏
function updateTitle(e) {
  videoInfo.value.title = e
}

const emits = defineEmits(['updateSetting', 'validConfig'])
function validConfigFun() {
  emits('validConfig', 'video_recommend')
}
watch(
  () => list.value,
  value => {
    emits('updateSetting', 'video_recommend', value)
  },
  { deep: true, immediate: true }
)
// 删除
const deleteItem = index => {
  list.value[index] = initListItem()
  // if (videoInfo.value.switch === '1') {
  //   videoInfo.value.switch = '0'
  // }
}
const drag = ref(false)
</script>

<style lang="scss" scoped>
@import '../../../components/css/setting_page.scss';
.operation-video {
  :deep(.el-form-item) {
    margin-bottom: 0px;
  }

  .container {
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
