<template>
  <div>
    <el-dialog
      ref="dialog"
      :close-on-click-modal="false"
      destroy-on-close
      v-model="show"
      title="关联灵感"
      width="960px"
      custom-class="rule_setting_dialog show_header_line hide_footer_line"
      append-to-body
      :before-close="handleClose"
    >
      <template #title>
        <div class="title_box">
          <div class="title1">关联灵感</div>
          <div class="title2">
            共
            <span>{{ tableForm.page.total || 0 }}</span>
            个
          </div>
        </div>
      </template>
      <div class="dialog_container" v-loading="tableForm.loading">
        <div class="table_box">
          <!-- <div
        class="list_warp"
        ref="listWarpRef"
        :infinite-scroll-delay="1000"
        v-infinite-scroll="loadFun"
        :infinite-scroll-distance="50"
        :infinite-scroll-immediate="false"
        :infinite-scroll-disabled="tableForm.listData.length >= tableForm.page.total"
      > -->
          <template v-if="tableForm.listData.length > 0">
            <div class="content_box" v-click-outside="onClickOutside" @click="showDelId = null">
              <div
                :class="{
                  one_content: true,
                  one_content_show: showDelId == item.id || mouseId == item.id
                }"
                v-for="(item, index) in tableForm.listData"
                :key="item.id"
                @click.stop="previewFun(item, index)"
              >
                <img class="content_cover" :src="item.videoCoverUrl" alt="" />

                <!-- 不推荐次数 -->
                <el-tooltip
                  v-if="item.notRecommended"
                  popper-class="tooltip-class"
                  placement="top"
                  :style="{ 'margin-left': '4px' }"
                >
                  <template #content>
                    <p style="max-width: 254px">
                      该灵感{{ item.mediaType == 2 ? '图文' : '视频' }}已被c端用户标记{{
                        item.notRecommended || 0
                      }}次减少推荐。被标记达到10次，将立即下架删除。
                    </p>
                  </template>
                  <img
                    style="width: 24px; height: 24px"
                    class="content_tip"
                    src="https://tagvv-1256030678.file.myqcloud.com/20230612s4nh3.png"
                    alt=""
                  />
                </el-tooltip>
                <!-- 播放按钮 只有视频才需要 -->
                <img
                  v-if="item.mediaType === 4"
                  class="content_play"
                  src="https://tagvv-1256030678.file.myqcloud.com/20230612x1o1g.png"
                  alt=""
                />
                <!-- 删除 -->
                <div class="content_del" @click.stop="showDelId = item.id">
                  <el-popconfirm placement="top" title="确定删除该灵感？" @confirm="delFun(item)">
                    <template #reference>
                      <div class="content_delIcon"></div>
                    </template>
                  </el-popconfirm>
                </div>
              </div>
            </div>
            <!-- <div class="xm_pullUpToLoadMore">
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
              ? tableForm.listData.length > 5
                ? '已经到底了~'
                : ''
              : '上拉加载更多~'
          }}
        </div> -->
          </template>

          <div class="xm_noneData" v-if="tableForm.listData.length === 0 && !tableForm.loading">
            <img src="@/assets/images/content_center/no_activity.png" alt />
            暂无关联灵感
          </div>
        </div>
        <!-- </div> -->
        <div class="xm_table_page">
          <el-pagination
            v-model:current-page="tableForm.page.index"
            background
            layout=" sizes, prev, pager, next , jumper"
            :total="tableForm.page.total"
            :page-size="tableForm.page.size"
            :page-sizes="[12, 24, 55, 120]"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
          ></el-pagination>
        </div>
      </div>
    </el-dialog>
    <!-- 视频预览的弹窗 -->
    <previewVideo v-if="videoDialog.show" :videoDialog="videoDialog" />
    <!-- 图文预览的弹窗 -->
    <previewImg v-if="imgDialog.show" :imgDialog="imgDialog" />
  </div>
</template>
<script setup>
import previewImg from '@/components/preview_inspirtaion_imgText/index.vue'
import previewVideo from '@/components/preview_inspirtaion_video/index.vue'
import { ClickOutside as vClickOutside } from 'element-plus'

import { throttle } from '@/utils/tools.js'
import { inspirationVideoPage, saveInspirationVideo } from '@/api/content_center/video_library.js'
const props = defineProps({
  associationDialog: {
    type: Object,
    default: () => {
      return {
        show: true, // 是否显示弹窗
        ids: []
      }
    }
  }
})

const { show, ids } = toRefs(props.associationDialog)
// 列表查询 begin--

const tableForm = reactive({
  loading: true,
  listData: [],
  page: {
    index: 1,
    size: 12,
    total: 0
  }
})
function resetList() {
  tableForm.loading = true
  tableForm.page.index = 1
  tableForm.page.size = 12
  getList()
}
function getList() {
  tableForm.loading = true
  inspirationVideoPage({
    pageNo: tableForm.page.index,
    pageSize: tableForm.page.size,
    subscribeIds: ids.value,
    orderSetting: 'DESC:gmt_update'
  })
    .then(res => {
      if (res.code === 0) {
        // if (tableForm.page.index === 1) {
        tableForm.listData = res.data.records || []
        tableForm.page.total = res.data.total || 0
        // } else {
        //   const newListData = res.data.records || []
        //   tableForm.listData = tableForm.listData.concat(newListData)
        // }
      } else {
        // if (tableForm.page.index === 1) {
        tableForm.listData = []
        tableForm.page.total = 0
        // }
      }
      tableForm.loading = false
    })
    .catch(() => {
      tableForm.loading = false
    })
}
// const loadFun = throttle(function () {
//   tableForm.loading = true
//   tableForm.page.index++
//   getList()
// }, 100)
const handleCurrentChange = val => {
  document.querySelector('.table_box').scrollTo(0, 0)
  tableForm.page.index = val
  getList()
}
// 分页相关：监听单页显示数量切换事件
const handleSizeChange = val => {
  tableForm.page.index = 1
  tableForm.page.size = val
  getList()
}
// 列表查询 end--

// 灵感预览 begin--
const videoDialog = ref({
  show: false,
  url: ''
})
const imgDialog = ref({
  show: false,
  info: null
})
const previewFun = throttle((item, index) => {
  showDelId.value = null
  if (item.mediaType === 4) {
    if (!item.videoPlayUrl) {
      message.warning('暂未找到视频播放地址')
      return
    }
    videoDialog.value = {
      show: true,
      url: item.videoPlayUrl
    }
  } else {
    imgDialog.value = {
      show: true,
      info: item
    }
  }
}, 700)
// 灵感预览 end--

// 删除灵感 begin--

const message = inject('$message')
const isUpdate = ref(false) // 如果删除了灵感，关闭弹窗时需要更新列表
const showDelId = ref('') // 要删除的灵感ID
function delFun(item) {
  saveInspirationVideo({
    brandId: item.brandId,
    id: item.id,
    isDel: 1
  }).then(res => {
    if (res.code === 0) {
      isUpdate.value = true
      message.success('删除成功')
      resetList()
    }
  })
}
// 删除灵感 end--
// const mouseTimer = ref(null) // 鼠标悬停的定时器
const mouseId = ref(null) // 鼠标悬停放大显示的ID

// function handleClickOutside() {
//   console.log('页面的点击')
//   mouseId.value = null
//   showDelId.value = null
// }
const onClickOutside = e => {
  console.log('onClickOutside', e)
  showDelId.value = null
}

onMounted(() => {
  resetList()
  // window.addEventListener('click', handleClickOutside)
})
const emits = defineEmits('updateFun')
function handleClose(done) {
  if (isUpdate.value) {
    emits('updateFun')
  }
  done()
}
</script>
<style lang="scss" scoped>
.dialog_container {
  width: 100%;

  padding: 16px 0 16px 16px;
}
.table_box {
  width: 100%;
  max-height: 65vh;
  overflow-y: auto;
}
.content_box {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
}
.one_content {
  cursor: pointer;
  width: 144px;
  height: 192px;
  background: #d8d8d8;
  border-radius: 2px;
  position: relative;
  margin: 0 12px 12px 0;

  .content_cover {
    width: 144px;
    height: 192px;
    background: #d8d8d8;
    border-radius: 2px;
    object-fit: cover;
    display: flex;
  }

  .content_play {
    // opacity: 0;
    width: 48px;
    height: 48px;
    object-fit: contain;
    display: flex;
    cursor: pointer;
    position: absolute;
    left: 48px;
    top: 72px;
  }

  .content_del {
    opacity: 0;
    position: absolute;
    right: 12px;
    top: 12px;
    width: 24px;
    height: 24px;
  }

  .content_delIcon {
    opacity: 0;

    width: 24px;
    height: 24px;
    object-fit: contain;

    cursor: pointer;
    background: url('https://tagvv-1256030678.file.myqcloud.com/20230612874qx.png') no-repeat;
    background-size: contain;
  }

  .content_tip {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0) 25%, rgba(255, 125, 0, 0.27) 100%);
    border-radius: 2px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-end;
    padding: 12px;

    .content_tipIcon {
      width: 24px;
      height: 24px;
      object-fit: contain;
      display: flex;
    }
  }

  &:hover {
    .content_delIcon,
    .content_del {
      opacity: 1;
    }
  }
}
.one_content_show {
  .content_delIcon,
  .content_del {
    opacity: 1;
  }
}
.xm_table_page {
  padding-right: 16px;
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
.title_box {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  .title2 {
    display: flex;
    margin-left: 16px;
    font-size: 14px;
    font-weight: 400;
    color: #999999;
    span {
      color: #364fcd;
      font-weight: 600;
      margin: 0 2px;
    }
  }
}
</style>
