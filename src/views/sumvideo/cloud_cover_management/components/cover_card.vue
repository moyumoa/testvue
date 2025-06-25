<template>
  <div class="sumvideo_cover_parent" v-loading="tableForm.loading">
    <template v-if="tableForm.listData && tableForm.listData.length > 0">
      <div
        class="all_cover"
        :infinite-scroll-delay="1000"
        v-infinite-scroll="loadFun"
        :infinite-scroll-distance="50"
        :infinite-scroll-immediate="false"
        :infinite-scroll-disabled="tableForm.listData.length >= tableForm.page.total"
      >
        <div
          class="one_cover"
          v-for="(item, index) in tableForm.listData"
          :key="item.id"
          :style="{
            width: `${oneWidth}px`,
            height: `calc((${oneWidth}px - 16px) * 1.3333 + 32px + 16px)`
          }"
        >
          <div
            class="one_box"
            @mouseenter="enter($event, item)"
            @mouseleave="leave($event, item)"
            @click="toDetail(item)"
            :style="{
              cursor:
                props.origin === 'cloud_cover_management' ||
                (props.origin === 'cover_management' && item.coverType === 2)
                  ? 'point'
                  : 'default'
            }"
          >
            <!-- 放大的样式 -->
            <div
              class="animation_box"
              :style="{
                cursor:
                  props.origin === 'cloud_cover_management' ||
                  (props.origin === 'cover_management' && item.coverType === 2)
                    ? 'point'
                    : 'default'
              }"
              v-if="mouseId == item.id"
            >
              <!-- 封面区域 -->
              <div class="animation_top">
                <!-- 封面 -->
                <img class="animation_cover" :src="item.cover || defaultCover" alt="" />
                <div
                  class="animation_top_btn"
                  v-if="
                    props.origin == 'cloud_cover_management' ||
                    (props.origin == 'cover_management' && item.coverType == 2)
                  "
                >
                  <!-- 删除按钮 -->

                  <div class="del_btn" @click.stop="showDelDialogFun(item, index)">
                    <img
                      class="del_icon"
                      src="https://tagvv-1256030678.file.myqcloud.com/20230303ajt5u.png"
                      alt=""
                    />
                  </div>
                </div>
                <!-- 管理按钮 云封面管理显示-->
                <div
                  @click.stop="showManagementFun(item, index)"
                  class="animation_bottom_btn"
                  v-if="props.origin == 'cloud_cover_management'"
                >
                  管理封面信息
                </div>
                <!-- 云封面的ICON 只有企业封面并且是云封面才显示 -->
                <img
                  v-if="props.origin == 'cover_management' && item.coverType == 1"
                  class="animation_tag"
                  src="https://tagvv-1256030678.file.myqcloud.com/202310194z5rq.png"
                  alt=""
                />
              </div>
              <!-- 封面标题 -->
              <div class="animation_bottom">
                <div class="animation_title line-hidden1">{{ item.name || '' }}</div>
              </div>
            </div>
            <!-- 原本的样式 -->
            <div v-else class="origin_box">
              <!-- 封面 -->
              <img class="origin_cover" :src="item.cover || defaultCover" alt="" />
              <!-- 云封面的ICON 只有企业封面并且是云封面才显示 -->
              <img
                v-if="props.origin == 'cover_management' && item.coverType == 1"
                class="origin_tag"
                src="https://tagvv-1256030678.file.myqcloud.com/202310194z5rq.png"
                alt=""
              />
              <div class="origin_title line-hidden1">{{ item.name || '' }}</div>
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
    <!-- 管理封面信息的弹窗 -->
    <managementDOM
      v-if="managementDialog.show"
      :managementDialog="managementDialog"
      @updateOneInfo="updateOneInfo"
    />
  </div>
</template>
<script setup>
import managementDOM from './management_dialog.vue'
import { deleteCover } from '@/api/sumvideo/cloud_cover_management.js'
import { throttle, getCWidth } from '@/utils/tools'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
const defaultCover = ref('https://tagvv-1256030678.file.myqcloud.com/202212066b4kq.png')
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
          size: 32,
          total: 0
        }
      }
    }
  },
  origin: {
    type: String,
    default: ''
  } // 页面来源 cloud_cover_management 云封面管理 cover_management 企业封面
})
const { tableForm } = toRefs(props)

const emits = defineEmits(['updateOneInfo', 'resetList', 'loadSwiperFun'])
// 上拉加载
const loadFun = throttle(function () {
  emits('loadSwiperFun')
}, 1000)
const delDialogVisible = ref(false)
// 删除创意
const showDelDialogFun = throttle(item => {
  delDialogVisible.value = true
  ElMessageBox.confirm('删除封面后无法找回，请谨慎操作', '删除封面', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
    customClass: 'drawer_systemBox'
  })
    .then(() => {
      deleteCover({
        id: item.id
      })
        .then(res => {
          if (res.code === 0) {
            mouseId.value = null
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

const managementDialog = reactive({
  show: false,
  id: null,
  index: null,
  origin: props.origin
})
//  管理模板信息
const showManagementFun = throttle((e, i) => {
  managementDialog.id = e.id
  managementDialog.index = i
  managementDialog.show = true
}, 500)

// 更新单条数据
function updateOneInfo() {
  emits('updateOneInfo', managementDialog.index, managementDialog.id)
}

const toDetail = throttle(item => {
  if (
    props.origin === 'cloud_cover_management' ||
    (props.origin === 'cover_management' && item.coverType === 2)
  ) {
    // 合成成功的模板进入模板详情页
    router.push({
      path: `/sumwhy_video/${props.origin}/detail`,
      query: {
        origin: props.origin,
        id: item.id
      }
    })
  }
})
// 放大的效果
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
  // 如果打开删除的二次弹窗，就不清空id
  if (delDialogVisible.value || managementDialog.show) {
    console.log('显示')
  } else {
    mouseId.value = null
  }
  window.clearTimeout(mouseTimer.value)
  mouseTimer.value = null
}
// 页面销毁时清空ID和放大的定时器
onBeforeMount(() => {
  mouseId.value = null
  window.clearTimeout(mouseTimer.value)
  mouseTimer.value = null
})

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
</script>
<style lang="scss" scoped>
@import '../scss/cover_page.scss';
</style>
