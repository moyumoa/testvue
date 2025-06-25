<template>
  <div>
    <el-dialog
      :close-on-click-modal="false"
      ref="dialog"
      custom-class="rule_setting_dialog hide_footer_line"
      destroy-on-close
      v-model="show"
      title="全部实拍图"
      width="680px"
      :before-close="beforeCloseFun"
    >
      <div class="dialog_parent">
        <div class="dialog_content" ref="dialogContent">
          <div class="sumvideo_page" v-loading="loading">
            <template v-if="listData && listData.length > 0">
              <div
                class="all_material"
                :infinite-scroll-delay="1000"
                v-infinite-scroll="loadFun"
                :infinite-scroll-distance="50"
                :infinite-scroll-immediate="false"
                :infinite-scroll-disabled="listData.length >= page.total"
              >
                <div class="storyboard_material_box">
                  <div class="material_box">
                    <div
                      class="one_material"
                      @click.stop="previewFun(item)"
                      v-for="(item, index) in listData"
                      :key="index"
                    >
                      <!-- 封面 -->
                      <img
                        class="material_cover"
                        :src="item.thumbCoverUrl || item.coverUrl"
                        alt=""
                      />

                      <!-- 实拍图的替换标识 -->
                      <img
                        class="item_mark"
                        src="https://tagvv-1256030678.file.myqcloud.com/202410210h1pp.png"
                        alt=""
                      />
                      <!-- 选择保留区域 要替换的才显示 如果有保留区域了就鼠标挪上去才显示 -->
                      <div
                        :class="{ img_choose: true, img_choose_opa: true }"
                        @click.stop="showCanvasFun(item, index)"
                      >
                        选择商品区域
                      </div>
                      <!-- 批量删除 -->
                      <div
                        class="material_action material_action_batch"
                        @click.stop="checkChange(item)"
                      >
                        <div class="action_right">
                          <div class="xm_check_box_round" style="margin-right: 8px">
                            <div
                              :class="
                                checkList.includes(item.tagvvMediaId || item.id || item.materialId)
                                  ? 'check_box check_box_active'
                                  : 'check_box'
                              "
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="loading_library">
                <img src="/public/loading.gif" v-if="loading && page.index > 1" alt="" />
                {{
                  loading
                    ? page.index === 1
                      ? ''
                      : '加载中...'
                    : listData.length >= page.total
                    ? listData.length > 12
                      ? '已经到底了~'
                      : ''
                    : '上拉加载更多~'
                }}
              </div>
            </template>
            <div v-if="!loading && !(listData && listData.length > 0)" class="no_echart">
              <img src="@/assets/images/content_center/no_activity.png" alt />
              暂无数据
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="footer_box">
          <div class="footer-left">
            <div class="xm_check_box_round" @click="setCheckFun(creativeReplaceId, item)">
              <div
                :class="[
                  'check_box',
                  checkStatus === 1
                    ? 'check_box_half_choose'
                    : checkStatus === 2
                    ? 'check_box_active'
                    : ''
                ]"
              ></div>
              <div class="select_all_text">全选</div>
            </div>
            <div class="left_clear" v-if="false" @click="clearFun">清除</div>
          </div>
          <span class="dialog-footer">
            <!-- <el-button @click="closeDialog" v-if="false">取消</el-button> -->
            <el-button
              :disabled="loading"
              type="primary"
              @click="delMaterialFun(creativeReplaceId)"
            >
              删除
            </el-button>
          </span>
        </div>
      </template>
    </el-dialog>
    <shootCanvasDOM
      v-if="canvasDialog.show"
      :canvasDialog="canvasDialog"
      @updateFun="upateCanvasFun"
    />
  </div>
</template>
<script setup>
import shootCanvasDOM from './shoot_canvas_dialog.vue'

import { ElMessageBox } from 'element-plus'
import { throttle, isNotEmpty } from '@/utils/tools.js'
import { pageMannequinShoot, deleteShoot } from '@/api/sumvideo/product_shooting_library'
const props = defineProps({
  info: Object,
  materialDialog: {
    type: Object,
    default: () => {
      return {
        creativeReplaceId: null, // 分镜替换ID
        resourceType: null, //  图文模板需要的
        creativeId: null, // 图文模板需要的
        show: true
      }
    }
  },
  extraParams: Object // 不同页面查询列表需要携带的固定参数
})
const { extraParams } = toRefs(props)
const { show, creativeReplaceId } = toRefs(props.materialDialog)
const emits = defineEmits(['updateChooseList', 'previewFun', 'updateMaterialFilter'])
const dialog = ref(null)
const loading = ref(true)
const listData = ref([])
const idDel = ref(false) // 是否触发了删除 触发后需要将最新的列表和数量传递给父
const page = reactive({
  index: 1,
  size: 20,
  total: 0
})
const checkStatus = ref(null) // 全选状态 Null 未选中 1半选 2全选
const checkList = ref([]) // 选中的列表
const unCheckList = ref([]) // 取消选中的列表
const checkTotal = ref(0) // 选中的数量
const isAllCheck = ref(false) // 是否点击过全选
const dialogContent = ref()
const message = inject('$message')
function resetList(source) {
  loading.value = true
  page.index = 1
  getList(source).then(() => {
    if (source === 'del') {
      message.success('刪除成功')
    }
  })
}
function getList(source) {
  return new Promise(resolve => {
    const params = JSON.parse(JSON.stringify(extraParams.value))
    params.pageNo = page.index
    params.pageSize = page.size
    pageMannequinShoot(params)
      .then(res => {
        if (res.code === 0) {
          const list2 = res.data?.records || []
          if (checkStatus.value === 2) {
            list2.forEach(x => {
              const index1 = checkList.value.findIndex(xxx => xxx === x.materialId)
              if (index1 === -1) {
                checkList.value.push(x.materialId)
              }
              const index2 = unCheckList.value.findIndex(xxx => xxx === x.materialId)
              if (index2 > -1) {
                unCheckList.value.splice(index2, 1)
              }
            })
          }
          if (page.index === 1) {
            listData.value = list2
            page.total = res.data?.total || 0
          } else {
            listData.value = listData.value.concat(list2)
          }
        }
        if (source === 'del' && page.index === 1) {
          dialogContent.value?.scrollTo(0, 0)
        }
        loading.value = false
        resolve()
      })
      .catch(() => {
        loading.value = false
        resolve()
      })
  })
}
function loadFun() {
  if (loading.value) return
  console.log('滚动到底')
  loading.value = true
  page.index++
  getList()
}

onMounted(() => {
  resetList()
})
function delFun(e) {
  resetList('del')
  idDel.value = true
}
function previewFun(item) {
  emits('previewFun', '查看图片', item.coverUrl, 'image', item.coverUrl)
}
function beforeCloseFun(done) {
  if (idDel.value) {
    emits('updateChooseList', listData.value.slice(0, 20), page.total)
    done()
  } else {
    done()
  }
}

// 单个分镜的单个原料选中/非选中状态修改
function checkChange(item, creativeReplaceId) {
  console.log('dange ', item, creativeReplaceId)

  const index = checkList.value.findIndex(
    x => x === item.tagvvMediaId || x === item.id || x === item.materialId
  )
  const index2 = unCheckList.value.findIndex(
    x => x === item.tagvvMediaId || x === item.id || x === item.materialId
  )
  if (index > -1) {
    //  当前在选中列表里面，那就从选中列表删除 并在取消选中列表里添加
    checkTotal.value = checkTotal.value - 1
    checkList.value.splice(index, 1)
    unCheckList.value.push(item.tagvvMediaId || item.id || item.materialId)
  } else {
    // 当前不在选中列表里，那就从取消选中列表里删除，并在选中列表里添加
    checkTotal.value = checkTotal.value + 1
    checkList.value.push(item.tagvvMediaId || item.id || item.materialId)
    unCheckList.value.splice(index2, 1)
  }
  nextTick(() => {
    if (checkTotal.value === page.total) {
      checkStatus.value = 2
      isAllCheck.value = true
    } else if (checkTotal.value > 0) {
      checkStatus.value = 1
    } else {
      checkStatus.value = null
    }
  })
}
// 设置单个分镜的全选 null 未选中 1半选 2全选
const setCheckFun = throttle(function (creativeReplaceId, item) {
  console.log('批量删除', creativeReplaceId, checkStatus.value)
  if (loading.value) return
  const ids = listData.value.map(x => x.tagvvMediaId || x.id || x.materialId)

  // 全选情况下，变成未选中
  if (checkStatus.value === 2) {
    checkStatus.value = null

    checkList.value = []
    unCheckList.value = ids
    checkTotal.value = 0
    isAllCheck.value = false
  } else {
    // 半选或者未选情况下，变成全选中
    checkStatus.value = 2

    checkList.value = ids
    unCheckList.value = []

    checkTotal.value = page.total
    isAllCheck.value = true
  }
}, 300)
// 清除所有选中
function clearFun(type) {
  if (type !== 'delSuccess' && loading.value) return
  checkStatus.value = null
  checkList.value = []
  unCheckList.value = []
  checkTotal.value = 0
  isAllCheck.value = false
}
// 批量删除
const delMaterialFun = throttle(function (creativeReplaceId) {
  if (
    checkStatus.value === null ||
    (checkStatus.value !== null && checkList.value && checkList.value.length === 0)
  ) {
    message.warning(`请先选择实拍图`)
    return
  }
  ElMessageBox.confirm('删除后不可恢复，是否确定？', '系统提示', {
    closeOnClickModal: false,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: '',
    customClass: 'xm_dialog_messageBox',
    dangerouslyUseHTMLString: true
  })
    .then(() => {
      loading.value = true

      console.log('批量删除', creativeReplaceId, listData.value, checkStatus.value)

      productShootDelFun()
    })
    .catch(() => {})
}, 500)

// 实拍库的全部实拍图批量删除
function productShootDelFun() {
  const params = JSON.parse(JSON.stringify(extraParams.value))
  if (checkStatus.value === 2) {
    params.deleteAll = true
  } else {
    // 历史点击过全选，那就传排除的，否则就是选中的
    if (isAllCheck.value) {
      params.deleteAll = true
      params.excludeResourceIds = unCheckList.value
    } else {
      params.deleteAll = false
      params.materialIds = checkList.value
    }
  }
  deleteShoot(params)
    .then(res => {
      if (res.code === 0) {
        clearFun('delSuccess')

        delFun([])
      } else {
        loading.value = false
      }
    })
    .catch(() => {
      loading.value = false
    })
}

// --选择保留区域
const canvasDialog = ref({ show: false })
const showCanvasFun = throttle((item, index) => {
  canvasDialog.value = {
    isNeedReplaceFace: item.isNeedReplaceFace,
    origin: 'table',
    show: true,
    materialId: item.materialId,
    url: item.coverUrl,
    width: item.width,
    height: item.height,
    markUrl: item.markUrl,
    indexList: isNotEmpty(item.indexs) ? item.indexs.split(',') : [],
    imgIndex: index
  }
})
function upateCanvasFun(url, indexList, isSave, yellowUrl) {
  listData.value[canvasDialog.value.imgIndex].markUrl = url || ''
  listData.value[canvasDialog.value.imgIndex].indexs = isNotEmpty(indexList)
    ? indexList.join(',')
    : ''
  listData.value[canvasDialog.value.imgIndex].redrawYellowUrl = yellowUrl || ''
}
// --选择保留区域end
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.dialog_parent {
  padding: 16px 0 4px;
}
// 选中的原料信息
.storyboard_material_box {
  margin-bottom: 12px;
  width: calc(100% - 12px);
  padding-left: 12px;
  max-height: 256px;
  overflow-y: auto;

  .material_box {
    margin-top: -12px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    // 视频和图片
    .one_material {
      cursor: pointer;
      margin-right: 12px;
      margin-top: 12px;
      width: 120px;
      height: 160px;
      // background: #303133;
      background: #b9b9b9;
      border-radius: 2px;
      border: 1px solid #eaedf0;
      position: relative;
      overflow: hidden;
      .material_cover {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: flex;
      }
      .action_play {
        opacity: 0;
        position: absolute;
        top: calc(50% - 16px);
        left: 50%;
        transform: translateY(-50%) translateX(-50%);
        width: 32px;
        height: 32px;
        object-fit: contain;
        display: flex;
      }
      .action_time {
        position: absolute;
        left: 6px;
        top: 6px;
        padding: 0 4px;
        font-weight: 400;
        font-size: 12px;
        color: #ffffff;
        line-height: 18px;

        background: rgba(0, 0, 0, 0.4);
        border-radius: 2px;
      }
      .material_action {
        width: 100%;
        padding-left: 8px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        position: absolute;
        right: 0;
        bottom: 40px;

        .action_right {
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
          align-items: center;
        }
      }
      .material_action_batch {
        bottom: 0;
        height: 40px;
        padding-bottom: 8px;
        align-items: flex-end;
        width: 50%;
      }
    }
  }
}

.show_all_storyboard {
  .storyboard_material_box {
    max-height: 224px !important;
  }
}
.dialog_content {
  min-height: 100px;
  max-height: 60vh;
  overflow-y: auto;
  :deep(.loading_library) {
    padding-bottom: 15px;
  }
  .sumvideo_page {
    min-height: 100px;
    height: max-content;
    width: 100%;
  }
  :deep(.storyboard_material_box) {
    margin-bottom: 0 !important;
    max-height: max-content !important;
    width: 100% !important;
  }
}
.footer_box {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 0px 0px;
  .xm_check_box_round,
  .footer-left {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .footer-left {
    padding-bottom: 4px;
  }
  .select_all_text {
    cursor: pointer;
    font-weight: 400;
    font-size: 14px;
    color: #606266;
    line-height: 20px;
    margin-left: 8px;
  }
  .left_clear {
    margin-left: 16px;
    color: #364fcd;
    cursor: pointer;
  }
}
:deep(.material_action) {
  justify-content: flex-end !important;
}
:deep(.one_material:hover) {
  .img_choose_opa {
    opacity: 1 !important;
  }
}
.item_mark {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 20px;
  height: 20px;
  object-fit: contain;
  display: flex;
}

.img_choose {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateY(-50%) translateX(-50%);
  width: 89px;
  height: 28px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 14px;
  cursor: pointer;
  font-weight: 400;
  font-size: 12px;
  color: #ffffff;
  line-height: 28px;
  text-align: center;
}
.img_choose_opa {
  opacity: 0;
}
</style>
