<template>
  <div class="page_page_scroll" v-loading="!props.changeFileLoading && tableForm.page.loading">
    <div class="page_scroll">
      <div
        class="card"
        v-if="videoData.records && videoData.records.length"
        @getTableData="getList"
        ref="myCard"
      >
        <div
          v-for="(item, index) in videoData.records"
          :key="item.id"
          class="card_list"
          :style="{
            width: `${oneWidth}px`,
            height: `calc(${oneWidth}px * 1.43)`
          }"
        >
          <div
            :class="{ card_item: true, card_item_mouse: mouseId == item.id }"
            @mouseenter="mouseId = item.id"
            @mouseleave="mouseId = null"
          >
            <img class="videoImg" :src="item.thumbCoverUrl || item.coverUrl || item.url" alt="" />
            <div
              class="batch_warp"
              v-if="props.batchInfo.showBatch"
              @click.stop="clickBatch(item, $event)"
            >
              <div :class="{ 'select-state': true, 'selected-state': item.itemChose }">
                <div :class="{ 'state-chose': item.itemChose }"></div>
              </div>
            </div>
            <div
              v-else
              class="card_item_top"
              :style="{ backgroundSize: '100% 100%', background: '#303133' }"
              @click="playVideo(item)"
            >
              <div class="digital_icon_left" v-if="item.templateTag == 2"></div>

              <div class="content">
                <!-- 图文任务要把标题的宽度减少 -->
                <div class="content_title" style="padding-right: 60px">
                  {{ item.name }}
                </div>
                <div class="content_data">
                  <div class="one_box">
                    <img
                      class="icon_img"
                      src="@/assets/images/content_center/content_repository/memory_icon.png"
                      alt=""
                    />
                    <span class="num">{{ changeKB(item.size || 0) }}</span>
                  </div>
                  <div class="one_box">
                    <img
                      class="icon_img"
                      src="@/assets/images/content_center/content_repository/times_icon.png"
                      alt=""
                    />
                    <span class="num">{{ item.useTimes || 0 }}次</span>
                  </div>
                  <div class="one_box" v-if="item.type == 1">
                    <img
                      class="icon_img"
                      src="@/assets/images/content_center/content_repository/time_icon.png"
                      alt=""
                    />
                    <span class="num">
                      {{
                        item.duration ? secondToDate(item.duration / 1000, '秒', true, true) : '--'
                      }}
                    </span>
                  </div>
                </div>

                <div class="operation_box">
                  <!-- 开放状态 -->
                  <div
                    class="operation_status"
                    v-if="item.type != 99 && systemVersion == 3"
                    @click.stop=""
                  >
                    <div :class="{ text_warp: true }">
                      开放状态
                      <el-tooltip class="item" effect="dark" content="" placement="top">
                        <template #content>
                          <div style="max-width: 300px">
                            开启开关后，素材将在小程序【素材宝典】模块内开放给员工下载
                          </div>
                        </template>
                        <img
                          src="https://tagvv-1256030678.file.myqcloud.com/20240514pzcus.png"
                          style="width: 14px; height: 14px; margin: 2px"
                          alt
                        />
                      </el-tooltip>
                    </div>
                    <el-switch
                      :width="45"
                      class="public_switch"
                      v-model="item.isOpen"
                      @change="openTemplateChange($event, index)"
                      :before-change="beoreOpenChange.bind(this, item)"
                      inline-prompt
                      :active-value="1"
                      :inactive-value="0"
                    ></el-switch>
                  </div>
                  <!-- 所属文件夹 -->
                  <fileTag
                    v-if="item.folderList && item.folderList.length > 0"
                    class="file_tagbox"
                    :fileName="item.folderList[0].name"
                    :fileInfo="item.folderList[0]"
                    @showRemoveFun="showRemoveFun(item, index)"
                  />
                  <!-- 详情等操作区 -->
                  <div class="operation_box_box">
                    <el-tooltip
                      class="box-item"
                      v-if="item.type != 99"
                      effect="dark"
                      content="详情"
                      placement="bottom"
                    >
                      <img
                        src="@/assets/images/content_center/content_repository/detail.png"
                        @click.stop="toDetail(item.id, item.type)"
                        alt=""
                      />
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" content="打标签" placement="bottom">
                      <img
                        src="@/assets/images/content_center/content_repository/add.png"
                        @click.stop="addTab(item)"
                        alt=""
                      />
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" content="下载" placement="bottom">
                      <img
                        src="@/assets/images/content_center/content_repository/download.png"
                        @click.stop="download(item)"
                        alt=""
                      />
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" content="删除" placement="bottom">
                      <img
                        src="@/assets/images/content_center/content_repository/delete.png"
                        @click.stop="celItem(item)"
                        alt=""
                      />
                    </el-tooltip>
                  </div>
                </div>
              </div>
              <!-- 图集 -->
              <!-- <imgTextTask_ICON v-if="item.type == 99" :info="item" :useClick="false" /> -->
              <!-- 素材类型 -->
              <div class="content_type">
                {{ item.type == 99 ? '图文' : item.type == 1 ? '视频' : '图片' }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- <div v-else class="noData">暂无数据</div> -->
      <div
        v-if="!tableForm.page.loading && !(videoData.records && videoData.records.length)"
        class="xm_noneData no_echart"
      >
        <img src="@/assets/images/content_center/no_activity.png" alt />
        暂无数据
      </div>
      <div class="xm_table_page">
        <el-pagination
          v-model:current-page="pageIndex"
          background
          :layout="props.pageLayout"
          :total="props.page.total"
          :page-size="props.page.size"
          :page-sizes="props.pageSizes"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        ></el-pagination>
      </div>
    </div>
    <!-- 添加标签的弹窗 -->
    <addDialog v-if="addTagDialog.show" :addDialog="addTagDialog" @updateTag="getList" />
    <!-- 预览素材 -->
    <previewDialog v-if="previewInfo.show" :previewDialog="previewInfo"></previewDialog>
    <!-- 图文详情的预览弹窗 -->
    <previewImgTextDOM v-if="previewImgTextInfo.show" :previewDialog="previewImgTextInfo" />
  </div>
</template>
<script setup>
import { useStore } from 'vuex'
import fileTag from '@/views/sumvideo/components/files/file_tag.vue'
import previewImgTextDOM from '@/views/sumvideo/components/preview_imgText_dialog.vue'
import previewDialog from '@/components/preview_dialog/preview_dialog.vue'
import addDialog from '../components/addTag_dialog.vue'
// import {
//   getWorkTabList,
//   updateWork,
//   getWorkDetail,
//   delAllTags,
//   beforUpdateWorks
// } from '@/api/content_center/content_repository.js'
import { updateWork, beforUpdateWorks } from '@/api/content_center/content_repository.js'
import { changeKB, secondToDate, getCWidth, isNotEmpty } from '@/utils/tools.js' // throttle
import { downLoadFile } from '@/utils/exportFile.js'
import { downLoadAllFile, cancelDownFile } from '@/utils/batchDownloadFile.js'
import { pageList } from '../model/get_works_listV2.js'
import router from '@/router/index.js'
import { ElMessageBox, ElMessage } from 'element-plus'
import { defineProps, defineEmits, watch } from 'vue'
const emit = defineEmits(['getList', 'delItem', 'batchSelect', 'showRemoveFun'])
const props = defineProps({
  changeFileLoading: {
    type: Boolean,
    dafault: false
  },
  videoData: {
    type: Object,
    default: () => {}
  },
  page: {
    // 分页参数
    type: Object,
    default: () => {
      return { loading: true, index: 1, size: 24, total: 0 }
    }
  },
  pageLayout: { type: String, default: 'total, sizes, prev, pager, next , jumper' }, // 分页需要显示的东西，默认全部
  pageSizes: { type: Array, default: () => [24, 48, 72, 96] },
  version: {
    type: Number || String,
    default: () => {
      return 2
    } // 版本 2 脱离任务转发， 1旧版兼容海尔
  },
  batchInfo: {
    type: Object,
    default: () => {
      return {
        showBatch: false // 是否打开批量操作开关
      }
    }
  }
})
const previewInfo = ref({
  show: false
}) // 预览
const previewImgTextInfo = ref({
  show: false,
  info: {}
}) // 图文的预览
const dialogVisible = ref(false)
const inputTagName = ref('')
const myCard = ref(null)

// watch(
//   () => props.batchInfo,
//   val => {
//     console.log('批量操作信息有修改--', val)
//   },
//   { deep: true, immediate: true }
// )
const batchOperationArr = ref([]) // 选中列表
// 选择
function clickBatch(item, e) {
  e.stopPropagation()
  const isPush = !batchOperationArr.value.some(x => x.id === item.id) // 是否添加选中，没有选中就添加，选中了就去除
  if (isPush) {
    getChoseOrNo(props.videoData.records, item, true)
    batchOperationArr.value.push(item)
  } else {
    getChoseOrNo(props.videoData.records, item, false)
    batchOperationArr.value.splice(batchOperationArr.value.indexOf(item), 1)
  }
  emit('batchSelect', batchOperationArr.value)
}
// 获取单个类型下的选择与取消选择
function getChoseOrNo(columns, choseItem, type) {
  ;(columns || []).forEach(column => {
    if (column.id === choseItem.id) {
      column.itemChose = type
    }
  })
}

// 清空选择
function clearBatch() {
  ;(props.videoData.records || []).forEach(item => {
    batchOperationArr.value.forEach(selectItem => {
      if (item.id === selectItem.id) {
        item.itemChose = false
      }
    })
  })
  batchOperationArr.value = []
}

function playVideo(item) {
  // 图文类型就显示图文详情的弹窗
  if (item.type === 99) {
    const urlList = JSON.parse(item.pictures).map(x => x.url)
    let imageTextTitle = ''
    let imageTextDescription = ''
    if (isNotEmpty(item.imageTextTitle)) {
      try {
        const titleInfo = JSON.parse(item.imageTextTitle)
        imageTextTitle = titleInfo.title
        imageTextDescription = titleInfo.description
      } catch {}
    }
    previewImgTextInfo.value = {
      show: true,
      urlList: urlList,
      title: imageTextTitle,
      desc: imageTextDescription,
      mount: item.mount ? JSON.parse(item.mount) : {}
    }
  } else {
    previewInfo.value = {
      show: true,
      title: item.type === 2 ? '查看图片' : '查看视频',
      url: item.url,
      type: item.type === 2 ? 'image' : 'video',
      cover: item.coverUrl || ''
    }
  }
}
const tableForm = reactive({
  page: {}, // 分页相关
  tags: [], // 获取到的所有标签的列表
  delTagIds: [], // 要删除的标签id列表(所有素材的标签)
  currentTags: [], // 当前素材标签的数组
  currentTagIds: [], // 要保存的标签id列表(当前素材)
  currentWorkId: '' // 当前添加标签的素材id
})
const version = toRef(props, 'version')
tableForm.page = toRef(props, 'page')
const pageIndex = ref(1)
watch(
  () => props.page,
  val => {
    pageIndex.value = val.index || 1
  },
  {
    deep: true
  }
)
// 分页相关：监听切换单页事件
const handleCurrentChange = val => {
  document.querySelector('.el-main').scrollTo(0, 0)
  tableForm.page.index = val
  emit('getList')
}
// 分页相关：监听单页显示数量切换事件
const handleSizeChange = val => {
  tableForm.page.size = val
  tableForm.page.index = 1
  emit('getList')
}
const store = useStore()
const systemVersion = computed(() => store.state.user.systemVersion)
// 点击去往作品详情页面的回调
function toDetail(id, type) {
  console.log('version', version.value)
  let url = `/sumwhy_video/finish_product_store/works_detail`
  if (version.value === 1) {
    url = `/content_center/work_library/works_detail`
  }
  if (systemVersion.value === 1) {
    url = `/content_market/finish_product_store/works_detail`
  }
  router.push({
    path: url,
    query: {
      id: id,
      v: version.value,
      workType: type
    }
  })
}

const addTagDialog = reactive({
  show: false,
  id: null,
  type: null,
  chooseTagList: []
})
// async function addTab(item){
//   addTagDialog.type = 1
//   addTagDialog.id = item.id
//   addTagDialog.show = true
//   addTagDialog.chooseTagList = info.value.tagList
//     ? JSON.parse(JSON.stringify(info.value.tagList))
//     : []
// }
// // 点击添加标签符号的回调
async function addTab(item) {
  // dialogVisible.value = true
  // tableForm.currentWorkId = item.id
  // getCurrentTagList(item.id)
  addTagDialog.type = 1
  addTagDialog.id = item.id
  addTagDialog.show = true
  addTagDialog.chooseTagList = []
}
const { getImgTextDownloadList } = pageList()
// 点击下载视频的回调
function download(e) {
  ElMessageBox.confirm('是否要下载该素材?', '系统提醒', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: '',
    customClass: 'drawer_systemBox',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        instance.confirmButtonText = '确定'
        const regex = /[^\u4e00-\u9fa5a-zA-Z0-9]/g
        let urlList = []

        // 图文类型，要加图片和文本单独下载
        if (e.type === 99) {
          urlList = getImgTextDownloadList(e, false)
          console.log('xxx', urlList)
        }
        const downPromise =
          e.type === 99
            ? downLoadAllFile(urlList, '', instance, `${e.name.replace(regex, '')}.zip`)
            : downLoadFile(e.url, e.name.replace(regex, ''), 'material_library')
        downPromise
          .then(() => {
            ElMessage({
              type: 'success',
              message: '下载成功'
            })
            beforUpdateWorks({ cId: e.id, useWay: 21 })
            emit('getList')
            done()
            setTimeout(() => {
              instance.confirmButtonLoading = false
            }, 300)
          })
          .catch(() => {
            done()
            setTimeout(() => {
              instance.confirmButtonLoading = false
            }, 300)
          })
      } else {
        if (e.type === 99) cancelDownFile()
        done()
        setTimeout(() => {
          instance.confirmButtonLoading = false
        }, 300)
      }
    }
  }).then(() => {})
}
// 点击删除素材按钮的回调
function celItem(item) {
  ElMessageBox.confirm('删除后不可恢复，是否确认?', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: '',
    customClass: 'drawer_systemBox'
  })
    .then(() => {
      emit('delItem', item)
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消删除'
      })
    })
}
// function retEmit(e, index) {
//   const reg = /[^\u4e00-\u9fa5a-zA-Z0-9]/gi
//   inputTagName.value = e.target.value.replace(reg, '')
// }
// 监听添加标签弹窗是否显示的回调
watch(
  () => dialogVisible.value,
  val => {
    if (!val) {
      inputTagName.value = ''
      tableForm.tags = [] // 获取到的所有标签的列表
      tableForm.delTagIds = [] // 要删除的所有标签的ids
      tableForm.currentTags = [] // 当前素材标签的数组
      tableForm.currentTagIds = [] // 要保存的标签id列表
      tableForm.currentWorkId = '' // 当前添加标签的素材id
    }
  },
  { immediate: true }
)
const cLen = ref(7)
const listWidth = ref()
const oneWidth = ref(176)
function getWidth() {
  listWidth.value = getCWidth() - 264 - 32 - 34 - 7
  init()
}
getWidth()
function init() {
  // 假设图片宽度为100px
  // containerWidth.value = getCWidth()- 32 - 48 - 84
  cLen.value = Math.floor((getCWidth() - 32 - 48 - 84) / 196)
  oneWidth.value = Math.floor(listWidth.value / cLen.value) - 2
  // alert(cWidth + ' ' + listWidth.value + ' ' + cLen.value + ' ' + oneWidth.value)
}
onMounted(() => {
  window.onresize = () => {
    getWidth()
  }
})
onUnmounted(() => {
  mouseId.value = null
  window.onresize = null
})
defineExpose({ clearBatch })

function showRemoveFun(item, index) {
  emit(
    'showRemoveFun',
    false,
    [item.id],
    index,
    item.folderList && item.folderList.length > 0 ? item.folderList[0].id : []
  )
}

const mouseId = ref(null) // 鼠标挪上去的素材ID

// 开关开启/关闭之前
function beoreOpenChange(item) {
  mouseId.value = item.id
  console.log('item', item)
  return new Promise(resolve => {
    ElMessageBox.confirm(`确认${item.isOpen ? '取消设置' : '设置'}为开放素材吗？`, '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'drawer_systemBox'
    })
      .then(() => {
        updateWork({
          id: item.id,
          isOpen: item.isOpen === 1 ? 0 : 1,
          bizShow: 1
        })
          .then(res => {
            if (res.code === 0) {
              ElMessage({
                message: '设置成功',
                type: 'success'
              })
              mouseId.value = null
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
        mouseId.value = null
        resolve(false)
      })
  })
}
function openTemplateChange(e, i) {
  console.log('xx', e, i)
  // const data = getQuery(searchComponents.value)
  // if (data.isOpen !== null) {
  mouseId.value = null
  emit('getList')
  // }
}
</script>

<style lang="scss" scoped>
@import url('@/styles/layout.scss');
.page_page_scroll {
  width: 100%;
  height: calc(100% - 64px);
}
.page_scroll {
  overflow-y: auto;
  height: 100%;
  width: 100%;
}
.noData {
  text-align: center;
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #909399;
}
.xm_table_page {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  width: 100%;
  padding-right: 24px;
}
.card {
  padding: 0 10px 0 24px;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  .card_list {
    .card_item {
      height: calc(100% - 14px);
      border-radius: 4px;
      margin-right: 14px;
      margin-bottom: 14px;
      overflow: hidden;
      position: relative;
      .batch_warp {
        width: 100%;
        height: 100%;
        z-index: 3;
        opacity: 1;
        transition: all 0.3s ease;
        background-color: rgba(0, 0, 0, 0.6);
        border-radius: 4px;
        position: absolute;
        top: 0;
        left: 0;
        .select-state {
          width: 14px;
          height: 14px;
          background-color: #fff;
          margin: 8px 0 0 8px;
          line-height: 14px;
          text-align: center;
          transition: all 0.2s;
          cursor: pointer;
          padding-top: 2px;
          display: flex;
          flex-direction: row;
          justify-content: center;
        }
        .state-chose {
          width: 4px;
          height: 8px;
          border-color: #fff;
          border-style: solid;
          border-width: 0 1px 1px 0;
          transform: rotate(45deg);
        }
        .selected-state {
          background: #364fcd !important;
        }
      }

      .videoImg {
        position: absolute;
        z-index: 1;
        width: 101%;
        object-fit: contain;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 4px;
      }

      .card_item_top {
        height: 100%;
        width: 100%;
        position: relative;

        .content {
          width: 100%;
          height: 100%;
          position: relative; // data-v-0925d526 aria-describedby="el-id-5379-140"
          opacity: 0;
          z-index: 2;
          transition: all 0.2s ease-in-out;

          .content_title {
            background: linear-gradient(180deg, rgba(0, 0, 0, 0.36) 0%, rgba(0, 0, 0, 0) 100%);
            // height: 40px;
            padding: 10px 11px 0 11px;
            line-height: 20px;
            font-size: 14px;
            cursor: default;
            color: #fff;
            display: -webkit-box;
            word-break: break-all;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: pre-line;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
          }
          .content_data {
            margin-top: 8px;
            padding: 0 7px;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            .one_box {
              margin-top: 5px;
              display: flex;
              padding: 2px 4px;
              align-items: center;
              background: rgba(51, 51, 51, 0.2);
              border-radius: 12px;
              color: #fff;
              .icon_img {
                width: 20px;
                height: 20px;
                margin-right: 4px;
              }
              .num {
                height: 22px;
                font-size: 12px;
                font-weight: 400;
                line-height: 22px;
              }
            }
          }
          .operation_box_box {
            margin-top: 6px;
            display: flex;
            width: 100%;
            justify-content: space-between;
          }
          .operation_box {
            padding: 0 8px;
            position: absolute;
            left: 0;
            right: 0;
            bottom: 17px;
            img {
              cursor: pointer;
              height: 32px;
              width: 32px;
              object-fit: cover;
            }
          }
          .operation_status {
            width: max-content;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            min-height: 22px;
            padding: 0 6px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 2px;
            .text_warp {
              margin-right: 6px;
              display: flex;
              flex-direction: row;
              justify-content: flex-start;
              align-items: center;
              border-radius: 4px;

              font-weight: 400;
              font-size: 12px;
              color: #ffffff;
              line-height: 20px;
              padding: 0 2px 0 0px;
            }
            :deep(.el-switch) {
              height: 20px;
              line-height: 20px;
              width: 40px;
            }
          }
          .operation_status + .file_tag {
            margin-top: 4px;
          }
        }
        .content_type {
          z-index: 1;
          position: absolute;
          right: 10px;
          top: 9px;
          min-width: 48px;
          min-height: 22px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 11px;
          font-weight: 400;
          font-size: 14px;
          color: #ffffff;
          line-height: 20px;
          padding: 1px 10px;
        }
      }
    }
    .card_item:hover {
      .content {
        // opacity: 1;
      }
    }
  }
}
.card_item_mouse {
  .content {
    opacity: 1 !important;
  }
}
.el-dialog {
  .add_tag_box {
    display: flex;
    .add_btn {
      margin-left: 24px;
    }
  }
  .line {
    width: 100%;
    height: 1px;
    margin-top: 16px;
    background: #ebedf0;
  }
  .current_tag_box {
    margin-top: 18px;
    .label {
      margin-bottom: 12px;
      height: 20px;
      font-size: 14px;
      font-weight: 400;
      color: #303133;
      line-height: 20px;
    }
    .tag_box1 {
      display: flex;
      flex-wrap: wrap;
      // max-height: 68px;
      // overflow-y: auto;
      // &::-webkit-scrollbar {
      //   // display: none;
      // }
      .tag {
        margin: 14px 24px 0 0;
        padding: 1px 10px 1px 22px;
        background: #d2d7f0;
        color: #303133;
        border-radius: 16px;
        border: none;
      }
    }
    :deep(.el-tag--light .el-tag__close) {
      color: #364fcd;
    }
    :deep(.el-tag--info .el-tag__close) {
      color: #303133;
    }
    .tag_box {
      display: flex;
      flex-wrap: wrap;
      .tag1 {
        margin-right: 24px;
        margin-bottom: 10px;
        padding: 1px 10px 1px 22px;
        height: 28px;
        background: #d2d7f0;
        color: #303133;
        border-radius: 16px;
        border: none;
      }
      .tag2 {
        margin-right: 24px;
        padding: 1px 10px 1px 22px;
        margin-bottom: 10px;
        height: 28px;
        color: #303133;
        border: 1px solid #999999;
        border-radius: 16px;
        background: #fff;
      }
    }
  }
  .all_tag_title {
    margin-top: 24px;
    height: 20px;
    font-size: 14px;
    font-weight: 400;
    color: #303133;
    line-height: 20px;
  }
  .all_tag_box {
    height: 254px;
    overflow-y: auto;
    &::-webkit-scrollbar {
      // display: none;
      width: 2px;
    }
    .tag_box {
      margin-top: 18px;
      .label {
        margin-bottom: 12px;
        height: 20px;
        font-size: 14px;
        font-weight: 400;
        color: #303133;
        line-height: 20px;
      }
      .tag_box {
        display: flex;
        .tab {
          margin-right: 24px;
          height: 28px;
        }
      }
    }
  }
}
.video {
  width: 300px;
  height: auto;
  border-radius: 8px;
  max-height: 80vh;
  object-fit: cover;
}
.no_echart {
  height: 300px;
}
:deep(.el-tag--default) {
  cursor: default;
}
:deep(.xm .el-dialog__body) {
  padding: 22px 10px 22px 24px;
}
:deep(.imgText_ICON) {
  z-index: 2;
  width: 40px !important;
  height: 40px !important;
  position: absolute !important;
  right: 0 !important;
  top: 0 !important;
  left: auto !important;
  .icon_icon {
    right: 8px !important;
    top: 8px !important;
    border-radius: 4px !important;
    padding: 4px !important;
    img {
      width: 16px !important;
      height: 16px !important;
    }
  }
}
</style>
