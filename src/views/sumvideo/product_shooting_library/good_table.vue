<template>
  <div
    class="table_page sumvideo_page"
    v-loading="props.changeFileLoading && tableForm.loading ? false : tableForm.loading"
    :style="tableForm.loading ? 'pointer-events: none' : ''"
  >
    <div class="table_th">
      <div class="one_th th_176">商品</div>
      <div class="one_th th_other">
        实拍图
        <img
          @click="showIntroduceFun"
          src="https://tagvv-1256030678.file.myqcloud.com/202410093k18h.png"
          alt=""
        />
      </div>
    </div>
    <div
      class="table_body"
      :style="{
        height: tableBodyHeight ? `${tableBodyHeight}px` : ''
      }"
    >
      <div
        ref="tableRef"
        class="modal_list modal_list_scroll"
        :infinite-scroll-delay="1000"
        v-infinite-scroll="loadFun"
        :infinite-scroll-distance="50"
        :infinite-scroll-immediate="false"
        :infinite-scroll-disabled="tableForm.listData.length >= tableForm.page.total"
      >
        <template v-if="props.list && props.list.length > 0">
          <div
            class="table_tr"
            v-for="(item, index) in props.list"
            :key="index"
            v-loading="trLoading === index"
          >
            <!-- 商品信息 -->
            <div class="table_td td_176 td_good" @click.stop="showGoodFun(item, index, false)">
              <div class="has_good">
                <div class="good_top">
                  <!-- 有商品图 -->
                  <img :src="item.thumbCover || item.cover" class="has_cover" v-if="item.cover" />
                  <!-- 无商品图 -->

                  <uploadImage
                    v-loading="uploadLoading && trLoading === index"
                    @click.stop="() => {}"
                    v-else
                    :maxSize="15360"
                    :index="0"
                    origin="sumvideo"
                    :useCommonReason="true"
                    @success="uploadImgSuccess($event, item, index)"
                    :showLoading="true"
                  >
                    <div class="no_cover">
                      <el-icon class="icon-plus">
                        <i-plus />
                      </el-icon>
                      <div>添加图片</div>
                    </div>
                  </uploadImage>
                  <!-- 标签 -->
                  <div class="good_tag" v-if="item.tagList && item.tagList.length > 0">
                    <div class="one_tag" v-for="(x, y) in item.tagList" :key="y">{{ x.name }}</div>
                  </div>
                </div>

                <div class="good_bottom">
                  <div class="good_name line-hidden1">
                    {{ item.name || '' }}
                  </div>
                  <img
                    class="good_edit_icon"
                    src="https://tagvv-1256030678.file.myqcloud.com/202409200bhd5.png"
                    alt=""
                  />
                </div>
              </div>
            </div>
            <!-- 模特+实拍图信息 -->
            <div class="table_td td_other">
              <!-- 添加模特 -->
              <div class="td_model_add" @click.stop="showModelFun(true, null, index, item.id)">
                <img src="https://tagvv-1256030678.file.myqcloud.com/20240920mdi8f.png" alt="" />
                <div>添加实拍模特</div>
              </div>
              <div class="td_model" v-if="item.mannequinList && item.mannequinList.length > 0">
                <div
                  class="one_model"
                  v-for="(oneModel, modelIndex) in item.mannequinList"
                  :key="modelIndex"
                >
                  <!-- 模特信息 -->
                  <div
                    class="model_info"
                    @click.stop="showModelFun(false, oneModel, index, item.id)"
                  >
                    <div class="model_name_box">
                      <img
                        class="model_icon"
                        src="https://tagvv-1256030678.file.myqcloud.com/20240920i95dj.png"
                        alt=""
                      />
                      <div class="model_name line-hidden1">
                        {{ oneModel.name || '' }}
                      </div>
                      <img
                        class="model_edit_icon"
                        src="https://tagvv-1256030678.file.myqcloud.com/202409200bhd5.png"
                        alt=""
                      />
                    </div>
                    <div class="model_tag" v-if="oneModel.tagList && oneModel.tagList.length > 0">
                      <div class="one_tag" v-for="(x1, y1) in oneModel.tagList" :key="y1">
                        {{ x1.name || '' }}
                      </div>
                    </div>
                  </div>
                  <!-- 实拍图 -->
                  <div class="shoot_info">
                    <template v-if="oneModel.coverList && oneModel.coverList.length > 0">
                      <template v-for="(oneShoot, shootIndex) in oneModel.coverList">
                        <div
                          class="one_shoot"
                          v-if="shootIndex < 11"
                          :key="shootIndex"
                          @click.stop="
                            previewFun('查看图片', oneShoot.coverUrl, 'image', oneShoot.coverUrl)
                          "
                        >
                          <img
                            class="shoot_cover"
                            :src="oneShoot.thumbCoverUrl || oneShoot.coverUrl"
                            alt=""
                          />
                          <!-- 有替换图的标识 -->
                          <el-tooltip popper-class="tooltip-class" placement="top">
                            <template #content>
                              <p>选择商品区域</p>
                            </template>
                            <img
                              @click.stop="
                                showCanvasFun(
                                  item.id,
                                  index,
                                  oneModel.mannequinId,
                                  oneShoot.materialId,
                                  oneShoot
                                )
                              "
                              class="shoot_icon"
                              src="https://tagvv-1256030678.file.myqcloud.com/20241105eamct.png"
                              alt=""
                            />
                          </el-tooltip>
                          <!-- 删除 -->
                          <div
                            class="shoot_del"
                            @click.stop="
                              delShootFun(item.id, index, oneModel.mannequinId, oneShoot.materialId)
                            "
                          >
                            <img
                              src="https://tagvv-1256030678.file.myqcloud.com/20241105wxein.png"
                              alt=""
                            />
                          </div>
                        </div>
                      </template>
                      <div
                        v-if="oneModel.coverList && oneModel.coverList.length >= 10"
                        class="one_shoot_num"
                        @click.stop="showShootAllFun(item.id, index, oneModel.mannequinId)"
                      >
                        <div>共{{ oneModel.coverTotalNum || 0 }}张</div>
                        <div style="color: #364fcd">查看全部</div>
                      </div>
                    </template>
                    <div
                      class="one_shoot_add"
                      @click.stop="showAddShootFun(item.id, index, oneModel.mannequinId)"
                    >
                      <el-icon class="icon-plus">
                        <i-plus />
                      </el-icon>
                      <div>添加图片</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <div
          class="xm_pullUpToLoadMore"
          style="padding: 0 16px 16px 0px"
          v-if="tableForm.listData && tableForm.listData.length > 8"
        >
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
      </div>
      <!-- 添加商品 -->
      <div
        class="modal_list modal_list_add"
        :style="tableForm.listData && tableForm.listData.length > 0 ? '' : 'padding-top:0'"
      >
        <div class="table_tr">
          <!-- 商品信息 -->
          <div
            style="min-height: 40px !important"
            class="table_td td_176 td_good"
            @click.stop="showGoodFun('', null, true)"
          >
            <div class="no_good">
              <img src="https://tagvv-1256030678.file.myqcloud.com/20240920mdi8f.png" alt="" />
              <div>添加商品</div>
            </div>
          </div>
          <!-- 模特+实拍图信息 -->
          <div style="min-height: 40px !important" class="table_td td_other"></div>
        </div>
      </div>
    </div>
    <!-- 预览弹窗 -->
    <previewDialog v-if="previewInfo.show" :previewDialog="previewInfo"></previewDialog>
    <!-- 添加/编辑商品弹窗 -->
    <goodDOM
      v-if="goodDialog.show"
      :goodDialog="goodDialog"
      @updateFun="updateGoodFun"
      @updateAllGoodFun="updateAllGoodFun"
    />
    <!-- 添加/编辑模特弹窗 -->
    <modelDOM
      v-if="modelDialog.show"
      :modelDialog="modelDialog"
      @updateFun="updateGoodFun"
      @updateAllGoodFun="updateAllGoodFun"
    />
    <!-- 添加实拍图 -->
    <addShootDOM
      v-if="addShootDialog.show"
      :addDialog="addShootDialog"
      @updateFun="updateGoodFun"
    />
    <!-- 查看全部 -->
    <materialDOM
      v-if="allMaterialDilog.show"
      :materialDialog="allMaterialDilog"
      :extraParams="{
        mannequinId: allMaterialDilog.modelId, // 模特ID
        productId: allMaterialDilog.goodId // 商品ID
      }"
      @previewFun="previewFun"
      @updateChooseList="updateChooseList"
    />
    <!-- 实拍图上传介绍 -->
    <introduceDOM v-if="introduceDialog.show" :introduceDialog="introduceDialog" />
    <shootCanvasDOM
      v-if="canvasDialog.show"
      :canvasDialog="canvasDialog"
      @updateFun="upateCanvasFun"
    />
  </div>
</template>
<script setup>
import { pageShoot, deleteShoot, updateProduct } from '@/api/sumvideo/product_shooting_library'
import introduceDOM from './components/introduce_dialog.vue'
import materialDOM from './components/all_shoot_dialog.vue'
import addShootDOM from './components/add_shoot_dialog.vue'
import uploadImage from '@/views/market/miniprogram_operation/components/upload_image.vue'
import modelDOM from './components/model_dialog.vue'
import goodDOM from './components/good_dialog.vue'
import previewDialog from '@/components/preview_dialog/preview_dialog.vue'
import shootCanvasDOM from './components/shoot_canvas_dialog.vue'
import { throttle, isNotEmpty } from '@/utils/tools'

const props = defineProps({
  chooseFileId: String, // 当前选中的文件夹ID
  list: Array,
  tableForm: Object,
  tableBodyHeight: Number,
  changeFileLoading: Boolean
})
const { list, tableForm } = toRefs(props)
console.log('list', list)
const trLoading = ref(null) // 要显示哪一行商品的Loading
const message = inject('$message')
const emits = defineEmits(['updateDetailFun', 'loadFun', 'updateListFun'])
const clickInfo = ref({
  id: null, // 商品ID
  index: null // 第几个商品
})
// 更新商品信息【包括商品+对应的模特和实拍图】
function updateGoodFun() {
  trLoading.value = clickInfo.value.index
  pageShoot({
    productId: clickInfo.value.id, // 商品ID
    pageNo: 1,
    pageSize: 1
  })
    .then(res => {
      if (res.code === 0 && res.data?.records) {
        emits('updateDetailFun', clickInfo.value.index, res.data?.records[0])
      }
      trLoading.value = ''
    })
    .catch(() => {
      trLoading.value = ''
    })
}
function updateAllGoodFun() {
  emits('updateListFun')
  trLoading.value = ''
}
// --添加/编辑商品
const goodDialog = ref({
  show: false,
  isAdd: false
})
const showGoodFun = throttle((item, index, isAdd) => {
  if (tableForm.value.loading) return
  clickInfo.value = {
    id: item.id,
    index: index
  }
  goodDialog.value = {
    show: true,
    isAdd: isAdd,
    id: isAdd ? null : item.id,
    chooseFileId: props.chooseFileId || '0',
    info: isAdd
      ? null
      : {
          name: item.name,
          cover: item.cover,
          id: item.id,
          tagList: item.tagList
        }
  }
}, 700)

// --添加/编辑商品 end
// 上传商品图片
const uploadLoading = ref(false)
function uploadImgSuccess(e, item, index) {
  console.log('图片上传成功', e, item, index)
  uploadLoading.value = true
  // 调保存编辑商品保存图片

  updateProduct({
    id: item.id,
    coverUrl: e.imgUrl
  })
    .then(res => {
      if (res.code === 0) {
        message.success('商品图片上传成功')
        tableForm.value.listData[index].cover = e.imgUrl
      }
      nextTick(() => {
        uploadLoading.value = false
      })
    })
    .catch(() => {
      uploadLoading.value = false
    })
  //  emits('updateDetailFun', item.id, index)
}

// --添加/编辑模特

const modelDialog = ref({
  show: false,
  isAdd: false
})
const showModelFun = throttle((isAdd, item, goodIndex, goodId) => {
  console.log('showModelFun,', item, goodIndex, isAdd)
  if (tableForm.value.loading) return

  clickInfo.value = {
    id: goodId,
    index: goodIndex
  }
  modelDialog.value = {
    show: true,
    isAdd: isAdd,
    goodId: goodId, // 当前对应的商品ID
    info: isAdd
      ? null
      : {
          products: [goodId],
          name: item.name,
          id: item.mannequinId,
          tagList: item.tagList
        }
  }
}, 700)
// --添加/编辑模特 end

// --添加实拍图
const addShootDialog = ref({
  show: false
})
const showAddShootFun = throttle((goodId, goodIndex, modelId) => {
  if (tableForm.value.loading) return
  clickInfo.value = {
    id: goodId,
    index: goodIndex
  }
  addShootDialog.value = {
    mannequinId: modelId, // 模特ID
    productId: goodId, // 商品ID
    show: true
  }
}, 700)
// --添加实拍图 end

// 删除实拍图
const delShootFun = throttle((goodId, goodIndex, modelId, shootId) => {
  if (tableForm.value.loading || trLoading.value) return
  trLoading.value = goodIndex
  clickInfo.value = {
    id: goodId,
    index: goodIndex
  }
  deleteShoot({
    deleteAll: false, //	是否删除所有实拍图
    mannequinId: modelId, // 实拍模特id
    materialIds: [shootId] // 素材id
  })
    .then(res => {
      if (res.code === 0) {
        message.success('实拍图删除成功')
        updateGoodFun()
      }
      trLoading.value = null
    })
    .catch(() => {
      trLoading.value = null
    })
}, 700)

// --查看全部实拍图
const allMaterialDilog = ref({
  show: false
})
const showShootAllFun = throttle((goodId, goodIndex, modelId) => {
  if (tableForm.value.loading) return
  clickInfo.value = {
    id: goodId,
    index: goodIndex
  }

  allMaterialDilog.value = {
    show: true,
    goodId: goodId,
    modelId: modelId,
    mediaType: 8, // 实际的原料类型
    materialType: 8 // 要显示的原料类型
  }
}, 700)
// 查看全部弹窗里点击了删除，所以要更新最新的导入原料信息和数量
function updateChooseList(data, total) {
  console.log('updateChooseList', data, total)
  updateGoodFun()
}
// --查看全部实拍图 end

// 实拍图介绍
const introduceDialog = reactive({
  show: false
})
const showIntroduceFun = throttle(() => {
  introduceDialog.show = true
}, 700)
// 上拉加载更多
function loadFun() {
  emits('loadFun')
}
// --预览信息
const previewInfo = ref({
  show: false
})
// 预览弹窗的信息
function previewFun(title, url, type, cover, urlList) {
  previewInfo.value = {
    show: true,
    title: title,
    url: url,
    urlList: urlList,
    type: type,
    cover: cover || ''
  }
}
// --预览信息 end

// --选择保留区域
const canvasDialog = ref({ show: false })
const showCanvasFun = throttle((goodId, goodIndex, modelId, shootId, shootInfo) => {
  console.log('编辑保留区域', shootInfo)
  clickInfo.value = {
    id: goodId,
    index: goodIndex
  }
  canvasDialog.value = {
    isNeedReplaceFace: shootInfo.isNeedReplaceFace,
    origin: 'table',
    show: true,
    materialId: shootInfo.materialId,
    url: shootInfo.coverUrl,
    width: shootInfo.width,
    height: shootInfo.height,
    markUrl: shootInfo.markUrl,
    indexList: isNotEmpty(shootInfo.indexs) ? shootInfo.indexs.split(',') : []
  }
})
function upateCanvasFun(url, indexList, isSave, yellowUrl) {
  console.log('upateCanvasFun', url, indexList, isSave, yellowUrl)
  // if (isSave) {
  //   updateGoodFun()
  // }
}
// --选择保留区域end

const tableRef = ref()
function scrollToFun() {
  tableRef.value?.scrollTo(0, 0)
}
defineExpose({
  scrollToFun
})
</script>
<style lang="scss" scoped>
.table_th {
  padding-bottom: 4px;
  border-top: 1px solid #eaedf0;
  border-left: 1px solid #eaedf0;
  border-right: 1px solid #eaedf0;
}
.modal_list_scroll {
  border-left: 1px solid #eaedf0;
  border-right: 1px solid #eaedf0;
}
.modal_list_add {
  border-left: 1px solid #eaedf0;
  border-right: 1px solid #eaedf0;
  border-bottom: 1px solid #eaedf0;
  padding-top: 4px;
  .table_tr {
    margin-top: 0 !important;
  }
}
.table_page {
  width: 100%;
  height: 100%;
  border-radius: 2px;
  .td_176,
  .th_176 {
    width: 176px;
  }

  .td_other,
  .th_other {
    box-sizing: content-box;
    border-left: 4px solid #fff;
    width: calc(100% - 180px);
  }

  .table_th {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;

    .one_th {
      height: 40px;
      background: #f2f3f5;
      font-weight: 600;
      font-size: 14px;
      color: #323233;
      line-height: 20px;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      img {
        cursor: pointer;
        width: 16px;
        height: 16px;
        object-fit: contain;
        display: flex;
        margin-left: 8px;
      }
    }
  }
  .modal_list_scroll {
    width: 100%;
    max-height: calc(100% - 64px);
    overflow-y: auto;
    overflow-x: hidden;
  }
  .table_body {
    width: 100%;

    height: calc(100% - 40px);
    .table_tr:nth-child(1) {
      margin-top: 0 !important;
    }
    .table_tr {
      background: #f2f3f5;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: stretch;
      margin-top: 4px;
      .table_td {
        min-height: 176px;
      }

      .td_model {
        width: 100%;
        // max-height: 210px;
        // overflow-y: auto;
        //   overflow-x: hidden;

        .one_model {
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: stretch;
        }
        .model_info {
          width: 134px;
          padding: 0 12px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          .model_name_box {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            .model_icon {
              width: 16px;
              height: 16px;
              object-fit: contain;
              display: flex;
              margin-right: 4px;
            }
            .model_name {
              max-width: calc(100% - 44px);
              font-weight: 600;
              font-size: 14px;
              color: #323233;
              line-height: 20px;
            }
            .model_edit_icon {
              cursor: pointer;
              width: 16px;
              height: 16px;
              display: flex;
              object-fit: contain;
              margin-left: 8px;
            }
          }
          .model_tag {
            margin-top: 8px;
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            flex-wrap: wrap;
            height: 20px;
            overflow: hidden;
            .one_tag {
              margin: 0 8px 8px 0;
              font-weight: 400;
              font-size: 12px;
              color: #606266;
              line-height: 18px;
              padding: 1px 7px;
              background: rgba(48, 49, 51, 0.1);
              border-radius: 4px;
            }
          }
        }
        .shoot_info {
          padding-top: 8px;
          width: calc(100% - 136px);
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: flex-start;
          flex-wrap: wrap;
          .one_shoot {
            margin: 0 8px 8px 0;
            cursor: pointer;
            width: 66px;
            height: 88px;
            border-radius: 4px;
            overflow: hidden;
            position: relative;
            .shoot_cover {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: flex;
            }
            .shoot_icon {
              position: absolute;
              left: 34px;
              top: 24px;
              width: 24px;
              height: 24px;
              object-fit: contain;
              display: flex;
            }
            .shoot_del {
              cursor: pointer;
              position: absolute;
              right: 8px;
              bottom: 8px;
              width: 24px;
              height: 24px;
              img {
                width: 100%;
                height: 100%;
                display: flex;
                object-fit: cover;
              }
            }
            .shoot_editMark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translateY(-50%) translateX(-50%);
              width: 70px;
              height: 22px;
              background: rgba(0, 0, 0, 0.4);
              border-radius: 5px;
              cursor: pointer;
              font-weight: 400;
              font-size: 10px;
              color: #ffffff;
              line-height: 22px;
              text-align: center;
            }
          }
          .one_shoot_num {
            cursor: pointer;
            margin: 0 8px 8px 0;
            width: 66px;
            height: 88px;
            background: rgba(0, 0, 0, 0.05);
            border-radius: 4px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            div {
              margin-top: 4px;
              font-weight: 400;
              font-size: 12px;
              color: #606266;
              line-height: 18px;
            }
          }
          .one_shoot_add {
            cursor: pointer;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            width: 66px;
            height: 88px;
            background: #ffffff;
            border-radius: 2px;
            border: 1px dashed #d8d8d8;
            margin: 0 0px 8px 0;
            font-weight: 400;
            font-size: 12px;
            color: #909399;
            line-height: 18px;
          }
        }
      }
      .one_model {
        box-sizing: content-box;
        border-top: 1px solid #fff;
        min-height: 104px;
      }

      .td_model_add {
        cursor: pointer;
        width: 100%;
        height: 36px !important;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        font-weight: 400;
        font-size: 14px;
        color: #364fcd;
        line-height: 20px;
        img {
          width: 20px;
          height: 20px;
          object-fit: contain;
          display: flex;
          margin-right: 4px;
        }
      }
    }
  }
}
.td_model::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.icon-plus {
  margin-bottom: 8px;
  color: #606266;
  font-size: 18px;
  font-weight: 600;
}
.td_good {
  cursor: pointer;
  min-height: 204px !important;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  .no_good {
    cursor: pointer;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-weight: 400;
    font-size: 14px;
    color: #364fcd;
    line-height: 20px;
    img {
      width: 20px;
      height: 20px;
      display: flex;
      margin-right: 4px;
    }
  }
  .has_good {
    position: sticky;
    top: 8px;
    // position: relative;
    .has_cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: flex;
    }
    .no_cover {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-weight: 400;
      font-size: 12px;
      color: #909399;
      line-height: 18px;
      width: 160px;
      height: 160px;
      background: #ffffff;
      border: 1px dashed #d8d8d8;
    }
    .good_tag {
      height: 24px;
      overflow: hidden;
      position: absolute;
      left: 8px;
      top: 8px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      flex-wrap: wrap;
      .one_tag {
        margin: 0 8px 8px 0;
        background: rgba(0, 0, 0, 0.4);
        border-radius: 10px;
        font-weight: 400;
        font-size: 12px;
        color: #ffffff;
        line-height: 18px;
        padding: 1px 7px;
      }
    }
  }
  .good_top {
    width: 160px;
    height: 160px;
    border-radius: 2px;
    overflow: hidden;
    position: relative;
  }
  .good_bottom {
    width: 160px;
    padding: 0 5px;
    margin-top: 8px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    .good_name {
      width: calc(100% - 24px);
    }
    .good_edit_icon {
      cursor: pointer;
      width: 16px;
      height: 16px;
      object-fit: contain;
      display: flex;
      margin-left: 8px;
    }
  }
}
</style>
