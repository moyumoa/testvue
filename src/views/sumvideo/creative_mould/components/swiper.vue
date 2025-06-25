<template>
  <div>
    <div class="video_box" v-loading="tableForm.loading">
      <template v-if="tableForm.listData && tableForm.listData.length > 0">
        <div
          class="all_video"
          :infinite-scroll-delay="1000"
          v-infinite-scroll="loadFun"
          :infinite-scroll-distance="50"
          :infinite-scroll-immediate="false"
          :infinite-scroll-disabled="
            pageOnHide || tableForm.listData.length >= tableForm.page.total
          "
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
            <div
              class="one_box"
              @mouseenter="enter($event, item)"
              @mouseleave="leave($event, item)"
              @click="toDetail(item)"
            >
              <div
                :class="{
                  animation_box: true,
                  err_animation_box: !(item.videoStatus == 2 && item.status != 1)
                }"
                v-if="mouseId == item.id"
              >
                <!-- 视频区域 -->
                <div class="animation_video_box">
                  <!-- 视频 合成成功-->
                  <video
                    v-if="item.videoStatus == 2 && item.status != 1"
                    :src="item.videoUrl"
                    :poster="item.coverUrl"
                    playsinline
                    autoplay
                    loop
                    muted
                  ></video>
                  <!-- 除了成功以外，需要显示占位效果 -->
                  <template v-else>
                    <div
                      class="video_default"
                      :style="{
                        height: `calc((${oneWidth}px - 16px) * 1.721 + 20px + 39px )`,
                        cursor: `${
                          item.videoStatus === 1 || item.videoStatus === 0 ? 'default' : ''
                        }`
                      }"
                      v-loading="item.videoStatus === 1 || item.videoStatus === 0"
                      element-loading-text="正在合成中"
                      element-loading-background="rgba(255, 255, 255, 0)"
                    >
                      <!-- 合成失败 -->
                      <div class="video_err video_err2" v-if="item.videoStatus === 3">
                        <div class="wrapper">
                          <img
                            src="https://tagvv-1256030678.file.myqcloud.com/20250113fovzk.png"
                            alt=""
                          />
                          <p>合成失败</p>
                        </div>
                      </div>
                      <!-- 草稿 -->
                      <div class="video_err" v-if="item.status === 1">
                        <div class="wrapper">
                          <img
                            src="https://tagvv-1256030678.file.myqcloud.com/20250110j4e2f.png"
                            alt=""
                          />
                          <p class="marginTop8">模板草稿</p>
                        </div>
                      </div>
                    </div>
                  </template>
                  <!-- 是否为开放模板 -->
                  <div
                    class="video_public"
                    v-if="
                      item.isOpenTemplate &&
                      item.videoStatus == 2 &&
                      item.status != 1 &&
                      pageSource != 'createByTemplate'
                    "
                  >
                    已开放给成员
                  </div>
                  <!-- 时长 -->
                  <div
                    class="video_time"
                    v-if="item.videoStatus == 2 && pageSource === 'createByTemplate'"
                  >
                    {{ conversionTime(item.duration || 0) }}
                  </div>
                  <!-- 顶部操作区 -->
                  <div class="video_operate_top" v-if="pageSource != 'createByTemplate'">
                    <!-- 编辑分类 -->
                    <el-tooltip
                      effect="dark"
                      content="编辑分类"
                      placement="top"
                      v-if="item.videoStatus == 2 && item.status != 1"
                    >
                      <div class="del_btn" @click.stop="showCategoryDialogFun(item, index)">
                        <img
                          src="https://tagvv-1256030678.file.myqcloud.com/20230307m325c.png"
                          alt=""
                        />
                      </div>
                    </el-tooltip>

                    <!-- 删除 -->
                    <el-tooltip effect="dark" content="移入回收站" placement="top">
                      <div class="del_btn" @click.stop="showDelDialogFun(item, index)">
                        <img
                          src="https://tagvv-1256030678.file.myqcloud.com/20230303ajt5u.png"
                          alt=""
                        />
                      </div>
                    </el-tooltip>
                  </div>
                  <!-- 数字人表示    -->
                  <img
                    v-if="item.tag == 2"
                    class="video_digital_icon"
                    src="https://tagvv-1256030678.file.myqcloud.com/20230309l1jh0.png"
                    alt=""
                  />
                  <!-- 单选框 -->
                  <div class="xm_radio_box" v-if="pageSource === 'createByTemplate'">
                    <div class="radio_choose" v-if="chooseInfo.id === item.id"></div>
                    <div class="radio_unChooose" v-else></div>
                  </div>
                </div>
                <div class="video_bottom">
                  <!-- 视频标题 -->
                  <div class="animation_video_title line-hidden1">{{ item.name || '-' }}</div>
                  <!-- 视频模板数据 -->
                  <div class="animation_video_num" v-if="item.videoStatus == 2">
                    <div class="one_num num_video">
                      视频：
                      <span>{{ item.videoClipCnt || 0 }}</span>
                    </div>
                    <div class="one_num num_img">
                      图片：
                      <span>{{ item.photoClipCnt || 0 }}</span>
                    </div>
                    <div class="one_num num_audio">
                      音频：
                      <span>{{ item.audioClipCnt || 0 }}</span>
                    </div>
                  </div>
                  <!-- 底部操作区 只有合成成功 -->
                  <div
                    class="animation_video_btn"
                    v-if="
                      item.videoStatus == 2 && item.status != 1 && pageSource != 'createByTemplate'
                    "
                  >
                    <div class="one_video_btn half_btn status_btn" @click.stop="">
                      <div class="text_warp">
                        开放状态
                        <el-tooltip
                          class="item"
                          effect="dark"
                          content=""
                          placement="top"
                          v-if="systemVersion == 3"
                        >
                          <template #content>
                            <div style="max-width: 300px">
                              开启开关后，模板及模板批量合成的视频将在小程序首页“发视频”模块内开放给员工直接跟拍发布或转发视频到平台，可在模板详情页开启
                            </div>
                          </template>
                          <img
                            src="@/assets/images/content_center/tip_line.png"
                            style="width: 14px; height: 14px; margin: -2px 0 0 4px"
                            alt
                          />
                        </el-tooltip>
                        ：
                      </div>
                      <el-switch
                        :width="45"
                        class="public_switch"
                        v-model="item.isOpenTemplate"
                        @change="openTemplateChange($event, index)"
                        :before-change="beoreOpenChange.bind(this, item)"
                        inline-prompt
                        :active-value="1"
                        :inactive-value="0"
                      ></el-switch>
                    </div>
                    <el-button
                      type="primary"
                      class="one_video_btn half_btn"
                      @click.stop="showCopyFun(item, index)"
                    >
                      克隆模板
                    </el-button>
                  </div>
                </div>
              </div>

              <div v-else class="origin_box">
                <div
                  class="video_info_box"
                  v-loading="item.videoStatus === 1 || item.videoStatus === 0"
                  element-loading-text="正在合成中"
                  element-loading-background="rgba(255, 255, 255, 0)"
                >
                  <div class="video_cover_box">
                    <!-- 素材拆解的合成中显示cover -->
                    <template v-if="item.videoStatus == 1 && item.coverUrl">
                      <img class="video_cover" :src="item.coverUrl" alt />
                    </template>
                    <!-- 合成成功 -->
                    <template v-if="item.videoStatus == 2 && item.status != 1">
                      <img class="video_cover" :src="item.coverUrl || defaultCover" alt />
                    </template>
                    <!-- 合成失败 -->
                    <template v-if="item.videoStatus === 3">
                      <div class="mask mask2">
                        <div class="wrapper">
                          <img
                            src="https://tagvv-1256030678.file.myqcloud.com/20250113fovzk.png"
                            alt=""
                          />
                          <p>合成失败</p>
                        </div>
                      </div>
                    </template>
                    <!-- 草稿 -->
                    <template v-if="item.status === 1">
                      <div class="mask">
                        <div class="wrapper">
                          <img
                            src="https://tagvv-1256030678.file.myqcloud.com/20250110j4e2f.png"
                            alt=""
                          />
                          <p class="marginTop8">模板草稿</p>
                        </div>
                      </div>
                    </template>
                    <!-- 数字人标识 -->
                    <img
                      v-if="item.tag == 2"
                      class="digital_icon"
                      src="https://tagvv-1256030678.file.myqcloud.com/20230309l1jh0.png"
                      alt=""
                    />
                    <!-- 时长 -->
                    <div
                      class="video_time"
                      v-if="item.videoStatus == 2 && pageSource === 'createByTemplate'"
                    >
                      {{ conversionTime(item.duration || 0) }}
                    </div>
                    <!-- 单选框 -->
                    <div class="xm_radio_box" v-if="pageSource === 'createByTemplate'">
                      <div class="radio_choose" v-if="chooseInfo.id === item.id"></div>
                      <div class="radio_unChooose" v-else></div>
                    </div>
                  </div>
                </div>
                <div class="title_box line-hidden1">
                  {{ item.name || '-' }}
                </div>
              </div>
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
    <el-dialog
      destroy-on-close
      title="移入回收站"
      width="444px"
      @close="delDialogVisible = false"
      v-model="delDialogVisible"
      custom-class="rule_setting_dialog hide_footer_line"
    >
      <div style="padding: 16px 16px 12px">创意已绑定流水线，无法删除</div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="delDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="delDialogVisible = false">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <bindCategoryDOM
      v-if="bindCategoryDialog.show"
      :bindDialog="bindCategoryDialog"
      @updateCategory="updateCategory"
    />
    <!-- 预览视频弹窗   -->
    <PreviewVideo :videoDialog="videoDialog"></PreviewVideo>
    <!-- 克隆模板的弹窗 -->
    <copyTemplateDOM
      v-if="copyDialog.show"
      :copyDialog="copyDialog"
      @updateList="updateList"
    ></copyTemplateDOM>
  </div>
</template>
<script setup>
import { sendHrefMessage } from '@/utils/OEA.js'
// 创意模板图片列表
import copyTemplateDOM from './template/copyTemplate_dialog.vue'
import { getQuery } from '@/utils/get_query.js'
import bindCategoryDOM from './bindCategory_dialog.vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteCreative, updateOpenTemplate } from '@/api/sumvideo/creative_mould.js'
import { throttle, getCWidth, secToMin, isNotEmpty } from '@/utils/tools'
import PreviewVideo from '@/components/preview_video/preview_video.vue'
import { useStore } from 'vuex'
const router = useRouter()

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
  pageOnHide: {
    type: Boolean,
    default: false
  },
  pageSource: {
    type: String,
    default: ''
  }, // 页面来源 createByTemplate 模板式生成过来的 显示单选框和样式修改
  chooseTemplateInfo: {
    type: Object,
    default: () => {
      return {}
    }
  } // 选中的模板信息 目前只有模板式生成过来才有
})
const { tableForm, searchComponents, pageOnHide, pageSource } = toRefs(props)
const defaultCover = ref('https://tagvv-1256030678.file.myqcloud.com/202212066b4kq.png')

const emits = defineEmits(['success', 'resetList', 'updateCategory', 'chooseTemplateFun'])
const store = useStore()
const systemVersion = computed(() => store.state.user.systemVersion)

const loadFun = throttle(function () {
  console.log('滚动到底了')
  emits('loadSwiperFun')
}, 1000)

const cLen = ref(7)
const listWidth = ref()
const oneWidth = ref(206)
function getWidth() {
  listWidth.value =
    pageSource.value === 'createByTemplate' ? getCWidth() - 32 - 24 - 7 : getCWidth() - 32 - 30 - 7
  init()
}
getWidth()
function init() {
  cLen.value =
    pageSource.value === 'createByTemplate'
      ? parseInt((getCWidth() - 32 - 24 - 112) / 190)
      : parseInt((getCWidth() - 32 - 30 - 96) / 190)
  oneWidth.value = Math.floor(listWidth.value / cLen.value)
}
const initOver = ref(false)
onMounted(() => {
  if (isNotEmpty(props.chooseTemplateInfo)) {
    chooseInfo.value = JSON.parse(JSON.stringify(props.chooseTemplateInfo))
    nextTick(() => {
      initOver.value = true
    })
  } else {
    initOver.value = true
  }
  window.onresize = () => {
    getWidth()
  }
})
onUnmounted(() => {
  ElMessageBox.close(false)
  window.onresize = null
})
const delDialogVisible = ref(false)
// 删除创意
const showDelDialogFun = throttle(item => {
  if (item.hasPipeline) {
    delDialogVisible.value = true
    return
  }
  const data = {
    creativeId: item.id
  }
  deleteCreative(data).then(res => {
    if (res.code === 0) {
      emits('resetList')

      ElMessage({
        message: '移入成功',
        type: 'success'
      })
    }
  })
}, 500)
const chooseInfo = ref({}) // 选中的模板信息
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
// 编辑
const toDetail = throttle(item => {
  // 如果是模板式生成过来的 就是选中当前模板 而不是进来详情页
  if (pageSource.value === 'createByTemplate') {
    chooseInfo.value = item

    return
  }
  // 合成中不进行任何操作
  if (item.videoStatus === 1 || item.videoStatus === 0) {
    return
  }
  // 合成失败、未正式合成的模板进入剪辑页
  if (item.videoStatus === 3 || item.status === 1) {
    const url = `${location.origin}/sumvideo/editing_project_web/${item.templateId}/${item.id}?origin=template_space`
    sendHrefMessage(url)
    return
  }
  // 合成成功的模板进入模板详情页
  router.push({
    path: '/sumwhy_video/template_space/template_edit',
    query: {
      id: item.id,
      origin: 'creative_mould'
    }
  })
}, 500)
// 编辑分类
const bindCategoryDialog = reactive({
  show: false,
  id: null,
  categoryIdList: []
})
const showCategoryDialogFun = throttle((item, index) => {
  bindCategoryDialog.id = item.id
  bindCategoryDialog.categoryIdList = item.categoryIdList || []
  bindCategoryDialog.index = index
  bindCategoryDialog.show = true
})
// 编辑分类成功后，修改选中的数据
function updateCategory(e) {
  emits('updateCategory', {
    categoryIdList: e,
    index: bindCategoryDialog.index
  })
}

// 预览视频
const videoDialog = reactive({
  show: false,
  url: ''
})
// const openDetail = throttle(e => {
//   videoDialog.show = true
//   videoDialog.url = e.videoUrl
// }, 500)

// 公开模板相关--
const publickClickId = ref(null) // 要设置公开/非公开模板的ID
// 开关开启/关闭之前
function beoreOpenChange(item) {
  publickClickId.value = item.id
  console.log('item', item)
  return new Promise(resolve => {
    ElMessageBox.confirm(`确认${item.isOpenTemplate ? '取消设置' : '设置'}为开放模板吗？`, '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'drawer_systemBox'
    })
      .then(() => {
        updateOpenTemplate({
          creativeId: item.id,
          isOpenTemplate: item.isOpenTemplate === 1 ? 0 : 1
        })
          .then(res => {
            if (res.code === 0) {
              ElMessage({
                message: '设置成功',
                type: 'success'
              })
              publickClickId.value = null
              // 调接口，成功后返回true 否则false
              resolve(true)
            } else {
              resolve(false)
            }
          })
          .catch(() => {
            resolve(false)
          })
      })
      .catch(() => {
        publickClickId.value = null
        resolve(false)
      })
  })
}
function openTemplateChange(e, i) {
  console.log('xx', e, i)
  const data = getQuery(searchComponents.value)
  if (data.isOpenTemplate !== null) {
    publickClickId.value = null
    mouseId.value = null
    emits('resetList')
  }
}

const mouseTimer = ref(null) // 鼠标悬停的定时器
const mouseId = ref(null) // 鼠标悬停放大显示的ID
// 鼠标移入
function enter(e, x) {
  if (!mouseTimer.value) {
    mouseTimer.value = window.setTimeout(() => {
      mouseTimer.value = null
      mouseId.value = x.id
    }, 200) // 停顿一秒
  }
}
// 鼠标挪走
function leave(e) {
  // 如果打开分类弹窗和删除的二次弹窗，就不清空id
  if (
    bindCategoryDialog.show ||
    delDialogVisible.value ||
    publickClickId.value ||
    copyDialog.show
  ) {
    console.log('显示')
  } else {
    mouseId.value = null
  }
  window.clearTimeout(mouseTimer.value)
  mouseTimer.value = null
}
// 页面销毁时清空ID和放大的定时器
onBeforeMount(() => {
  desotryMouse()
})
function desotryMouse() {
  mouseId.value = null
  window.clearTimeout(mouseTimer.value)
  mouseTimer.value = null
}
defineExpose({
  desotryMouse
})

// 克隆模板
const copyDialog = reactive({
  show: false
})
const showCopyFun = throttle(e => {
  if (!e.templateId) {
    ElMessage({
      message: '抱歉，模板工程数据缺失，无法完成操作！',
      type: 'warning'
    })
    return
  }
  copyDialog.origin = 'creative_mould'
  copyDialog.id = e.id
  copyDialog.show = true
}, 500)
function updateList() {
  mouseId.value = null
  emits('resetList')
}

// 将毫秒转换成分秒
function conversionTime(time) {
  return secToMin((time || 0) / 1000 / 1000)
}
</script>
<style lang="scss" scoped>
.video_box {
  margin-top: 16px;
  width: 100%;
  background: #ffffff;
  border-radius: 4px;
}
.xm_radio_box {
  z-index: 5;
  position: absolute;
  right: 12px;
  bottom: 12px;
}
</style>
