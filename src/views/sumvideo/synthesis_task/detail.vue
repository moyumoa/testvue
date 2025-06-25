<template>
  <div class="detail_page sumvideo_page" v-loading="tableForm.loading">
    <div class="page_top" :class="{ page_top_img: tableForm.isImgText }">
      <div class="top_left">
        <div class="top_title">{{ tableForm.info.jobName || '--' }}</div>
        <div
          class="top_stu"
          :class="{ orange_circle: isPreview(tableForm.info) }"
          v-if="!tableForm.loading"
        >
          {{
            SYNTHESISTASK_STATUS.getCN(
              isPreview(tableForm.info)
                ? tableForm.info.mergeStatus || 0
                : tableForm.info.status || 0
            ).label
          }}
        </div>
        <div class="time_warp">
          {{
            tableForm.info.createTime ? String(tableForm.info.createTime).replace(/T/, ' ') : '--'
          }}
        </div>
        <div class="top_num">已提交：{{ tableForm.info.submitNum || 0 }}</div>
        <div class="top_num">已合成：{{ tableForm.info.successNum || 0 }}</div>
        <div class="top_num">已失败：{{ tableForm.info.failNum || 0 }}</div>
        <el-select
          v-model="previewBorder"
          placeholder="请选择边框"
          style="width: 180px"
          v-if="!tableForm.isImgText"
        >
          <el-option
            v-for="item in previewBorderList"
            :label="item.label"
            :value="item.value"
            :key="item.value"
          />
        </el-select>
      </div>
      <el-button
        type="primary"
        @click="handelReeditStatus"
        class="reedit"
        v-if="!tableForm.isImgText"
      >
        重新编辑
      </el-button>
    </div>
    <!-- 非图文合成 -->
    <div class="page_center" v-if="!tableForm.isImgText">
      <template v-if="tableForm.listData && tableForm.listData.length > 0">
        <div
          class="all_video"
          :infinite-scroll-delay="1000"
          v-infinite-scroll="loadFun"
          :infinite-scroll-distance="50"
          :infinite-scroll-immediate="false"
          :infinite-scroll-disabled="tableForm.listData.length >= tableForm.page.total"
        >
          <div
            class="one_video"
            v-for="(item, index) in tableForm.listData"
            :key="index"
            :style="{
              width: `${oneWidth}px`,
              height: `calc((${oneWidth}px - 16px) * 1.721 + 20px)`
            }"
          >
            <div class="one_video_box">
              <!-- 合成中&合成失败 -->
              <template v-if="item.editStatus == 1">
                <div
                  class="video_status"
                  v-loading="item.editStatus == 1"
                  element-loading-text="正在合成中"
                  element-loading-background="rgba(4, 4, 5)"
                ></div>
              </template>
              <!-- 除了合成中 -->
              <template v-else>
                <!-- 单选框 -->
                <div class="select_warp" v-if="isReedit" @click.stop="beforeSelect(item)">
                  <div class="action_right">
                    <div class="xm_check_box_round" style="margin-right: 8px">
                      <div
                        :class="
                          chooseItemId === item.id ? 'check_box check_box_active' : 'check_box'
                        "
                      ></div>
                    </div>
                  </div>
                </div>
                <!-- 合成失败 -->
                <template v-if="item.editStatus == 3">
                  <div class="video_err_box">
                    <div class="wrapper">
                      <img
                        src="https://tagvv-1256030678.file.myqcloud.com/20230303bcyvr.png"
                        alt=""
                      />
                      <p>合成失败</p>
                    </div>
                  </div>
                </template>
                <!-- 合成成功 -->
                <template v-else>
                  <img class="video_cover" :src="item.coverUrl" alt="" />

                  <div class="video_title">
                    <div class="line-hidden2">{{ item.name || '--' }}</div>
                  </div>
                  <img
                    class="play_icon"
                    src="https://tagvv-1256030678.file.myqcloud.com/20240329lnttj.png"
                    alt=""
                    @click="previewFun('查看视频', item.materialUrl, 'borderVideo', item.coverUrl)"
                  />
                </template>
              </template>
            </div>
          </div>
        </div>
        <div class="loading_library">
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
              ? tableForm.listData.length > 12
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
    <!-- 图文合成 -->
    <div class="page_center_img_text" v-else>
      <div
        class="left_list"
        :class="{
          left_list_only_img: isOnlyImg,
          left_list_scroll: tableForm.listData && tableForm.listData.length > 4
        }"
      >
        <template v-if="tableForm.listData && tableForm.listData.length > 0">
          <div
            class="all_imgtext"
            :infinite-scroll-delay="1000"
            v-infinite-scroll="loadFun"
            :infinite-scroll-distance="50"
            :infinite-scroll-immediate="false"
            :infinite-scroll-disabled="tableForm.listData.length >= tableForm.page.total"
          >
            <div
              class="one_imgtext"
              :class="{
                one_imgtext_active: currentChooseImgtext && currentChooseImgtext.id === item.id
              }"
              v-for="item in tableForm.listData"
              :key="item.id"
              @click="chooseImgtext(item)"
            >
              <img
                :src="
                  item.materialUrl[0]
                    ? item.materialUrl[0].thumbUrl || item.materialUrl[0].url
                    : 'https://tagvv-1256030678.file.myqcloud.com/20240914lrejw.png'
                "
                alt=""
                class="cover_img"
              />
              <div class="desc_box" v-if="item.creativeStruct == 2">
                <div class="one_title line-hidden1">
                  {{ item.imageTextTitle.title || '' }}
                </div>
                <div class="one_text">
                  {{ item.imageTextTitle.description || '' }}
                  <div class="content_mount">
                    <template
                      v-if="item.mount && item.mount.dyTopic && item.mount.dyTopic.length > 0"
                    >
                      <span v-for="(a, b) in item.mount.dyTopic" :key="b">#{{ a.name }}</span>
                    </template>
                    <template
                      v-if="item.mount && item.mount.xhsTopic && item.mount.xhsTopic.length > 0"
                    >
                      <span v-for="(a, b) in item.mount.xhsTopic" :key="b">#{{ a.name }}</span>
                    </template>
                    <template v-if="item.mount && item.mount.xhsAt && item.mount.xhsAt.length > 0">
                      <span v-for="(a, b) in item.mount.xhsAt" :key="b">@{{ a.name }}</span>
                    </template>
                  </div>
                </div>
                <div class="num_tip">{{ `共${item.materialUrl.length || 0}张图片` }}</div>
              </div>
              <!-- 仅图片 -->
              <div class="num_tip" v-else>{{ `共${item.materialUrl.length || 0}张图片` }}</div>
            </div>
          </div>
          <div class="loading_library">
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
                ? tableForm.listData.length > 12
                  ? '已经到底了~'
                  : ''
                : '上拉加载更多~'
            }}
          </div>
        </template>
        <div
          v-if="!tableForm.loading && !(tableForm.listData && tableForm.listData.length > 0)"
          class="no_echart"
          style="width: 110px"
        >
          <img src="@/assets/images/content_center/no_activity.png" alt />
          暂无数据
        </div>
      </div>
      <div
        class="right_detail"
        :class="{
          swiper_warp_center: currentChooseImgtext && currentChooseImgtext.creativeStruct == 1
        }"
      >
        <template v-if="currentChooseImgtext">
          <div class="swiper_warp">
            <previewImgText
              :bigWidth="360"
              :bigImgWidth="360"
              :imgAspectRatio="0.75"
              :smallHeight="88"
              :imgList="currentChooseImgtext.materialUrl || []"
              operButPosition="offset"
              :acceptPreivew="true"
            />
          </div>
          <div class="text_warp" v-if="currentChooseImgtext.creativeStruct == 2">
            <div class="text_title">{{ currentChooseImgtext.imageTextTitle.title || '' }}</div>
            <div class="text">
              {{ currentChooseImgtext.imageTextTitle.description || '' }}

              <div class="content_mount">
                <template
                  v-if="
                    currentChooseImgtext.mount &&
                    currentChooseImgtext.mount.dyTopic &&
                    currentChooseImgtext.mount.dyTopic.length > 0
                  "
                >
                  <span v-for="(a, b) in currentChooseImgtext.mount.dyTopic" :key="b">
                    #{{ a.name }}
                  </span>
                </template>
                <template
                  v-if="
                    currentChooseImgtext.mount &&
                    currentChooseImgtext.mount.xhsTopic &&
                    currentChooseImgtext.mount.xhsTopic.length > 0
                  "
                >
                  <span v-for="(a, b) in currentChooseImgtext.mount.xhsTopic" :key="b">
                    #{{ a.name }}
                  </span>
                </template>
                <template
                  v-if="
                    currentChooseImgtext.mount &&
                    currentChooseImgtext.mount.xhsAt &&
                    currentChooseImgtext.mount.xhsAt.length > 0
                  "
                >
                  <span v-for="(a, b) in currentChooseImgtext.mount.xhsAt" :key="b">
                    @{{ a.name }}
                  </span>
                </template>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="no_echart">
          <img src="@/assets/images/content_center/no_activity.png" alt />
          暂无数据
        </div>
      </div>
    </div>
    <div class="page_bottom">
      <el-button @click="goBack" v-if="!isReedit">返回</el-button>
      <el-button type="primary" @click="product" v-if="!isReedit && isPreview()">
        继续合成
      </el-button>
      <el-button @click="handelReeditStatus('cancel')" v-if="isReedit">取消</el-button>
      <el-button type="primary" @click="handelReedit" v-if="isReedit" :loading="reEditLoading">
        编辑
      </el-button>
    </div>
    <!-- 预览分镜的弹窗 -->
    <previewDialog v-if="previewInfo.show" :previewDialog="previewInfo"></previewDialog>
  </div>
</template>
<script setup>
import previewDialog from '@/components/preview_dialog_v2/preview_dialog.vue'
import previewImgText from '@/views/sumvideo/components/preview_img_text.vue'

import { SYNTHESISTASK_STATUS } from '@/utils/dictionary/sumvideo.js'
import { info, proceedProduce, editVideo } from '@/api/sumvideo/syntesis_task'

import { useRoute, useRouter } from 'vue-router'
import { throttle, getCWidth, isNotEmpty } from '@/utils/tools'
import { sendHrefMessage } from '@/utils/OEA.js'
import { ElMessageBox } from 'element-plus'
import { getProductGoodsPrice } from '@/api/system_setting/brand_info'

const route = useRoute()
const router = useRouter()
const isOnlyImg = ref(false)

const previewBorderList = ref([
  {
    label: '抖音边框',
    value: 'dy'
  },
  {
    label: '小红书边框',
    value: 'xhs'
  },
  {
    label: '快手边框',
    value: 'ks'
  },
  {
    label: '视频号边框',
    value: 'sph'
  },
  {
    label: '无边框',
    value: ''
  }
])
const previewBorder = ref('dy') // 默认选中抖音边框
const message = inject('$message')

const tableForm = reactive({
  id: null,
  isImgText: false, // 是否是图文合成
  info: {},
  loading: true,
  timer: null,
  listData: [],
  page: {
    index: 1,
    size: 24,
    total: 0
  }
})
tableForm.id = route.query.id
tableForm.isImgText = route.query.isImgText
// 预览信息
const previewInfo = ref({
  show: false
})
const previewFun = throttle((title, url, type, cover) => {
  previewInfo.value = {
    show: true,
    title: title,
    url: url,
    type: type,
    cover: cover || '',
    borderType: previewBorder.value
  }
})

const chooseItemId = ref(null) // 已选择的
const reEditLoading = ref(false)
const currentChooseImgtext = ref(null) // 当前选择的图文合成成品信息
// 选择一个图文合成成品
const chooseImgtext = throttle(function (item) {
  console.log('item', item)
  if (item.id === currentChooseImgtext?.value?.id) return
  currentChooseImgtext.value = null
  nextTick(() => {
    currentChooseImgtext.value = item
  })
}, 700)

const oneCouponNum = ref(10)
// 获取普通视频合成需要消耗的数量
function getPrice() {
  return new Promise(resolve => {
    getProductGoodsPrice()
      .then(res => {
        if (res.code === 0) {
          oneCouponNum.value = res.data?.proudctConfig?.videoCost || 1
          console.log('获取到的消耗', res, oneCouponNum.value)
        }
      })
      .finally(() => {
        resolve()
      })
  })
}
getPrice()

function isPreview() {
  return (
    tableForm.info.mergeStatus === 10 &&
    tableForm.info.finishNum === tableForm.info.previewNumber &&
    tableForm.info.finishNum > 0
  )
}

function beforeSelect(item) {
  chooseItemId.value = item.id
}

const isReedit = ref(false) // 是否在重新编辑
const handelReeditStatus = throttle(function (type) {
  if (type === 'cancel') {
    isReedit.value = false
    // 清空选中
    chooseItemId.value = null
  } else {
    isReedit.value = !isReedit.value
  }
}, 500)

const handelReedit = throttle(function () {
  if (!chooseItemId.value) {
    message.warning('请选择视频')
    return
  }
  reEditLoading.value = true
  editVideo({
    productVideoId: chooseItemId.value
  })
    .then(res => {
      if (res.code === 0) {
        // 跳转
        const { aliyunProjectId, projectId, creativeId } = res.data
        const url = `${location.origin}/sumvideo/editing_project_web/${aliyunProjectId}/${projectId}?origin=synthesis_task_detail&hideSave=true&creativeId=${creativeId}&id=${tableForm.id}`
        sendHrefMessage(url)
      }
      reEditLoading.value = false
    })
    .catch(() => {
      reEditLoading.value = false
    })
}, 500)

// 查询的回调
function resetSearch() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 24
  getList()
}
function getList(loading = true) {
  tableForm.page.loading = loading

  // 发送请求
  info({
    pageNo: tableForm.page.index,
    pageSize: tableForm.page.size,
    batchId: tableForm.id
  })
    .then(res => {
      if (res.code === 0) {
        let newList = res.data?.productPage?.records || []

        if (tableForm.isImgText) {
          newList = newList.map(item => {
            return {
              ...item,
              mount:
                typeof item.mount === 'string'
                  ? isNotEmpty(item.mount)
                    ? JSON.parse(item.mount)
                    : {}
                  : {},
              imageTextTitle: item.imageTextTitle ? JSON.parse(item.imageTextTitle) : {},
              materialUrl: item.materialUrl ? JSON.parse(item.materialUrl) : []
            }
          })
        }

        const successList =
          tableForm.page.index === 1 ? newList : tableForm.listData.concat(newList)

        // 如果当前记录中有editStatus=1 的情况就要轮询状态  editStatus 1：合成中  2：已完成 3:合成失败，null 表示没有进行过二次编辑
        const index = successList.findIndex(x => x.editStatus === 1)
        // 没有轮询定时器，并且有合成中视频时，开启一个轮询定时器
        if (!tableForm.timer && index > -1) {
          tableForm.timer = setInterval(() => {
            getList(false)
          }, 5000)
        } else {
          // 有轮询，轮询结束时清空定时器
          if (tableForm.timer && index === -1) {
            clearInterval(tableForm.timer)
            tableForm.timer = null
          } else if (tableForm.timer) {
            // 有需要轮询时，暂不赋值页面，等状态轮询有结果时才最后赋值
            tableForm.page.loading = false
            console.log('轮询中不需要赋值')
            return
          }
        }
        console.log('需要赋值')
        if (tableForm.page.index === 1) {
          tableForm.info = res.data
          tableForm.listData = successList
          tableForm.page.total = res.data?.productPage?.total || 0
          isOnlyImg.value = newList[0].creativeStruct === 1
          // 图文合成进入页面默认选中第一个
          if (tableForm.listData.length > 0) {
            chooseImgtext(tableForm.listData[0])
          }
        } else {
          tableForm.listData = successList
        }
      } else {
        if (tableForm.page.index === 1) {
          tableForm.listData = []
        }
      }
      tableForm.loading = false
    })
    .catch(() => {
      tableForm.loading = false
    })
}
const loadFun = throttle(function () {
  tableForm.loading = true
  tableForm.page.index++
  getList()
}, 1000)
const cLen = ref(7)
const listWidth = ref()
const oneWidth = ref(206)
function getWidth() {
  listWidth.value = getCWidth() - 32 - 30 - 7
  init()
}
function init() {
  cLen.value = parseInt((getCWidth() - 32 - 30 - 96) / 190)
  oneWidth.value = Math.floor(listWidth.value / cLen.value)
}
onMounted(() => {
  resetSearch()
  getWidth()
  window.onresize = () => {
    getWidth()
  }
})
onUnmounted(() => {
  window.onresize = null
  if (tableForm.timer) {
    clearInterval(tableForm.timer)
    tableForm.timer = null
  }
})

function product() {
  // const continueNum = (tableForm.info.productNum || 0) - (tableForm.info.finishNum || 0)
  // const useIntegral = (oneCouponNum.value || 10) * continueNum
  const contentText = `本次任务合成每分钟将消耗<span style="color: #364fcd">10</span>AI智能合成星力值，是否确认合成？<br /><span style="color: #8f939a">（扣减数额稍后查看“套餐使用记录”）</span>`
  ElMessageBox.confirm(contentText, '提示', {
    closeOnClickModal: false,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: '',
    customClass: 'xm_dialog_messageBox',
    dangerouslyUseHTMLString: true
  })
    .then(() => {
      proceedProduce({ batchId: tableForm.info.id }).then(res => {
        if (res.code === 0) {
          // message.success('操作成功')
          resetSearch()
        }
      })
    })
    .catch(() => {
      console.log('取消')
    })
}

const goBack = throttle(() => {
  router.go(-1)
}, 500)
</script>
<style lang="scss" scoped>
.detail_page {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 4px;
  position: relative;
  .page_top {
    padding: 20px 24px 20px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .top_left {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      .top_title {
        font-weight: 600;
        font-size: 16px;
        color: #303133;
        line-height: 22px;
        margin-right: 12px;
        max-width: 500px;
      }
      .top_stu {
        width: max-content;

        font-weight: 400;
        font-size: 12px;
        color: #364fcd;
        line-height: 18px;
        padding: 0 4px;
        border-radius: 3px;
        border: 1px solid rgba(54, 79, 205, 0.4);
        margin-right: 12px;
      }
      .orange_circle {
        color: #ed6a0c;
        border-color: #f1924e;
      }
      .time_warp {
        margin-right: 48px;
        font-weight: 400;
        font-size: 14px;
        color: #909399;
        line-height: 22px;
      }
      .top_num {
        margin-right: 48px;
        font-weight: 400;
        font-size: 14px;
        color: #909399;
        line-height: 22px;
      }
    }
  }
  .page_top_img {
    padding-top: 15px;
    padding-bottom: 15px;
  }
  .page_center {
    width: 100%;
    height: calc(100% - 136px);
    overflow-y: auto;
    padding-left: 24px;
    .loading_library {
      padding-bottom: 20px;
    }
    .all_video {
      .one_video_box {
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: 4px;

        // cursor: pointer;
        position: relative;
        .video_status {
          width: 100%;
          height: 100%;
        }
        .video_err_box {
          width: 100%;
          height: 100%;
          background-color: rgb(20, 21, 24);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          .wrapper {
            display: flex;
            flex-direction: column;
            > img {
              width: 56px;
              height: 56px;
              display: flex;
            }
            > p {
              font-size: 12px;
              color: rgba(255, 255, 255, 0.4);
              line-height: 18px;
              text-align: center;
            }
          }
        }
      }
      .video_cover {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: flex;
      }
      .select_warp {
        position: absolute;
        top: 0;
        left: 0;
        padding-top: 8px;
        :deep(.check_box) {
          margin-left: 8px;
        }
      }
      .video_title {
        width: 100%;
        position: absolute;
        left: 0;
        bottom: 0;
        padding: 12px;
        font-weight: 400;
        font-size: 14px;
        color: #ffffff;
        line-height: 20px;
      }
      .play_icon {
        opacity: 0;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateY(-50%) translateX(-50%);
        width: 46px;
        height: 46px;
        object-fit: contain;
        display: flex;
        cursor: pointer;
      }
    }
    .one_video:hover {
      .one_video_box {
        background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%);
      }

      .play_icon {
        opacity: 1;
      }
    }
  }
  // 图文合成的样式
  .page_center_img_text {
    width: 100%;
    height: calc(100% - 116px);
    background: #f7f8fa;
    display: flex;
    padding-top: 16px;
    .loading_library {
      padding-bottom: 16px;
    }
    // 左边列表
    .left_list {
      background: #fff;
      border-radius: 4px 4px 0 0;
      max-width: 352px;
      height: 100%;
      overflow-y: auto;
      padding: 16px 16px 0 16px;
      .all_imgtext {
        .num_tip {
          font-weight: 400;
          font-size: 12px;
          color: #909399;
          line-height: 18px;
          display: flex;
          align-items: flex-end;
          flex: 1;
        }
        .one_imgtext {
          max-width: 320px;
          max-height: 160px;
          border-radius: 4px;
          cursor: pointer;
          padding: 8px;
          display: flex;
          border: 2px solid #fff;
          &:hover {
            background: #f2f3f5;
          }
          .cover_img {
            width: 90px;
            min-width: 90px;
            height: 120px;
            border-radius: 4px;
            object-fit: cover;
          }
          .desc_box {
            margin-left: 12px;
            width: calc(100% - 102px);
            display: flex;
            flex-direction: column;
            .one_title {
              font-weight: 600;
              font-size: 16px;
              color: #323233;
              line-height: 22px;
            }
            .one_text {
              word-break: break-all;
              font-weight: 400;
              font-size: 14px;
              color: #606266;
              line-height: 20px;
              margin-top: 4px;
              max-height: 80px;
              text-overflow: ellipsis;
              overflow: hidden;
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 4;
            }
          }
        }
        .one_imgtext + .one_imgtext {
          margin-top: 8px;
        }
        .one_imgtext_active {
          border-color: #364fcd;
          background: #f2f3f5;
        }
      }
    }
    // 左边列表-仅图片
    .left_list_only_img {
      .all_imgtext {
        .one_imgtext {
          display: flex;
          flex-direction: column;
          max-height: max-content;
          .num_tip {
            margin-top: 8px;
          }
        }
      }
    }
    // 去除滚动条样式影响
    .left_list_scroll {
      padding-right: 9px;
    }
    // 右边详情
    .right_detail {
      background: #fff;
      border-radius: 4px 4px 0 0;
      flex: 1;
      height: 100%;
      margin-left: 16px;
      padding: 22px 32px 22px 24px;
      display: flex;
      overflow-y: auto;
      .swiper_warp {
        width: 360px;
        height: max-content;
        min-width: 360px;
        margin-bottom: 2px;
        :deep(.default_box) {
          border-radius: 4px !important;
          background: #f2f3f5;
          overflow: hidden !important;
        }
        :deep(.big_img) {
          border-radius: 0 !important;
          background: #f2f3f5;
        }
        :deep(.preview_small_parent) {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
        }
        :deep(.preview_small) {
          width: max-content;
        }
        :deep(.default_cover) {
          border-radius: 4px;
        }
        :deep(.default_box) {
          border-radius: 4px;
        }
        :deep(.big_img) {
          border-radius: 4px;
        }
      }
      .text_warp {
        flex: 1;
        height: 480px;
        padding-left: 32px;
        .text_title {
          font-weight: 600;
          font-size: 20px;
          color: #323233;
          line-height: 28px;
        }
        .text {
          font-weight: 400;
          font-size: 16px;
          color: #606266;
          line-height: 24px;
          margin-top: 12px;
        }
      }
    }
    .swiper_warp_center {
      display: flex;
      justify-content: center;
    }
    .no_echart {
      height: 100% !important;
    }
  }
  .page_bottom {
    border-radius: 0px 0px 4px 4px;
    box-shadow: 0px -2px 8px 0px rgba(103, 103, 103, 0.15);
    width: 100%;
    height: 64px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    position: absolute;
    left: 0;
    bottom: 0;
  }
}
.content_mount {
  span {
    margin-right: 4px;
    color: #364fcd;
  }
}
</style>
