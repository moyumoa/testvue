<template>
  <div
    v-loading="loading"
    class="choose_bgm"
    :class="props.classList.length > 0 ? [...props.classList] : ''"
  >
    <div class="page_top flex_c" :style="{ paddingBottom: pageData.enableBgm ? 0 : '12px' }">
      <div class="top_l flex_c mar_top_12">
        BGM
        <el-switch
          style="margin-left: 8px; margin-right: 24px"
          v-model="pageData.enableBgm"
          inline-prompt
          @change="switchChange"
        ></el-switch>
        <!-- 全选+删除 -->
        <div
          class="all_choose_box"
          v-if="getBgmConfig.mediaList && getBgmConfig.mediaList.length > 0"
        >
          <div class="xm_check_box_round" @click="setCheckFun">
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

          <div class="all_choose_del_btn" @click.stop="delMaterialFun">删除</div>
        </div>
      </div>
      <div class="top_r flex_c" v-if="pageData.enableBgm">
        <el-button type="primary" class="mar_top_12" @click="importFun">从原料库选择</el-button>
        <div class="voice_warp mar_top_12 flex_c" @click="changeShowVoice">
          <img
            src="https://tagvv-1256030678.file.myqcloud.com/20240401k0fsn.png"
            alt=""
            class="voice_icon"
          />
          {{ `${pageData.volume}%` }}
          <!-- 音量拖动 -->
          <div class="voice_darg flex_c" v-show="showVoice">
            <el-slider
              v-model="pageData.volume"
              size="small"
              :min="0"
              :max="100"
              :show-tooltip="false"
              @change="volumeChange"
            />
          </div>
        </div>
        <span class="mar_top_12" style="margin-right: 24px">
          淡入时长：
          <el-select style="width: 80px" v-model="pageData.fadeInTime" @change="timeChange">
            <el-option
              v-for="(rItem, rIndex) in volumeList"
              :label="rItem.label || '-'"
              :value="rItem.value"
              :key="rIndex"
            />
          </el-select>
        </span>
        <span class="mar_top_12">
          淡出时长：
          <el-select style="width: 80px" v-model="pageData.fadeOutTime" @change="timeChange">
            <el-option
              v-for="(rItem, rIndex) in volumeList"
              :label="rItem.label || '-'"
              :value="rItem.value"
              :key="rIndex"
            />
          </el-select>
        </span>
      </div>
    </div>

    <div
      v-if="pageData.enableBgm"
      class="material_warp"
      :class="{ material_warp_padding_bottom: getBgmConfig.mediaListTotal > 20 }"
    >
      <div
        class="material_item_warp"
        v-if="getBgmConfig && getBgmConfig.mediaList && getBgmConfig.mediaList.length > 0"
      >
        <materialItem
          :mediaList="getBgmConfig.mediaList"
          :checkList="checkList"
          :materialType="'audio'"
          :showDel="true"
          @preview="previewMaterial"
          @onCheckChangeFun="onCheckChangeFun"
        />
      </div>
      <!-- 查看全部 -->
      <div class="check_all_warp" v-if="getBgmConfig.mediaListTotal > 20" @click="checkMore(item)">
        <div class="check_all">
          {{ `查看全部（共${getBgmConfig.mediaListTotal || 0}个）` }}
          <img
            src="https://tagvv-1256030678.file.myqcloud.com/20240411d038e.png"
            alt=""
            class="more_icon"
          />
        </div>
      </div>
    </div>

    <selectMaterial
      v-if="selectMaterialInfo.show"
      :info="selectMaterialInfo"
      dialogTitle="导入BGM"
      :subtitle="'时长超过所有分镜之和的BGM将自动截取前段，时长不足的将自动循环'"
      :materialType="3"
      :isBgm="true"
      :bgmOtherParams="pageData"
      :materialTypeList="[3]"
      :origin="props.origin"
      :pipelineId="props.pipelineId"
      @updateSelectInfo="updateSelectInfo"
    />
    <!-- 查看更多 -->
    <materialMore
      v-if="materialDialog.show"
      :materialDialog="materialDialog"
      :origin="props.origin"
      @preview="previewMaterial"
      @resetCheckFun="resetCheckFun"
    />
  </div>
</template>

<script setup>
import { ElMessageBox } from 'element-plus'
import selectMaterial from '../material/select_material_dialog.vue'
import materialItem from '../../create_by_script/components/storyboard_material_item.vue'
import materialMore from '../../create_by_script/components/storyboard_material_dialog.vue'
import { removeMaterial } from '@/api/sumvideo/create_by_script.js'
import { foolishRemoveMaterial } from '@/api/sumvideo/create_by_foolish.js'
import { throttle, isNotEmpty } from '@/utils/tools.js'
const props = defineProps({
  pipelineId: {
    type: Number,
    default: null
  },
  // 回显的配置信息
  extraConfig: {
    type: Object,
    default: () => {
      return {}
    }
  },
  classList: {
    type: Array,
    default: () => {
      return []
    }
  },
  origin: {
    type: String,
    default: 'scriptStep'
  }
})

const showVoice = ref(false)
const pageData = reactive({
  enableBgm: false, // 是否打开
  volume: 20, // 音量-百分比 20% 传 20
  fadeInTime: 1, // 选择 的淡入时长
  fadeOutTime: 1, // 淡出时长
  mediaList: [], // 选择的音频列表
  isSelectAll: false, // 是否全选
  excludeBgmId: [] // 要排除的bgm ids
})
const emits = defineEmits(['updateBgm', 'updateList', 'preview', 'update:bgmLoading'])

const volumeList = [
  {
    label: '0.5s',
    value: 0.5
  },
  {
    label: '1s',
    value: 1
  },
  {
    label: '1.5s',
    value: 1.5
  },
  {
    label: '2s',
    value: 2
  },
  {
    label: '2.5s',
    value: 2.5
  },
  {
    label: '3s',
    value: 3
  }
]
const selectMaterialInfo = reactive({
  show: false
})
// 配置
const getBgmConfig = computed(() => {
  // console.log('props.extraConfig.bgmConfig', props.extraConfig.bgmConfig)
  return isNotEmpty(props.extraConfig?.bgmConfig || {})
    ? props.extraConfig.bgmConfig
    : { mediaListTotal: 0, mediaList: [] }
})

// 更多原料
const materialDialog = reactive({
  materialType: 'audio',
  isBgm: true, // 是否是BGM
  pipelineId: null, // 流水线ID
  show: false
})

watch(
  () => props.extraConfig,
  val => {
    console.log('配置发生变化', val)
    if (isNotEmpty(val)) {
      const { bgmConfig } = val
      pageData.enableBgm = bgmConfig?.enableBgm
      pageData.volume = bgmConfig?.volume || 20
      pageData.fadeInTime = bgmConfig?.fadeInTime || 1
      pageData.fadeOutTime = bgmConfig?.fadeOutTime || 1
      pageData.mediaList = bgmConfig?.mediaList || [] // 选择的音频列表
      const bgms = (bgmConfig?.bgms || []).map(x => {
        return {
          ...x,
          id: x.id.toString()
        }
      })
      pageData.bgms = bgms // 选择的音频列表
      // pageData.queryParam = bgmConfig.queryParam || {}
      // pageData.excludeBgmId = bgmConfig.excludeBgmId || []
      // pageData.isSelectAll = bgmConfig.isSelectAll || false
    } else {
      console.log('BGM的配置是空的')
    }
  },
  {
    deep: true,
    immediate: true
  }
)

// // 删除BGM
// function delItem(item) {
//   console.log('删除', item)
//   removeMaterial({
//     isPublicBgm: true,
//     pipelineId: props.pipelineId,
//     scriptReplaceId: 0,
//     tagvvMediaIds: item?.tagvvMediaId ? [item.tagvvMediaId] : null
//   }).then(res => {
//     if (res.code === 0) {
//       emits('updateList')
//     }
//   })
// }

// 查看分镜的更多原料
const checkMore = throttle(function (item) {
  materialDialog.pipelineId = props.pipelineId
  console.log('查看更多', item, materialDialog)

  materialDialog.show = true
}, 500)

// 预览
function previewMaterial(info) {
  console.log('预览', info)
  emits('preview', info)
}
function switchChange() {
  emits('updateBgm', pageData, 'switch')
}
// 音量变化
function volumeChange() {
  emits('updateBgm', pageData, 'volume')
}
// 淡入/淡出时长
function timeChange() {
  emits('updateBgm', pageData, 'voice')
}

const changeShowVoice = throttle(function () {
  showVoice.value = !showVoice.value
}, 500)

const importFun = throttle(function () {
  selectMaterialInfo.show = true
})
function updateSelectInfo() {
  console.log('BGM导入成功，重新获取页面信息')
  resetCheckFun()
}
const checkStatus = ref(null) // 全选状态 Null 未选中 1半选 2全选
const checkList = ref([]) // 选中的列表
const unCheckList = ref([]) // 取消选中的列表
const checkTotal = ref(0) // 选中的数量
const isAllCheck = ref(false) // 是否点击过全选
// 清空选中状态
function resetCheckFun() {
  loading.value = true
  checkStatus.value = null
  checkList.value = []
  unCheckList.value = []
  checkTotal.value = 0
  isAllCheck.value = false
  emits('updateList')
}
// 单个分镜的单个原料选中/非选中状态修改
function onCheckChangeFun(e, item) {
  console.log('dange ', e, item)
  const index = checkList.value.findIndex(x => x === e.tagvvMediaId || x === e.id)
  const index2 = unCheckList.value.findIndex(x => x === e.tagvvMediaId || x === e.id)
  if (index > -1) {
    //  当前在选中列表里面，那就从选中列表删除 并在取消选中列表里添加
    checkTotal.value = checkTotal.value - 1
    checkList.value.splice(index, 1)
    unCheckList.value.push(e.tagvvMediaId || e.id)
  } else {
    // 当前不在选中列表里，那就从取消选中列表里删除，并在选中列表里添加
    checkTotal.value = checkTotal.value + 1
    checkList.value.push(e.tagvvMediaId || e.id)
    unCheckList.value.splice(index2, 1)
  }
  nextTick(() => {
    if (checkTotal.value === getBgmConfig.value.mediaListTotal) {
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
const setCheckFun = throttle(function () {
  console.log('批量删除', getBgmConfig.value, checkStatus.value)

  const ids = getBgmConfig.value.mediaList.map(x => x.tagvvMediaId || x.id)
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
    checkTotal.value = getBgmConfig.value.mediaListTotal
    isAllCheck.value = true
  }
}, 300)
const message = inject('$message')
const loading = ref(false)
const isClickDel = ref(false)
// 批量删除
const delMaterialFun = throttle(function () {
  console.log('del', checkStatus.value)
  if (checkStatus.value === null) {
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
      // disPageAction.value = true

      console.log('批量删除', checkStatus.value)
      const params = { isPublicBgm: true, pipelineId: props.pipelineId, scriptReplaceId: 0 }
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
            isClickDel.value = true
            resetCheckFun()
            // disPageAction.value = false
          } else {
            loading.value = false
            // disPageAction.value = false
          }
        })
        .catch(() => {
          loading.value = false
          // disPageAction.value = false
        })
    })
    .catch(() => {})
}, 500)

// 清空分镜的Loading
function clearLoading() {
  console.log('clearLoading')
  loading.value = false
  if (isClickDel.value) {
    message.success('删除成功')
    isClickDel.value = false
  }
}
defineExpose({
  clearLoading
})

watch(
  () => loading.value,
  val => {
    emits('update:bgmLoading', val)
  }
)
</script>

<style lang="scss" scoped>
.flex_c {
  display: flex;
  align-items: center;
}
.mar_top_12 {
  margin-top: 12px;
}
.choose_bgm {
  background: linear-gradient(180deg, #e0eaff 0%, #f4f9ff 100%);
  border-radius: 4px;
  // height: max-content;
  .page_top {
    justify-content: space-between;
    font-family: PingFangSC, PingFang SC;
    color: #364fcd;
    line-height: 20px;
    font-size: 16px;
    font-weight: 400;
    padding: 0 16px;
    white-space: nowrap;
    flex-wrap: wrap;
    width: 100%;
    .top_l {
      font-weight: 500;
      width: 100%;
      .all_choose_box {
        flex: 1;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        cursor: pointer;
        .xm_check_box_round .check_box {
          margin: 0;
        }
        .xm_check_box_round {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
        }
        .select_all_text {
          font-weight: 400;
          font-size: 14px;
          color: #606266;
          line-height: 20px;
          margin-left: 8px;
        }
        .all_choose_del_btn {
          cursor: pointer;
          font-weight: 400;
          font-size: 14px;
          color: #364fcd;
          line-height: 20px;
          margin-left: 16px;
        }
      }
    }
    .top_r {
      font-size: 14px;
      flex-wrap: wrap;
      .voice_warp {
        width: 66px;
        height: 20px;
        margin-right: 24px;
        margin-left: 24px;
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        font-size: 14px;
        color: #303133;
        position: relative;
        cursor: pointer;

        .voice_icon {
          width: 24px;
          height: 24px;
          min-width: 24px;
          margin-right: 4px;
          cursor: pointer;
        }
        .voice_darg {
          position: absolute;
          left: 0;
          top: -36px;
          width: 268px;
          height: 28px;
          background: #ffffff;
          box-shadow: 0px 0px 8px 0px rgba(103, 103, 103, 0.3);
          border-radius: 4px;
          padding: 0 8px;
          :deep(.el-slider__button) {
            width: 14px;
            height: 14px;
          }
        }
      }
    }
  }
  .material_warp {
    margin-top: 20px;
    max-height: 324px;
    overflow-y: auto;
    margin-left: 12px;
  }
  .material_warp_padding_bottom {
    padding-bottom: 12px;
  }
  .material_item_warp {
    display: flex;
    flex-wrap: wrap;
  }

  .check_all_warp {
    display: flex;
    align-items: center;
    justify-content: center;
    .check_all {
      cursor: pointer;
      display: flex;
      align-items: center;
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 14px;
      color: #364fcd;
      line-height: 20px;
      .more_icon {
        width: 14px;
        height: 14px;
        margin-left: 4px;
        object-fit: cover;
      }
    }
  }
}
</style>
