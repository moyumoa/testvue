<template>
  <div :style="disPageAction ? 'pointer-events: none' : ''">
    <div class="story_item" v-for="(item, index) in ruleForm.list" :key="index">
      <!-- 2024/7/27修改：阿里云变动，原来是相邻的下一个，现在需要改为相邻的上一个 -->
      <!-- <div class="transition_info" v-if="index !== 0">
        <img
          src="https://tagvv-1256030678.file.myqcloud.com/20240329lzat0.png"
          alt=""
          class="transition_icon"
          v-if="item.transition.enable"
        />

        <img
          src="https://tagvv-1256030678.file.myqcloud.com/20240329dlon6.png"
          alt=""
          class="transition_icon"
          v-if="!item.transition.enable"
        />
        <template v-if="item.transition.enable">
          <span class="span">
            转场：
            <el-select
              style="width: 120px"
              v-model="item.transition.subtype"
              @change="subtypeChange($event, item)"
            >
              <el-option
                v-for="(rItem, rIndex) in transitionList"
                :label="rItem.name || '-'"
                :value="rItem.subType"
                :key="rIndex"
              />
            </el-select>
          </span>
          <span class="span" style="margin-left: 24px">
            时长：
            <el-select
              style="width: 120px"
              v-model="item.transition.duration"
              @change="durationChang($event, item)"
            >
              <el-option
                v-for="(rItem, rIndex) in durationList"
                :label="rItem.label || '-'"
                :value="rItem.value"
                :key="rIndex"
              />
            </el-select>
          </span>
        </template>
        <el-switch
          style="margin-left: 16px"
          v-model="item.transition.enable"
          inline-prompt
          :width="44"
          @change="transitionChange($event, item)"
        ></el-switch>
      </div> -->
      <div
        v-loading="loadingClipId == item.id"
        class="item_info"
        :class="[
          props.storyErrIds.includes(item.id) ? 'item_info_err' : '',
          `item_info_err_${item.id}`
        ]"
      >
        <div class="info_top">
          <span class="name">{{ `分镜${index + 1}` }}</span>
          <span class="desc line-hidden1" :title="item.clipDesc">
            场景描述：{{ item.clipDesc || '-' }}
          </span>
        </div>

        <div class="info_voiceover">{{ item.clipAside || '-' }}</div>

        <div class="setting_warp">
          <span class="span">
            原料声音：
            <img
              src="https://tagvv-1256030678.file.myqcloud.com/202403290kg1x.png"
              alt=""
              class="voice_icon"
              v-show="item.isEnableMaterialSound === 1 ? false : true"
              @click="changeVoice(item, false)"
            />
            <img
              src="https://tagvv-1256030678.file.myqcloud.com/20240329cunn9.png"
              alt=""
              class="voice_icon"
              @click="changeVoice(item, true)"
              v-show="item.isEnableMaterialSound === 1 ? true : false"
            />
          </span>
          <span class="span">
            原料比例：
            <el-select
              style="width: 120px"
              v-model="item.cropType"
              @change="cropTypeChange($event, item)"
            >
              <el-option
                v-for="(rItem, rIndex) in cropTypeList"
                :label="rItem.label || '-'"
                :value="rItem.value"
                :key="rIndex"
              />
            </el-select>
          </span>
          <span class="span">
            该分镜预计时长
            <span style="color: #364fcd; margin-left: 2px; margin-right: 2px">
              <!-- getUseTime(item, 'min') === getUseTime(item, 'max')
                  ? getUseTime(item, 'min')
                  : `${getUseTime(item, 'min')}-${getUseTime(item, 'max')}` -->
              {{ `${getUseTime(item, 'min')}-${getUseTime(item, 'max')}` }}
            </span>
            s，长原料处理方式：
            <el-select
              :disabled="disPageAction && loadingClipId == item.id"
              style="width: 120px"
              v-model="item.replaceModel"
              @focus="nowChooseModal = item.replaceModel"
              @change="replaceModelChange($event, item)"
            >
              <el-option
                v-for="(lItem, lIndex) in replaceModelList"
                :label="lItem.label || '-'"
                :value="lItem.value"
                :key="lIndex"
              >
                <div class="xm_flex_center">
                  {{ lItem.label || '-' }}
                  <el-tooltip class="item" effect="dark" placement="top">
                    <template #content>
                      <div class="tooltip_wrap">{{ lItem.tip || '--' }}</div>
                    </template>
                    <div class="xm_tooltipOfRight1"></div>
                  </el-tooltip>
                </div>
              </el-option>
            </el-select>
          </span>
          <div class="select_warp">
            <!-- 全选+删除 -->
            <div class="all_choose_box" v-if="item.mediaList && item.mediaList.length > 0">
              <div class="xm_check_box_round" @click="setCheckFun(item)">
                <div
                  :class="[
                    'check_box',
                    item.checkStatus === 1
                      ? 'check_box_half_choose'
                      : item.checkStatus === 2
                      ? 'check_box_active'
                      : ''
                  ]"
                ></div>
                <div class="select_all_text">全选</div>
              </div>

              <div class="all_choose_del_btn" @click.stop="delMaterialFun(item)">删除</div>
            </div>
            <!-- 匹配原料 -->
            <el-dropdown popper-class="xm_dropDown">
              <el-button type="primary">
                匹配原料
                <el-icon class="el-icon--right">
                  <i-arrow-down />
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="conditionMatch(item, index)">条件匹配</el-dropdown-item>
                  <el-dropdown-item @click="accurateMatch(item, index)">精确匹配</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <div class="material_warp">
          <div class="material_item_warp" v-if="item.mediaList && item.mediaList.length > 0">
            <materialItem
              :scriptId="item.id"
              :mediaList="item.mediaList"
              :checkList="item.checkList"
              :materialType="'video'"
              :showDel="true"
              @del="delOne"
              @preview="previewMaterial"
              @onCheckChangeFun="onCheckChangeFun($event, item)"
            />
          </div>
          <!-- 查看全部 -->
          <div class="check_all_warp" v-if="item.mediaListTotal > 20" @click="checkMore(item)">
            <div class="check_all">
              {{ `查看全部（共${item.mediaListTotal || 0}个）` }}
              <img
                src="https://tagvv-1256030678.file.myqcloud.com/20240411d038e.png"
                alt=""
                class="more_icon"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="transition_info" v-if="index < (ruleForm.list && ruleForm.list.length - 1)">
        <!-- @click="transitionChange(item, 0)" -->
        <img
          src="https://tagvv-1256030678.file.myqcloud.com/20240329lzat0.png"
          alt=""
          class="transition_icon"
          v-if="item.transition.enable"
        />
        <!-- @click="transitionChange(item, 1)" -->
        <img
          src="https://tagvv-1256030678.file.myqcloud.com/20240329dlon6.png"
          alt=""
          class="transition_icon"
          v-if="!item.transition.enable"
        />
        <template v-if="item.transition.enable">
          <span class="span">
            转场：
            <el-select
              style="width: 120px"
              v-model="item.transition.subtype"
              @change="subtypeChange($event, item)"
            >
              <el-option
                v-for="(rItem, rIndex) in transitionList"
                :label="rItem.name || '-'"
                :value="rItem.subType"
                :key="rIndex"
              />
            </el-select>
          </span>
          <span class="span" style="margin-left: 24px">
            时长：
            <el-select
              style="width: 120px"
              v-model="item.transition.duration"
              @change="durationChang($event, item)"
            >
              <el-option
                v-for="(rItem, rIndex) in durationList"
                :label="rItem.label || '-'"
                :value="rItem.value"
                :key="rIndex"
              />
            </el-select>
          </span>
        </template>
        <el-switch
          style="margin-left: 16px"
          v-model="item.transition.enable"
          inline-prompt
          :width="44"
          @change="transitionChange($event, item)"
        ></el-switch>
      </div>
    </div>
    <!-- 精确导入 -->
    <selectMaterial
      v-if="selectMaterialInfo.show"
      :dialogTitle="'匹配原料'"
      :subtitle="'时长小于该分镜0.5倍的视频已过滤'"
      :origin="'scriptStep'"
      :materialType="1"
      :materialTypeList="[1, 2]"
      :info="selectMaterialInfo"
      :pipelineId="props.pipelineId"
      :scriptReplaceId="selectMaterialInfo.item.id"
      :durationMin="selectMaterialInfo.durationMin"
      :durationMax="selectMaterialInfo.durationMax"
      :scriptStepMax="selectMaterialInfo.scriptStepMax"
      :scriptStepMin="selectMaterialInfo.scriptStepMin"
      :replaceModel="selectMaterialInfo.replaceModel"
      @updateSelectInfo="updateSelectInfo"
    />
    <!-- 条件匹配 -->
    <matchMaterial
      ref="matchMaterialRef"
      v-if="matchMaterialInfo.show"
      :info="matchMaterialInfo"
      :subtitle="'时长小于该分镜0.5倍的视频已过滤'"
      :origin="'scriptStep'"
      :pipelineId="props.pipelineId"
      :scriptReplaceId="matchMaterialInfo.item.id"
      :materialTypeList="[1, 2]"
      :durationMin="matchMaterialInfo.durationMin"
      :durationMax="matchMaterialInfo.durationMax"
      :scriptStepMax="matchMaterialInfo.scriptStepMax"
      :scriptStepMin="matchMaterialInfo.scriptStepMin"
      :replaceModel="matchMaterialInfo.replaceModel"
      @close="matchMaterialClose"
      @updateSelectInfo="updateSelectInfo"
    />
    <!-- 查看更多 -->
    <materialMore
      v-if="materialDialog.show"
      :materialDialog="materialDialog"
      @preview="previewMaterial"
      @resetCheckFun="updateSelectInfo(null, null)"
    />
  </div>
</template>

<script setup>
import { ElMessageBox } from 'element-plus'
import selectMaterial from '../../components/material/select_material_dialog.vue'
import matchMaterial from '../../components/material/match_material.vue'
import materialItem from './storyboard_material_item.vue'
import materialMore from './storyboard_material_dialog.vue'

import { throttle } from '@/utils/tools.js'
import { listTransition, removeMaterial, saveClipConfig } from '@/api/sumvideo/create_by_script.js'

const props = defineProps({
  ruleForm: {
    type: Object,
    default: () => {
      return {
        list: []
      }
    }
  }, // 分镜列表
  pipelineId: {
    type: Number,
    default: null
  }, // 流水线id
  storyErrIds: {
    type: Array,
    default: () => {
      return [] // 验证不通过的分镜ids
    }
  }
})
const { ruleForm, pipelineId } = toRefs(props)
const message = inject('$message')
const emits = defineEmits(['preview', 'change', 'updateList'])
const loadingClipId = ref() // 当前加载中的分镜ID
const isClickDel = ref(false) // 是否触发了删除
// 原料比例选择项
const cropTypeList = ref([
  {
    label: '自适应',
    value: 1
  },
  {
    label: '填充',
    value: 2
  }
])
// 长原料处理方式
const replaceModelList = ref([
  // {
  //   label: '不使用',
  //   value: 2
  // },
  {
    label: '随机选取',
    value: 0,
    tip: '从原料中随机选取分镜时长长度的片段'
  },
  {
    label: '选取前段',
    value: 1,
    tip: '从原料中选取分镜时长长度的前部分片段'
  },
  {
    label: '智能倍速',
    value: 3,
    tip: '对原料进行倍速，超过分镜时长 2 倍的原料不会被使用'
  }
])
// 转场
const transitionList = ref([])
// 时长选项
const durationList = ref([
  {
    label: '0.5秒',
    value: 0.5
  },
  {
    label: '1秒',
    value: 1
  },
  {
    label: '1.5秒',
    value: 1.5
  },
  {
    label: '2秒',
    value: 2
  }
])
const selectMaterialInfo = reactive({
  show: false,
  currentIndex: null, // 导入的哪个分镜的
  item: {}, // 导入分镜
  showBackSelectMaterialIds: [], // 回显的选中的原料ids
  showBackSelectMaterialList: [] // 回显的选中的原料列表
}) // 精确导入
const matchMaterialInfo = reactive({
  show: false,
  currentIndex: null, // 导入的哪个分镜的index
  item: {} // 导入分镜
}) // 条件匹配
// 更多原料
const materialDialog = reactive({
  templateId: null, // 分镜id
  pipelineId: null, // 流水线ID
  show: false
})
// 查看分镜的更多原料
const checkMore = throttle(function (item) {
  materialDialog.materialType = 'video'
  materialDialog.templateId = item.id
  materialDialog.pipelineId = pipelineId.value
  materialDialog.show = true
}, 500)

// 删除一个
const delOne = throttle(function (item, scriptId) {
  const params = {
    pipelineId: pipelineId.value,
    scriptReplaceId: scriptId,
    tagvvMediaIds: [item.tagvvMediaId]
  }
  removeMaterial(params).then(res => {
    if (res.code === 0) {
      emits('updateList')
    }
  })
}, 700)

function getUseTime(item, type) {
  let time = 0
  const clipAsideLength = item?.clipAside?.length || 0
  if (type === 'min') {
    if (clipAsideLength > 0) {
      time = (clipAsideLength / 5.5).toFixed(1)
    } else {
      time = 0
    }
  }
  if (type === 'max') {
    if (clipAsideLength > 0) {
      time = (clipAsideLength / 4.2).toFixed(1)
    } else {
      time = 0
    }
  }
  return time || 0
}

const transitionChange = throttle(function (e, item) {
  emits('change', item, 'transition')
}, 500)
function subtypeChange(e, item) {
  emits('change', item, 'transition')
}
function durationChang(e, item) {
  emits('change', item, 'transition')
}
const nowChooseModal = ref() // 当前选中的长原料处理方式
const disPageAction = ref(false) // 是否要禁用当前分镜列表的所有操作
function replaceModelChange(e, item) {
  if (e === 3 && item.mediaList && item.mediaList.length > 0) {
    disPageAction.value = true
    loadingClipId.value = item.id
    saveClipConfig({
      clearInvalidMaterial: false,
      pipelineId: pipelineId.value,
      scriptClipId: item.id,
      cropType: item.cropType,
      isEnableMaterialSound: item.isEnableMaterialSound,
      replaceModel: item.replaceModel,
      maxDuration: getUseTime(item, 'max') * 1000,
      minDuration: getUseTime(item, 'min') * 1000
    })
      .then(res => {
        if (res.code === 0) {
          if (!res.data) {
            loadingClipId.value = null
            item.replaceModel = nowChooseModal.value
            ElMessageBox.confirm(
              `该分镜选取原料中存在超过分镜时长2倍原料，暂不支持智能倍速，是否刪除这些原料？<br/><span style="line-height: 30px;font-size:13px;color:#606266">注：不会刪除原料库中对应的原料</span>`,
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
                loadingClipId.value = item.id
                isClickDel.value = true
                disPageAction.value = false
                emits('change', item, 'replaceModel', true)
              })
              .catch(() => {
                isClickDel.value = false
                loadingClipId.value = null
                disPageAction.value = false
              })
          } else {
            isClickDel.value = false
            loadingClipId.value = null
            disPageAction.value = false
          }
        } else {
          isClickDel.value = false
          loadingClipId.value = null
          disPageAction.value = false
        }
      })
      .catch(() => {
        isClickDel.value = false
        loadingClipId.value = null
        disPageAction.value = false
      })
  } else {
    emits('change', item, 'replaceModel')
  }
}
function cropTypeChange(e, item) {
  emits('change', item, 'cropType')
}
const changeVoice = throttle(function (item, val) {
  item.isEnableMaterialSound = val ? 0 : 1
  emits('change', item, 'voice')
}, 500)
// 预览
function previewMaterial(info) {
  emits('preview', info)
}
// 精确匹配
const accurateMatch = throttle(function (item, index) {
  selectMaterialInfo.durationMin = getUseTime(item, 'max') * 0.5 * 1000
  selectMaterialInfo.durationMax = item.replaceModel === 3 ? getUseTime(item, 'min') * 2 * 1000 : ''
  selectMaterialInfo.replaceModel = item.replaceModel
  selectMaterialInfo.scriptStepMax = getUseTime(item, 'max') * 1000
  selectMaterialInfo.scriptStepMin = getUseTime(item, 'min') * 1000
  selectMaterialInfo.item = item
  selectMaterialInfo.currentIndex = index
  selectMaterialInfo.show = true
  // const mediaList = (ruleForm.value.list[index] && ruleForm.value.list[index]?.mediaList) || []
  // selectMaterialInfo.showBackSelectMaterialList = mediaList
})
// 条件匹配 - 不需要回显
const conditionMatch = throttle(function (item, index) {
  matchMaterialInfo.durationMin = getUseTime(item, 'max') * 0.5 * 1000
  matchMaterialInfo.durationMax = item.replaceModel === 3 ? getUseTime(item, 'min') * 2 * 1000 : ''
  matchMaterialInfo.replaceModel = item.replaceModel
  matchMaterialInfo.scriptStepMax = getUseTime(item, 'max') * 1000
  matchMaterialInfo.scriptStepMin = getUseTime(item, 'min') * 1000
  matchMaterialInfo.currentIndex = index
  matchMaterialInfo.item = item
  matchMaterialInfo.show = true
})

// 精确匹配 选择结果
function updateSelectInfo(info, type = null) {
  // 更新列表
  loadingClipId.value =
    type === 'matchMaterial' ? matchMaterialInfo.item.id : selectMaterialInfo.item.id
  emits('updateList')
  if (type === 'matchMaterial') {
    message.success(`条件匹配到${info.total || 0}个原料`)
  }
}
function matchMaterialClose() {
  matchMaterialInfo.show = false
}
// 获取转场效果列表
function listTransitionFn() {
  listTransition({}).then(res => {
    if (res.code === 0) {
      transitionList.value = res.data || []
    }
  })
}
listTransitionFn()

function rollToErr(id) {
  const element = document.querySelector(`.item_info_err_${id}`)
  element.scrollIntoView({
    // behavior: 'smooth',
    block: 'center'
  })
}
// 清空分镜的Loading
function clearLoading() {
  loadingClipId.value = null
  if (isClickDel.value) {
    message.success('删除成功')
    isClickDel.value = false
  }
}
defineExpose({
  rollToErr,
  clearLoading
})

// 单个分镜的单个原料选中/非选中状态修改
function onCheckChangeFun(e, item) {
  const index = item.checkList.findIndex(x => x === e.tagvvMediaId || x === e.id)
  const index2 = item.unCheckList.findIndex(x => x === e.tagvvMediaId || x === e.id)
  if (index > -1) {
    //  当前在选中列表里面，那就从选中列表删除 并在取消选中列表里添加
    item.checkTotal = item.checkTotal - 1
    item.checkList.splice(index, 1)
    item.unCheckList.push(e.tagvvMediaId || e.id)
  } else {
    // 当前不在选中列表里，那就从取消选中列表里删除，并在选中列表里添加
    item.checkTotal = item.checkTotal + 1
    item.checkList.push(e.tagvvMediaId || e.id)
    item.unCheckList.splice(index2, 1)
  }
  nextTick(() => {
    if (item.checkTotal === item.listTotal) {
      item.checkStatus = 2
      item.isAllCheck = true
    } else if (item.checkTotal > 0) {
      item.checkStatus = 1
    } else {
      item.checkStatus = null
    }
  })
}
// 设置单个分镜的全选 null 未选中 1半选 2全选
const setCheckFun = throttle(function (item) {
  const ids = item.mediaList.map(x => x.tagvvMediaId || x.id)
  // 全选情况下，变成未选中
  if (item.checkStatus === 2) {
    item.checkStatus = null
    item.checkList = []
    item.unCheckList = ids
    item.checkTotal = 0
    item.isAllCheck = false
  } else {
    // 半选或者未选情况下，变成全选中
    item.checkStatus = 2
    item.checkList = ids
    item.unCheckList = []
    item.checkTotal = item.mediaListTotal
    item.isAllCheck = true
  }
}, 300)
// 批量删除
const delMaterialFun = throttle(function (item) {
  if (item.checkStatus === null) {
    message.warning('请先选择原料')
    return
  }
  ElMessageBox.confirm(
    `从该分镜所匹配的原料中删除所选原料？<br/><span style="line-height: 30px;font-size:13px;color:#606266">注：不会刪除原料库中对应的原料</span>`,
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
      disPageAction.value = true
      loadingClipId.value = item.id
      const params = {
        pipelineId: pipelineId.value,
        scriptReplaceId: item.id
      }
      // 全选
      if (item.checkStatus === 2) {
        params.isSelectAll = true
      } else {
        // 历史点击过全选，那就传排除的，否则就是选中的
        if (item.isAllCheck) {
          params.isSelectAll = true
          params.excludeResourceIds = item.unCheckList
        } else {
          params.isSelectAll = false
          params.tagvvMediaIds = item.checkList
        }
      }
      removeMaterial(params)
        .then(res => {
          if (res.code === 0) {
            disPageAction.value = false
            isClickDel.value = true
            emits('updateList')
          } else {
            loadingClipId.value = null
            disPageAction.value = false
          }
        })
        .catch(() => {
          loadingClipId.value = null
          disPageAction.value = false
        })
    })
    .catch(() => {})
}, 500)
</script>
<style lang="scss" scoped>
.xm_tooltipOfRight1 {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  &::after {
    content: ' ';
    background: url('https://tagvv-1256030678.file.myqcloud.com/20230609v2t8m.png') no-repeat;
    width: 14px;
    height: 14px;
    background-size: cover;
    margin-left: 4px;
  }
}
</style>

<style lang="scss" scoped>
div {
  box-sizing: border-box;
}
.story_item {
  .item_info {
    padding: 13px 12px 12px;
    background: #f2f3f5;
    border-radius: 2px;
    border: 1px solid #eaedf0;
    .info_top {
      display: flex;
      align-items: center;
      height: 22px;
      width: 100%;
      .name {
        font-family: PingFangSC, PingFang SC;
        font-weight: 500;
        font-size: 16px;
        color: #323233;
        line-height: 22px;
        flex-shrink: 0;
      }
      .desc {
        width: 100%;
        flex: 1;
        margin-left: 20px;
        // white-space: nowrap;
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        font-size: 12px;
        color: #606266;
      }
    }
    .info_voiceover {
      background: #fff;
      padding: 6px 12px;
      word-break: break-all;
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 14px;
      color: #606266;
      line-height: 20px;
      border-radius: 4px;
      margin-top: 13px;
    }
    .setting_warp {
      display: flex;
      align-items: center;
      margin-top: 12px;
      position: relative;
      > .span {
        display: flex;
        align-items: center;
        margin-left: 24px;
        &:first-child {
          margin-left: 0;
        }
      }
      .voice_icon {
        width: 20px;
        height: 20px;
        min-width: 20px;
        cursor: pointer;
      }
      .select_warp {
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        .all_choose_box {
          margin-right: 20px;
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
    }
    .material_warp {
      margin-top: 20px;
      max-height: 174px;
      overflow-y: auto;
      .material_item_warp {
        display: flex;
        flex-wrap: wrap;
        margin-left: 12px;
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
  }
  .item_info_err {
    border-color: red;
  }
  .transition_info {
    display: flex;
    align-items: center;
    padding: 12px 0;
    height: 52px;
    .transition_icon {
      width: 24px;
      height: 24px;
      min-width: 24px;
      cursor: pointer;
    }
    > .span {
      margin-left: 16px;
    }
  }
}
</style>
