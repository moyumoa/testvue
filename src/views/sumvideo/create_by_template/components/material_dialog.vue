<template>
  <el-dialog
    :close-on-click-modal="false"
    ref="dialog"
    custom-class="rule_setting_dialog hide_footer_line"
    destroy-on-close
    v-model="show"
    :title="dialogTitle || '全部原料'"
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
              <div class="material_box">
                <!-- 视频、图片原料 -->
                <videoOrImgMaterial
                  :showMarkICON="showMarkICON"
                  :showXMICON="showXMICON"
                  :origin="batchDel || origin == 'createByTemplate' ? 'createByTemplate' : origin"
                  v-if="materialType === 1 || materialType === 8"
                  :mediaType="materialType"
                  :chooseList="listData"
                  :checkList="checkList"
                  :creativeReplaceId="creativeReplaceId"
                  :templateId="templateId"
                  :pipelineId="pipelineId"
                  @previewFun="previewFun"
                  @delFun="delFun"
                  @onCheckChangeFun="onCheckChangeFun"
                  :hideName="hideName"
                />
                <!-- 音频原料 BGM和时长小于2s的非BGM 只能导入音频  其余为文本+AI朗读 -->
                <BGMMaterial
                  :origin="origin"
                  v-if="materialType === 2"
                  :mediaType="materialType"
                  :chooseList="listData"
                  :checkList="checkList"
                  :creativeReplaceId="creativeReplaceId"
                  :templateId="templateId"
                  :pipelineId="pipelineId"
                  @previewFun="previewFun"
                  @delFun="delFun"
                  @onCheckChangeFun="onCheckChangeFun"
                />
                <!-- 文本原料 -->
                <textMaterial
                  :origin="origin"
                  v-if="materialType === 3"
                  :chooseList="listData"
                  :checkList="checkList"
                  :creativeReplaceId="creativeReplaceId"
                  :templateId="templateId"
                  :pipelineId="pipelineId"
                  @delFun="delFun"
                  @onCheckChangeFun="onCheckChangeFun"
                />
                <!-- 场景图 -->
                <sceneDOM
                  :chooseList="listData"
                  :checkList="checkList"
                  v-if="materialType === 16"
                  @updateSelect="onCheckChangeFun"
                  :hideName="hideName"
                />
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
          <el-button :disabled="loading" type="primary" @click="delMaterialFun(creativeReplaceId)">
            删除
          </el-button>
        </span>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import sceneDOM from '@/views/sumvideo/components/material/scene_material.vue'
import { ElMessageBox } from 'element-plus'
import textMaterial from './text_material.vue'
import BGMMaterial from './BGM_material.vue'
import videoOrImgMaterial from './video_or_image_material.vue'
import { throttle, isNotEmpty, isEmpty } from '@/utils/tools.js'
import { listImportMaterial, removeMaterial } from '@/api/sumvideo/create_by_template.js'
import { list } from '@/api/content_center/material_library.js'
import { removeImageCreativeMedia } from '@/api/sumvideo/template_imgText'
import { pageMannequinShoot, deleteShoot } from '@/api/sumvideo/product_shooting_library'
// import { delFun as delMaterialFun } from '@/views/sumvideo/creative_mould/components/template/js/choose_material.js'
const props = defineProps({
  delMessageBox: Object, // 批量删除的二次弹窗
  dialogTitle: String, // 弹窗标题
  origin: {
    type: String,
    default: ''
  }, //  templateEdit 模板分镜过来的 createByTemplate 模板式生成过来的 图文模板 templateImgText 实拍库 productShoot
  info: Object,
  isDynamicFilter: Boolean, // 模板分镜过来的 要区分是条件匹配还是精确匹配
  materialText: String, // 原料名称
  materialIds: Array, // 模板ID列表 目前图文模板的查看全部，是根据各自的id列表来查询 所以要传过来
  materialDialog: {
    type: Object,
    default: () => {
      return {
        materialType: null, // 原料类型
        creativeReplaceId: null, // 分镜替换ID
        templateId: null, // 模板ID
        pipelineId: null, // 流水线ID
        resourceType: null, //  图文模板需要的
        creativeId: null, // 图文模板需要的
        show: true,
        filter: {} // 查询条件 模板分镜规则过来才会有
      }
    }
  },
  extraParams: Object, // 不同页面查询列表需要携带的固定参数
  hideName: Boolean, // 是否隐藏文件名
  batchDel: Boolean, // 是否批量删除
  showMarkICON: Boolean, // 是否要显示左上角的标识图片
  showXMICON: Boolean // 是否要显示左上角的云资源图片
})
const {
  delMessageBox,
  dialogTitle,
  origin,
  isDynamicFilter,
  extraParams,
  hideName,
  batchDel,
  showMarkICON,
  showXMICON
} = toRefs(props)
const { show, materialType, creativeReplaceId, templateId, pipelineId, filter } = toRefs(
  props.materialDialog
)
const emits = defineEmits(['updateChooseList', 'previewFun', 'updateMaterialFilter'])
const dialog = ref(null)
const loading = ref(true)
const listData = ref([])
const materialText = ref('') //  要删除的名称 默认原料
const idDel = ref(false) // 是否触发了删除 触发后需要将最新的列表和数量传递给父
const page = reactive({
  index: 1,
  size: 20,
  total: 0
})
const materialIds = ref([]) // 图文模板获取数据列表需要的id列表
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
    if (origin.value === 'productShoot') {
      const params = JSON.parse(JSON.stringify(extraParams.value))
      params.pageNo = page.index
      params.pageSize = page.size
      pageMannequinShoot(params)
        .then(res => {
          if (res.code === 0) {
            const list2 = res.data?.records || []
            if (page.index === 1) {
              listData.value = list2
              page.total = res.data?.total || 0
            } else {
              listData.value = listData.value.concat(list2)
              if (
                ['createByTemplate', 'templateImgText'].includes(origin.value) &&
                isAllCheck.value
              ) {
                const ids = list2.map(x => x.tagvvMediaId || x.id || x.materialId)
                checkList.value = checkList.value.concat(ids)
              }
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

      return
    }
    if (origin.value === 'templateEdit') {
      // 如果是精确匹配，但选中的ID为空，就不请求接口了，直接置为空
      if (
        !isDynamicFilter.value &&
        !(filter.value.includeIds && filter.value.includeIds.length > 0)
      ) {
        listData.value = []
        page.total = 0
        loading.value = false
        resolve()
        return
      }
    }
    const param = origin.value === 'templateEdit' ? JSON.parse(JSON.stringify(filter.value)) : {}
    param.pageNo = page.index
    param.pageSize = page.size
    param.isDelete = 2 // 从0改成2的原因：后端和产品沟通说图文模板中删除的实拍图、场景图已经选择了就要保留
    param.subSource = [1, 0]
    // 如果入参需要传包含的ID，就这么传
    if (isNotEmpty(materialIds.value)) {
      param.includeIds = materialIds.value
      param.subSource = []
    }
    const listPromise =
      origin.value === 'templateImgText' || origin.value === 'templateEdit'
        ? list(param)
        : listImportMaterial({
            pageNo: page.index,
            pageSize: page.size,
            pipelineId: pipelineId.value,
            scriptId: templateId.value,
            scriptReplaceId: creativeReplaceId.value
          })
    listPromise
      .then(res => {
        if (res.code === 0) {
          const list2 = res.data?.records || []
          if (page.index === 1) {
            listData.value = list2
            page.total = res.data?.total || 0
          } else {
            listData.value = listData.value.concat(list2)
            if (
              ['createByTemplate', 'templateImgText'].includes(origin.value) &&
              isAllCheck.value
            ) {
              const ids = list2.map(x => x.tagvvMediaId || x.id || x.materialId)
              checkList.value = checkList.value.concat(ids)
            }
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
  materialText.value = props.materialText
    ? props.materialText
    : origin.value === 'productShoot'
    ? '实拍图'
    : '原料'
  // 图文模板的查看全部，是根据各自的id列表来查询  // 所有图文模板需要存id列表
  if (props.materialIds && props.materialIds.length > 0) {
    materialIds.value = JSON.parse(JSON.stringify(props.materialIds))
  }
  resetList()
})
function delFun(e) {
  if (origin.value === 'templateEdit') {
    // 模板分镜过来的删除：根据info.isDynamicFilter判断 如果是条件匹配[动态筛选]，那就是往excludeIds里加，否则就是从creationIds里删。
    // delMaterialFun()
    if (isDynamicFilter.value) {
      // 条件匹配
      const index3 = (filter.value.excludeIds || []).findIndex(x => x === e)
      if (index3 === -1) {
        if (filter.value.excludeIds && filter.value.excludeIds.length > 0) {
          filter.value.excludeIds.push(e)
        } else {
          filter.value.excludeIds = [e]
        }
      }
    } else {
      // 精确匹配
      const index2 = filter.value.includeIds.findIndex(x => x === e)
      if (index2 > -1) {
        filter.value.includeIds.splice(index2, 1)
      }
    }
  }
  resetList('del')
  idDel.value = true
  // page.total = page.total - 1
}
function previewFun(title, url, type, cover) {
  emits('previewFun', title, url, type, cover)
}
function beforeCloseFun(done) {
  if (idDel.value) {
    if (origin.value === 'templateImgText') {
      emits('updateChooseList', listData.value.slice(0, 20), page.total, materialIds.value)
      done()
      return
    }
    if (origin.value === 'templateEdit') {
      // 如果是模板分镜规则设置过来的，需要把删除的ID返回，条件匹配时返回删除的ID列表 精确匹配是返回删除后的ID列表
      const ids = isDynamicFilter.value
        ? filter.value.excludeIds || []
        : filter.value.includeIds || []
      emits('updateMaterialFilter', ids)
    }
    // 如果当前列表的总数小于20 就去请求接口获取最新的20条数据 因为我们初始化只返回20条数据
    // if (listData.value.length < 20) {
    //   loading.value = true
    //   page.index = 1
    //   getList().then(() => {
    //     emits('updateChooseList', listData.value, page.total)
    //     done()
    //   })
    // } else {
    emits('updateChooseList', listData.value.slice(0, 20), page.total)
    done()
    // }
  } else {
    done()
  }
}

// function closeDialog() {
//   emits('updateChooseList', listData.value, page.total)
//   dialog.value.handleClose()
// }

// function handleConfirm() {
//   emits('updateChooseList', listData.value, page.total)
//   dialog.value.handleClose()
// }

// 单个分镜的单个原料选中/非选中状态修改
function onCheckChangeFun(item, creativeReplaceId) {
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
    message.warning(`请先选择${materialText.value || '原料'}`)
    return
  }
  ElMessageBox.confirm(
    delMessageBox.value?.content ||
      `从该分镜所匹配的${materialText.value || '原料'}中删除所选${
        materialText.value || '原料'
      }？<br/><span style="line-height: 30px;font-size:13px;color:#606266">注：不会刪除${
        materialText.value || '原料'
      }库中对应的${materialText.value || '原料'}</span>`,
    delMessageBox.value?.title || `刪除${materialText.value || '原料'}`,
    {
      closeOnClickModal: false,
      confirmButtonText: delMessageBox.value?.confirmButtonText || '刪除',
      cancelButtonText: '取消',
      type: '',
      customClass: 'xm_dialog_messageBox',
      dangerouslyUseHTMLString: true
    }
  )
    .then(() => {
      loading.value = true

      console.log('批量删除', creativeReplaceId, listData.value, checkStatus.value)
      if (origin.value === 'productShoot') {
        productShootDelFun()
        return
      }
      if (origin.value === 'templateImgText') {
        imgTextDelFun()
        return
      }
      const params = {
        pipelineId: pipelineId.value,
        scriptId: templateId.value,
        scriptReplaceId: creativeReplaceId
      }
      // 全选
      if (checkStatus.value === 2) {
        params.isSelectAll = true
      } else {
        // 历史点击过全选，那就传排除的，否则就是选中的
        if (isAllCheck.value) {
          params.isSelectAll = true
          params.excludeResourceIds = unCheckList.value
        } else {
          params.isSelectAll = false
          params.tagvvMediaIds = checkList.value
        }
      }
      removeMaterial(params)
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
    })
    .catch(() => {})
}, 500)

// 图文模板的场景图等批量删除
function imgTextDelFun() {
  const params = {
    creativeId: props.materialDialog.creativeId,
    resourceType: props.materialDialog.resourceType
  }
  if (checkStatus.value === 2) {
    params.isSelectAll = true
  } else {
    // 历史点击过全选，那就传排除的，否则就是选中的
    if (isAllCheck.value) {
      params.isSelectAll = true
      params.excludeResourceIds = unCheckList.value
    } else {
      params.isSelectAll = false
      params.resourceIds = checkList.value
    }
  }
  removeImageCreativeMedia(params)
    .then(res => {
      if (res.code === 0) {
        materialIds.value = res.data || []
        clearFun('delSuccess')
        if (isEmpty(res.data || [])) {
          page.total = 0
          loading.value = false
          listData.value = []
          message.success('刪除成功')
          idDel.value = true
        } else {
          delFun([])
        }
      } else {
        loading.value = false
      }
    })
    .catch(() => {
      loading.value = false
    })
}
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
        // if (isEmpty(res.data || [])) {
        //   page.total = 0
        //   loading.value = false
        //   listData.value = []
        //   message.success('刪除成功')
        //   idDel.value = true
        // } else {
        //   delFun([])
        // }
        delFun([])
      } else {
        loading.value = false
      }
    })
    .catch(() => {
      loading.value = false
    })
}
</script>
<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.dialog_parent {
  padding: 16px 0 4px;
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
  :deep(.one_text) {
    padding-right: 12px;
    .text_text_box {
      background: #f7f8fa !important;
    }
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
  .dialog-footer {
  }
}
</style>
