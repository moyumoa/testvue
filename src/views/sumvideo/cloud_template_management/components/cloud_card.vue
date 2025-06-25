<template>
  <div>
    <div class="video_box_parent" v-loading="!props.industryLoading && tableForm.loading">
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
            :key="item.id"
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
              <!-- 放大的样式 -->
              <div
                :class="{
                  animation_box: true,
                  err_animation_box: !(item.videoStatus == 2 && item.status != 1)
                }"
                v-if="mouseId == item.id"
              >
                <!-- 视频区域 -->
                <div class="animation_video_box">
                  <!-- 视频 -->
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
                  <!-- 时长 -->
                  <div class="video_time" v-if="item.videoStatus == 2">
                    {{ conversionTime(item.duration || 0) }}
                  </div>
                  <!-- 图集模板标识 只有云模板才有 -->
                  <img
                    v-if="props.origin == 'cloud_template_management' && item.tag == 5"
                    class="video_imgList_icon"
                    src="https://tagvv-1256030678.file.myqcloud.com/20250107x6o7g.png"
                    alt=""
                  />
                  <!-- 顶部操作区 -->
                  <div class="video_operate_top" v-if="props.origin == 'cloud_template_management'">
                    <!-- 删除 -->
                    <!-- <el-tooltip effect="dark" content="移入回收站" placement="top"> -->
                    <div class="del_btn" @click.stop="showDelDialogFun(item, index)">
                      <img
                        src="https://tagvv-1256030678.file.myqcloud.com/20230303ajt5u.png"
                        alt=""
                      />
                    </div>
                    <!-- </el-tooltip> -->
                  </div>
                  <!-- 数字人表示    -->
                  <img
                    v-if="item.tag == 2"
                    class="video_digital_icon"
                    src="https://tagvv-1256030678.file.myqcloud.com/20230309l1jh0.png"
                    alt=""
                  />
                  <!-- 底部操作区
                  <div
                    class="video_operate_bottom"
                    @click.stop="showManagementFun(item, index)"
                    v-if="item.videoStatus == 2"
                  >
                    {{
                      props.origin == 'cloud_template_management'
                        ? '管理模板信息'
                        : '保存到我的企业模板'
                    }}
                  </div> -->
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
                  <!-- 底部操作区 只有合成成功-->
                  <div class="animation_video_btn" v-if="item.videoStatus == 2">
                    <!-- 云模板管理 : 管理模板 和 克隆模板 -->
                    <template v-if="props.origin == 'cloud_template_management'">
                      <el-button
                        type="primary"
                        class="one_video_btn half_btn"
                        @click.stop="showManagementFun(item, index)"
                      >
                        管理模板
                      </el-button>
                      <el-button
                        type="primary"
                        class="one_video_btn half_btn"
                        @click.stop="showCopyFun(item, index)"
                      >
                        克隆模板
                      </el-button>
                    </template>

                    <!-- 云模板 ：保存到我的企业模板 -->

                    <el-button
                      v-else
                      type="primary"
                      class="one_video_btn"
                      @click.stop="showManagementFun(item, index)"
                    >
                      保存到我的企业模板
                    </el-button>
                  </div>
                </div>
              </div>
              <!-- 原本的样式 -->
              <div v-else class="origin_box">
                <div
                  class="video_info_box"
                  v-loading="item.videoStatus === 1 || item.videoStatus === 0"
                  element-loading-text="正在合成中"
                  element-loading-background="rgba(255, 255, 255, 0)"
                >
                  <div class="video_cover_box">
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
                    <!-- 时长 -->
                    <div class="video_time" v-if="item.videoStatus == 2">
                      {{ conversionTime(item.duration || 0) }}
                    </div>
                    <!-- 数字人标识 -->
                    <img
                      v-if="item.tag == 2"
                      class="digital_icon"
                      src="https://tagvv-1256030678.file.myqcloud.com/20230309l1jh0.png"
                      alt=""
                    />
                    <!-- 图集模板标识 只有云模板才有 -->
                    <img
                      v-if="props.origin == 'cloud_template_management' && item.tag == 5"
                      class="imgList_icon"
                      src="https://tagvv-1256030678.file.myqcloud.com/20250107x6o7g.png"
                      alt=""
                    />
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
      <div v-else class="no_echart">
        <img src="@/assets/images/content_center/no_activity.png" alt />
        暂无数据
      </div>
    </div>
    <!-- 管理模板 -->
    <cloudTemplateDOM
      v-if="managementDialog.show"
      :managementDialog="managementDialog"
      @updateOneInfo="updateOneInfo"
    />
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
import copyTemplateDOM from '../../creative_mould/components/template/copyTemplate_dialog.vue'
import { deleteCreative } from '@/api/sumvideo/creative_mould.js'
// import { templateToProject } from '@/api/sumvideo/creative_templateSpectroscope.js'
import cloudTemplateDOM from './management_dialog.vue'
import { throttle, getCWidth, secToMin } from '@/utils/tools'
import { useRouter } from 'vue-router'

import { ElMessage, ElMessageBox } from 'element-plus'
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
  origin: {
    type: String,
    default: ''
  }, // 页面来源 cloud_template_management 云模板管理 cloud_tempalte 云模板
  industryLoading: {
    type: Boolean,
    default: false
  }, // 获取行业的Loading
  pageOnHide: {
    type: Boolean,
    default: false
  }
})
const { tableForm, pageOnHide } = toRefs(props)
const defaultCover = ref('https://tagvv-1256030678.file.myqcloud.com/202212066b4kq.png')

const delDialogVisible = ref(false)
// 删除创意
const showDelDialogFun = throttle(item => {
  delDialogVisible.value = true
  ElMessageBox.confirm('确认删除云模板，操作无法恢复', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
    customClass: 'drawer_systemBox'
  })
    .then(() => {
      deleteCreative({
        creativeId: item.id
      })
        .then(res => {
          if (res.code === 0) {
            emits('resetList')
            ElMessage({
              message: '删除成功',
              type: 'success'
            })
          }
          delDialogVisible.value = false
        })
        .catch(() => {
          delDialogVisible.value = false
        })
    })
    .catch(() => {
      delDialogVisible.value = false
    })
}, 500)

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
  // 如果打开管理云模板弹窗和删除的二次弹窗，就不清空id
  if (delDialogVisible.value || managementDialog.show || copyDialog.show) {
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
const emits = defineEmits(['updateOneInfo', 'resetList', 'loadSwiperFun'])
// 上拉加载
const loadFun = throttle(function () {
  emits('loadSwiperFun')
}, 1000)

// 去往详情页
const toDetail = throttle(item => {
  // 合成中不进行任何操作
  if (item.videoStatus === 1 || item.videoStatus === 0) {
    return
  }
  // 合成失败、未正式合成的模板进入剪辑页
  if (item.videoStatus === 3 || item.status === 1) {
    sendHrefMessage(
      `${location.origin}/sumvideo/editing_project_web/${item.templateId}/${item.id}?origin=${
        props.origin === 'cloud_template' ? 'template_space' : props.origin
      }`
    )
    return
  }
  // 合成成功的模板进入模板详情页
  router.push({
    path: `/sumwhy_video/${
      props.origin === 'cloud_template' ? 'template_space' : props.origin
    }/template_edit`,
    query: {
      origin: props.origin,
      id: item.id
    }
  })
}, 500)

// 每个卡片宽度自适应
const cLen = ref(7)
const listWidth = ref()
const oneWidth = ref(206)
function getWidth() {
  listWidth.value = getCWidth() - 32 - 30 - 7
  init()
}
getWidth()
function init() {
  cLen.value = parseInt((getCWidth() - 32 - 30 - 96) / 190)
  oneWidth.value = Math.floor(listWidth.value / cLen.value)
}
onMounted(() => {
  window.onresize = () => {
    getWidth()
  }
})
onUnmounted(() => {
  window.onresize = null
})
// 将毫秒转换成分秒
function conversionTime(time) {
  return secToMin((time || 0) / 1000 / 1000)
}
const managementDialog = reactive({
  show: false,
  id: null,
  index: null,
  origin: props.origin
})
// 管理模板信息 / 下载为企业模板
const showManagementFun = throttle((e, i) => {
  managementDialog.id = e.id
  managementDialog.index = i
  managementDialog.show = true
}, 500)
// 更新单条数据
function updateOneInfo(updateType) {
  emits('updateOneInfo', managementDialog.index, managementDialog.id, updateType)
}

// 克隆模板
const copyDialog = reactive({
  show: false
})
const showCopyFun = throttle(e => {
  copyDialog.origin = props.origin
  copyDialog.id = e.id
  copyDialog.show = true
}, 500)
function updateList() {
  mouseId.value = null
  emits('resetList')
}
onUnmounted(() => {
  ElMessageBox.close(false)
})
</script>
<style lang="scss" scoped></style>
