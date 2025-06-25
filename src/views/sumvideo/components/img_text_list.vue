<template>
  <div>
    <div class="video_box" v-loading="tableForm.loading">
      <template v-if="tableForm.listData && tableForm.listData.length > 0">
        <div
          class="all_warp"
          :infinite-scroll-delay="1000"
          v-infinite-scroll="loadFun"
          :infinite-scroll-distance="50"
          :infinite-scroll-immediate="false"
          :infinite-scroll-disabled="tableForm.listData.length >= tableForm.page.total"
        >
          <div
            class="one_item"
            v-for="(item, index) in tableForm.listData"
            :key="item.id || index"
            :style="{
              width: `${oneWidth}px`,
              height: `calc((${oneWidth}px - 16px) * ${warpRatio} + 48px)`
            }"
            @click.stop="toDetail(item, index)"
          >
            <div
              class="top_warp"
              :style="
                (chooseInfo.creativeId || chooseInfo.id) == item.id
                  ? 'outline:2px solid #364fcd;padding:1px'
                  : 'padding:1px'
              "
            >
              <!-- 草稿 -->
              <div class="cover_draft" v-if="item.status === 1">
                <div class="wrapper">
                  <img src="https://tagvv-1256030678.file.myqcloud.com/20250114grl16.png" alt="" />
                  <p class="marginTop8">模板草稿</p>
                </div>
              </div>
              <div class="mask_warp">
                <!-- 标签列表 -->
                <div class="tag_list" v-if="item.tagList">
                  <div class="tag_item" v-for="tag in item.tagList" :key="tag.id">
                    {{ tag.name }}
                  </div>
                </div>

                <div class="det_warp">
                  <div class="det_item">图片：{{ item.photoClipCnt || 0 }}</div>
                  <div class="det_item" v-if="item.creativeStruct == 2">
                    文本：{{ item.creativeStruct == 1 ? 0 : 1 }}
                  </div>
                  <!-- <div class="det_item">BGM：{{ 0 }}</div> -->
                </div>

                <!-- 选择按钮 -->
                <div class="choose_warp" v-if="pageSource == 'create_image_text'">
                  <!-- 选中 -->
                  <img
                    src="https://tagvv-1256030678.file.myqcloud.com/20240913jppch.png"
                    alt=""
                    class="select_icon"
                    v-if="(chooseInfo.creativeId || chooseInfo.id) == item.id"
                  />
                  <!-- 未选中 -->
                  <img
                    src="https://tagvv-1256030678.file.myqcloud.com/202409137klsi.png"
                    alt=""
                    class="select_icon"
                    v-else
                  />
                </div>
                <!-- 删除按钮 -->
                <div
                  class="del_btn"
                  @click.stop="delFun(item, index)"
                  v-if="pageSource == 'template_image_text'"
                >
                  <img
                    class="del_icon"
                    src="https://tagvv-1256030678.file.myqcloud.com/20240914hukdx.png"
                    alt=""
                  />
                </div>
              </div>
              <sceneCover
                origin="imgTextList"
                v-if="item.pictures"
                :list="JSON.parse(item.pictures)"
              />
              <img
                v-if="!item.pictures && item.coverUrl"
                :src="item.coverUrl"
                alt=""
                class="cover_img"
              />
            </div>
            <div class="name line-hidden1">{{ item.name || '-' }}</div>
          </div>
        </div>
        <div class="loading_library" style="padding-bottom: 20px">
          <img
            src="/public/loading.gif"
            v-if="tableForm.loading && tableForm.page.index > 1"
            alt=""
          />
          {{
            tableForm.loading
              ? tableForm.page.index === 1
                ? ''
                : '加载中...'
              : tableForm.listData.length >= tableForm.page.total
              ? tableForm.listData.length > 8
                ? '已经到底了~'
                : ''
              : '上拉加载更多~'
          }}
        </div>
      </template>
      <div
        v-if="!tableForm.loading && !(tableForm.listData && tableForm.listData.length > 0)"
        class="no_echart"
      >
        <img src="@/assets/images/content_center/no_activity.png" alt />
        暂无数据
      </div>
    </div>
  </div>
</template>

<script setup>
import { throttle, isNotEmpty, getCWidth } from '@/utils/tools'
import sceneCover from '@/views/sumvideo/components/scene_cover.vue'

const props = defineProps({
  tableForm: {
    type: Object,
    default: () => {
      return {
        loading: false,
        listData: [],
        page: {
          index: 1,
          size: 10,
          total: 0
        }
      }
    }
  },
  searchComponents: {
    type: Object,
    default: () => {
      return {}
    }
  },
  pageSource: {
    type: String,
    default: ''
  }, // 页面来源 create_image_text 图文生成 template_image_text图文模板
  chooseTemplateInfo: {
    type: Object,
    default: () => {
      return {}
    }
  }, // 选中的模板信息 图文生成时有选中信息
  warpRatio: {
    type: Number,
    default: 1 // 高宽比例
  },
  oneWidthDefault: {
    type: Number,
    default: null // 单个宽度
  }
})
const { tableForm, pageSource, warpRatio, oneWidthDefault } = toRefs(props)
// const defaultCover = ref('https://tagvv-1256030678.file.myqcloud.com/202212066b4kq.png')
const emits = defineEmits(['loadMore', 'chooseTemplateFun', 'toDetail', 'delFun'])
const initOver = ref(false)

const chooseInfo = ref({}) // 选中的模板信息
// 选择一个
const updateChoose = throttle(function (item) {
  const id = chooseInfo.value?.id || chooseInfo.value?.creativeId || null
  if (id === item.id) return
  chooseInfo.value = item
}, 300)
// 加载更多
const loadFun = throttle(function () {
  emits('loadMore')
}, 1000)

// 去详情
const toDetail = throttle((item, index) => {
  if (pageSource.value === 'create_image_text') {
    updateChoose(item)
    return
  }
  emits('toDetail', item, index)
}, 300)

// 删除
const delFun = throttle((item, index) => {
  emits('delFun', item, index)
}, 700)
watch(
  () => chooseInfo.value,
  val => {
    if (initOver.value) {
      emits('chooseTemplateFun', val)
    }
  },
  {
    deep: true,
    immediate: true
  }
)

const listWidth = ref() // 列表宽度
const cLen = ref(7) // 列数 (ui图)
const oneWidth = ref(240) // 每个元素宽度

function getWidth() {
  listWidth.value = getCWidth() - 32 - 24 - 7
  init()
}
function init() {
  cLen.value = parseInt((getCWidth() - 32 - 24 - 7) / 256)
  oneWidth.value = Math.floor(listWidth.value / cLen.value) - 16
}

onMounted(() => {
  if (oneWidthDefault.value) {
    oneWidth.value = JSON.parse(JSON.stringify(oneWidthDefault.value))
  }
  if (isNotEmpty(props.chooseTemplateInfo)) {
    chooseInfo.value = JSON.parse(JSON.stringify(props.chooseTemplateInfo))
    nextTick(() => {
      initOver.value = true
    })
  } else {
    initOver.value = true
  }
  getWidth()
  window.onresize = () => {
    getWidth()
  }
})
onUnmounted(() => {
  window.onresize = null
})
</script>

<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.video_box {
  .all_warp {
    padding-top: 20px;
    padding-left: 24px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    .one_item {
      cursor: pointer;
      width: 180px;
      height: 272px;
      margin-bottom: 16px;
      margin-right: 16px;
      .top_warp {
        width: 100%;
        height: calc(100% - 32px);
        border-radius: 4px;
        position: relative;
        .mask_warp {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 4px;
          z-index: 1;
          .tag_list {
            display: flex;
            flex-wrap: wrap;
            padding: 12px 4px 0 12px;
            .tag_item {
              margin-right: 8px;
              margin-bottom: 8px;
              width: max-content;
              height: max-content;
              color: #fff;
              font-size: 12px;
              line-height: 18px;
              padding: 1px 4px;
              border-radius: 4px;
              background-color: rgba(0, 0, 0, 0.4);
            }
          }
          .det_warp {
            display: flex;
            flex-wrap: wrap;
            padding: 12px 4px 0 12px;
            .det_item {
              margin-right: 8px;
              margin-bottom: 8px;
              width: max-content;
              height: max-content;
              color: #fff;
              font-size: 12px;
              line-height: 18px;
              padding: 1px 4px;
              border-radius: 4px;
              background-color: rgba(0, 0, 0, 0.4);
            }
          }
          .choose_warp {
            position: absolute;
            bottom: 0;
            right: 0;
            padding: 8px;
            cursor: pointer;
            z-index: 2;
            .select_icon {
              width: 16px;
              height: 16px;
            }
          }
          .del_btn {
            position: absolute;
            bottom: 12px;
            right: 12px;
            width: 32px;
            height: 32px;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            background: rgba(0, 0, 0, 0.4);
            border-radius: 100%;
            cursor: pointer;
            img {
              width: 16px;
              height: 16px;
              object-fit: contain;
              display: flex;
            }
          }
        }
        .cover_img {
          width: 100%;
          height: 100%;
          border-radius: 4px;
          object-fit: cover;
        }
        // 草稿
        .cover_draft {
          border-radius: 4px;
          background: linear-gradient(135deg, #eff2ff 0%, #dbe0ff 100%);
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: flex;
          justify-content: center;
          align-items: center;

          .wrapper {
            p {
              font-size: 14px;
              color: #636bb1;
              line-height: 18px;
              text-align: center;
            }

            img {
              width: 60px;
              height: 60px;
              display: flex;
            }
          }
        }
      }
      .name {
        text-align: center;
        padding: 12px 8px 0 8px;
        line-height: 20px;
      }
    }
  }
}
</style>
