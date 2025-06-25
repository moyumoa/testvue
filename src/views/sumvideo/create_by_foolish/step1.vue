<template>
  <div class="step1_page" v-loading="pageLoading">
    <div class="page_left">
      <!-- 切换音频处理方式 -->
      <el-button
        v-if="!!formInfo.audioProcessMode"
        class="change_btn change_btn_change"
        type="primary"
        @click="changeType(formInfo.audioProcessMode == 1 ? 2 : 1, 'changeLoadingTop')"
        :icon="transElIconName('Switch')"
        :loading="loadingStates.changeLoadingTop"
      >
        切换音频处理方式
      </el-button>
      <!-- 未选择音频处理方式 -->
      <template v-if="!formInfo.audioProcessMode">
        <div class="choose_warp">
          <div class="tip_warp">请选择原料音频的处理方式</div>
          <div class="btn_warp">
            <el-button
              class="change_btn"
              type="primary"
              @click="changeType(1, 'changeLoadingLeft')"
              :loading="loadingStates.changeLoadingLeft"
            >
              保留视频原音，生成字幕
            </el-button>
            <el-button
              class="change_btn"
              type="primary"
              @click="changeType(2, 'changeLoadingRight')"
              :loading="loadingStates.changeLoadingRight"
            >
              不用视频原音，生成脚本
            </el-button>
          </div>
        </div>
      </template>

      <!-- 生成脚本 -->
      <template v-if="formInfo.audioProcessMode == 2">
        <div class="left_title">
          <span>Part1</span>
          商品信息
        </div>
        <div class="content_box">
          <!-- 商品大类 -->
          <div class="left_content" :ref="el => (validList.category.ref = el)">
            <div class="content_title content_title_required">商品大类：</div>
            <div class="content_content">
              <el-input
                ref="categoryRef"
                :class="{ err_input: !!validList.category.tip }"
                type="text"
                v-model.trim="formInfo.category"
                :placeholder="validList.category.placeholder"
                @blur="categoryBlurFun"
                @keyup.enter="categoryEnterFun"
                :maxlength="validList.category.maxWord"
              />
              <div class="err_tip" v-if="validList.category.tip">{{ validList.category.tip }}</div>
            </div>
          </div>
          <!-- 商品小类 -->
          <div class="left_content" :ref="el => (validList.industry.ref = el)">
            <div class="content_title content_title_required">{{ validList.industry.label }}：</div>
            <div class="content_content">
              <inputTagDOM
                :ref="el => (inputTagRef.industry = el)"
                v-if="!pageLoading"
                key="industry"
                :loading="getSelectLoading"
                :placeholder="validList.industry.placeholder"
                v-model:list="formInfo.industry"
                v-model:errTip="validList.industry.tip"
                :selectList="allSelectList.industry || []"
                :label="validList.industry.label"
                :validRequired="validList.industry.required"
                :minWord="validList.industry.minWord"
                :maxWord="validList.industry.maxWord"
                :maxCount="validList.industry.maxCount"
              />
            </div>
          </div>
          <!-- 核心卖点 -->
          <div class="left_content" :ref="el => (validList.sellingPoint.ref = el)">
            <div class="content_title content_title_required">
              {{ validList.sellingPoint.label }}：
            </div>
            <div class="content_content">
              <inputTagDOM
                :ref="el => (inputTagRef.sellingPoint = el)"
                v-if="!pageLoading"
                key="sellingPoint"
                :loading="getSelectLoading"
                :placeholder="validList.sellingPoint.placeholder"
                v-model:list="formInfo.sellingPoint"
                v-model:errTip="validList.sellingPoint.tip"
                :selectList="allSelectList.selling_point || []"
                :label="validList.sellingPoint.label"
                :validRequired="validList.sellingPoint.required"
                :minWord="validList.sellingPoint.minWord"
                :maxWord="validList.sellingPoint.maxWord"
                :maxCount="validList.sellingPoint.maxCount"
              />
            </div>
          </div>
          <!-- 解决问题 -->
          <div class="left_content" :ref="el => (validList.painPoint.ref = el)">
            <div class="content_title">{{ validList.painPoint.label }}：</div>
            <div class="content_content">
              <inputTagDOM
                :ref="el => (inputTagRef.painPoint = el)"
                v-if="!pageLoading"
                key="painPoint"
                :loading="getSelectLoading"
                :placeholder="validList.painPoint.placeholder"
                v-model:list="formInfo.painPoint"
                v-model:errTip="validList.painPoint.tip"
                :selectList="allSelectList.pain_point || []"
                :label="validList.painPoint.label"
                :minWord="validList.painPoint.minWord"
                :maxWord="validList.painPoint.maxWord"
                :maxCount="validList.painPoint.maxCount"
              />
            </div>
          </div>
        </div>
        <div class="left_title">
          <span>Part2</span>
          适用范围
        </div>
        <div class="content_box">
          <!-- 适用人群 -->
          <div class="left_content" :ref="el => (validList.populationFeatures.ref = el)">
            <div class="content_title content_title_required">
              {{ validList.populationFeatures.label }}：
            </div>
            <div class="content_content">
              <inputTagDOM
                :ref="el => (inputTagRef.populationFeatures = el)"
                v-if="!pageLoading"
                key="populationFeatures"
                :loading="getSelectLoading"
                :placeholder="validList.populationFeatures.placeholder"
                v-model:list="formInfo.populationFeatures"
                v-model:errTip="validList.populationFeatures.tip"
                :selectList="allSelectList.population_features || []"
                :label="validList.populationFeatures.label"
                :validRequired="validList.populationFeatures.required"
                :minWord="validList.populationFeatures.minWord"
                :maxWord="validList.populationFeatures.maxWord"
                :maxCount="validList.populationFeatures.maxCount"
              />
            </div>
          </div>
          <!-- 适用场景 -->
          <div class="left_content" :ref="el => (validList.sceneFeatures.ref = el)">
            <div class="content_title">{{ validList.sceneFeatures.label }}：</div>
            <div class="content_content">
              <inputTagDOM
                :ref="el => (inputTagRef.sceneFeatures = el)"
                v-if="!pageLoading"
                key="sceneFeatures"
                :loading="getSelectLoading"
                :placeholder="validList.sceneFeatures.placeholder"
                v-model:list="formInfo.sceneFeatures"
                v-model:errTip="validList.sceneFeatures.tip"
                :selectList="allSelectList.scene_features || []"
                :label="validList.sceneFeatures.label"
                :minWord="validList.sceneFeatures.minWord"
                :maxWord="validList.sceneFeatures.maxWord"
                :maxCount="validList.sceneFeatures.maxCount"
              />
            </div>
          </div>
        </div>
      </template>
      <!-- 生成脚本的其他设置/保留原音 -->
      <div class="left_title" v-if="!!formInfo.audioProcessMode">
        <span v-if="formInfo.audioProcessMode == 2">Part3</span>
        其他设置
      </div>
      <div class="content_box" v-if="!!formInfo.audioProcessMode">
        <!-- 生成脚本的其他设置 -->
        <template v-if="formInfo.audioProcessMode == 2">
          <!-- 推广场景 -->
          <div class="left_content" :ref="el => (validList.scene.ref = el)">
            <div class="content_title" style="height: 24px">推广场景：</div>
            <div class="content_content content_radio_box">
              <div
                :class="{ content_radio: true, choose_radio: formInfo.scene == item.value }"
                v-for="(item, index) in sceneList"
                :key="index"
                @click="changeSceneFun(item)"
              >
                {{ item.label }}
              </div>
            </div>
          </div>
          <!-- 特殊节点 -->
          <div
            class="left_content"
            style="margin-top: 12px"
            :ref="el => (validList.festival.ref = el)"
          >
            <div class="content_title" style="height: 24px">特殊节点：</div>
            <div class="content_content content_radio_box">
              <div
                :class="{ content_radio: true, choose_radio: formInfo.festival == item.festival }"
                v-for="(item, index) in festivalList"
                :key="index"
                @click="changeFestivalFun(item)"
              >
                {{ item.festival }}
              </div>
            </div>
          </div>
          <!-- 优惠活动 -->
          <div
            class="left_content"
            style="margin-top: 12px"
            :ref="el => (validList.activity.ref = el)"
          >
            <div class="content_title">{{ validList.activity.label }}：</div>
            <div class="content_content">
              <inputTagDOM
                :ref="el => (inputTagRef.activity = el)"
                v-if="!pageLoading"
                key="activity"
                :loading="getSelectLoading"
                :placeholder="validList.activity.placeholder"
                v-model:list="formInfo.activity"
                v-model:errTip="validList.activity.tip"
                :selectList="allSelectList.activity || []"
                :label="validList.activity.label"
                :minWord="validList.activity.minWord"
                :maxWord="validList.activity.maxWord"
                :maxCount="validList.activity.maxCount"
              />
            </div>
          </div>
        </template>
        <!-- 视频合成设置 -->
        <div class="left_content" :ref="el => (validList.composeMode.ref = el)">
          <div class="content_title content_title_required" style="width: 116px">
            {{ validList.composeMode.label }}：
          </div>
          <div class="content_content radio_tip">
            <el-radio-group v-model="formInfo.composeMode" @change="changeHandelVideoRadio">
              <el-radio :label="1">
                固定时长
                <el-tooltip placement="top">
                  <template #content>
                    <p style="max-width: 260px">
                      对原料时长范围有要求，合成出所有视频的时长在选择的固定时长范围内
                    </p>
                  </template>
                  <img
                    src="https://tagvv-1256030678.file.myqcloud.com/2024082277ofo.png"
                    class="tip_icon"
                  />
                </el-tooltip>
              </el-radio>
              <el-radio :label="2">
                随机片段
                <el-tooltip placement="top">
                  <template #content>
                    <p style="max-width: 260px">
                      对原料时长范围无要求，根据选择使用的原料数量从原料池内随机挑选后进行排列组合合成视频
                    </p>
                  </template>
                  <img
                    src="https://tagvv-1256030678.file.myqcloud.com/2024082277ofo.png"
                    class="tip_icon"
                  />
                </el-tooltip>
              </el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="video_setting_warp">
          <!-- 固定时长的选择时长 -->
          <div class="content_content" v-if="formInfo.composeMode == 1">
            <el-select
              v-model="formInfo.durationDesc"
              :placeholder="validList.composeMode.placeholder"
            >
              <el-option
                v-for="item in durationList"
                :label="item.label"
                :value="item.value"
                :key="item.value"
              />
            </el-select>
          </div>
          <!-- 随机片段的选择原料个数 -->
          <div class="content_content" v-else-if="formInfo.composeMode == 2">
            使用
            <el-select
              v-model="formInfo.videoNumList"
              multiple
              placeholder="请选择"
              @change="handelChangeVideoNum"
              :class="!!validList.composeMode.tip ? 'select_err' : ''"
            >
              <el-option
                v-for="item in videoOption"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            个原料进行组合
          </div>
          <div
            class="content_content content_content_err_warp"
            v-if="
              !pageLoading &&
              formInfo.composeMode == 2 &&
              (videoOption.length < 1 || !!validList.composeMode.tip)
            "
          >
            {{ videoOption.length < 1 ? '请先至少上传2个视频原料' : validList.composeMode.tip }}
          </div>
        </div>
      </div>
      <!-- 保留原音的BGM -->
      <div class="content_bgm" v-if="!!formInfo.audioProcessMode">
        <choseBgm
          v-model:bgmLoading="bgmLoading"
          ref="chooseBGMRef"
          :pipelineId="pipelineId"
          :extraConfig="{ bgmConfig: formInfo.bgmConfig }"
          :classList="bgmErr ? ['chose_voice_step2_err'] : []"
          origin="foolishStepBGM"
          @preview="previewFun"
          @updateBgm="updateBgm"
          @updateList="updateListFn"
        />
      </div>
    </div>
    <div class="page_right" :class="{ page_right_un_one_line: !topOneLine }" ref="pageRightRef">
      <div class="right_top">
        <div class="top_left">
          <div class="top_title">原料匹配</div>
          <div class="top_voice">
            原料声音：
            <!-- 开启 -->
            <img
              @click="changeSoundFun(false)"
              v-if="formInfo.enableVideoSound"
              src="https://tagvv-1256030678.file.myqcloud.com/20240523yznc3.png"
              alt=""
            />
            <!-- 静音 -->
            <img
              @click="changeSoundFun(true)"
              v-else
              src="https://tagvv-1256030678.file.myqcloud.com/20240523ssbwn.png"
              alt=""
            />
          </div>
        </div>
        <div class="top_btn">
          <div class="btn_item xm_check_box_round select_all_text" @click="selectAll">
            <div
              :class="[
                'check_box',
                $choose.checkStatus == 1
                  ? 'check_box_half_choose'
                  : $choose.checkStatus == 2
                  ? 'check_box_active'
                  : ''
              ]"
            ></div>
            全选
          </div>
          <div class="btn_item btn_del" @click="beforeDet">清除</div>
        </div>
        <div class="top_right">
          <el-dropdown popper-class="xm_dropDown" :disabled="materialOperation.uploadLoading">
            <el-button
              :disabled="materialOperation.uploadLoading"
              type="primary"
              class="xm_dropDown_btn"
            >
              导入原料
              <el-icon style="margin-left: 8px"><i-arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  :disabled="materialOperation.uploadLoading"
                  @click.stop="showChooseMaterialFun"
                >
                  原料库选择
                </el-dropdown-item>

                <el-dropdown-item
                  :disabled="materialOperation.uploadLoading"
                  @click.stop="showUploadFun"
                >
                  本地上传
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="right_bottom" v-loading="materialLoading || materialOperation.uploadLoading">
        <div class="bottom_content" ref="rightContent">
          <div class="sumvideo_page" v-if="materialList && materialList.length > 0">
            <div
              class="all_material"
              :infinite-scroll-delay="1000"
              v-infinite-scroll="loadFun"
              :infinite-scroll-distance="50"
              :infinite-scroll-immediate="false"
              :infinite-scroll-disabled="materialList.length >= page.total"
            >
              <div class="material_box">
                <div
                  class="material_item"
                  :id="sItem.id"
                  :style="errIdList.includes(sItem.id) ? 'border:2px solid #f85151' : ''"
                  style="cursor: pointer"
                  @click.stop="
                    sItem.type == 1 || sItem.mediaType == 1
                      ? videoPreviewFn(sItem)
                      : previewImg(sItem)
                  "
                  v-for="(sItem, sIndex) in materialList"
                  :key="sItem.id || sIndex"
                >
                  <!-- 删除按钮 -->
                  <!-- <div class="del_warp">
                    <img
                      src="https://tagvv-1256030678.file.myqcloud.com/2024032998kkl.png"
                      alt=""
                      class="del_icon"
                      @click.stop="delFun(sItem)"
                    />
                  </div> -->
                  <!-- 选择按钮 -->
                  <div class="del_warp material_action" @click.stop="checkChange(sItem)">
                    <div class="xm_check_box_round" style="margin-right: 8px">
                      <div
                        :class="sItem.checked ? 'check_box check_box_active' : 'check_box'"
                      ></div>
                    </div>
                  </div>

                  <!-- 封面/图片原料 -->
                  <img
                    :src="sItem.coverUrl || sItem.url || sItem.mediaUrl"
                    alt=""
                    class="cover_img"
                  />
                  <!-- 视频的时间 -->
                  <div class="video_time" v-if="sItem.type == 1 || sItem.mediaType == 1">
                    {{ conversionTime(sItem.duration) }}
                  </div>
                  <!-- 视频的播放 -->
                  <img
                    src="https://tagvv-1256030678.file.myqcloud.com/20240329aqyhk.png"
                    alt=""
                    class="video_preview"
                    v-if="sItem.type == 1 || sItem.mediaType == 1"
                  />
                </div>
              </div>
            </div>
            <div class="xm_pullUpToLoadMore">
              <img src="/public/loading.gif" v-if="materialLoading && page.index > 1" alt="" />
              {{
                materialLoading
                  ? page.index === 1
                    ? ''
                    : '加载中...'
                  : materialList.length >= page.total
                  ? materialList.length > 12
                    ? '已经到底了~'
                    : ''
                  : '上拉加载更多~'
              }}
            </div>
          </div>
          <div
            v-if="
              !materialOperation.uploadLoading &&
              !materialLoading &&
              !(materialList && materialList.length > 0)
            "
            class="xm_noneData"
          >
            <img src="@/assets/images/content_center/no_activity.png" alt />
            <div>每次上传最多选择50个原料，视频支持：mp4/mov，视频不超过500M</div>
          </div>
        </div>
      </div>
    </div>
    <!-- 原料库选择 -->
    <selectMaterialDOM
      origin="foolishStep"
      v-if="chooseMaterialDialog.show"
      :info="chooseMaterialDialog"
      :dialogTitle="chooseMaterialDialog.dialogTitle"
      :subtitle="chooseMaterialDialog.subtitle"
      :pipelineId="pipelineId"
      :materialType="chooseMaterialDialog.materialType"
      :materialTypeList="chooseMaterialDialog.materialTypeList"
      @updateSelectInfo="updateSelectFun"
      :durationMin="chooseMaterialDialog.durationMin"
      :durationMax="chooseMaterialDialog.durationMax"
      :resourceType="chooseMaterialDialog.resourceType"
    />
    <!-- 预览分镜的弹窗 -->
    <previewDialog v-if="previewInfo.show" :previewDialog="previewInfo"></previewDialog>
    <!-- 统一的上传入口 -->
    <uploadMaterial
      v-if="materialOperation.showUpload"
      ref="uploadRef"
      :showLoading="false"
      :videoMaxSize="materialOperation.videoMaxSize"
      :imgMaxSize="materialOperation.imgMaxSize"
      :minDuration="materialOperation.minDuration"
      :maxDuration="materialOperation.maxDuration"
      :acceptVideoImg="true"
      :index="1"
      :limit="50"
      :multiple="true"
      commonErrTip="单个视频不超过500M且单次上传不超过50个原料"
      v-model:uploadLoading="materialOperation.uploadLoading"
      @success="uploadSuccessFun"
      @error="uploadErrFun"
      :ConvertOfdurationUnit="false"
      :acceptTypeList="materialOperation.acceptTypeList"
    ></uploadMaterial>
  </div>
</template>
<script setup>
import { batchSave, list } from '@/api/content_center/material_library.js'
import {
  aggregationRefine,
  savePipelineConfig,
  getFoolishPipelineDetail,
  removeMaterial,
  checkMaterial,
  listFestival
} from '@/api/sumvideo/create_by_foolish.js'

import selectMaterialDOM from '@/views/sumvideo/components/material/select_material_dialog.vue'
// import uploadMaterial from '@/views/sumvideo/components/material/upload_multiple_material_dialog.vue'
import uploadMaterial from '@/views/sumvideo/components/material/upload_material_dialog.vue'

import previewDialog from '@/components/preview_dialog/preview_dialog.vue'
import inputTagDOM from './components/input_tag.vue'
import { isNotEmpty, isEmpty, throttle, secToMin, transElIconName } from '@/utils/tools'
import { ElMessageBox } from 'element-plus'
import choseBgm from '@/views/sumvideo/components/material/choose_bgm.vue'

const props = defineProps({
  pipelineId: {
    type: Number || String,
    default: null
  },
  durationList: Object,
  info: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
const { pipelineId, durationList } = toRefs(props)
const message = inject('$message')

const loadingStates = reactive({
  changeLoadingTop: false, // 产品要求刷新后，停留在选择的页面里，所以选择信息存到后端
  changeLoadingLeft: false, // 选择loading
  changeLoadingRight: false // 选择loading
})
const bgmErr = ref(false) // Bgm红框

const sceneList = reactive([
  {
    value: '吸引流量',
    label: '通用'
  },
  {
    value: '点击商品链接购买',
    label: '短视频引流'
  },
  {
    value: '直播间引流',
    label: '直播间引流'
  },
  {
    value: '引导用户填写线索信息',
    label: '引导留资'
  }
]) // 推广场景列表
const festivalList = ref([]) // 特殊节点列表

const formInfo = ref({
  audioProcessMode: 0, // 原料音频处理方式： 0未选择时页面 1保留视频原音 2不用视频原音
  category: '',
  industry: [],
  sellingPoint: [],
  painPoint: [],
  populationFeatures: [],
  sceneFeatures: [],
  scene: '', // 推广 单选
  festival: '', // 特殊 单选
  activity: [],
  durationDesc: 1,
  enableVideoSound: true, // 原料声音
  resourcesIds: [], // 选中的所有原料IDs
  composeMode: 1, // 视频合成设置 1固定时长 2随机片段
  videoNumList: [], // 组合的原料个数
  bgmConfig: {} // bgm
}) // 左侧填写的信息

const errIdList = ref([]) // 不符合时长的原料ID列表
const materialList = ref([]) // 选中的原料列表
const page = reactive({
  index: 1,
  size: 42,
  total: 0
})
const allSelectList = ref({
  industry: [], // 商品小类
  selling_point: [], // 核心卖点
  pain_point: [], // 解决问题
  population_features: [], // 适用人群
  scene_features: [], // 适用场景
  activity: [] // 优惠活动
}) // 商品小类、卖点等可选列表
const categoryRef = ref()

const $choose = reactive({
  checkStatus: null, // 全选状态 Null 未选中 1半选 2全选
  isAllCheck: false, // 是否点击过全选
  checkTotal: 0, // 选中的数量
  checkList: [], // 选中的列表
  unCheckList: [] // 取消选中的列表
})

const pageRightRef = ref(null)
const topOneLine = ref(true) // 是否在一行内

const valNameSet = {
  1: 'keepVideoVoice',
  2: 'notUsedVideoVoice'
}

const videoOption = computed(() => {
  const newVal = materialList.value
  const list =
    newVal.length < 2
      ? []
      : newVal.slice(1).map((item, index) => {
          return { label: index + 2, value: index + 2 }
        })
  console.log('material', materialList.value)
  return list
})

// 切换视频合成设置 看是否要清空数据，从固定到随机，清空随机的数据，从随机到固定，清空固定的数据
function changeHandelVideoRadio() {
  // 清空右侧原料匹配错误的标识
  errIdList.value = []
}

const changeType = throttle(function (val, loadingNme = '') {
  if (formInfo.value.audioProcessMode === val) return
  loadingStates[loadingNme] = true
  commonSaveFun({ audioProcessMode: val })
    .then(() => {
      formInfo.value.audioProcessMode = val
      emits('changeType', valNameSet[val])
      loadingStates[loadingNme] = false
    })
    .catch(() => {
      loadingStates[loadingNme] = false
    })
}, 500)

function initVideoNumList() {
  formInfo.value.videoNumList = []
}
const bgmLoading = ref(false)
// 更新BGM信息
function updateBgm(info, type) {
  console.log('更新bgm信息', info, type)
  const bgmConfig = {
    enableBgm: info.enableBgm || false,
    volume: info.volume || 20,
    fadeInTime: info.fadeInTime || 1,
    fadeOutTime: info.fadeOutTime || 1,
    isSelectAll: false,
    bgms: info.bgms // 选择的音频列表
  }
  // 保存bgm信息
  savePipelineConfig({
    pipelineId: pipelineId.value,
    bgmConfig: bgmConfig
  }).then(res => {
    if (res.code === 0) {
      const bgmInfo = JSON.parse(JSON.stringify(info))
      if (formInfo.value.bgmConfig.mediaListTotal) {
        bgmInfo.mediaListTotal = formInfo.value.bgmConfig.mediaListTotal
      }
      formInfo.value.bgmConfig = bgmInfo
    }
  })
}
const chooseBGMRef = ref()
// 更新bgm列表
function updateListFn(info) {
  console.log('更新bgm列表', info)
  // 获取详情拿BGM信息
  getPipelineDetail('bgm').finally(res => {
    chooseBGMRef.value?.clearLoading()
  })
}
// 选择个数
function handelChangeVideoNum() {
  if (formInfo.value.videoNumList.length > 0) {
    validList.composeMode.tip = ''
  } else {
    validList.composeMode.tip = '请选择原料使用个数'
  }
}

function updateChooseStatus() {
  if ($choose.isAllCheck) {
    if ($choose.unCheckList.length === 0) {
      $choose.checkStatus = 2
    } else if ($choose.unCheckList.length === page.total) {
      $choose.checkStatus = null
    } else {
      $choose.checkStatus = 1
    }
  } else {
    if ($choose.checkTotal === 0) {
      $choose.checkStatus = null
    } else if ($choose.checkTotal === page.total) {
      $choose.checkStatus = 2
    } else {
      $choose.checkStatus = 1
    }
  }
}

function checkChange(item) {
  const currentId = item.tagvvMediaId || item.id

  if (item.checked) {
    console.log('取消选择，全选时需要将数据放入unCheckLis，非全选时需要将数据从checkList移出')
    if ($choose.isAllCheck) {
      const index = $choose.unCheckList.findIndex(id => id === currentId)
      if (index === -1) {
        item.checked = false
        $choose.checkTotal--
        $choose.unCheckList.push(currentId)
      }
      const index2 = $choose.checkList.findIndex(id => id === currentId)
      if (index2 > -1) {
        $choose.checkList.splice(index, 1)
      }
    } else {
      console.log('checkList移出', item)
      // const deepCheckList = JSON.parse(JSON.stringify($choose.checkList))
      const index = $choose.checkList.findIndex(id => id === currentId)
      console.log('index', $choose.checkList, index)
      if (index > -1) {
        item.checked = false
        $choose.checkTotal--
        $choose.checkList.splice(index, 1)
      }
    }
  } else {
    console.log('选择，全选时需要将数据从unCheckList内移出，非全选时需要将数据放入checkList')
    if ($choose.isAllCheck) {
      const index = $choose.unCheckList.findIndex(id => id === currentId)
      if (index > -1) {
        $choose.checkTotal++
        item.checked = true
        $choose.unCheckList.splice(index, 1)
      }
      const index2 = $choose.checkList.findIndex(id => id === currentId)
      if (index2 === -1) {
        $choose.checkList.push(currentId)
      }
    } else {
      console.log('放入checkList')
      const index = $choose.checkList.findIndex(id => id === currentId)
      if (index === -1) {
        $choose.checkTotal++
        item.checked = true
        $choose.checkList.push(currentId)
      }
    }
  }
  if ($choose.checkTotal === page.total) {
    $choose.isAllCheck = true
  }

  updateChooseStatus()
}

// 批量移出
function batchRemove(list) {
  ;(list || []).forEach(item => {
    item.checked = false
    $choose.checkTotal--
    const currentId = item.tagvvMediaId || item.id
    const index = $choose.checkList.findIndex(id => id === currentId)

    if (index > -1) {
      $choose.checkList.splice(index, 1)
    }
  })
  updateChooseStatus()
}

// 批量添加
function batchAdd(list) {
  ;(list || []).forEach(item => {
    item.checked = true
    $choose.checkTotal++
    const currentId = item.tagvvMediaId || item.id
    if ($choose.isAllCheck) {
      // 全选时，在unCheckList内就删除
      const index = $choose.unCheckList.findIndex(id => id === currentId)
      if (index > -1) {
        $choose.unCheckList.splice(index, 1)
      }
    } else {
      if (!$choose.checkList.includes(currentId)) {
        $choose.checkList.push(currentId)
      }
    }
  })

  updateChooseStatus()
}
// 全选
const selectAll = throttle(function () {
  if (materialList?.value.length === 0) return
  // 判断当前状态，非全选时就将页面加载出来的数据全部选中，全选时就全部取消
  if ($choose.checkStatus === 2) {
    // 取消
    $choose.isAllCheck = false
    clearSelect()
  } else {
    // 选中
    batchAdd(materialList.value)
    $choose.checkStatus = 2
    $choose.isAllCheck = true
  }
}, 300)
// 清除已选
const clearSelect = throttle(function () {
  batchRemove(materialList.value)
}, 300)

// 删除
const beforeDet = throttle(function () {
  if (!$choose.checkStatus) {
    message.warning('请选择原料')
    return
  }
  const contentText = `从匹配的原料中删除所选原料？<br/><span style="line-height: 30px;font-size:13px;color:#606266">注：不会删除原料库中对应的原料</span>`
  ElMessageBox.confirm(contentText, '删除原料', {
    closeOnClickModal: false,
    confirmButtonText: '清除',
    cancelButtonText: '取消',
    type: '',
    customClass: 'xm_dialog_messageBox',
    dangerouslyUseHTMLString: true
  })
    .then(() => {
      console.log('点击确定删除')
      materialLoading.value = true
      const params = {
        pipelineId: pipelineId.value,
        isSelectAll: $choose.isAllCheck
      }
      if (params.isSelectAll) {
        // 全选传排除ids
        console.log('全选传排除ids')
        params.excludeResourceIds = $choose.unCheckList
      } else {
        // 非全选传选中ids
        console.log('非全选传选中ids')
        params.resourcesIds = $choose.checkList
      }
      console.log('params', params)
      // if (params) return
      removeMaterial(params)
        .then(async res => {
          console.log('删除接口返回res')
          if (res.code === 0) {
            // 初始化
            $choose.checkStatus = null
            $choose.isAllCheck = false
            $choose.checkTotal = 0
            $choose.checkList = []
            $choose.unCheckList = []

            getPipelineDetail()
              .then(() => {
                // 根据原料ID刷新原料列表
                if (isNotEmpty(formInfo.value.resourcesIds)) {
                  resetList('del')
                } else {
                  nextTick(() => {
                    page.index = 1
                    materialList.value = []
                    materialLoading.value = false
                    initVideoNumList()
                  })
                }
              })
              .catch(() => {
                materialLoading.value = false
              })
          }
        })
        .catch(() => {
          materialLoading.value = false
        })
    })
    .catch(() => {
      console.log('取消')
    })
}, 500)

// 大类的输入框失去焦点-如果输入框内容为空，则删除所有的可选列表
function categoryBlurFun() {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi
  formInfo.value.category = formInfo.value.category.replace(reg, '')
  if (isEmpty(formInfo.value.category)) {
    clearSelectList()
    validList.category.tip = `请输入${validList.category.label}`
  } else {
    validList.category.tip = ``
  }
}
// 大类的回车事件-如果输入框有内容，就去获取最新的可选列表
function categoryEnterFun() {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi
  formInfo.value.category = formInfo.value.category.replace(reg, '')
  if (isNotEmpty(formInfo.value.category)) {
    // 获取可选列表
    getAllSelectList()
    validList.category.tip = ``
  } else {
    clearSelectList()
    validList.category.tip = `请输入${validList.category.label}`
  }
}
function clearSelectList() {
  allSelectList.value = {
    industry: [], // 商品小类
    selling_point: [], // 核心卖点
    pain_point: [], // 解决问题
    population_features: [], // 适用人群
    scene_features: [], // 适用场景
    activity: [] // 优惠活动
  }
}
const getSelectLoading = ref(false) // 获取可选列表的loading
// 根据商品大类获取最新的可选列表
function getAllSelectList() {
  if (getSelectLoading.value) return
  clearSelectList()
  getSelectLoading.value = true
  aggregationRefine({
    productCategory: formInfo.value.category || ''
  })
    .then(res => {
      if (res.code === 0) {
        allSelectList.value = res.data || {}
      }

      getSelectLoading.value = false
    })
    .catch(() => {
      getSelectLoading.value = false
    })
}

const validList = reactive({
  category: {
    required: true,
    itemToType: [2],
    // showItem: formInfo.value.audioProcessMode  === 2,
    ref: null,
    label: '商品大类',
    placeholder: '输入一个商品大类，如沙发、冰箱等，回车键确认，不超过10个字',
    validType: 1, // 1 只校验是否有数据并且不超过10个字
    minWord: 1,
    maxWord: 10,
    maxCount: 1,
    tip: '' // 校验失败
  },
  industry: {
    required: true,
    itemToType: [2],
    ref: null,
    label: '商品小类',
    placeholder: '输入一个商品小类或具体名称，如真皮沙发、01号沙发，回车键确认，不超过10个字',
    validType: 2, // 2 校验是否有数据，并且字数限制，最多几个
    minWord: 1,
    maxWord: 10,
    maxCount: 1,
    tip: '' // 校验失败
  },
  sellingPoint: {
    required: true,
    itemToType: [2],
    label: '核心卖点',
    placeholder: '输入核心卖点，如舒适柔软、真皮面料，回车键确认，每个标签2-5个字，最多支持5个',
    validType: 2, // 2 校验是否有数据，并且字数限制，最多几个
    minWord: 2,
    maxWord: 5,
    maxCount: 5,
    tip: '' // 校验失败
  },
  painPoint: {
    itemToType: [2],
    label: '解决问题',
    placeholder: '输入能解决的问题，如价格昂贵、质量差，回车键确认，每个标签2-5个字，最多支持5个',
    validType: 2, // 2 校验是否有数据，并且字数限制，最多几个
    minWord: 2,
    maxWord: 5,
    maxCount: 5,
    tip: '' // 校验失败
  },
  populationFeatures: {
    required: true,
    itemToType: [2],
    label: '适用人群',
    placeholder: '输入适用的人群范围，如上班族、多人使用，回车键确认，不超过10个字',
    validType: 2, // 2 校验是否有数据，并且字数限制，最多几个
    minWord: 1,
    maxWord: 10,
    maxCount: 1,
    tip: '' // 校验失败
  },
  sceneFeatures: {
    itemToType: [2],
    label: '适用场景',
    placeholder:
      '输入商品适用的场景，如约会、家用客厅使用，回车键确认，每个标签2-5个字，最多支持5个',
    validType: 2, // 2 校验是否有数据，并且字数限制，最多几个
    minWord: 2,
    maxWord: 5,
    maxCount: 5,
    tip: '' // 校验失败
  },
  scene: {
    itemToType: [2],
    label: '推广场景',
    placeholder: '',
    validType: 3, // 3 单选框 校验是否有数据
    tip: '' // 校验失败
  },
  festival: {
    itemToType: [2],
    label: '特殊节点',
    placeholder: '',
    validType: 3, // 3 单选框 校验是否有数据,
    tip: '' // 校验失败
  },
  activity: {
    itemToType: [2],
    label: '优惠活动',
    placeholder: '输入参加的优惠活动，如拍一发二、包邮，回车键确认，每个标签2-5个字，最多支持5个',
    validType: 2, // 2 校验是否有数据，并且字数限制，最多几个
    minWord: 2,
    maxWord: 5,
    maxCount: 5,
    tip: '' // 校验失败
  },
  composeMode: {
    required: true,
    itemToType: [1, 2],
    label: '视频合成设置',
    placeholder: '请选择视频时长',
    validType: 5, // 5 单选框+选项 校验是否有数据
    tipDefault: '请完善视频合成设置',
    tip: '' // 校验失败
  },
  resourcesIds: {
    itemToType: [1, 2],
    required: true,
    label: '原料',
    validType: 4, // 4 多选框 校验是否有数据
    tip: '' // 校验失败
  },
  bgmConfig: {
    itemToType: [1, 2],
    validType: 6 // 6 BGM验证
  }
})

// 判断当前数据是否超出可是范围
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect()
  return (
    rect.top >= 150 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}
// 校验视频时长---
function validMaterialFun(key) {
  return new Promise((resolve, reject) => {
    const durationInfo = durationList.value.filter(x => x.value === formInfo.value.durationDesc)
    if (!materialList.value || (materialList.value && materialList.value.length === 0)) {
      validList[key].tip = '请选择原料'
      reject(new Error('请选择原料'))
    }
    // 随机片段不需要进行时长校验
    if (formInfo.value.composeMode === 2) return
    checkMaterial({
      pipelineId: pipelineId.value,
      durationMin: 0,
      durationMax:
        durationInfo && durationInfo.length > 0 && durationInfo[0].max
          ? durationInfo[0].max * 1000
          : null
    })
      .then(res => {
        if (res.code === 0) {
          if (res.data && res.data.length > 0) {
            errIdList.value = res.data.map(x => x.id)
            validList[key].tip = '请选择符合时长的原料'
            const errDOM = document.getElementById(errIdList.value[0])
            // 自动滚动到显示区域
            if (errDOM && !isElementInViewport(errDOM)) {
              errDOM.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
            reject(new Error('请选择符合时长的原料'))
          } else {
            errIdList.value = []
            validList[key].tip = ''
            resolve()
          }
        } else {
          errIdList.value = []
          validList[key].tip = ''
          resolve()
        }
      })
      .catch(err => {
        reject(err)
      })
  })
}

const inputTagRef = reactive({
  industry: null,
  sellingPoint: null,
  painPoint: null,
  populationFeatures: null,
  sceneFeatures: null,
  activity: null
}) // 输入即成标签的组件DOM
// 校验输入的信息
function validFun() {
  return new Promise((resolve, reject) => {
    if (formInfo.value.audioProcessMode === 0) {
      const tip = '请选择原料音频的处理方式'
      message.warning(tip)
      reject(new Error(tip))
      return
    }
    // 原声处理方式不同、视频合成设置选项不同，验证项不同
    const finVaild = Object.keys(validList).reduce((result, key) => {
      if (validList[key].itemToType.includes(formInfo.value.audioProcessMode)) {
        result[key] = { ...validList[key] } // 需要验证的
      }
      return result
    }, {})
    let errKey = ''
    const { enableBgm, bgms } = formInfo.value.bgmConfig || {}
    for (const key in finVaild) {
      // 清空输入框内容
      if (inputTagRef[key]) {
        inputTagRef[key].clearInputValue()
      }
      // 判断数据是否为空
      if (validList[key].required && isEmpty(formInfo.value[key])) {
        const tip = `请${
          validList[key].validType === 5 ? '完善' : validList[key].validType === 4 ? '选择' : '输入'
        }${parseInt(validList[key].maxCount || 0) > 1 ? '至少一个' : ''}${validList[key].label}`
        validList[key].tip = validList[key].tipDefault ? validList[key].tipDefault : tip
        if (!errKey) {
          errKey = key
        }
      } else {
        switch (validList[key].validType) {
          case 1:
            // 字数校验
            if (formInfo.value[key].length > parseInt(validList[key].maxWord)) {
              validList[key].tip = `请输入${validList[key].label}`
            } else {
              validList[key].tip = ''
            }
            if (validList[key].tip && !errKey) {
              errKey = key
            }
            break
          case 2:
            // 关键词个数校验
            if (formInfo.value[key].length > parseInt(validList[key].maxCount)) {
              validList[key].tip = `最多支持${validList[key].maxCount}个${validList[key].label}`
            } else {
              let lengthErr = false
              formInfo.value[key].forEach(x => {
                if (
                  !(
                    x.length >= parseInt(validList[key].minWord) &&
                    x.length <= parseInt(validList[key].maxWord)
                  )
                ) {
                  lengthErr = true
                }
              })
              if (lengthErr) {
                validList[key].tip = `每个${validList[key].label || '标签'}在${
                  validList[key].minWord
                }-${validList[key].maxWord}个字之间`
              } else {
                validList[key].tip = ''
              }
            }
            if (validList[key].tip && !errKey) {
              errKey = key
            }
            break
          case 3:
            validList[key].tip = ''
            break
          case 5:
            // 根据单选框和选项进行校验-视频合成设置独有的
            if (formInfo.value.composeMode === 1) {
              // 校验是否有选择固定时长
              if (isNotEmpty(formInfo.value.durationDesc)) {
                validList[key].tip = ''
              } else {
                validList[key].tip = '请选择固定时长'
              }
            } else {
              // 校验是否有选择原料个数
              if (isNotEmpty(formInfo.value.videoNumList)) {
                validList[key].tip = ''
              } else {
                validList[key].tip =
                  videoOption.value && videoOption.value.length > 0
                    ? '请选择原料使用个数'
                    : '请先至少上传2个视频原料'
              }
            }

            if (validList[key].tip && !errKey) {
              errKey = key
            }
            break
          case 6:
            // BGM验证

            if (!enableBgm) {
              validList[key].tip = ''
            } else {
              if (bgms && bgms.length > 0) {
                validList[key].tip = ''
              } else {
                validList[key].tip = '请选择至少一个BGM'
              }
            }
            if (validList[key].tip && !errKey) {
              errKey = key
            }
            break
        }
      }
    }

    if (errKey) {
      message.warning(validList[errKey].tip)

      validList[errKey].ref?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      reject(new Error(validList[errKey].tip))
    } else {
      // 如果选择固定时长，就先验证视频时长再验证bgm
      // 如果选择了随机片段不验证时长，直接验证bgm
      // 最新 如果选择了固定时长，则进行时长校验，保证每个都在最大限制的范围内
      if (formInfo.value.composeMode === 1) {
        validMaterialFun('resourcesIds')
          .then(() => {
            resolve()
          })
          .catch(() => {
            if (validList.resourcesIds.tip) {
              message.warning(validList.resourcesIds.tip)
            }
            reject(new Error(validList.resourcesIds.tip))
          })
      } else {
        resolve()
      }
    }
  })
}

const pageLoading = ref(true)
onMounted(() => {
  // 获取节日
  getFestivalFun()
  if (isNotEmpty(props.info)) {
    const propsInfo = JSON.parse(JSON.stringify(props.info))
    // 老数据如果音频类型不存在就默认为2
    if (isEmpty(propsInfo.audioProcessMode)) {
      propsInfo.audioProcessMode = 2
    }
    formInfo.value = {
      ...propsInfo,
      composeMode: propsInfo.composeMode ? propsInfo.composeMode : 1,
      videoNumList: propsInfo.videoNumList ? propsInfo.videoNumList : []
    }
    // 如果商品大类存在，就去获取最新的可选列表
    if (isNotEmpty(formInfo.value.category)) {
      getAllSelectList()
    }
    // 如果有选中的原料ID，就去获取原料列表
    if (isNotEmpty(formInfo.value.resourcesIds)) {
      resetList().finally(() => {
        nextTick(() => {
          pageLoading.value = false
        })
      })
    } else {
      nextTick(() => {
        pageLoading.value = false
      })
    }
  } else {
    pageLoading.value = false
  }
  emits('changeType', valNameSet[formInfo.value.audioProcessMode])
  // 监听右边宽度变化以增加样式
  window.addEventListener('resize', handleResize)
  handleResize()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

function handleResize() {
  const width = pageRightRef.value?.clientWidth
  topOneLine.value = width > 442 // 随便定义的宽度
}
// 获取节日列表
function getFestivalFun() {
  listFestival({
    brandId: localStorage.getItem('brandInfo')
      ? JSON.parse(localStorage.getItem('brandInfo')).brandId
      : ''
  }).then(res => {
    if (res.code === 0) {
      festivalList.value = res.data || []
    }
  })
}
// 修改推广场景
function changeSceneFun(item) {
  if (formInfo.value.scene === item.value) {
    formInfo.value.scene = ''
  } else {
    formInfo.value.scene = item.value
  }
}
// 修改特殊节点
function changeFestivalFun(item) {
  if (formInfo.value.festival === item.festival) {
    formInfo.value.festival = ''
  } else {
    formInfo.value.festival = item.festival
  }
}
// 修改原料声音
const changeSoundFun = throttle(function (sound) {
  formInfo.value.enableVideoSound = sound || false
  commonSaveFun({
    enableVideoSound: sound || false
  })
}, 500)
// 通用的保存操作接口
function commonSaveFun(obj2) {
  return new Promise((resolve, reject) => {
    const obj1 = { pipelineId: pipelineId.value }
    savePipelineConfig({ ...obj1, ...obj2 })
      .then(res => {
        if (res.code === 0) {
          resolve(res)
        } else {
          reject(res)
        }
      })
      .catch(err => {
        reject(err)
      })
  })
}
// 获取流水线详情
function getPipelineDetail(updateType) {
  return new Promise((resolve, reject) => {
    getFoolishPipelineDetail({
      pipelineId: pipelineId.value
    })
      .then(res => {
        if (res.code === 0) {
          const data = res.data || {}
          if (updateType && updateType === 'bgm') {
            if (isNotEmpty(data?.extraConfig?.bgmConfig)) {
              formInfo.value.bgmConfig = JSON.parse(
                JSON.stringify(data?.extraConfig?.bgmConfig || {})
              )
            }
          } else {
            formInfo.value.resourcesIds = data?.extraConfig?.resourcesIds || []
          }
          resolve()
        } else {
          reject(res)
        }
      })
      .catch(err => {
        reject(err)
      })
  })
}

// 原料库选择相关的方法--
const chooseMaterialDialog = ref({
  show: false,
  dialogTitle: '',
  materialType: 1,
  materialTypeList: [1] // 原料类型 1视频 2图片 3音频 4文本
})
const materialLoading = ref(false) // 加载原料的Loading
const rightContent = ref()
// 打开原料库选择弹窗
const showChooseMaterialFun = throttle(() => {
  if (materialOperation.value.uploadLoading) return
  const durationInfo = durationList.value.filter(x => x.value === formInfo.value.durationDesc)
  chooseMaterialDialog.value = {
    show: true,
    dialogTitle: '导入原料',
    subtitle:
      formInfo.value.audioProcessMode && formInfo.value.composeMode === 1
        ? `已自动过滤不符合条件的原料`
        : '',
    materialTypeList: [1],
    materialType: 1,
    showBackSelectMaterialList: materialList.value,
    durationMin: null,
    durationMax:
      formInfo.value.audioProcessMode && formInfo.value.composeMode === 1
        ? durationInfo && durationInfo.length > 0 && durationInfo[0].max
          ? durationInfo[0].max
          : null
        : null,
    resourceType: 0
  }
}, 500)
// 保存选中的原料-拿到选中的原料ID，先存到流水线配置，再通过流水线详情接口获取所有原料ID，根据ID获取对应的分页原料列表
function updateSelectFun(list, dialog, btnLoading) {
  // 将选中的原料ID存到流水线配置
  savePipelineConfig({
    pipelineId: pipelineId.value,
    resourcesIds: list
  })
    .then(res => {
      if (res.code === 0) {
        // 获取流水线详情，拿到所有的原料ID
        getPipelineDetail()
          .then(() => {
            // 根据原料ID刷新原料列表
            if (isNotEmpty(formInfo.value.resourcesIds)) {
              resetList('select')
            }

            dialog.handleClose()
          })
          .finally(() => {
            btnLoading.value = false
          })
      } else {
        btnLoading.value = false
      }
    })
    .catch(() => {
      btnLoading.value = false
    })
}

// 本地上传---

const materialOperation = ref({
  uploadLoading: false, // 上传的loading
  showUpload: false, // 显示上传的dom
  acceptTypeList: [], // 支持上传的类型
  videoMaxSize: null, // 上传的大小限制
  imgMaxSize: null // 上传的大小限制
})
const acceptTypeList = reactive({
  1: ['video/mp4', 'video/quicktime']
  // 2: ['audio/mp3', 'audio/mpeg'],
  // 8: ['image/jpeg', 'image/jpg', 'image/png']
}) // 每个分镜能接受的上传类型
const maxSizeList = reactive({
  1: 500 * 1024
  // 2: 20 * 1024,
  // 8: 15 * 1024
}) // 每个分镜能接受的上传类型
const uploadRef = ref()
function showUploadFun() {
  if (materialOperation.value.uploadLoading) return
  const durationInfo = durationList.value.filter(x => x.value === formInfo.value.durationDesc)
  materialOperation.value.videoMaxSize = maxSizeList[1]
  materialOperation.value.imgMaxSize = maxSizeList[8]

  materialOperation.value.maxDuration =
    formInfo.value.audioProcessMode && formInfo.value.composeMode === 1
      ? durationInfo && durationInfo.length > 0 && durationInfo[0].max
        ? durationInfo[0].max
        : null
      : null
  materialOperation.value.minDuration = null
  materialOperation.value.acceptTypeList = acceptTypeList[1].concat(acceptTypeList[8])
  materialOperation.value.showUpload = true
  nextTick(() => {
    uploadRef.value?.showUploadFun()
  })
}

function getParamsInfo(fileType, url) {
  let type = null
  let coverUrl = ''
  switch (fileType) {
    case 'video':
      // 视频
      type = 1
      coverUrl = url + '?x-oss-process=video/snapshot,t_1000,m_fast'
      break
    case 'audio':
      // 音频
      type = 3
      break
    case 'image':
      // 图片
      type = 2
      coverUrl = url
      break
  }
  return { type, coverUrl }
}

// 本地上传成功
function uploadSuccessFun(data, index, duration, name, multiple) {
  console.log('上传成功', data, index, duration, name)
  materialOperation.value.uploadLoading = true
  const batchSaveParams = []

  ;(data || []).forEach(item => {
    const infoObj = getParamsInfo(item.fileType, item.url)
    const everyMaterial = {
      coverUrl: infoObj.coverUrl,
      name: item.fileName || '',
      source: 14,
      type: infoObj.type,
      url: item.url || ''
    }
    if (infoObj.type === 3) {
      everyMaterial.duration = item.duration || '0'
    }
    batchSaveParams.push(everyMaterial)
  })

  batchSave(batchSaveParams)
    .then(res => {
      if (res.code === 0) {
        const resIds = (res.data || []).map(x => x.id)
        // 将上传的原料ID存到流水线配置
        savePipelineConfig({
          pipelineId: pipelineId.value,
          resourcesIds: resIds
        })
          .then(res => {
            if (res.code === 0) {
              // 获取流水线详情，拿到所有的原料ID
              getPipelineDetail()
                .then(() => {
                  // 根据原料ID刷新原料列表
                  if (isNotEmpty(formInfo.value.resourcesIds)) {
                    // materialOperation.value.uploadLoading = false
                    materialOperation.value = {
                      showUpload: false,
                      uploadLoading: false
                    }
                    resetList('upload')
                  } else {
                    message.success('上传成功')
                    page.index = 1
                    materialList.value = []
                    materialLoading.value = false
                    // materialOperation.value.uploadLoading = false
                    materialOperation.value = {
                      showUpload: false,
                      uploadLoading: false
                    }
                  }
                })
                .catch(() => {
                  // materialOperation.value.uploadLoading = false
                  materialOperation.value = {
                    showUpload: false,
                    uploadLoading: false
                  }
                })
            } else {
              // materialOperation.value.uploadLoading = false
              materialOperation.value = {
                showUpload: false,
                uploadLoading: false
              }
            }
          })
          .catch(() => {
            // materialOperation.value.uploadLoading = false
            materialOperation.value = {
              showUpload: false,
              uploadLoading: false
            }
          })
      } else {
        // materialOperation.value.uploadLoading = false
        materialOperation.value = {
          showUpload: false,
          uploadLoading: false
        }
      }
    })
    .catch(() => {
      // materialOperation.value.uploadLoading = false
      materialOperation.value = {
        showUpload: false,
        uploadLoading: false
      }
    })
}
// 本地上传失败
function uploadErrFun() {
  materialOperation.value = {
    showUpload: false,
    uploadLoading: false
  }
}

// 获取导入的原料列表方法--
function resetList(source) {
  return new Promise(resolve => {
    materialLoading.value = true
    page.index = 1

    getList(source)
      .then(() => {
        if (source === 'del' || source === 'upload') {
          message.success(source === 'del' ? '刪除成功' : '上传成功')
          if (source === 'del') {
            initVideoNumList()
          }
        }
        if (source) {
          // 如果是保留原音，校验是否有选择原料个数
          if (formInfo.value.composeMode === 2) {
            if (isNotEmpty(formInfo.value.videoNumList)) {
              validList.composeMode.tip = ''
            } else {
              validList.composeMode.tip =
                videoOption.value && videoOption.value.length > 0
                  ? '请选择原料使用个数'
                  : '请先至少上传2个视频原料'
            }
          }
        }
      })
      .finally(() => {
        resolve()
      })
  })
}
function getList(source) {
  return new Promise(resolve => {
    list({
      pageNo: page.index,
      pageSize: page.size,
      isDelete: 0,
      subSource: [1, 0],
      includeIds: formInfo.value.resourcesIds || []
    })
      .then(res => {
        if (res.code === 0) {
          const list2 = res.data?.records || []
          if ($choose.isAllCheck) {
            // 全选新获取下来的数据也选中
            batchAdd(list2)
          }
          if (page.index === 1) {
            materialList.value = list2
            page.total = res.data?.total || 0
          } else {
            materialList.value = materialList.value.concat(list2)
          }
        }
        if (source && page.index === 1) {
          rightContent.value?.scrollTo(0, 0)
        }

        materialLoading.value = false
        resolve()
      })
      .catch(() => {
        materialLoading.value = false
        resolve()
      })
  })
}
function loadFun() {
  if (materialLoading.value) return
  console.log('滚动到底')
  materialLoading.value = true
  page.index++
  getList()
}
// 预览信息
const previewInfo = ref({
  show: false
}) // 预览弹窗的信息
function previewFun(info) {
  previewInfo.value = {
    show: true,
    title: info.title,
    url: info.url,
    type: info.type,
    cover: info.cover || null
  }
}

// 删除原料
// function delFun(e) {
//   console.log('删除', e)
//   materialLoading.value = true
//   removeMaterial({
//     pipelineId: pipelineId.value,
//     resourcesIds: [e.id]
//   })
//     .then(res => {
//       if (res.code === 0) {
//         // 获取流水线详情，拿到所有的原料ID
//         getPipelineDetail()
//           .then(() => {
//             // message.success('删除成功')
//             // 根据原料ID刷新原料列表
//             if (isNotEmpty(formInfo.value.resourcesIds)) {
//               resetList('del')
//             } else {
//               page.index = 1
//               materialList.value = []
//               materialLoading.value = false
//             }
//           })
//           .catch(() => {
//             materialLoading.value = false
//           })
//       } else {
//         materialLoading.value = false
//       }
//     })
//     .catch(() => {
//       materialLoading.value = false
//     })
// }

// 将毫秒转换成分秒
function conversionTime(time) {
  return secToMin((time || 0) / 1000)
}
const videoPreviewFn = throttle(function (item) {
  console.log('点击预览视频', item)

  const info = {
    show: true,
    cover: item.coverUrl,
    url: item.url || item.mediaUrl,
    type: 'video',
    title: '预览视频'
  }
  previewFun(info)
}, 500)
const previewImg = throttle(function (item) {
  console.log('点击预览图片', item)
  const info = {
    show: true,
    url: item.mediaUrl || item.url,
    type: 'image',
    title: '预览图片'
  }
  previewFun(info)
}, 500)
defineExpose({
  validFun
})
const emits = defineEmits(['update:info', 'update:btnDis', 'changeType'])
watch(
  () => formInfo.value,
  val => {
    console.log('数据修改', val)
    emits('update:info', val)
  },
  {
    deep: true
  }
)

watch(
  () => materialLoading.value,
  () => {
    emits(
      'update:btnDis',
      materialLoading.value || materialOperation.value.uploadLoading || bgmLoading.value
    )
  },
  {
    immediate: true
  }
)
watch(
  () => bgmLoading.value,
  () => {
    emits(
      'update:btnDis',
      materialLoading.value || materialOperation.value.uploadLoading || bgmLoading.value
    )
  },
  {
    immediate: true
  }
)
watch(
  () => materialOperation.value.uploadLoading,
  () => {
    emits(
      'update:btnDis',
      materialLoading.value || materialOperation.value.uploadLoading || bgmLoading.value
    )
  }
)
</script>
<style lang="scss" scoped>
@import '../create_by_template/components/scss/step.scss';
div {
  box-sizing: border-box;
}
.step1_page {
  background: #f7f8fa;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  .page_left {
    border-radius: 4px;
    background: #fff;
    width: 780px;
    height: 100%;
    margin-right: 16px;
    overflow-y: auto;
    padding: 2px 24px 17px;
    position: relative;
    .change_btn_change {
      position: absolute;
      top: 20px;
      right: 24px;
    }
    .choose_warp {
      margin-top: 300px;
      .tip_warp {
        font-family: PingFangSC, PingFang SC;
        font-weight: 600;
        font-size: 16px;
        color: #303133;
        line-height: 22px;
        width: 100%;
        text-align: center;
      }
      .btn_warp {
        margin-top: 24px;
        display: flex;
        justify-content: center;
        .change_btn + .change_btn {
          margin-left: 16px;
        }
      }
    }
    .video_setting_warp {
      padding-left: 116px;
      margin-top: 4px;
    }
    .radio_tip {
      :deep(.el-radio__label) {
        display: flex;
        align-items: center;
      }
      .tip_icon {
        width: 16px;
        height: 16px;
        margin-left: 8px;
      }
    }
    .content_content_err_warp {
      padding-left: 32px;
      margin-top: 4px;
      font-family: PingFangSC, PingFang SC;
      font-weight: 400;
      font-size: 12px;
      color: #f56c6c;
      line-height: 18px;
    }

    .left_title {
      padding: 20px 0 16px;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      font-weight: 600;
      font-size: 16px;
      color: #303133;
      line-height: 22px;
      span {
        margin-right: 8px;
        color: #364fcd;
      }
    }
    .content_box {
      width: 100%;
      padding: 16px;
      background: #f2f3f5;
      border-radius: 2px;
      .left_content {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        .content_title {
          margin-right: 8px;
          width: 82px;
          height: 32px;
          line-height: 24px;
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
          align-items: center;
          font-weight: 400;
          font-size: 14px;
          color: #303133;
          line-height: 20px;
        }
        .content_title_required::before {
          content: '*';
          color: var(--el-color-danger);
          margin-right: 4px;
        }
        .content_content {
          width: calc(100% - 90px);
          .err_tip {
            font-weight: 400;
            font-size: 12px;
            color: #f56c6c;
            line-height: 18px;
          }
          :deep(.err_input .el-input__inner) {
            border-color: #f56c6c;
          }
        }
        .content_radio_box {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          flex-wrap: wrap;
          .content_radio {
            cursor: pointer;
            margin-bottom: 8px;
            margin-right: 8px;
            width: max-content;
            padding: 4px 10px;
            background: #ffffff;
            border-radius: 4px;
            font-weight: 400;
            font-size: 12px;
            color: #909399;
            line-height: 16px;
          }
          .choose_radio {
            background: #364fcd;
            color: #ffffff;
          }
        }
      }
      .left_content + .left_content {
        margin-top: 20px;
      }
    }
    .content_bgm {
      margin-top: 12px;
    }
  }
  .page_right {
    border-radius: 4px;
    background: #fff;
    width: calc(100% - 796px);
    height: calc(100% - 2px);
    padding: 20px 0px 2px 24px;
    .right_top {
      margin-bottom: 16px;
      padding-right: 24px;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      .top_left {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        height: 32px;
        .top_title {
          font-weight: 600;
          font-size: 16px;
          color: #303133;
          line-height: 22px;
          margin-right: 16px;
        }
        .top_voice {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          font-weight: 400;
          font-size: 14px;
          color: #303133;
          line-height: 20px;
          img {
            cursor: pointer;
            width: 20px;
            height: 20px;
            object-fit: contain;
            display: flex;
          }
        }
      }
      .top_btn {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex: 1;
        white-space: nowrap;
        height: 32px;
        .btn_item {
          cursor: pointer;
          display: flex;
          align-items: center;
          font-weight: 400;
          font-size: 14px;
          color: #606266;
          &:first-child {
            margin-right: 16px;
          }
          .check_box {
            margin-right: 8px;
            margin-left: 0;
          }
        }
        .btn_del {
          color: #364fcd;
        }
      }
      .top_right {
        margin-left: 16px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }
    }
    .right_bottom {
      width: 100%;
      height: calc(100% - 48px);

      .bottom_content {
        width: 100%;
        height: 100%;

        overflow-y: auto;
      }
      .material_box {
        display: flex;
        flex-wrap: wrap;
      }
      .xm_pullUpToLoadMore {
        padding-bottom: 16px;
      }
      .material_item {
        width: 105px;
        height: 140px;
        min-width: 105px;
        min-height: 140px;
        margin-right: 12px;
        margin-bottom: 12px;
        border-radius: 4px;
        box-sizing: border-box;

        border: 2px solid #fff;
        position: relative;
        .del_warp {
          position: absolute;
          bottom: 0;
          padding-bottom: 8px;
          // right: 8px;
          right: 0;
          cursor: pointer;
          border-radius: 4px;
          width: max-content;
          z-index: 13;
          height: max-content;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-end; // background: rgba(0, 0, 0, 0.2);
          .del_icon {
            width: 24px;
            height: 24px;
            object-fit: contain;
            display: flex;
            z-index: 13;
            border-radius: 4px;
          }
        }

        .cover_img {
          width: 100%;
          height: 100%;
          border-radius: 4px;
          position: absolute;
          top: 0;
          left: 0;
          object-fit: cover;
          display: flex;
          overflow-clip-margin: border-box;
          -webkit-overflow-clip-margin: border-box;
        }
        .video_time {
          position: relative;
          top: 6px;
          left: 6px;
          padding: 0 4px;
          font-family: PingFangSC, PingFang SC;
          font-weight: 400;
          font-size: 12px;
          color: #ffffff;
          line-height: 14px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 2px;
          width: max-content;
        }
        .video_preview {
          width: 36px;
          height: 36px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          cursor: pointer;
          border-radius: 50%;
        }
        .img_preview {
          width: 60px;
          height: 60px;
          border-radius: unset;
        }
      }
    }
  }
  .page_right_un_one_line {
    .top_right {
      margin-left: 0;
      width: 100%;
    }
  }
}
.xm_noneData {
  flex-direction: column;
  padding: 0 24px 0 0px;
  text-align: center;
  font-weight: 400;
  font-size: 12px;
  color: #909399;
  line-height: 18px;
  .none_tip1 {
    margin-top: 9px;
    margin-bottom: 8px;
    font-size: 14px;
    color: #303133;
    line-height: 20px;
  }
}
:deep(.select_err .el-input__inner) {
  border-color: red;
}
</style>
