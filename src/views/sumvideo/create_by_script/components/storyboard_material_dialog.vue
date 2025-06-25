<template>
  <el-dialog
    :close-on-click-modal="false"
    ref="dialog"
    custom-class="rule_setting_dialog hide_footer_line"
    destroy-on-close
    v-model="show"
    title="全部原料"
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
              <div class="warp">
                <materialItem
                  :showDel="true"
                  :mediaList="listData"
                  :checkList="checkList"
                  :materialType="materialType"
                  :audioClass="['audio_item_gray']"
                  @preview="previewMaterial"
                  @onCheckChangeFun="onCheckChangeFun"
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

    <!-- <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </span>
    </template> -->
    <template #footer>
      <div class="footer_box">
        <div class="footer-left">
          <div class="xm_check_box_round" @click="setCheckFun(item)">
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
          <el-button :disabled="loading" type="primary" @click="delMaterialFun()">删除</el-button>
        </span>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import { ElMessageBox } from 'element-plus'
import { throttle } from '@/utils/tools.js'
import { listImportMaterialByScript, removeMaterial } from '@/api/sumvideo/create_by_script.js'
import materialItem from './storyboard_material_item.vue'
import { foolishRemoveMaterial } from '@/api/sumvideo/create_by_foolish.js'

const props = defineProps({
  materialDialog: {
    type: Object,
    default: () => {
      return {
        materialType: 'video', // 预览类型 video视频/图片 audio音频/bgm
        isBgm: false, // 是否是获取bgm原料
        templateId: null, // 模板ID/分镜id
        pipelineId: null, // 流水线ID
        show: true
      }
    }
  },
  origin: String
})
const { show, templateId, pipelineId, isBgm, materialType } = toRefs(props.materialDialog)
const emits = defineEmits(['preview', 'resetCheckFun'])
const dialog = ref(null)
const loading = ref(true)
const listData = ref([]) // 列表
const page = reactive({
  index: 1,
  size: 25,
  total: 0
})
const idDel = ref(false)
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
    const params = {
      pageNo: page.index,
      pageSize: page.size,
      pipelineId: pipelineId.value
    }
    if (templateId && templateId.value) {
      params.scriptReplaceId = templateId.value
    }
    if (isBgm && isBgm.value) {
      params.isBgm = true
    }
    listImportMaterialByScript(params)
      .then(res => {
        console.log('获取列表返回', res)
        if (res.code === 0) {
          const list = res.data?.records || []
          if (page.index === 1) {
            listData.value = list
            page.total = res.data?.total || 0
          } else {
            listData.value = listData.value.concat(list)
            if (isAllCheck.value) {
              const ids = list.map(x => x.tagvvMediaId || x.id)
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

// 预览
function previewMaterial(info) {
  if (loading.value) return
  emits('preview', info)
}

onMounted(() => {
  resetList()
})

function beforeCloseFun(done) {
  console.log('xx', idDel.value)
  if (idDel.value) {
    emits('resetCheckFun')
  }
  done()
}

// function closeDialog() {
//   dialog.value.handleClose()
// }

// function handleConfirm() {
//   dialog.value.handleClose()
// }

// 单个分镜的单个原料选中/非选中状态修改
function onCheckChangeFun(item) {
  console.log('dange ', item)

  const index = checkList.value.findIndex(x => x === item.tagvvMediaId || x === item.id)
  const index2 = unCheckList.value.findIndex(x => x === item.tagvvMediaId || x === item.id)
  if (index > -1) {
    //  当前在选中列表里面，那就从选中列表删除 并在取消选中列表里添加
    checkTotal.value = checkTotal.value - 1
    checkList.value.splice(index, 1)
    unCheckList.value.push(item.tagvvMediaId || item.id)
  } else {
    // 当前不在选中列表里，那就从取消选中列表里删除，并在选中列表里添加
    checkTotal.value = checkTotal.value + 1
    checkList.value.push(item.tagvvMediaId || item.id)
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
const setCheckFun = throttle(function (item) {
  console.log('批量删除', checkStatus.value)
  if (loading.value) return
  const ids = listData.value.map(x => x.tagvvMediaId || x.id)

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
const delMaterialFun = throttle(function () {
  if (
    checkStatus.value === null ||
    (checkStatus.value !== null && checkList.value && checkList.value.length === 0)
  ) {
    message.warning('请先选择原料')
    return
  }
  ElMessageBox.confirm(
    `${
      props.origin && props.origin === 'foolishStepBGM' ? '从匹配' : '从该分镜所匹配'
    }的原料中删除所选原料？<br/><span style="line-height: 30px;font-size:13px;color:#606266">注：不会刪除原料库中对应的原料</span>`,
    '刪除原料',
    {
      closeOnClickModal: false,
      confirmButtonText: '刪除',
      cancelButtonText: '取消',
      type: '',
      customClass: 'xm_dialog_messageBox',
      dangerouslyUseHTMLString: true
    }
  )
    .then(() => {
      loading.value = true

      console.log('批量删除', listData.value, checkStatus.value)
      const params = {
        pipelineId: pipelineId.value
      }
      if (templateId && templateId.value) {
        params.scriptReplaceId = templateId.value
      }
      if (materialType.value === 'audio') {
        params.isPublicBgm = true
        params.scriptReplaceId = 0
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
          if (props.origin && props.origin === 'foolishStepBGM') {
            params.resourcesIds = checkList.value
          } else {
            params.tagvvMediaIds = checkList.value
          }
        }
      }
      const promise =
        props.origin && props.origin === 'foolishStepBGM'
          ? foolishRemoveMaterial(params)
          : removeMaterial(params)
      promise
        .then(res => {
          if (res.code === 0) {
            idDel.value = true
            clearFun('delSuccess')
            resetList('del')
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
    height: max-content;
    width: 100%;
    .warp {
      display: flex;
      flex-wrap: wrap;
      padding-left: 16px;
      :deep(.material_item) {
        width: 118px;
        height: 158px;
      }
      :deep(.audio_item_gray) {
        background: rgba(0, 0, 0, 0.1);
        width: 196px;
      }
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
}
</style>
