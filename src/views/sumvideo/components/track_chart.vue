<template>
  <!-- 分镜轨道图 -->
  <div class="track_warp">
    <img
      v-if="!initShowTrack"
      src="https://tagvv-1256030678.file.myqcloud.com/20231107uvxsw.png"
      alt=""
      class="tr_img"
      @click="showTrackAreaFn"
    />
    <div
      class="track_are"
      :class="{ track_are_time_line_top: timeLineTop }"
      ref="showTrackAreaRef"
      v-if="$data.showTrackArea"
    >
      <div class="track_title">分镜轨道图</div>
      <div class="track_con">
        <div class="track_con_content">
          <div class="track_time_line_war" v-if="showTimeLine">
            <div
              class="item_second"
              v-for="(item, index) in timeLine"
              :key="index"
              :style="{ maxWidth: `${oneSecWidth}px` }"
            >
              <p class="time">{{ item.time }}</p>
              <!-- -10 是每个竖线本身宽度 -->
              <div
                class="item_ver_line"
                :style="{ marginRight: `${(oneSecWidth - 10) / 10}px` }"
                v-for="index in 10"
                :key="index"
              ></div>
            </div>
          </div>
          <div class="track_item_warp">
            <!-- 每个轨道 -->
            <template v-for="(item, index) in $data.VideoTracks">
              <div
                class="track_item"
                v-if="item && item.length > 0"
                :key="index"
                v-show="item.length > 0"
              >
                <!-- 每个分镜 -->
                <div
                  :class="{ story_item: true, story_item_checked: storyItem.trackChecked }"
                  v-for="(storyItem, storyIndex) in item"
                  :key="storyIndex"
                  :style="{
                    width: storyItem.TimelineWidth + 'px',
                    minWidth: storyItem.TimelineWidth + 'px',
                    marginLeft: `${storyItem.TimelineInPosition}px`,
                    background: $data.trackStyle[storyItem.Type]
                      ? $data.trackStyle[storyItem.Type].backgroundColor
                      : '',
                    cursor: disClick ? 'default' : 'pointer'
                  }"
                  @click="choseTrack($event, storyItem)"
                >
                  <img :src="$data.trackStyle[storyItem.Type].icon" alt="" class="story_icon" />
                  {{ $data.trackStyle[storyItem.Type].text }}
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class="track_con_bottom_box"></div>
    </div>
  </div>
</template>
<script setup>
import { throttle } from '@/utils/tools.js'

const props = defineProps({
  disClick: {
    type: Boolean,
    default: false
  }, // 是否禁用选中
  allowCancel: {
    type: Boolean,
    default: false
  }, // 是否允许取消选中
  initShowTrack: {
    type: Boolean,
    default: false
  }, //  是否直接显示轨道
  templateConfigJson: {
    type: Object,
    default: () => {
      return {}
    }
  },
  showTimeLine: {
    type: Boolean,
    default: false // 是否显示时间刻度线
  },
  duration: {
    type: Number,
    default: null // 视频总时长（时间线时长）
  },
  timeLineTop: {
    type: Boolean,
    default: false // 是否将时间线固定在顶部
  }
})
const {
  disClick,
  initShowTrack,
  allowCancel,
  templateConfigJson,
  showTimeLine,
  duration,
  timeLineTop
} = toRefs(props)
const $data = reactive({
  showTrackArea: true, // 是否显示轨道图
  VideoTracks: [], // 显示的轨道信息，数据结构为二维数据，第一维是轨道，第二维是轨道内的分镜
  trackStyle: {
    Video: {
      icon: 'https://tagvv-1256030678.file.myqcloud.com/20231107ld2qw.png',
      text: '视频',
      backgroundColor: '#004A51'
    },
    Image: {
      icon: 'https://tagvv-1256030678.file.myqcloud.com/20231107zk1fw.png',
      text: '图片',
      backgroundColor: '#936442'
    },
    Text: {
      icon: 'https://tagvv-1256030678.file.myqcloud.com/2023110789bu0.png',
      text: '文本',
      backgroundColor: '#BA533D'
    },
    Audio: {
      icon: 'https://tagvv-1256030678.file.myqcloud.com/20231107vsxmu.png',
      text: '音频',
      backgroundColor: '#744A82'
    },
    Filter: {}, // 进一步描述滤镜子类型
    Transition: {}, // 进一步描述转场子类型
    VFX: {} // 进一步描述特效子类型
  }
})
const oneSecWidth = ref(5) // 一秒钟对应的宽度像素
const timeLine = ref([]) // 时间

onMounted(() => {
  $data.showTrackArea = props.initShowTrack
  if (props.initShowTrack) {
    // nextTick(() => {
    setTrackArea()

    // })
  }
})
// init()
const emits = defineEmits(['choseTrack', 'hideTrackAreaFn'])
const showTrackAreaRef = ref(null) // 分镜轨道图
function getTimeLine(total) {
  const timeArr = []
  const dur = JSON.parse(JSON.stringify(duration.value))
  console.log('当前宽度对应的总时间', total)
  const finDur = dur > total ? dur + 1 : total - 2 // -1是滚动条占位置，防止出现横向滚动条
  for (let seconds = 0; seconds < finDur; seconds++) {
    // 计算分钟和剩余的秒数
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    // 确保分钟和秒数都是两位数
    const formattedMinutes = minutes.toString().padStart(2, '0')
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0')
    const itemTime = {
      time: `${formattedMinutes}:${formattedSeconds}`
    }
    timeArr.push(itemTime)
  }
  timeLine.value = timeArr
}
// 显示轨道图
function showTrackAreaFn() {
  $data.showTrackArea = !$data.showTrackArea
  if ($data.showTrackArea) {
    nextTick(() => {
      setTrackArea()
    })
  } else {
    emits('hideTrackAreaFn')
  }
}
function setTrackArea() {
  const offsetWidth = showTrackAreaRef.value?.offsetWidth || 100 // 整体宽度，用来计算时长对应像素关系，时长取小数点后一位
  const totalLength = offsetWidth * 10 // 当前宽度下30秒对应的总宽度，因为取一位小数，最后结果除以10
  const oneSecW = totalLength / 300 < 40 ? 40 : totalLength / 300 // 一秒钟的宽度，不足40px，按40px算
  oneSecWidth.value = oneSecW
  const totalSec = offsetWidth / oneSecW
  getTimeLine(totalSec)
  console.log('一秒钟的宽度', oneSecWidth.value)

  let { AudioTracks, VideoTracks } = templateConfigJson.value
  // 将文本轨道，视频轨道、音频轨道分离，字幕轨道一定在最上边，音频轨道一定在最下边，视频轨道（包括图片轨道）在中间，再在个类型轨道内通过Id排序，id小的在下边
  let TextTracks = VideoTracks.filter(item => {
    return item.Type === 'Subtitle'
  })
  let VideoTracksMid = VideoTracks.filter(item => {
    return item.Type === 'Video'
  })
  AudioTracks = AudioTracks.sort((a, b) => b.Id - a.Id)
  TextTracks = TextTracks.sort((a, b) => b.Id - a.Id)
  VideoTracksMid = VideoTracksMid.sort((a, b) => b.Id - a.Id)

  const totalTracks = [...TextTracks, ...VideoTracksMid, ...AudioTracks]
  // console.log('totalTracks', totalTracks)

  $data.VideoTracks = totalTracks.map(itemTrack => {
    return (itemTrack?.VideoTrackClips || itemTrack?.AudioTrackClips).map(itemShot => {
      // 处理分镜开始位置和宽度
      // 找到当前类型的分镜的相邻的上一个分镜的出点时间
      let preTimeLineOut = 0 // 减去的距左距离
      const index = (itemTrack?.VideoTrackClips || itemTrack?.AudioTrackClips).findIndex(
        x => x.Id === itemShot.Id
      )
      if (index > 0) {
        // 当前轨道上非第一个分镜，margin-left就要减去相邻的上一个分镜的出点
        const preOne = (itemTrack?.VideoTrackClips || itemTrack?.AudioTrackClips)[index - 1] || {}
        preTimeLineOut = preOne.TimelineOut || 0
        console.log('上一个的出点', preOne.TimelineOut)
      }
      const TimelineInPosition = oneSecW * (itemShot.TimelineIn - preTimeLineOut) // 每个分镜的margin-left

      const TimelineWidth = (itemShot.TimelineOut - itemShot.TimelineIn) * oneSecW // 每个分镜宽度
      return (itemShot = {
        ...itemShot,
        TimelineInPosition,
        // TimelineOutPosition,
        TimelineWidth,
        trackChecked: false // 轨道是否被选中
      })
    })
  })
  console.log('结果', $data.VideoTracks)
}
const choseTrack = throttle((e, storyItem) => {
  if (disClick.value) {
    return
  }
  if (allowCancel.value && storyItem.trackChecked) {
    console.log('已经点击过了')
    storyItem.trackChecked = false
    emits('hideTrackAreaFn')
    return
  }
  const { MediaURL, Content } = storyItem
  const currentId = MediaURL || Content
  console.log('点击轨道', currentId, storyItem)
  // 单选storyItem.trackChecked = true
  $data.VideoTracks.forEach(s => {
    s.forEach(ss => {
      if ((ss.MediaURL ? ss.MediaURL : ss.Content) === currentId) {
        ss.trackChecked = true
      } else {
        ss.trackChecked = false
      }
    })
  })
  emits('choseTrack', e, storyItem)
})
</script>
<style lang="scss" scoped>
.track_warp {
  // margin-left: 16px;
  // height: 64px;
  // padding-top: 19px;
  position: relative;
  .tr_img {
    width: 101px;
    height: 28px;
    cursor: pointer;
    transition: all 0.3s;
    &:hover {
      opacity: 0.8;
    }
  }
  .track_are {
    position: absolute;
    top: 55px;
    left: 0;
    width: calc(100vw - 467px);
    min-width: 900px;
    // max-height: 218px;
    box-sizing: border-box;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.8);
    z-index: 199;
    .track_title {
      padding: 16px 20px 10px 20px;
      color: #fff;
    }
    .track_con {
      width: 100%;
      overflow-x: auto;
      height: 178px;
      // height: 168px;
      // margin-bottom: 10px;
      // &::after {
      //   content: '';
      //   position: absolute;
      //   bottom: 10px;
      //   right: 0;
      //   background: rgba(0, 0, 0, 0.8);
      //   width: 7px; /* 滚动条宽度 */
      //   height: 14px; /* 滚动条宽度 */
      // }
      .track_con_content {
        width: max-content;
        height: 100%;
        min-width: 100%;
        .track_time_line_war {
          box-sizing: border-box;
          background: rgba(0, 0, 0, 0.2);
          height: 22px;
          width: 100%;
          padding-left: 16px;
          display: flex;
          .item_second {
            display: flex;
            // justify-content: space-between;
            position: relative;

            .time {
              position: absolute;
              left: 4px;
              top: 0;
              font-size: 10px;
              color: rgba(255, 255, 255, 0.8);
              line-height: 14px;
            }
            .item_ver_line {
              height: 5px;
              border-left: 1px solid rgba(255, 255, 255, 0.2);
              min-width: 1px;
              &:nth-of-type(1) {
                height: 10px;
                margin-left: 0 !important;
              }
            }
            // &:last-child {
            //   .item_ver_line + .item_ver_line {
            //     display: none;
            //   }
            // }
          }
        }
        .track_item_warp {
          height: calc(100% - 22px);
          overflow-y: auto;
        }
        .track_item {
          height: 40px;
          display: flex;
          align-items: center;
          box-sizing: border-box;
          position: relative;
          padding-left: 16px;
          &:nth-of-type(2n + 1) {
            background-color: rgba(0, 0, 0, 0.2);
          }
          .story_item {
            display: flex;
            align-items: center;
            height: 28px;
            box-sizing: border-box;
            border-radius: 4px;
            color: #fff;
            font-size: 12px;
            cursor: pointer;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            border: 2px solid transparent;
            .story_icon {
              width: 16px;
              height: 16px;
              margin-right: 4px;
              margin-left: 6px;
            }
          }
          .story_item_checked {
            border-color: #fff;
          }
        }
      }
    }
    // .track_con_bottom_box {
    //   height: 20px;
    //   background: rgba(0, 0, 0, 0.2);
    // }
  }
  .track_are_time_line_top {
    .track_con {
      // &::after {
      //   bottom: 8px;
      // }
      // position: relative;
      // padding-top: 22px;
      // overflow: hidden;
      // margin-bottom: 0 !important;
      // height: max-content;
      .track_con_content {
        // overflow: auto;
        // height: 134px;
        // margin-bottom: 20px;
        // width: 100%;
        // .track_item {
        //   background-color: unset !important;
        // }
        .track_time_line_war {
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          // position: absolute;
          // background-color: unset !important;
          // top: 0;
          // left: 0;
          // .item_second {
          // }
        }
      }
    }
  }
}
</style>
