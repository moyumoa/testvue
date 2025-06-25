<template>
  <div class="detail_page" v-loading="pageLoading">
    <div class="page_top">
      <!-- 预览区 -->
      <div class="page_left">
        <div class="left_title">
          <div class="has_title" v-if="!editNameInfo.show">
            <div class="name_text">{{ info.name || '' }}</div>
            <img
              @click="showEditFun"
              class="edit_icon"
              src="https://tagvv-1256030678.file.myqcloud.com/20231021q0ibz.png"
              alt=""
            />
          </div>
          <div class="edit_title" v-else>
            <el-input
              ref="editRef"
              :disabled="editLoading"
              class="input_box"
              placeholder="请输入模板名称"
              type="text"
              v-model.trim="editNameInfo.name"
              @blur="inputBlurFun"
              @keyup.enter="inputEnterFun"
              maxlength="20"
            />
          </div>
        </div>
        <div class="left_content">
          <div class="content_content">
            <previewImgText :imgList="previewImg" :bigImgWidth="271" />
            <div class="content_title" v-if="info.creativeStruct == 2">
              {{ previewTextInfo.title || '' }}
            </div>
            <div class="content_text" v-if="info.creativeStruct == 2">
              {{ previewTextInfo.desc || '' }}
              <div class="content_mount">
                <template v-if="info.mount && info.mount.dyTopic && info.mount.dyTopic.length > 0">
                  <span v-for="(a, b) in info.mount.dyTopic" :key="b">#{{ a }}</span>
                </template>
                <template
                  v-if="info.mount && info.mount.xhsTopic && info.mount.xhsTopic.length > 0"
                >
                  <span v-for="(a, b) in info.mount.xhsTopic" :key="b">#{{ a.name }}</span>
                </template>
                <template v-if="info.mount && info.mount.xhsAt && info.mount.xhsAt.length > 0">
                  <span v-for="(a, b) in info.mount.xhsAt" :key="b">@{{ a.name }}</span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 未选择实拍图的设置区 -->
      <div class="page_right right_un_right" v-if="showPageType == 1">
        <div
          :style="errList.shoot ? 'border-color:red' : ''"
          class="right_un"
          @click="showChooseMaterialFun"
        >
          <img src="https://tagvv-1256030678.file.myqcloud.com/20240918ocks7.png" alt="" />
          <div>从产品实拍库选择实拍图</div>
        </div>
      </div>
      <!-- 已选择实拍图的设置区 -->
      <div class="page_right right_has_right" v-else>
        <div class="one_has">
          <!-- 实拍图 -->
          <div
            class="has_half"
            :style="{
              borderColor: errList.shoot ? 'red' : ''
            }"
            ref="shootRef"
          >
            <div class="half_top">选择实拍图</div>
            <div class="half_content">
              <div class="half_content_content" v-loading="delLoading == 'shoot'">
                <template v-for="(item, index) in info.realShootList">
                  <div
                    :style="
                      errList.shoot &&
                      ((info.mannequinList && info.mannequinList.length > 0 && !item.markUrl) ||
                        (!(info.mannequinList && info.mannequinList.length > 0) && item.markUrl))
                        ? 'outline: 1px solid red;'
                        : ''
                    "
                    class="one_content"
                    v-if="index < 15"
                    :key="item.tagvvMediaId || item.id"
                    @click.stop="
                      previewFun(
                        '查看图片',
                        item.coverUrl || item.mediaUrl || item.url,
                        'image',
                        item.coverUrl || item.mediaUrl || item.url
                      )
                    "
                  >
                    <img
                      class="content_cover"
                      :src="
                        item.thumbMediaUrl ||
                        item.thumbUrl ||
                        item.coverUrl ||
                        item.mediaUrl ||
                        item.url
                      "
                      alt=""
                    />
                    <img
                      v-if="item.markUrl"
                      class="content_mark"
                      src="https://tagvv-1256030678.file.myqcloud.com/202410210h1pp.png"
                      alt=""
                    />
                    <div class="content_del" @click.stop="delFun(index, 'shoot', item)">
                      <img
                        src="https://tagvv-1256030678.file.myqcloud.com/20240918fu2cf.png"
                        alt=""
                      />
                    </div>
                  </div>
                </template>
                <div
                  class="one_content one_content_num"
                  v-if="info.realShootMax && info.realShootMax > 15"
                  @click.stop="showAllFun('shoot', info.realShootIds)"
                >
                  <div>
                    共
                    <span>{{ info.realShootMax }}</span>
                    张
                  </div>
                  <div><span>查看全部</span></div>
                </div>
                <div class="one_content one_content_add" @click="showChooseMaterialFun">
                  <el-icon class="icon-plus">
                    <i-plus />
                  </el-icon>
                  <div>添加图片</div>
                </div>
              </div>
            </div>
          </div>
          <!-- 不可替换图 -->
          <div class="has_half" v-if="info.imageCnt > 1">
            <div class="half_top">选择不可替换图</div>
            <div class="half_content">
              <div class="half_content_content" v-loading="delLoading == 'noReplace'">
                <div
                  class="one_content"
                  v-for="(item, index) in info.nonReplaceable"
                  :key="index"
                  @click.stop="previewFun('查看图片', item.resourceUrl, 'image', item.resourceUrl)"
                >
                  <img class="content_cover" :src="item.resourceUrl" alt="" />
                  <div class="content_del" @click.stop="delFun(index, 'noReplace', item)">
                    <img
                      src="https://tagvv-1256030678.file.myqcloud.com/20240918fu2cf.png"
                      alt=""
                    />
                  </div>
                </div>

                <div
                  v-if="info.nonReplaceable.length < previewImg.length - 1"
                  class="one_content one_content_add"
                  @click="showAddNoReplaceFun"
                >
                  <el-icon class="icon-plus">
                    <i-plus />
                  </el-icon>
                  <div>添加图片</div>
                </div>
              </div>
            </div>
          </div>
          <!-- </div>
        <div class="one_has"> -->
          <!-- 场景图 -->
          <div
            class="has_half"
            :style="{
              borderColor: errList.scene ? 'red' : '',
              height: '177px'
            }"
            ref="sceneRef"
          >
            <div class="half_top">选择场景图</div>
            <div
              class="half_content"
              :style="{
                height: '136px'
              }"
            >
              <div class="half_content_content" v-loading="delLoading == 'scene'">
                <template v-for="(item, index) in info.sceneList">
                  <div
                    class="one_content one_content_scene"
                    v-if="index < 8"
                    :key="item.tagvvMediaId || item.id"
                    @click.stop="
                      previewFun(
                        '查看场景图',
                        item.mediaUrl,
                        'scene',
                        item.coverUrl,
                        JSON.parse(item.pictures)
                      )
                    "
                  >
                    <!-- <img class="content_cover" :src="item.url" alt="" /> -->
                    <sceneCover
                      :isByXM="item.brandId === '0'"
                      class="content_cover"
                      :list="JSON.parse(item.pictures)"
                    />

                    <div class="content_del" @click.stop="delFun(index, 'scene', item)">
                      <img
                        src="https://tagvv-1256030678.file.myqcloud.com/20240918fu2cf.png"
                        alt=""
                      />
                    </div>
                  </div>
                </template>
                <div
                  class="one_content one_content_num one_content_num_scene"
                  v-if="info.sceneMax && info.sceneMax > 8"
                  @click.stop="showAllFun('scene', info.sceneIds)"
                >
                  <div>
                    共
                    <span>{{ info.sceneMax }}</span>
                    张
                  </div>
                  <div><span>查看全部</span></div>
                </div>
                <div
                  class="one_content one_content_add one_content_add_scene"
                  @click="showChooseSceneFun"
                >
                  <el-icon class="icon-plus">
                    <i-plus />
                  </el-icon>
                  <div>添加图片</div>
                </div>
              </div>
            </div>
          </div>
          <!-- 虚拟模特 -->
          <div
            class="has_half"
            v-if="info.imageReplaceType == 1"
            :style="errList.model ? 'border-color:red' : ''"
            ref="modelRef"
          >
            <div class="half_top">选择虚拟模特</div>
            <div class="half_content">
              <div class="half_content_content" v-loading="delLoading == 'model'">
                <template v-for="(item, index) in info.mannequinList">
                  <div
                    class="one_content one_content_model"
                    v-if="index < 11"
                    :key="item.tagvvMediaId || item.id"
                    @click.stop="previewFun('查看模特', item.coverUrl, 'image', item.coverUrl)"
                  >
                    <img class="content_cover" :src="item.thumbCoverUrl || item.coverUrl" alt="" />
                    <img
                      v-if="item.brandId == '0'"
                      class="xm_icon"
                      src="https://tagvv-1256030678.file.myqcloud.com/202410218dz9v.png"
                      alt=""
                    />
                    <div class="content_del" @click.stop="delFun(index, 'model', item)">
                      <img
                        src="https://tagvv-1256030678.file.myqcloud.com/20240918fu2cf.png"
                        alt=""
                      />
                    </div>
                  </div>
                </template>
                <div
                  class="one_content one_content_num one_content_num_model"
                  v-if="info.mannequinMax && info.mannequinMax > 11"
                  @click.stop="showAllFun('model', info.mannequinIds)"
                >
                  <div>
                    共
                    <span>{{ info.mannequinMax }}</span>
                    张
                  </div>
                  <div><span>查看全部</span></div>
                </div>
                <div
                  class="one_content one_content_add one_content_add_model"
                  @click="showSelectModelFun"
                >
                  <el-icon class="icon-plus">
                    <i-plus />
                  </el-icon>
                  <div>添加</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 创作文案 -->
        <div class="has_text" ref="textRef" v-if="info.creativeStruct == 2">
          <div class="text_title">创作文案</div>
          <div class="text_container">
            <div class="text_left">
              <div class="one_text_box one_text_box_flex">
                <div class="text_label">文案类型：</div>
                <div class="text_content text_content_flex">
                  <div
                    v-for="(item, index) in typeList"
                    :key="index"
                    @click.stop="info.titleGenconfig.titleDescType = item.value"
                    :class="{
                      one_text_type: true,
                      choose_text_type: info.titleGenconfig.titleDescType == item.value
                    }"
                  >
                    {{ item.label }}
                  </div>
                </div>
              </div>
              <div class="one_text_box">
                <div class="text_label text_label_12">
                  关键词：
                  <el-tooltip popper-class="tooltip-class" placement="right">
                    <template #content>
                      <p>可输入产品名称、卖点、活动信息...支持最多3个关键词、每个关键词最多5个字</p>
                    </template>
                    <img
                      src="https://tagvv-1256030678.file.myqcloud.com/20240918aabhm.png"
                      style="width: 16px; height: 16px; margin-left: 4px"
                    />
                  </el-tooltip>
                </div>
                <div class="keyword_select">
                  <el-select
                    v-model="info.titleGenconfig.keyword"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    :reserve-keyword="false"
                    :multiple-limit="3"
                    placeholder="请输入关键词，以回车键确认"
                    popper-class="publish_video_form_topic_select"
                    style="width: 100%"
                    :class="{ select_err: showKeywordsTip }"
                    @change="onChangeKeywords($event)"
                    @blur="onBlurKeywords($event)"
                  />
                </div>
                <div class="keyword_tip">
                  <span class="tips">文案是根据录入内容AI自动生成的，使用时请注意内容的合规性</span>
                  <div class="clear" @click="info.titleGenconfig.keyword = []">清空录入</div>
                </div>
              </div>
              <div
                class="one_text_box one_text_box_flex"
                style="align-items: flex-start; margin: -2px 0 18px"
              >
                <div class="text_label" style="margin-top: 2px">适用平台：</div>
                <div class="text_content text_content_flex">
                  <div
                    @click.stop="info.titleGenconfig.creationType = item.value"
                    :class="{
                      one_platform: true,
                      choose_platform: info.titleGenconfig.creationType == item.value
                    }"
                    v-for="(item, index) in platformList"
                    :key="index"
                  >
                    <div class="one_platform_content" :style="item.style">
                      <img :src="item.icon" alt="" />
                      <div>{{ item.label }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bottom_content" style="text-align: left">
                <el-button
                  style="margin: 0"
                  :loading="createLoading"
                  class="text_btn"
                  @click.stop="createFun"
                >
                  生成预览文案
                </el-button>
              </div>
            </div>
            <div class="text_right" v-if="false">
              <div class="one_text_box">
                <div class="text_label text_label_12">挂载项：</div>
                <div class="text_content">
                  <div class="one_mount">
                    <div class="mount_label">+ 添加抖音话题#</div>
                    <div class="mount_content">
                      <chooseDYTopic origin="task" v-model:topicList="info.mount.dyTopic" />
                    </div>
                  </div>
                  <div class="one_mount">
                    <div class="mount_label">+ 添加小红书话题#</div>
                    <div class="mount_content">
                      <chooseXHSTopic origin="task" v-model:topicList="info.mount.xhsTopic" />
                    </div>
                  </div>
                  <div class="one_mount">
                    <div class="mount_label">+ 添加小红书@</div>
                    <div class="mount_content">
                      <chooseAtPerson
                        type="xhs"
                        origin="task"
                        v-model:atPersonList="info.mount.xhsAt"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="bottom_content">
                <el-button :loading="createLoading" class="text_btn" @click.stop="createFun">
                  生成预览文案
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 保存区 -->
    <div class="page_bottom" v-if="!pageLoading">
      <!-- <el-button @click.stop="backFun">返回</el-button> -->
      <el-button :loading="saveLoading" type="primary" @click.stop="saveFun">保存模板</el-button>
    </div>
    <!-- 选择实拍图 -->
    <selectMaterialDOM
      :origin="chooseMaterialDialog.origin"
      :fileOrigin="chooseMaterialDialog.fileOrigin"
      :fileType="chooseMaterialDialog.fileType"
      :isBgm="true"
      v-if="chooseMaterialDialog.show"
      :info="chooseMaterialDialog"
      :dialogTitle="chooseMaterialDialog.dialogTitle"
      :materialType="chooseMaterialDialog.materialType"
      :materialTypeList="chooseMaterialDialog.materialTypeList"
      :materialSources="chooseMaterialDialog.materialSources"
      :materialSubSource="[]"
      :isAllInfo="true"
      :showMarkICON="chooseMaterialDialog.showMarkICON"
      :hideName="chooseMaterialDialog.hideName"
      :infoSearchComponents="chooseMaterialDialog.searchComponents"
      :extraParams="chooseMaterialDialog.extraParams || {}"
      @updateSelectInfo="updateSelectFun"
    />
    <!-- 查看全部 -->
    <materialDOM
      origin="templateImgText"
      :showXMICON="true"
      v-if="allMaterialDilog.show"
      :materialDialog="allMaterialDilog"
      :materialText="allMaterialDilog.materialText"
      :materialIds="allMaterialDilog.materialIds"
      :dialogTitle="allMaterialDilog.dialogTitle"
      :delMessageBox="allMaterialDilog.delMessageBox"
      @previewFun="previewFun"
      :batchDel="true"
      :showMarkICON="allMaterialDilog.showMarkICON"
      :hideName="allMaterialDilog.hideName"
      @updateChooseList="updateChooseList"
    />
    <!-- 预览弹窗 -->
    <previewDialog v-if="previewInfo.show" :previewDialog="previewInfo"></previewDialog>
    <!-- 添加不可替换图 -->
    <addNoReplaceDOM
      :previewImg="previewImg"
      :imgLen="info.imageCnt - 1"
      v-if="addNoReplaceDialog.show"
      :addDialog="addNoReplaceDialog"
      @updateFun="updateNoReplaceFun"
    />
    <!-- 添加虚拟模特 -->
    <selectModelDOM
      origin="templateImgText"
      tip="员工上传的虚拟模特图片无需选择，合成图片时员工可直接使用"
      v-if="selectModelDialog.show"
      :id="info.id"
      :selectDialog="selectModelDialog"
      @updateFun="updateSelectFun"
    />
  </div>
</template>
<script setup>
import chooseDYTopic from '@/views/market/marketing_task/create_task/components/video_setting/choose_dy_topic.vue'
import chooseXHSTopic from '@/views/market/marketing_task/create_task/components/video_setting/choose_xhs_topic.vue'
import chooseAtPerson from '@/views/market/marketing_task/create_task/components/video_setting/choose_atPerson.vue'
import { modify } from '@/api/sumvideo/creative_mould.js'
import {
  generatePreviewTitle,
  getImageCreativeDetail,
  saveImageCreativeSetting
} from '@/api/sumvideo/template_imgText'
import { useRoute, useRouter } from 'vue-router'
import { detailFun } from './js/detail.js'
import sceneCover from '@/views/sumvideo/components/scene_cover.vue'
import selectModelDOM from './components/select_model_dialog.vue'
import addNoReplaceDOM from './components/add_noReplace_dialog.vue'
import previewDialog from '@/components/preview_dialog/preview_dialog.vue'
import materialDOM from '@/views/sumvideo/create_by_template/components/material_dialog.vue'
import selectMaterialDOM from '@/views/sumvideo/components/material/select_material_dialog.vue'
import previewImgText from '@/views/sumvideo/components/preview_img_text.vue'

import { throttle, isEmpty, isNotEmpty } from '@/utils/tools'
const route = useRoute()
const router = useRouter()
const showPageType = ref(1) // 1 只显示添加实拍图 2 显示所有
// 预览的信息
const previewImg = ref([])
const previewTextInfo = ref({
  title: '',
  desc: ''
})
const info = ref({
  id: null,
  creativeStruct: null, // 1 仅图片 2 图文
  imageCnt: null, // 图文图片数量
  realShootList: [], // 实拍图
  nonReplaceable: [], // 不可替换图
  sceneList: [], // 场景图
  mannequinList: [], // 模特图

  titleGenconfig: {
    titleDescType: 2, // 文案类型
    keyword: [], // 关键词
    creationType: 1 // 当前选中的适用平台
  }, // 文案生成配置
  mount: {
    dyTopic: [], // 抖音话题列表
    xhsTopic: [], // 小红书话题列表
    xhsAt: [] // 小红书@列表
  } // 创作文案
})

// --修改模版名称
const editLoading = ref(false)
const editNameInfo = ref({
  show: false,
  name: ''
})
const editRef = ref()
const showEditFun = throttle(() => {
  editNameInfo.value = {
    show: true,
    name: info.value.name || ''
  }
  nextTick(() => {
    editRef.value?.focus()
  })
})
function inputEnterFun() {
  editRef.value?.blur()
}
function inputBlurFun() {
  const reg =
    // eslint-disable-next-line no-misleading-character-class
    /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\\A9|AE]\u3030|\uA9|\uAE|\u3030/gi

  editNameInfo.value.name = editNameInfo.value.name.replace(reg, '')

  if (isEmpty(editNameInfo.value.name)) {
    editNameInfo.value = {
      show: false,
      name: ''
    }
  } else {
    editLoading.value = true
    modify({ creativeId: info.value.id, name: editNameInfo.value.name })
      .then(res => {
        if (res.code === 0) {
          info.value.name = editNameInfo.value.name
          message.success(`修改成功`)
          nextTick(() => {
            editNameInfo.value = {
              show: false,
              name: ''
            }
          })
        }
        editLoading.value = false
      })
      .catch(() => {
        editLoading.value = false
      })
  }
}
// --修改模板名称 end

// --创作文案
const createLoading = ref(false) // 生成按钮Loading

// 文案类型
const typeList = ref([
  { label: '种草文案', value: 2 },
  { label: '爆款标题', value: 1 },
  { label: '测评文案', value: 3 },
  { label: '买家秀评价', value: 5 }
])
// 适用平台列表
const platformList = ref([
  {
    style: 'background: #FEEBEB;',
    label: '小红书',
    value: 1,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20240809ttngj.png'
  },
  {
    style: 'background: #F1F1F1;',
    label: '抖音',
    value: 2,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20240809vz7ck.png'
  },

  {
    style: 'background: #F3F4F8;',
    label: '朋友圈',
    value: 5,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20240906asprc.png'
  },
  {
    style: 'background: #FFEEE7;',
    label: '快手',
    value: 3,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20240809wmpj4.png'
  },
  {
    style: 'background: #FFF4E9;',
    label: '视频号',
    value: 4,
    icon: 'https://tagvv-1256030678.file.myqcloud.com/20240809n1a7d.png'
  }
])

const showKeywordsTip = computed(() => {
  return errList.text && info.value.titleGenconfig.keyword.length === 0
})
// 关键词内容改变
const onChangeKeywords = value => {
  errList.text = false
  // 下载发布模式补充需求 最多添加三个关键词 每个不超过5个字
  value.forEach((x, i) => {
    const text = typeof x === 'string' ? x.replace(/\s+/g, '') : ''
    if (text.length > 5) {
      message.warning('每个关键词不超过5个字')
      info.value.titleGenconfig.keyword.splice(i, 1)
    } else if (!text.length) {
      info.value.titleGenconfig.keyword.splice(i, 1)
    } else {
      info.value.titleGenconfig.keyword[i] = text
    }
  })
}
// 失焦添加关键词
const onBlurKeywords = e => {
  errList.text = false
  const value = e.target.value.replace(/\s+/g, '')
  if (value && info.value.titleGenconfig.keyword.length < 3 && value.length < 6) {
    info.value.titleGenconfig.keyword.push(value)
  } else {
    if (value) {
      if (info.value.titleGenconfig.keyword.length >= 3) {
        message.warning('最多添加3个话题')
      } else if (value.length > 5) {
        message.warning('单个话题不超过5字')
      }
    }
  }
}
// 开始生成
const createFun = throttle(() => {
  if (isEmpty(info.value.titleGenconfig.keyword)) {
    errList.text = true
    message.warning('关键词不能为空')
    return
  }
  createLoading.value = true
  previewTextInfo.value.title = ''
  previewTextInfo.value.desc = ''
  // 先保存创作文案配置 再去生成预览文案
  saveImageCreativeSetting({
    creativeId: info.value.id,
    titleGenconfig: getTitleConfig()
  })
    .then(res => {
      if (res.code === 0) {
        generatePreviewTitle({
          id: info.value.id
        })
          .then(res1 => {
            if (res1.code === 0) {
              const resultList = res1.data
              message.success('文案生成成功')

              previewTextInfo.value.title = resultList[0]?.title || ''
              previewTextInfo.value.desc = resultList[0]?.description || ''
            }
            createLoading.value = false
          })
          .catch(() => {
            createLoading.value = false
          })
        // console.log(getResult())
      } else {
        createLoading.value = false
      }
    })
    .catch(() => {
      createLoading.value = false
    })
}, 700)

// --创作文案 end
// 获取详情
const pageLoading = ref(true)
function getDetailFun() {
  getImageCreativeDetail({
    id: route.query.id
  })
    .then(res => {
      if (res.code === 0) {
        const resData = res.data
        // 根据图文图片数量生成左侧预览图
        const imgList = []
        for (let i = 0; i < resData.imageCnt; i++) {
          imgList.push({
            url: ''
          })
        }
        // 如果有不可替换图，就将他替换到对应的预览图片里
        if (resData.nonReplaceable && resData.nonReplaceable.length > 0) {
          resData.nonReplaceable.forEach(x => {
            imgList[x.index] = {
              index: x.index,
              url: x.resourceUrl
            }
          })
        }
        previewImg.value = imgList
        // 预览文案回显
        if (isNotEmpty(resData.previewTitle)) {
          previewTextInfo.value.title = resData.previewTitle[0]?.title || ''
          previewTextInfo.value.desc = resData.previewTitle[0]?.description || ''
        }
        //  创作文案转换
        if (isNotEmpty(resData.titleGenconfig)) {
          // 有关键词转成数组
          if (isNotEmpty(resData.titleGenconfig.keyWords)) {
            resData.titleGenconfig.keyword = resData.titleGenconfig.keyWords.split('、').slice(0, 3)
          }
        } else {
          // 没有创作文案 给他赋默认值
          resData.titleGenconfig = {
            titleDescType: 2, // 文案类型
            keyword: [], // 关键词
            creationType: 1 // 当前选中的适用平台
          }
        }
        // 挂载项转换
        if (isNotEmpty(resData.mount)) {
          console.log('xxx')
          // 目前抖音话题组件回显只支持['a','b'] 但接口返回是[{id:null,name:'a'},{id:null,name:'b'}]
          if (isNotEmpty(resData.mount.dyTopic)) {
            resData.mount.dyTopic = resData.mount.dyTopic.map(x => x.name)
          }
        } else {
          resData.mount = {
            dyTopic: [], // 抖音话题列表
            xhsTopic: [], // 小红书话题列表
            xhsAt: [] // 小红书@列表
          }
        }
        // 有实拍图右侧显示类型是2
        if (isNotEmpty(resData.realShootList)) {
          showPageType.value = 2
        }
        // 设置实拍图、场景图、虚拟模特的总数
        resData.realShootMax = resData.realShootIds.length || 0
        resData.sceneMax = resData.sceneIds.length || 0
        resData.mannequinMax = resData.mannequinIds.length || 0
        // 兼容老数据 模板类型
        if (!resData.imageReplaceType) {
          if (isNotEmpty(resData.realShootList)) {
            // 如果有实拍图 看实拍图类型是否有替换图片
            const hasMarkUrl = resData.realShootList.filter(x => x.markUrl)
            resData.imageReplaceType = hasMarkUrl && hasMarkUrl.length > 0 ? 1 : 2
          } else if (isNotEmpty(resData.mannequinList)) {
            // 没有实拍图 就看虚拟模特是否有数据
            resData.imageReplaceType = 1
          } else {
            // 如果都没有 那就默认是1
            resData.imageReplaceType = 1
          }
        }
        info.value = resData
      }
      nextTick(() => {
        pageLoading.value = false
      })
    })
    .catch(() => {
      pageLoading.value = false
    })
}
onMounted(() => {
  getDetailFun()
})

const message = inject('$message')
const saveLoading = ref(false)
// 如果不符合要求，就滚动到该位置
function validToScrollFun(ref) {
  ref?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
const errList = reactive({
  text: false,
  scene: false,
  shoot: false,
  model: false
})
const textRef = ref()
const modelRef = ref()
const sceneRef = ref()
const shootRef = ref()
const {
  validFun,
  previewInfo,
  previewFun,
  updateChooseList,
  showAllFun,
  allMaterialDilog,
  delFun,
  delLoading,
  showSelectModelFun,
  selectModelDialog,
  showChooseSceneFun,
  updateNoReplaceFun,
  showAddNoReplaceFun,
  addNoReplaceDialog,
  updateSelectFun,
  showChooseMaterialFun,
  chooseMaterialDialog
} = detailFun('templateImgText', info.value.id || null, info, previewImg, errList, showPageType)

// 获取创作文案配置的入参
function getTitleConfig() {
  if (info.value.creativeStruct === 2) {
    return {
      bizType: 4, // 生成业务类型1模板 2批量任务 3小程序标题 4图文模板
      creationType: info.value.titleGenconfig.creationType, // 创作类型 0通用 1小红书文案 2抖音标题 3快手 4视频号 5朋友圈
      creativeId: info.value.id,
      generateCount: 1, // 期望生成条数
      generateTone: 1, // 生成语气 1友好 2专业 3接地气 4活泼 5文艺
      keyWords: info.value.titleGenconfig.keyword.join('、'), // 关键词 每个关键词以、间隔
      titleDescType: info.value.titleGenconfig.titleDescType // 文案类型 1 爆款文案 2种草文案 3 测评文案 4 教程文案 5买家秀评价
    }
  } else {
    return null
  }
}
// 保存
const saveFun = throttle(() => {
  if (createLoading.value) {
    message.warning('文案生成中，不支持保存模板，请稍后再试')
    return
  }
  if (saveLoading.value) return
  // 校验实拍图是否符合要求
  saveLoading.value = true
  validFun(showPageType.value === 1 ? 'shoot' : 'all').then(errTip => {
    if (errTip) {
      message.warning(errTip)

      if (errList.shoot) {
        validToScrollFun(shootRef.value)
      } else if (errList.model) {
        validToScrollFun(modelRef.value)
      } else if (errList.scene) {
        validToScrollFun(sceneRef.value)
      } else if (errList.text) {
        validToScrollFun(textRef.value)
      }
      saveLoading.value = false
      return
    }
    // 抖音话题目前组件是没有Id的，后端需要，所以在回显的时候要做下转换
    const dyTopic = []
    if (isNotEmpty(info.value.mount.dyTopic)) {
      info.value.mount.dyTopic.forEach(x => {
        dyTopic.push({
          id: null,
          name: x
        })
      })
    }
    // 图文模板封面：不可替换图+实拍图前N张
    const previewImgList = JSON.parse(JSON.stringify(previewImg.value))
    let i = 0
    previewImgList.forEach(x => {
      if (!x.url) {
        const oneInfo = info.value.realShootList[i]
        x.url = oneInfo.coverUrl || oneInfo.mediaUrl || oneInfo.url
        i++
      }
    })
    console.log('prew', previewImgList)
    saveImageCreativeSetting({
      pictures: JSON.stringify(previewImgList),
      complete: true,
      creativeId: info.value.id,
      mount: {
        dyTopic: dyTopic,
        xhsAt: info.value.mount.xhsAt,
        xhsTopic: info.value.mount.xhsTopic
      },
      nonReplaceable: info.value.nonReplaceable,
      titleGenconfig: getTitleConfig()
    })
      .then(res => {
        if (res.code === 0) {
          if (router.options?.history?.state?.back === '/sumwhy_video/template_imgText') {
            router.go(-1)
          } else {
            router.push('/sumwhy_video/template_imgText')
          }
        }
        saveLoading.value = false
      })
      .catch(() => {
        saveLoading.value = false
      })
  })
}, 700)
</script>
<style lang="scss" scoped>
@import './scss/detail.scss';
:deep(img) {
  overflow-clip-margin: border-box;
  -webkit-overflow-clip-margin: border-box;
}
:deep(.one_material) {
  background: transparent !important;
}
:deep(.videoElement_box .video_item .item_top) {
  background: transparent !important;
}
</style>
