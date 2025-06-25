<template>
  <div class="step2_page step_page">
    <div class="page_top">
      <stepsTitle :currentSteps="1" title="请为被设置为替换项的分镜导入原料组"></stepsTitle>
    </div>
    <div class="page_bottom" v-loading="templateInfo.loading">
      <div class="template_info">
        <!-- 模板名称和分镜类型 -->
        <div class="info1">
          <div class="template_name line-hidden1">{{ moduleInfo.name || '--' }}</div>
          <div class="template_type">
            <template v-for="(item, index) in templateInfo.typeList">
              <div
                :class="{ one_type: true, choose_type: chooseType == item.id }"
                :key="index"
                v-if="
                  (!templateInfo.loading && moduleInfo[item.key] > 0 && item.id > -1) ||
                  item.id === -1
                "
                @click="changeTypeFun(item)"
              >
                {{ item.label }}
                <span v-if="moduleInfo[item.key] > 0">{{ moduleInfo[item.key] || 0 }}</span>
              </div>
            </template>
          </div>
        </div>
        <!-- 模板视频和分镜轨道 -->
        <div class="info2">
          <div
            class="template_video"
            @click="previewFun('查看视频', moduleInfo.materialPath, 'video', moduleInfo.coverUrl)"
          >
            <img class="video_cover" v-if="moduleInfo.coverUrl" :src="moduleInfo.coverUrl" alt="" />
            <img
              class="play_icon"
              src="https://tagvv-1256030678.file.myqcloud.com/20240329lnttj.png"
              alt=""
            />
          </div>
          <div class="template_track">
            <trackChart
              v-if="moduleInfo.templateConfigJson"
              :disClick="true"
              :allowCancel="true"
              :initShowTrack="true"
              :showTimeLine="true"
              :templateConfigJson="moduleInfo.templateConfigJson"
              :duration="Math.ceil(moduleInfo.duration / 1000000)"
              @choseTrack="choseTrack"
              @hideTrackAreaFn="hideTrackAreaFn"
            />
            <div class="none_track" v-else>暂无分镜</div>
          </div>
        </div>
      </div>
      <div
        class="template_storyboard sumvideo_page"
        v-loading="!templateInfo.loading && storyboardInfo.loading"
        :style="disPageAction ? 'pointer-events: none' : ''"
      >
        <div class="storyboard_box">
          <template v-if="storyboardInfo.listData && storyboardInfo.listData.length > 0">
            <div
              class="all_storyboard"
              :infinite-scroll-delay="1000"
              v-infinite-scroll="loadFun"
              :infinite-scroll-distance="50"
              :infinite-scroll-immediate="false"
              :infinite-scroll-disabled="
                storyboardInfo.listData.length >= storyboardInfo.page.total
              "
            >
              <!-- 分镜组 -->
              <div
                :class="{ one_group_box: true, none_group_box: !a.id }"
                v-for="(a, b) in storyboardInfo.listData"
                :key="b"
              >
                <!-- 分镜组的信息 -->
                <div class="one_group" v-if="a.id">
                  <div class="group1">{{ b + 1 }}.{{ a.groupName || '未命名分组' }}</div>
                  <div class="group2 line-hidden1" :title="a.groupDesc || ''">
                    {{ a.groupDesc || '' }}
                  </div>
                </div>
                <!-- 每一个分镜内容 -->
                <div
                  :class="{
                    one_storyboard: true,
                    red_storyboard: props.errIdList.includes(item.creativeReplaceId)
                  }"
                  :ref="setItemRefListItem($el, item.creativeReplaceId)"
                  v-for="(item, index) in a.groupClipList"
                  :key="index"
                  v-loading="
                    materialOperation.uploadLoading &&
                    materialOperation.clickStoryboardId == item.creativeReplaceId
                  "
                >
                  <!-- 分镜标题等固定信息 -->
                  <storyboardFixedInfo
                    :info="item"
                    :index="index"
                    @previewFun="previewFun"
                    @previewTextFun="previewTextFun"
                  >
                    <template #rightOperation>
                      <!-- 全选+删除 -->
                      <div
                        class="all_choose_box"
                        v-if="
                          materialInfo[item.creativeReplaceId] &&
                          materialInfo[item.creativeReplaceId].chooseList &&
                          materialInfo[item.creativeReplaceId].chooseList.length > 0
                        "
                      >
                        <div
                          class="xm_check_box_round"
                          @click="setCheckFun(item.creativeReplaceId, item)"
                        >
                          <div
                            :class="[
                              'check_box',
                              materialInfo[item.creativeReplaceId].checkStatus === 1
                                ? 'check_box_half_choose'
                                : materialInfo[item.creativeReplaceId].checkStatus === 2
                                ? 'check_box_active'
                                : ''
                            ]"
                          ></div>
                          <div class="select_all_text">全选</div>
                        </div>

                        <div
                          class="all_choose_del_btn"
                          @click.stop="delMaterialFun(item.creativeReplaceId, item)"
                        >
                          删除
                        </div>
                      </div>
                      <!-- 视频和音频显示处理方式 -->
                      <el-select
                        :disabled="
                          disPageAction &&
                          materialOperation.clickStoryboardId == item.creativeReplaceId
                        "
                        v-if="[1, 2].includes(item.mediaType)"
                        class="info_select"
                        v-model="materialInfo[item.creativeReplaceId].replaceModel"
                        placeholder="请选择"
                        @focus="nowChooseModal = materialInfo[item.creativeReplaceId].replaceModel"
                        @change="
                          replaceModelChangeFun(
                            $event,
                            item.creativeReplaceId,
                            item,
                            materialInfo[item.creativeReplaceId].replaceModel
                          )
                        "
                      >
                        <el-option
                          v-for="item in replaceModelList"
                          :label="item.label"
                          :value="item.id"
                          :key="item.id"
                        >
                          <div class="xm_flex_center">
                            {{ item.label }}
                            <el-tooltip class="item" effect="dark" placement="top">
                              <template #content>
                                <div class="tooltip_wrap">{{ item.tip || '--' }}</div>
                              </template>
                              <div class="xm_tooltipOfRight1"></div>
                            </el-tooltip>
                          </div>
                        </el-option>
                      </el-select>
                      <!--  BGM和时长小于2s的非BGM 只能导入音频  其余为文本+AI朗读 -->
                      <el-dropdown
                        popper-class="xm_dropDown"
                        v-if="
                          !(item.mediaType == 2 && !item.isBackground && item.itemDuration >= 2000)
                        "
                      >
                        <el-button type="primary" class="xm_dropDown_btn">
                          导入{{ MEDIA_TYPE.getCN(item.mediaType) }}
                          <el-icon style="margin-left: 8px"><i-arrow-down /></el-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item
                              :disabled="materialOperation.uploadLoading"
                              @click.stop="showChooseMaterialFun(item, item.mediaType)"
                            >
                              原料库选择
                            </el-dropdown-item>
                            <el-dropdown-item
                              v-if="item.mediaType === 3"
                              :disabled="materialOperation.uploadLoading"
                              @click.stop="showAddTextFun(item, false)"
                            >
                              添加
                            </el-dropdown-item>
                            <el-dropdown-item
                              @click.stop="showUploadFun(item, index)"
                              :disabled="materialOperation.uploadLoading"
                              v-else
                            >
                              本地导入
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </template>
                  </storyboardFixedInfo>
                  <!-- mediaType 原料类型 1：视频 2：音频 3：字幕 4：滤镜 5：特效 6:贴纸 7：转场 8:图片  -->
                  <!-- 视频、图片分镜 -->
                  <videoOrImgMaterial
                    v-if="
                      (item.mediaType === 1 || item.mediaType === 8) &&
                      materialInfo[item.creativeReplaceId] &&
                      materialInfo[item.creativeReplaceId].chooseList &&
                      materialInfo[item.creativeReplaceId].chooseList.length > 0
                    "
                    :showMore="true"
                    origin="createByTemplate"
                    v-model:listTotal="materialInfo[item.creativeReplaceId].listTotal"
                    :mediaType="item.mediaType"
                    :chooseList="materialInfo[item.creativeReplaceId].chooseList"
                    :checkList="materialInfo[item.creativeReplaceId].checkList"
                    :creativeReplaceId="item.creativeReplaceId"
                    :templateId="templateId"
                    :pipelineId="pipelineId"
                    @previewFun="previewFun"
                    v-model:clickStoryboardId="materialOperation.clickStoryboardId"
                    v-model:uploadLoading="materialOperation.uploadLoading"
                    @showMaterialAllFun="showMaterialAllFun(item)"
                    @delFun="delFun(item)"
                    @onCheckChangeFun="onCheckChangeFun"
                  />
                  <!-- 音频分镜 BGM和时长小于2s的非BGM 只能导入音频  其余为文本+AI朗读 -->
                  <BGMMaterial
                    v-if="
                      item.mediaType === 2 &&
                      (item.isBackground || (!item.isBackground && item.itemDuration < 2000)) &&
                      materialInfo[item.creativeReplaceId] &&
                      materialInfo[item.creativeReplaceId].chooseList &&
                      materialInfo[item.creativeReplaceId].chooseList.length > 0
                    "
                    :showMore="true"
                    origin="createByTemplate"
                    v-model:listTotal="materialInfo[item.creativeReplaceId].listTotal"
                    :mediaType="item.mediaType"
                    :chooseList="materialInfo[item.creativeReplaceId].chooseList"
                    :checkList="materialInfo[item.creativeReplaceId].checkList"
                    :creativeReplaceId="item.creativeReplaceId"
                    :templateId="templateId"
                    :pipelineId="pipelineId"
                    @previewFun="previewFun"
                    v-model:clickStoryboardId="materialOperation.clickStoryboardId"
                    v-model:uploadLoading="materialOperation.uploadLoading"
                    @showMaterialAllFun="showMaterialAllFun(item)"
                    @delFun="delFun(item)"
                    @onCheckChangeFun="onCheckChangeFun"
                  />
                  <div
                    class="notBGM_material"
                    v-if="item.mediaType === 2 && !item.isBackground && item.itemDuration >= 2000"
                  >
                    <chooseVoiceDOM
                      v-if="
                        defaultVoiceInfo.voiceList &&
                        defaultVoiceInfo.voiceList.length > 0 &&
                        defaultVoiceInfo.typeList &&
                        defaultVoiceInfo.typeList.length > 0
                      "
                      class="notBGM_one_material choose_voice_dom"
                      topIcon="https://tagvv-1256030678.file.myqcloud.com/20240401zsr3g.png"
                      :chooseInfo="
                        materialInfo[item.creativeReplaceId] &&
                        materialInfo[item.creativeReplaceId].chooseVoiceList &&
                        materialInfo[item.creativeReplaceId].chooseVoiceList.length > 0
                          ? materialInfo[item.creativeReplaceId].chooseVoiceList
                          : []
                      "
                      :creativeReplaceId="item.creativeReplaceId"
                      @updateVoiceFun="updateVoiceFun"
                      :initOver="true"
                      :defaultVoiceList="defaultVoiceInfo.voiceList"
                      :defaultTypeList="defaultVoiceInfo.typeList"
                    />
                    <chooseTextDOM
                      :showMore="true"
                      origin="createByTemplate"
                      v-model:listTotal="materialInfo[item.creativeReplaceId].listTotal"
                      :delLoading="delChooseTextInfo.loading"
                      :duration="item.itemDuration"
                      :delChooseTextInfo="delChooseTextInfo"
                      class="notBGM_one_material"
                      :chooseList="materialInfo[item.creativeReplaceId].chooseTextList"
                      :checkList="materialInfo[item.creativeReplaceId].checkList"
                      :creativeReplaceId="item.creativeReplaceId"
                      :templateId="templateId"
                      :pipelineId="pipelineId"
                      @showMaterialAllFun="showMaterialAllFun(item)"
                      @delFun="delFun(item)"
                      @changeDelInfo="changeDelInfo"
                      @onCheckChangeFun="onCheckChangeFun"
                    >
                      <template #topBtn>
                        <!-- 全选+删除 -->
                        <div
                          class="all_choose_box"
                          v-if="
                            materialInfo[item.creativeReplaceId] &&
                            materialInfo[item.creativeReplaceId].chooseTextList &&
                            materialInfo[item.creativeReplaceId].chooseTextList.length > 0
                          "
                        >
                          <div
                            class="xm_check_box_round"
                            @click="setCheckFun(item.creativeReplaceId, item)"
                          >
                            <div
                              :class="[
                                'check_box',
                                materialInfo[item.creativeReplaceId].checkStatus === 1
                                  ? 'check_box_half_choose'
                                  : materialInfo[item.creativeReplaceId].checkStatus === 2
                                  ? 'check_box_active'
                                  : ''
                              ]"
                            ></div>
                            <div class="select_all_text">全选</div>
                          </div>

                          <div
                            class="all_choose_del_btn"
                            @click.stop="delMaterialFun(item.creativeReplaceId, item)"
                          >
                            删除
                          </div>
                        </div>
                        <el-dropdown popper-class="xm_dropDown">
                          <el-button type="primary">
                            导入{{ MEDIA_TYPE.getCN(3) }}
                            <el-icon style="margin-left: 8px"><i-arrow-down /></el-icon>
                          </el-button>
                          <template #dropdown>
                            <el-dropdown-menu>
                              <el-dropdown-item
                                @click.stop="showChooseMaterialFun(item, 3, true)"
                                :disabled="materialOperation.uploadLoading"
                              >
                                原料库选择
                              </el-dropdown-item>
                              <el-dropdown-item
                                @click.stop="showAddTextFun(item, true)"
                                :disabled="materialOperation.uploadLoading"
                              >
                                添加
                              </el-dropdown-item>
                            </el-dropdown-menu>
                          </template>
                        </el-dropdown>
                      </template>
                    </chooseTextDOM>
                  </div>
                  <!-- 文本分镜 -->
                  <textMaterial
                    v-if="
                      item.mediaType === 3 &&
                      materialInfo[item.creativeReplaceId] &&
                      materialInfo[item.creativeReplaceId].chooseList &&
                      materialInfo[item.creativeReplaceId].chooseList.length > 0
                    "
                    :showMore="true"
                    origin="createByTemplate"
                    v-model:listTotal="materialInfo[item.creativeReplaceId].listTotal"
                    :chooseList="materialInfo[item.creativeReplaceId].chooseList"
                    :checkList="materialInfo[item.creativeReplaceId].checkList"
                    :creativeReplaceId="item.creativeReplaceId"
                    :templateId="templateId"
                    :pipelineId="pipelineId"
                    v-model:clickStoryboardId="materialOperation.clickStoryboardId"
                    v-model:uploadLoading="materialOperation.uploadLoading"
                    @showMaterialAllFun="showMaterialAllFun(item)"
                    @delFun="delFun(item)"
                    @onCheckChangeFun="onCheckChangeFun"
                  />
                </div>
              </div>
            </div>
            <div class="loading_library">
              <img
                src="/public/loading.gif"
                v-if="storyboardInfo.loading && storyboardInfo.page.index > 1"
                alt=""
              />
              {{
                storyboardInfo.loading
                  ? storyboardInfo.page.index === 1
                    ? ''
                    : '加载中...'
                  : storyboardInfo.listData.length >= storyboardInfo.page.total
                  ? storyboardInfo.listData.length > 12
                    ? '已经到底了~'
                    : ''
                  : '上拉加载更多~'
              }}
            </div>
          </template>
          <div
            v-if="
              !(templateInfo.loading || storyboardInfo.loading) &&
              !(storyboardInfo.listData && storyboardInfo.listData.length > 0)
            "
            class="no_echart"
          >
            <img src="@/assets/images/content_center/no_activity.png" alt />
            暂无数据
          </div>
        </div>
      </div>
    </div>
    <!-- 预览分镜的弹窗 -->
    <previewDialog v-if="previewInfo.show" :previewDialog="previewInfo"></previewDialog>
    <!-- 预览文本 -->
    <previewTextDialog v-if="previewTextInfo.show" :previewDialog="previewTextInfo" />
    <!-- 统一的上传入口 -->
    <uploadMaterial
      v-if="materialOperation.showUpload"
      ref="uploadRef"
      origin="createByTemplate"
      :showLoading="false"
      :maxSize="materialOperation.maxSize"
      :minDuration="materialOperation.minDuration"
      :maxDuration="materialOperation.maxDuration"
      durationUnit="ms"
      :replaceModel="materialOperation.replaceModel"
      :index="1"
      :limit="50"
      :multiple="true"
      v-model:uploadLoading="materialOperation.uploadLoading"
      @success="uploadSuccessFun"
      @error="uploadErrFun"
      :acceptTypeList="materialOperation.acceptTypeList"
    ></uploadMaterial>

    <!-- 原料库选择 -->
    <selectMaterialDOM
      origin="productStep"
      v-if="chooseMaterialDialog.show"
      :info="chooseMaterialDialog"
      :dialogTitle="chooseMaterialDialog.dialogTitle"
      :subtitle="chooseMaterialDialog.subtitle"
      :materialType="chooseMaterialDialog.materialType"
      :scriptReplaceId="chooseMaterialDialog.creativeReplaceId"
      :scriptId="templateId"
      :pipelineId="pipelineId"
      :materialTypeList="chooseMaterialDialog.materialTypeList"
      @updateSelectInfo="updateSelectFun"
      :lengthMin="chooseMaterialDialog.lengthMin"
      :lengthMax="chooseMaterialDialog.lengthMax"
      :durationMin="chooseMaterialDialog.durationMin"
      :durationMax="chooseMaterialDialog.durationMax"
      :resourceType="chooseMaterialDialog.resourceType"
      :replaceModel="chooseMaterialDialog.replaceModel"
    />

    <!-- 添加文本的弹窗 -->
    <addTextDOM
      :isSaveCloseDialog="false"
      v-if="addTextDialog.show"
      :minlength="addTextDialog.minlength"
      :maxlength="addTextDialog.maxlength"
      :info="addTextDialog"
      @submit="updateTextFun"
    />
    <!-- 查看所有导入原料的弹窗 -->
    <materialDOM
      v-if="materialDialog.show"
      origin="createByTemplate"
      :materialDialog="materialDialog"
      @previewFun="previewFun"
      @updateChooseList="updateChooseList"
    />
  </div>
</template>
<script setup>
import { ElMessageBox } from 'element-plus'
import {
  setClipReplaceModel,
  importMaterial,
  listImportMaterial,
  removeMaterial
} from '@/api/sumvideo/create_by_template.js'
import { save, batchSave } from '@/api/content_center/material_library.js'
import { getVoiceLabel, getVoices } from '@/api/sumvideo/material.js'
import { MEDIA_TYPE } from '@/utils/dictionary/sumvideo'
import materialDOM from './components/material_dialog.vue'
// import uploadMaterial from '@/views/market/miniprogram_operation/components/upload_video.vue'
import addTextDOM from '@/views/sumvideo/components/material/add_text_dialog.vue'
import selectMaterialDOM from '@/views/sumvideo/components/material/select_material_dialog.vue'
import uploadMaterial from '@/views/sumvideo/components/material/upload_material_dialog.vue'
import previewDialog from '@/components/preview_dialog/preview_dialog.vue'
import previewTextDialog from '@/components/preview_text/preview_text.vue'
import storyboardFixedInfo from './components/storyboard_fixed_info.vue'
import chooseTextDOM from './components/choose_text.vue'
import textMaterial from './components/text_material.vue'
import BGMMaterial from './components/BGM_material.vue'
import videoOrImgMaterial from './components/video_or_image_material.vue'
import stepsTitle from '@/views/sumvideo/components/step/steps_content_title.vue'
import trackChart from '@/views/sumvideo/components/track_chart.vue'
import chooseVoiceDOM from '@/views/sumvideo/components/material/choose_voice.vue'
import { details } from '@/api/sumvideo/creative_mould.js'
import { listGroupClip } from '@/api/sumvideo/creative_templateSpectroscope.js'
import { throttle, isEmpty, isNotEmpty } from '@/utils/tools.js'
import { trackFun } from './components/js/step2'
// import { materialAction } from './components/js/material'

// const { getVideoStoryboardMethodType } = materialAction()
const props = defineProps({
  stepLoading: {
    type: Boolean,
    default: false
  },
  choosematerialInfo: {
    type: Object,
    default: () => {
      return {}
    }
  },
  templateId: {
    type: Number || String,
    default: null
  },
  pipelineId: {
    type: Number || String,
    default: null
  },
  errIdList: {
    type: Array,
    default: () => {
      return []
    }
  } // 校验失败的分镜ID列表
})
const { templateId, pipelineId } = toRefs(props)
const replaceModelList = reactive([
  {
    label: '长原料随机选取',
    tip: '从原料中随机选取分镜时长长度的片段',
    id: 0
  },
  {
    label: '选取前段',
    tip: '从原料中选取分镜时长长度的前部分片段',
    id: 1
  },

  {
    label: '智能倍速',
    tip: '对原料进行倍速，超过分镜时长 2 倍的原料不会被使用',
    id: 3
  }
]) // 视频和音频的处理方式列表
const templateInfo = reactive({
  loading: true, // 获取模板信息的loading
  typeList: [
    {
      id: -1,
      label: '全部',
      key: null
    },
    {
      id: 1,
      label: '视频',
      key: 'videoClipCnt'
    },
    {
      id: 8,
      label: '图片',
      key: 'photoClipCnt'
    },
    {
      id: 2,
      label: '音频',
      key: 'audioClipCnt'
    },
    {
      id: 3,
      label: '文本',
      key: 'textClipCnt'
    }
  ], // 分镜类型
  chooseType: -1, // 选中的分镜类型
  moduleInfo: {} // 模板信息
}) // 模板相关的信息
const { moduleInfo, chooseType } = toRefs(templateInfo)
// mediaType 原料类型 1：视频 2：音频 3：字幕 4：滤镜 5：特效 6:贴纸 7：转场 8:图片
const storyboardInfo = reactive({
  loading: false,
  listData: [], // 分镜列表
  page: {
    index: 1,
    size: 12,
    total: 0
  }
}) // 分镜相关的信息

// 获取模板详情
const getTemplateInfo = () => {
  return new Promise(resolve => {
    templateInfo.loading = true
    details(templateId.value, 1)
      .then(res1 => {
        if (res1.code === 0) {
          const { data } = res1
          if (data.templateConfigJson) {
            data.templateConfigJson = JSON.parse(data.templateConfigJson)
          } else {
            data.templateConfigJson = null
          }

          moduleInfo.value = {
            ...data
          }
          emits('updateClipCntFun', data.replaceCnt || 0)
          templateInfo.loading = false
          resolve()
        } else {
          templateInfo.loading = false
          resolve()
        }
      })
      .catch(() => {
        templateInfo.loading = false
        resolve()
      })
  })
}

// 切换分镜类型获取对应的分镜列表
const changeTypeFun = throttle(e => {
  if (materialOperation.value.uploadLoading) return
  if (chooseType.value === e.id) return
  chooseType.value = e.id
  resetStoryboardFun()
}, 300)

// 分镜列表的滚动事件
const loadFun = throttle(function () {
  if (storyboardInfo.loading) return
  console.log('滚动到底')
  storyboardInfo.loading = true
  storyboardInfo.page.index++
  getList()
}, 500)
// 获取分镜列表
function getList() {
  return new Promise(resolve => {
    listGroupClip({
      mediaType: chooseType.value === -1 ? null : chooseType.value,
      creativeId: templateId.value,
      isReplace: 1
      // pageNo: storyboardInfo.page.index,
      // pageSize: storyboardInfo.page.size
    })
      .then(res => {
        if (res.code === 0) {
          let list = []
          ;(res.data?.groupOrderList || []).forEach(x => {
            if (isNotEmpty(x.groupClipList)) {
              list = list.concat(x.groupClipList)
            }
          })
          console.log('list', list)
          // 不是初次，就回显上一次信息
          const infoList = isEmpty(materialInfo.value)
            ? {}
            : JSON.parse(JSON.stringify(materialInfo.value))

          const materialList = isEmpty(materialInfo.value) ? {} : materialInfo.value
          list.forEach(x => {
            if ([1, 2].includes(x.mediaType)) {
              // if (x.mediaType === 2) {
              //   x.isBackground = getVideoStoryboardMethodType(x)
              // }
              // BGM和时长小于2s的非BGM 只能导入音频  其余为文本+AI朗读
              // 所以 要初始化 音色列表 和 文本列表
              let info = {}
              // 没设置过分镜的进行初始化 否则数据回显
              if (isEmpty(infoList) || isEmpty(infoList[x.creativeReplaceId])) {
                if (x.mediaType === 2 && !x.isBackground && x.itemDuration >= 2000) {
                  info = { replaceModel: 0, chooseVoiceList: [], chooseTextList: [], listTotal: 0 }
                } else {
                  info = { replaceModel: 0, chooseList: [], listTotal: 0 }
                }
              } else {
                info = infoList[x.creativeReplaceId]
              }
              info.checkStatus = null // 全选状态 Null 未选中 1半选 2全选
              info.checkList = [] // 选中的列表
              info.unCheckList = [] // 取消选中的列表
              info.checkTotal = 0 // 选中的数量
              info.isAllCheck = false // 是否点击过全选
              materialList[x.creativeReplaceId] = info
            } else {
              if (isEmpty(infoList) || isEmpty(infoList[x.creativeReplaceId])) {
                materialList[x.creativeReplaceId] = {
                  chooseList: [],
                  listTotal: 0,
                  checkStatus: null,
                  checkList: [],
                  unCheckList: [],
                  checkTotal: 0,
                  isAllCheck: false
                }
              } else {
                infoList[x.creativeReplaceId].checkStatus = null
                infoList[x.creativeReplaceId].checkList = []
                infoList[x.creativeReplaceId].unCheckList = []
                infoList[x.creativeReplaceId].checkTotal = 0
                infoList[x.creativeReplaceId].isAllCheck = false
                materialList[x.creativeReplaceId] = infoList[x.creativeReplaceId]
              }
            }
          })
          // const infoList = isEmpty(materialInfo.value)
          //   ? {}
          //   : JSON.parse(JSON.stringify(materialInfo.value))

          // const materialList = {}
          // list.forEach(x => {
          //   if ([1, 2].includes(x.mediaType)) {
          //     // BGM和时长小于2s的非BGM 只能导入音频  其余为文本+AI朗读
          //     // 所以 要初始化 音色列表 和 文本列表
          //     let info = {}
          //     // 没设置过分镜的进行初始化 否则数据回显
          //     console.log(
          //       '当前分镜是否有设置过',
          //       infoList[x.creativeReplaceId],
          //       x.creativeReplaceId,
          //       infoList,
          //       isEmpty(infoList),
          //       isEmpty(infoList[x.creativeReplaceId]),
          //       isEmpty(infoList) && isEmpty(infoList[x.creativeReplaceId])
          //     )
          //     if (isEmpty(infoList) || isEmpty(infoList[x.creativeReplaceId])) {
          //       if (x.mediaType === 2 && !x.isBackground && x.itemDuration >= 2000) {
          //         info = { replaceModel: 0, chooseVoiceList: [], chooseTextList: [], listTotal: 0 }
          //       } else {
          //         info = { replaceModel: 0, chooseList: [], listTotal: 0 }
          //       }
          //     } else {
          //       info = infoList[x.creativeReplaceId]
          //     }
          //     materialList[x.creativeReplaceId] = info
          //   } else {
          //     if (isEmpty(infoList) || isEmpty(infoList[x.creativeReplaceId])) {
          //       materialList[x.creativeReplaceId] = {
          //         chooseList: [],
          //         listTotal: 0
          //       }
          //     } else {
          //       materialList[x.creativeReplaceId] = infoList[x.creativeReplaceId]
          //     }
          //   }
          // })
          materialInfo.value = materialList
          if (storyboardInfo.page.index === 1) {
            storyboardInfo.listData =
              res.data?.groupOrderList.filter(e => isNotEmpty(e.groupClipList)) || []
          } else {
            storyboardInfo.listData = storyboardInfo.listData.concat(
              res.data?.groupOrderList.filter(e => isNotEmpty(e.groupClipList)) || []
            )
          }

          storyboardInfo.page.total = res.data?.total || 0
          nextTick(() => {
            storyboardInfo.loading = false
            resolve()
          })
        } else {
          storyboardInfo.loading = false
          resolve()
        }
      })
      .catch(() => {
        storyboardInfo.loading = false
        resolve()
      })
  })
}
// 重置分镜列表
function resetStoryboardFun() {
  return new Promise(resolve => {
    storyboardInfo.loading = true
    // storyboardInfo.listData = []
    storyboardInfo.page.index = 1
    getList().finally(() => {
      resolve()
    })
  })
}

const { choseTrack, hideTrackAreaFn, setItemRefListItem, itemRefsListItem, isElementInViewport } =
  trackFun(storyboardInfo)
onMounted(() => {
  emits('update:stepLoading', true)
  if (isNotEmpty(props.choosematerialInfo)) {
    const infoList = JSON.parse(JSON.stringify(props.choosematerialInfo))
    materialInfo.value = infoList
  }
  templateInfo.chooseType = -1

  const p3 = getAllVoiceFun()
  const p1 = getTemplateInfo()
  const p2 = resetStoryboardFun()
  Promise.all([p1, p2, p3]).then(() => {
    emits('update:stepLoading', false)
  })
})

// 获取默认的音色信息
const defaultVoiceInfo = reactive({
  voiceList: [],
  typeList: []
})
function getAllVoiceFun() {
  return new Promise(resolve => {
    const p1 = getDefaultTypeList()
    const p2 = getDefaultVoiceList()
    Promise.all([p1, p2]).then(() => {
      resolve()
    })
  })
}
// 获取类型列表
function getDefaultTypeList() {
  return new Promise(resolve => {
    getVoiceLabel({
      gender: 1
    })
      .then(res => {
        if (res.code === 0) {
          const list = res.data || []
          list.unshift({
            voiceTypeName: '全部',
            id: -1,
            voiceTypeCode: null,
            gender: 1
          })
          defaultVoiceInfo.typeList = list
        }
        resolve()
      })
      .catch(() => {
        defaultVoiceInfo.typeList = [
          {
            voiceTypeName: '全部',
            id: -1,
            voiceTypeCode: null,
            gender: 1
          }
        ]
        resolve()
      })
  })
}
// 获取音色列表
function getDefaultVoiceList() {
  return new Promise(resolve => {
    getVoices({
      gender: 1,
      voiceTypeName: ''
    })
      .then(res => {
        if (res.code === 0) {
          const list = res.data || []
          list.forEach(x => {
            x.isChoose = false
          })
          defaultVoiceInfo.voiceList = list
        }
        resolve()
      })
      .catch(() => {
        defaultVoiceInfo.voiceList = []
        resolve()
      })
  })
}
// 导入原料的相关方法
const materialInfo = ref() // 导入的原料信息

const materialOperation = ref({
  clickStoryboardType: null, // 点击的分镜类型
  clickStoryboardId: null, // 点击的分镜id
  uploadLoading: false, // 导入的loading
  showUpload: false, // 显示导入的dom
  acceptTypeList: [], // 支持导入的类型
  maxSize: null // 导入的大小限制
})
const acceptTypeList = reactive({
  1: ['video/mp4', 'video/quicktime'],
  2: ['audio/mp3', 'audio/mpeg'],
  8: ['image/jpeg', 'image/jpg', 'image/png']
}) // 每个分镜能接受的上传类型
const maxSizeList = reactive({
  1: 500 * 1024,
  2: 20 * 1024,
  8: 15 * 1024
}) // 每个分镜能接受的上传类型
const uploadRef = ref()

// 显示导入的入口
function showUploadFun(item, index) {
  if (materialOperation.value.uploadLoading) return
  materialOperation.value.minDuration =
    item.mediaType === 1 || item.mediaType === 2 ? Math.ceil(item.itemDuration * 0.5) : null
  materialOperation.value.maxDuration =
    (item.mediaType === 1 || item.mediaType === 2) &&
    materialInfo.value[item.creativeReplaceId].replaceModel === 3
      ? Math.ceil(item.itemDuration * 2)
      : null
  materialOperation.value.maxSize = maxSizeList[item.mediaType]
  materialOperation.value.clickStoryboardId = item.creativeReplaceId
  materialOperation.value.clickStoryboardType = item.mediaType
  materialOperation.value.acceptTypeList = acceptTypeList[item.mediaType]
  materialOperation.value.showUpload = true
  materialOperation.value.replaceModel = materialInfo.value[item.creativeReplaceId].replaceModel
  nextTick(() => {
    uploadRef.value?.showUploadFun()
  })
}

function getParamsInfo(clickStoryboardType, url) {
  let type = null
  let coverUrl = ''
  switch (clickStoryboardType) {
    case 1:
      // 视频
      type = 1
      coverUrl = url + '?x-oss-process=video/snapshot,t_1000,m_fast'
      break
    case 2:
      // 音频
      type = 3
      break
    case 8:
      // 图片
      type = 2
      coverUrl = url
      break
  }
  return { type, coverUrl }
}

// 本地导入成功
function uploadSuccessFun(data, index, duration, name, multiple) {
  console.log('导入成功', data, index, duration, name)
  materialOperation.value.uploadLoading = true
  let type = null
  let coverUrl = ''
  const batchSaveParams = []
  if (multiple) {
    ;(data || []).forEach(item => {
      const infoObj = getParamsInfo(materialOperation.value.clickStoryboardType, item.url)
      const everyMaterial = {
        coverUrl: infoObj.coverUrl,
        name: item.fileName || '',
        source: 11,
        type: infoObj.type,
        url: item.url || ''
      }
      if (infoObj.type === 3) {
        everyMaterial.duration = item.duration || '0'
      }
      batchSaveParams.push(everyMaterial)
    })
  } else {
    type = getParamsInfo(materialOperation.value.clickStoryboardType, data.url).type
    coverUrl = getParamsInfo(materialOperation.value.clickStoryboardType, data.url).coverUrl
  }

  const promiseRequest = multiple
    ? batchSave(batchSaveParams)
    : save({ source: 11, type: type, url: data.url, coverUrl: coverUrl || '', name: name || '' })

  // 保存到原料库
  promiseRequest
    .then(res => {
      if (res.code === 0) {
        // 拿到原料库id 导入到流水线
        const params = {
          isSelectAll: false,
          pipelineId: pipelineId.value,
          queryParam: {},
          resourceType: 0,
          scriptId: templateId.value,
          scriptReplaceId: materialOperation.value.clickStoryboardId,
          replaceModel: materialOperation.value.replaceModel
        }
        if (multiple) {
          const resIds = (res.data || []).map(x => x.id)
          params.resourceIds = resIds
        } else {
          params.resourceIds = [res.data.id]
        }

        importMaterial(params)
          .then(res1 => {
            if (res1.code === 0) {
              if (!res.data.duration || (res.data.duration && res.data.duration === '0')) {
                res.data.duration = duration
              }
              if (multiple) {
                const resData = (res.data || []).reverse()
                materialInfo.value[materialOperation.value.clickStoryboardId].listTotal +=
                  resData.length
                materialInfo.value[materialOperation.value.clickStoryboardId].chooseList =
                  resData.concat(
                    materialInfo.value[materialOperation.value.clickStoryboardId].chooseList
                  )
              } else {
                materialInfo.value[materialOperation.value.clickStoryboardId].listTotal++
                materialInfo.value[materialOperation.value.clickStoryboardId].chooseList.unshift(
                  res.data
                )
              }
              resetCheckFun(materialOperation.value.clickStoryboardId)
            }

            materialOperation.value.uploadLoading = false
          })
          .catch(() => {
            materialOperation.value.uploadLoading = false
          })
      } else {
        materialOperation.value.uploadLoading = false
      }
    })
    .catch(() => {
      materialOperation.value.uploadLoading = false
    })
}
// 本地导入失败
function uploadErrFun() {
  materialOperation.value = {
    showUpload: false,
    uploadLoading: false
  }
}
const nowChooseModal = ref() // 当前选中的处理方式
const disPageAction = ref(false) // 是否要禁用当前分镜列表的所有操作
// 处理方式改变
function replaceModelChangeFun(e, creativeReplaceId, item, val) {
  console.log(
    '切换处理方式',
    e,
    creativeReplaceId,
    item,
    !(item.mediaType === 2 && !item.isBackground && item.itemDuration >= 2000),
    val,
    nowChooseModal.value
  )
  // 视频或BGM(小于2S非BGM)的长原料处理方式修改
  if (
    !(item.mediaType === 2 && !item.isBackground && item.itemDuration >= 2000) &&
    e === 3 &&
    materialInfo.value[creativeReplaceId].chooseList &&
    materialInfo.value[creativeReplaceId].chooseList.length > 0
  ) {
    disPageAction.value = true
    materialOperation.value.uploadLoading = true
    materialOperation.value.clickStoryboardId = creativeReplaceId
    setClipReplaceModel({
      clearInvalidMaterial: false,
      clipReplaceId: creativeReplaceId,
      creativeId: templateId.value,
      pipelineId: pipelineId.value,
      replaceModel: e
    })
      .then(res => {
        if (res.code === 0) {
          if (!res.data) {
            materialOperation.value.uploadLoading = false
            materialOperation.value.clickStoryboardId = null
            // 切换“智能倍速”的时候，校验该分镜所匹配的原料中，如存在超过该分镜时长2倍的视频原料，则弹窗提示，点击“取消”后，切换不成功，恢复至原有处理方式，点击“刪除”，自动刪除所有超过2倍原料，并将处理方式切换为“智能倍速”
            materialInfo.value[creativeReplaceId].replaceModel = nowChooseModal.value
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
                disPageAction.value = false
                materialOperation.value.uploadLoading = true
                materialOperation.value.clickStoryboardId = creativeReplaceId
                changeReplaceModelOverFun(e, creativeReplaceId, true, item)
              })
              .catch(() => {
                materialOperation.value.uploadLoading = false
                materialOperation.value.clickStoryboardId = null
                disPageAction.value = false
              })
          } else {
            materialOperation.value.uploadLoading = false
            materialOperation.value.clickStoryboardId = null
            disPageAction.value = false

            materialInfo.value[creativeReplaceId].replaceModel = e
            nowChooseModal.value = materialInfo.value[creativeReplaceId].replaceModel
          }
        } else {
          materialOperation.value.uploadLoading = false
          materialOperation.value.clickStoryboardId = null
          disPageAction.value = false
        }
      })
      .catch(() => {
        materialOperation.value.uploadLoading = false
        materialOperation.value.clickStoryboardId = null
        disPageAction.value = false
      })
    return
  }
  changeReplaceModelOverFun(e, creativeReplaceId, false)
}
function changeReplaceModelOverFun(e, creativeReplaceId, clearInvalidMaterial, item) {
  materialInfo.value[creativeReplaceId].replaceModel = e
  nowChooseModal.value = materialInfo.value[creativeReplaceId].replaceModel
  setClipReplaceModel({
    clipReplaceId: creativeReplaceId,
    creativeId: templateId.value,
    pipelineId: pipelineId.value,
    replaceModel: e,
    clearInvalidMaterial: clearInvalidMaterial
  })
    .then(res => {
      if (res.code === 0) {
        if (clearInvalidMaterial) {
          resetCheckFun(creativeReplaceId)
          // 更新原料列表
          const useAIText = item.mediaType === 2 && !item.isBackground && item.itemDuration >= 2000

          listImportMaterial({
            pageNo: 1,
            pageSize: 20,
            pipelineId: pipelineId.value,
            scriptId: templateId.value,
            scriptReplaceId: creativeReplaceId
          })
            .then(res => {
              if (res.code === 0) {
                message.success('删除成功')
                if (useAIText) {
                  materialInfo.value[creativeReplaceId].chooseTextList = res.data?.records || []
                  //  删除到0个之后 校验一下
                  if (res.data?.total === 0) {
                    validVoiceTextFun(creativeReplaceId)
                  }
                } else {
                  materialInfo.value[creativeReplaceId].chooseList = res.data?.records || []
                }
                materialInfo.value[creativeReplaceId].listTotal = res.data?.total
              }
              materialOperation.value.uploadLoading = false
              materialOperation.value.clickStoryboardId = null
            })
            .catch(() => {
              materialOperation.value.uploadLoading = false
              materialOperation.value.clickStoryboardId = null
            })
        }
      } else {
        materialOperation.value.uploadLoading = false
        materialOperation.value.clickStoryboardId = null
      }
    })
    .catch(() => {
      materialOperation.value.uploadLoading = false
      materialOperation.value.clickStoryboardId = null
    })
}

// 选中音色
function updateVoiceFun(e, creativeReplaceId) {
  materialInfo.value[creativeReplaceId].chooseVoiceList = e
  validVoiceTextFun(creativeReplaceId)
}
// 校验单个文本+AI朗读
function validVoiceTextFun(creativeReplaceId) {
  // if (props.errIdList.findIndex(x => x === creativeReplaceId) === -1) return
  const voiceList = materialInfo.value[creativeReplaceId].chooseVoiceList
  const textList = materialInfo.value[creativeReplaceId].chooseTextList
  const hasVoiceList = voiceList && voiceList.length > 0
  const hasTextList = textList && textList.length > 0
  let validStatus = true
  // 两个都有
  if (hasVoiceList && hasTextList) {
    validStatus = true
  }
  // 两个都没有
  else if (!hasVoiceList && !hasTextList) {
    validStatus = true
  } else {
    validStatus = false
  }
  emits('updateErrIdFun', creativeReplaceId, !validStatus)
}
// 原料库选择相关的方法--
const chooseMaterialDialog = ref({
  creativeReplaceId: null,
  show: false,
  dialogTitle: '',
  materialType: '' // 原料类型 1视频 2图片 3音频 4文本
})
// 打开弹窗
const showChooseMaterialFun = throttle((item, mediaType, useAIText) => {
  console.log('打开导入原料', item.duration, item.itemDuration, mediaType, useAIText)
  if (materialOperation.value.uploadLoading) return
  const typeInfo = new Map([
    [1, 1],
    [2, 3],
    [3, 4],
    [8, 2]
  ])
  chooseMaterialDialog.value = {
    useAIText: useAIText,
    creativeReplaceId: item.creativeReplaceId,
    show: true,
    dialogTitle: '导入原料',
    subtitle:
      mediaType === 1 || (mediaType === 2 && !useAIText) ? `时长小于该分镜0.5倍的原料已过滤` : '',
    materialType: typeInfo.get(mediaType),
    showBackSelectMaterialList: useAIText
      ? materialInfo.value[item.creativeReplaceId].chooseTextList
      : materialInfo.value[item.creativeReplaceId].chooseList,
    materialTypeList: [typeInfo.get(mediaType)],
    durationMin:
      mediaType === 1 || (mediaType === 2 && !useAIText)
        ? Math.ceil(item.itemDuration * 0.5)
        : null,
    durationMax:
      (mediaType === 1 || (mediaType === 2 && !useAIText)) &&
      materialInfo.value[item.creativeReplaceId].replaceModel === 3
        ? Math.ceil(item.itemDuration * 2)
        : null,
    lengthMin: useAIText ? parseInt((item.itemDuration / 1000) * 4.2) : null,
    lengthMax: useAIText ? parseInt((item.itemDuration / 1000) * 5.5) : null,
    resourceType: useAIText ? 6 : 0,
    replaceModel: materialInfo.value[item.creativeReplaceId].replaceModel
  }
}, 500)
// 保存选中的原料
function updateSelectFun({ list, total }) {
  resetCheckFun(chooseMaterialDialog.value.creativeReplaceId)
  materialInfo.value[chooseMaterialDialog.value.creativeReplaceId].listTotal = total
  if (chooseMaterialDialog.value.useAIText) {
    materialInfo.value[chooseMaterialDialog.value.creativeReplaceId].chooseTextList = list
    validVoiceTextFun(chooseMaterialDialog.value.creativeReplaceId)
  } else {
    materialInfo.value[chooseMaterialDialog.value.creativeReplaceId].chooseList = list
  }
}

// 显示添加文本的弹窗--
const addTextDialog = ref({
  mediaType: null,
  useAIText: false, // 是否使用文本+AI朗读 BGM和时长小于2s的非BGM 只能导入音频  其余(大于等于2s的非BGM)为文本+AI朗读
  creativeReplaceId: null,
  maxlength: 300,
  show: false
})
const showAddTextFun = throttle((item, useAIText) => {
  if (materialOperation.value.uploadLoading) return
  addTextDialog.value = {
    mediaType: item.mediaType,
    useAIText: useAIText,
    creativeReplaceId: item.creativeReplaceId,
    minlength: useAIText ? parseInt((item.itemDuration / 1000) * 4.2) : 1,
    maxlength: useAIText ? parseInt((item.itemDuration / 1000) * 5.5) : 300,
    show: true,
    replaceModel: materialInfo.value[item.creativeReplaceId].replaceModel
  }
})
// 保存文本内容
function updateTextFun(e, dialog, loading) {
  save({ source: 11, type: 4, content: e, name: e.substring(0, 10) })
    .then(res => {
      if (res.code === 0) {
        // 拿到原料库id 导入到流水线
        importMaterial({
          isSelectAll: false,
          pipelineId: pipelineId.value,
          queryParam: {},
          resourceIds: [res.data.id],
          resourceType: addTextDialog.value.useAIText ? 6 : 0,
          scriptId: templateId.value,
          scriptReplaceId: addTextDialog.value.creativeReplaceId,
          replaceModel: addTextDialog.value.replaceModel
        })
          .then(res1 => {
            if (res1.code === 0) {
              if (addTextDialog.value.useAIText) {
                materialInfo.value[addTextDialog.value.creativeReplaceId].chooseTextList.unshift(
                  res.data
                )
                validVoiceTextFun(addTextDialog.value.creativeReplaceId)
              } else {
                materialInfo.value[addTextDialog.value.creativeReplaceId].chooseList.unshift(
                  res.data
                )
              }
              materialInfo.value[addTextDialog.value.creativeReplaceId].listTotal++
              resetCheckFun(addTextDialog.value.creativeReplaceId)
              dialog.handleClose()
            } else {
              loading = false
            }
          })
          .catch(() => {
            loading = false
          })
      } else {
        loading = false
      }
    })
    .catch(() => {
      loading = false
    })
}

// 点击查看全部
const materialDialog = ref({
  show: false
})
function showMaterialAllFun(item) {
  let materialType = null // 对应的原料类型
  let useAIText = false
  if ([1, 3, 8].includes(item.mediaType)) {
    materialType = item.mediaType
  } else {
    useAIText = item.mediaType === 2 && !item.isBackground && item.itemDuration >= 2000
    materialType = useAIText ? 3 : 2
  }
  materialDialog.value = {
    useAIText: useAIText, // 是否使用文本+AI朗读
    mediaType: item.mediaType, // 实际的原料类型
    materialType: materialType, // 要显示的原料类型 因为不足2秒的音频是打开文本弹窗
    creativeReplaceId: item.creativeReplaceId, // 分镜替换ID
    templateId: templateId.value, // 模板ID
    pipelineId: pipelineId.value, // 流水线ID
    show: true
  }
}
// 查看全部弹窗里点击了删除，所以要更新最新的导入原料信息和数量
function updateChooseList(data, total) {
  materialInfo.value[materialDialog.value.creativeReplaceId].listTotal = total
  if (materialDialog.value.useAIText) {
    materialInfo.value[materialDialog.value.creativeReplaceId].chooseTextList = data
    //  删除到0个之后 校验一下
    if (total === 0) {
      validVoiceTextFun(materialDialog.value.creativeReplaceId)
    }
  } else {
    materialInfo.value[materialDialog.value.creativeReplaceId].chooseList = data
  }
  resetCheckFun(materialDialog.value.creativeReplaceId)
}
const delChooseTextInfo = ref({
  loading: false,
  creativeReplaceId: null
})
// 文本+AI朗读的删除文本
function changeDelInfo(creativeReplaceId, loading) {
  delChooseTextInfo.value = {
    creativeReplaceId: creativeReplaceId,
    loading: loading
  }
}
const message = inject('$message')
// 清空选中状态
function resetCheckFun(creativeReplaceId) {
  materialInfo.value[creativeReplaceId].checkStatus = null
  materialInfo.value[creativeReplaceId].checkList = []
  materialInfo.value[creativeReplaceId].unCheckList = []
  materialInfo.value[creativeReplaceId].checkTotal = 0
  materialInfo.value[creativeReplaceId].isAllCheck = false
}
// 删除
function delFun(item) {
  const useAIText = item.mediaType === 2 && !item.isBackground && item.itemDuration >= 2000

  listImportMaterial({
    pageNo: 1,
    pageSize: 20,
    pipelineId: pipelineId.value,
    scriptId: templateId.value,
    scriptReplaceId: item.creativeReplaceId
  })
    .then(res => {
      if (res.code === 0) {
        if (useAIText) {
          materialInfo.value[item.creativeReplaceId].chooseTextList = res.data?.records || []
          //  删除到0个之后 校验一下
          if (res.data?.total === 0) {
            validVoiceTextFun(item.creativeReplaceId)
          }
        } else {
          materialInfo.value[item.creativeReplaceId].chooseList = res.data?.records || []
        }
        materialInfo.value[item.creativeReplaceId].listTotal = res.data?.total
      }
      resetCheckFun(item.creativeReplaceId)
      message.success('刪除成功')
      delChooseTextInfo.value.loading = false
      materialOperation.value.uploadLoading = false
    })
    .catch(() => {
      delChooseTextInfo.value.loading = false
      materialOperation.value.uploadLoading = false
    })
}

const emits = defineEmits([
  'updateErrIdFun',
  'choosematerialFun',
  'update:stepLoading',
  'updateClipCntFun',
  'update:btnDis'
])
watch(
  () => materialInfo.value,
  val => {
    emits('choosematerialFun', val)
  },
  {
    // immediate: true,
    deep: true
  }
)
watch(
  () => templateInfo.loading,
  val => {
    emitsLoadingFun()
  }
)
watch(
  () => delChooseTextInfo.value.loading,
  val => {
    emitsLoadingFun()
  }
)
watch(
  () => storyboardInfo.loading,
  val => {
    emitsLoadingFun()
  }
)
watch(
  () => materialOperation.value.uploadLoading,
  val => {
    emitsLoadingFun()
  }
)
function emitsLoadingFun() {
  if (
    templateInfo.loading ||
    delChooseTextInfo.value.loading ||
    storyboardInfo.loading ||
    materialOperation.value.uploadLoading
  ) {
    emits('update:btnDis', true)
  } else {
    emits('update:btnDis', false)
  }
}
// 预览信息
const previewInfo = ref({
  show: false
}) // 预览弹窗的信息
function previewFun(title, url, type, cover) {
  previewInfo.value = {
    show: true,
    title: title,
    url: url,
    type: type,
    cover: cover || ''
  }
}
const previewTextInfo = ref({
  show: false
})
function previewTextFun(content) {
  previewTextInfo.value = {
    text: content || '',
    show: true
  }
}

// 文本+AI朗读的校验 如果未设置完整就滚动到该位置
function validToScrollFun(errIds) {
  const itemRef = itemRefsListItem.value.find(itemRefsItem => {
    return itemRefsItem.id === errIds[0]
  })
  if (itemRef && !isElementInViewport(itemRef.ref)) {
    itemRef.ref.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}
// 单个分镜的单个原料选中/非选中状态修改
function onCheckChangeFun(item, creativeReplaceId) {
  console.log('dange ', item, creativeReplaceId, materialInfo.value[creativeReplaceId])

  const index = materialInfo.value[creativeReplaceId].checkList.findIndex(
    x => x === item.tagvvMediaId || x === item.id
  )
  const index2 = materialInfo.value[creativeReplaceId].unCheckList.findIndex(
    x => x === item.tagvvMediaId || x === item.id
  )
  if (index > -1) {
    //  当前在选中列表里面，那就从选中列表删除 并在取消选中列表里添加
    materialInfo.value[creativeReplaceId].checkTotal =
      materialInfo.value[creativeReplaceId].checkTotal - 1
    materialInfo.value[creativeReplaceId].checkList.splice(index, 1)
    materialInfo.value[creativeReplaceId].unCheckList.push(item.tagvvMediaId || item.id)
  } else {
    // 当前不在选中列表里，那就从取消选中列表里删除，并在选中列表里添加
    materialInfo.value[creativeReplaceId].checkTotal =
      materialInfo.value[creativeReplaceId].checkTotal + 1
    materialInfo.value[creativeReplaceId].checkList.push(item.tagvvMediaId || item.id)
    materialInfo.value[creativeReplaceId].unCheckList.splice(index2, 1)
  }
  nextTick(() => {
    if (
      materialInfo.value[creativeReplaceId].checkTotal ===
      materialInfo.value[creativeReplaceId].listTotal
    ) {
      materialInfo.value[creativeReplaceId].checkStatus = 2
      materialInfo.value[creativeReplaceId].isAllCheck = true
    } else if (materialInfo.value[creativeReplaceId].checkTotal > 0) {
      materialInfo.value[creativeReplaceId].checkStatus = 1
    } else {
      materialInfo.value[creativeReplaceId].checkStatus = null
    }
  })
}
// 设置单个分镜的全选 null 未选中 1半选 2全选
const setCheckFun = throttle(function (creativeReplaceId, item) {
  console.log(
    '批量删除',
    creativeReplaceId,
    materialInfo.value[creativeReplaceId].checkStatus,
    materialInfo.value[creativeReplaceId]
  )
  const list =
    item.mediaType === 2 && !item.isBackground && item.itemDuration >= 2000
      ? materialInfo.value[creativeReplaceId].chooseTextList
      : materialInfo.value[creativeReplaceId].chooseList
  const ids = list.map(x => x.tagvvMediaId || x.id)

  // 全选情况下，变成未选中
  if (materialInfo.value[creativeReplaceId].checkStatus === 2) {
    materialInfo.value[creativeReplaceId].checkStatus = null

    materialInfo.value[creativeReplaceId].checkList = []
    materialInfo.value[creativeReplaceId].unCheckList = ids
    materialInfo.value[creativeReplaceId].checkTotal = 0
    materialInfo.value[creativeReplaceId].isAllCheck = false
  } else {
    // 半选或者未选情况下，变成全选中
    materialInfo.value[creativeReplaceId].checkStatus = 2

    materialInfo.value[creativeReplaceId].checkList = ids
    materialInfo.value[creativeReplaceId].unCheckList = []

    materialInfo.value[creativeReplaceId].checkTotal =
      materialInfo.value[creativeReplaceId].listTotal
    materialInfo.value[creativeReplaceId].isAllCheck = true
  }
}, 300)
// 批量删除
const delMaterialFun = throttle(function (creativeReplaceId, item) {
  if (materialInfo.value[creativeReplaceId].checkStatus === null) {
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
      materialOperation.value.uploadLoading = true
      materialOperation.value.clickStoryboardId = creativeReplaceId
      console.log(
        '批量删除',
        creativeReplaceId,
        materialInfo.value[creativeReplaceId].chooseList,
        materialInfo.value[creativeReplaceId].checkStatus,
        materialInfo.value[creativeReplaceId]
      )
      const params = {
        pipelineId: pipelineId.value,
        scriptId: templateId.value,
        scriptReplaceId: creativeReplaceId
      }
      // 全选
      if (materialInfo.value[creativeReplaceId].checkStatus === 2) {
        params.isSelectAll = true
      } else {
        // 历史点击过全选，那就传排除的，否则就是选中的
        if (materialInfo.value[creativeReplaceId].isAllCheck) {
          params.isSelectAll = true
          params.excludeResourceIds = materialInfo.value[creativeReplaceId].unCheckList
        } else {
          params.isSelectAll = false
          params.tagvvMediaIds = materialInfo.value[creativeReplaceId].checkList
        }
      }
      removeMaterial(params)
        .then(res => {
          if (res.code === 0) {
            delFun(item)
          } else {
            materialOperation.value.uploadLoading = false
            materialOperation.value.clickStoryboardId = null
          }
        })
        .catch(() => {
          materialOperation.value.uploadLoading = false
          materialOperation.value.clickStoryboardId = null
        })
    })
    .catch(() => {})
}, 500)

defineExpose({
  validToScrollFun
})
</script>
<style lang="scss" scoped>
@import './components/scss/step.scss';
.step2_page {
  .page_bottom {
    margin-top: 8px;
    padding: 12px 24px 20px;
    .template_info {
      margin-bottom: 16px;
      .info1 {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        .template_name {
          font-weight: 600;
          font-size: 16px;
          color: #303133;
          line-height: 22px;
          margin-right: 24px;
          max-width: calc(100% - 310px);
        }
        .template_type {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          .one_type {
            cursor: pointer;
            padding: 2px 6px;
            font-weight: 400;
            font-size: 14px;
            color: #909399;
            line-height: 20px;
            border-radius: 4px;
            span {
              color: rgba(54, 79, 205, 1);
            }
          }
          .choose_type {
            background: rgba(0, 0, 0, 0.12);
            color: #303133;
          }
          .one_type + .one_type {
            margin-left: 8px;
          }
        }
      }
      .info2 {
        margin-top: 20px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        .template_video {
          cursor: pointer;
          width: 144px;
          height: 192px;
          background: #b9b9b9;
          border-radius: 4px;
          position: relative;
          overflow: hidden;
          margin-right: 16px;
          .video_cover {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: flex;
          }
          .play_icon {
            width: 36px;
            height: 36px;
            object-fit: contain;
            display: flex;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translateY(-50%) translateX(-50%);
          }
        }
        .template_track {
          width: calc(100% - 160px);
          .none_track {
            width: 100%;
            height: 192px;
            border: 1px solid #000;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 4px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.6);
          }
        }
      }
    }
    .template_storyboard {
      width: 100%;
      min-height: 64px;
      .storyboard_box {
        width: 100%;
        min-height: 100%;
        height: max-content;
        .one_storyboard + .one_storyboard {
          margin-top: 12px;
        }
        .red_storyboard {
          border-color: red;
        }
      }
      .all_storyboard {
        width: 100%;
        min-height: 100%;
        height: max-content;
      }
    }
  }
  :deep(.track_are) {
    top: 0 !important;
    width: 100%;
    min-height: 192px;
    max-height: 192px;
    .track_title {
      display: none;
    }
    .track_con {
      height: 192px;
      //   padding-top: 6px;
      //   padding-bottom: 4px;
      //   margin-bottom: 0px;
    }
    // .track_item {
    //   height: 36px !important;
    //   margin-top: 7px !important;
    //   padding-bottom: 8px;
    //   border-bottom: 2px solid rgba(0, 0, 0, 0.2);
    //   .story_item {
    //     height: 28px !important;
    //   }
    // }
    // .track_item:last-child {
    //   border-bottom: none !important;
    //   padding-bottom: 0 !important;
    // }
  }
  :deep(.choose_voice_page .page_center),
  :deep(.choose_text_page .page_center) {
    margin-top: 16px;
  }
  :deep(.choose_voice_page .page_bottom) {
    margin-top: 6px;
  }
  .notBGM_material {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    padding-right: 16px;
    padding-bottom: 12px;
    .notBGM_one_material {
      width: calc((100% - 12px) / 2);
      height: 256px;
      background: #ffffff;
      border-radius: 2px;
      padding-top: 12px;
      overflow: hidden;
    }
    .notBGM_one_material.notBGM_one_material {
      margin-left: 12px;
    }
    :deep(.choose_voice_dom) {
      .top_icon {
        margin-left: 2px;
        width: 21px;
        height: 19px;
      }
    }
  }
}
:deep(.sumvideo_page .storyboard_box .no_echart) {
  height: 200px !important;
}
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
.one_group_box {
  width: 100%;
  background: #f2f3f5;
  padding: 12px 16px;
  border-radius: 4px;
  .one_storyboard {
    background: rgba(255, 255, 255, 0.6);
  }
}
.none_group_box {
  border: none;
  background: transparent;
  padding: 0;
  border-radius: 0;
  .one_storyboard {
    background: #f2f3f5;
  }
  :deep(.notBGM_one_material) {
    background: rgba(255, 255, 255, 0.6) !important;
    .one_voice,
    .one_text .text_text_box {
      background: #ffffff;
    }
  }
}
.one_group_box + .one_group_box {
  margin-top: 8px;
}
.one_group {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  margin-bottom: 12px;

  font-size: 14px;
  color: #323233;
  line-height: 20px;
  .group1 {
    flex-shrink: 0;
    font-weight: 600;
    margin-right: 20px;
  }
  .group2 {
    // max-width: 50%;
  }
}
</style>
